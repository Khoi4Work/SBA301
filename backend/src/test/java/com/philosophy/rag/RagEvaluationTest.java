package com.philosophy.rag;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVPrinter;
import org.apache.commons.csv.CSVRecord;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.api.Advisor;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.document.Document;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.ai.ollama.api.OllamaApi;
import org.springframework.ai.ollama.api.OllamaChatOptions;
import org.springframework.ai.rag.advisor.RetrievalAugmentationAdvisor;
import org.springframework.ai.rag.retrieval.search.VectorStoreDocumentRetriever;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * RAG Evaluation Test — RAGAS-style CSV-driven edition.
 *
 * <p>
 * Reads questions from {@code src/test/resources/rag_evaluation_input.csv},
 * runs the full RAG pipeline for each row, evaluates <strong>five</strong>
 * RAGAS metrics,
 * and writes the results to {@code evaluation_result_gpt_oss_120b_cloud_v2.csv}.
 *
 * <h3>Multi-Judge Consensus Approach</h3>
 * To ensure objectivity and eliminate self-preference bias, this test uses a
 * panel of multiple LLM judges (Cross-Evaluation). The final score for each
 * metric is the arithmetic mean of scores provided by all judges.
 */
@SpringBootTest
@Tag("ai-eval")
@ActiveProfiles("dev")
public class RagEvaluationTest {

        static {
                RagApplication.loadEnv();
        }

        private static final Logger log = LoggerFactory.getLogger(RagEvaluationTest.class);

        // -----------------------------------------------------------------------
        // Constants
        // -----------------------------------------------------------------------

        private static final String INPUT_CSV_CLASSPATH = "/rag_evaluation_input.csv";
        private static final String OUTPUT_CSV_PATH = "evaluation_result.csv";

        // List of models used as judges to ensure objectivity (Cross-Evaluation)
        private static final String[] OLLAMA_JUDGE_MODELS = {"minimax-m3:cloud"};
        private static final String OLLAMA_BASE_URL = "http://localhost:11434";

        // -----------------------------------------------------------------------
        // Spring-managed beans
        // -----------------------------------------------------------------------

        @Autowired
        private ChatModel chatModel;

        @Autowired
        private VectorStore vectorStore;

        // -----------------------------------------------------------------------
        // Fields initialised in @BeforeEach
        // -----------------------------------------------------------------------

        private ChatClient chatClient;
        private Advisor ragAdvisor;
        private final List<ChatClient> judgeClients = new ArrayList<>();

        @BeforeEach
        void setUp() {
                // 1. Main RAG Pipeline setup
                this.chatClient = ChatClient.builder(chatModel).build();
                logModelDetails("MAIN RAG", chatModel);

                this.ragAdvisor = RetrievalAugmentationAdvisor.builder()
                                .documentRetriever(VectorStoreDocumentRetriever.builder()
                                                .vectorStore(vectorStore)
                                                .topK(6)
                                                .similarityThreshold(0.50)
                                                .build())
                                .build();

                // 2. Judge Panel setup: Initialize multiple LLM judges
                OllamaApi ollamaApi = OllamaApi.builder().baseUrl(OLLAMA_BASE_URL).build();

                for (String modelName : OLLAMA_JUDGE_MODELS) {
                    ChatModel evaluatorModel = OllamaChatModel.builder()
                                    .ollamaApi(ollamaApi)
                                    .defaultOptions(OllamaChatOptions.builder()
                                                    .model(modelName)
                                                    .temperature(0.0) // Deterministic scoring
                                                    .build())
                                    .build();

                    judgeClients.add(ChatClient.builder(evaluatorModel).build());
                    logModelDetails("JUDGE [" + modelName + "]", evaluatorModel);
                }
            }

        @Test
        void evaluateCsv() throws IOException {
                log.info("Reading CSV...");
                List<CsvQuestion> questions = loadCsv(INPUT_CSV_CLASSPATH);
                log.info("Loaded {} questions from CSV.", questions.size());

                List<EvaluationCsvResult> results = new ArrayList<>();
                int total = questions.size();

                for (int i = 0; i < total; i++) {
                        CsvQuestion q = questions.get(i);
                        log.info("Processing question {}/{} — id={}", i + 1, total, q.id());

                        // Step 1: generate answer
                        ChatResponse chatResponse = generateAnswer(q.question());
                        String generatedAnswer = chatResponse.getResult().getOutput().getText();

                        // Step 2: extract retrieved documents
                        List<Document> retrievedDocs = retrieveDocuments(chatResponse);

                        // Step 3: Multi-Judge Consensus Evaluation
                        log.info("Evaluating with {} judges for cross-validation...", judgeClients.size());

                        double sumFaith = 0, sumRel = 0, sumPrec = 0, sumRec = 0, sumCorr = 0;
                        StringBuilder reasonFaith = new StringBuilder(), reasonRel = new StringBuilder(),
                                      reasonPrec = new StringBuilder(), reasonRec = new StringBuilder(),
                                      reasonCorr = new StringBuilder();

                        for (int j = 0; j < judgeClients.size(); j++) {
                            ChatClient currentJudge = judgeClients.get(j);
                            String judgeName = OLLAMA_JUDGE_MODELS[j];

                            MetricScore f = evaluateFaithfulness(q.question(), generatedAnswer, retrievedDocs, currentJudge);
                            sumFaith += f.score();
                            reasonFaith.append("[").append(judgeName).append("]: ").append(f.reason()).append(" ");

                            MetricScore r = evaluateAnswerRelevance(q.question(), generatedAnswer, retrievedDocs, currentJudge);
                            sumRel += r.score();
                            reasonRel.append("[").append(judgeName).append("]: ").append(r.reason()).append(" ");

                            MetricScore p = evaluateContextPrecision(q.question(), q.context(), retrievedDocs, currentJudge);
                            sumPrec += p.score();
                            reasonPrec.append("[").append(judgeName).append("]: ").append(p.reason()).append(" ");

                            MetricScore rec = evaluateContextRecall(q.question(), q.context(), retrievedDocs, currentJudge);
                            sumRec += rec.score();
                            reasonRec.append("[").append(judgeName).append("]: ").append(rec.reason()).append(" ");

                            MetricScore c = evaluateAnswerCorrectness(q.question(), q.groundTruth(), generatedAnswer, currentJudge);
                            sumCorr += c.score();
                            reasonCorr.append("[").append(judgeName).append("]: ").append(c.reason()).append(" ");
                        }

                        double finalFaith = sumFaith / judgeClients.size();
                        double finalRel = sumRel / judgeClients.size();
                        double finalPrec = sumPrec / judgeClients.size();
                        double finalRec = sumRec / judgeClients.size();
                        double finalCorr = sumCorr / judgeClients.size();

                        double overall = calculateOverallScore(finalFaith, finalRel, finalPrec, finalRec, finalCorr);
                        String retrievedContextsText = buildRetrievedContextsText(retrievedDocs);

                        results.add(new EvaluationCsvResult(
                                        q.id(), q.question(), q.groundTruth(), q.context(),
                                        generatedAnswer, retrievedContextsText,
                                        finalFaith, reasonFaith.toString(),
                                        finalRel, reasonRel.toString(),
                                        finalPrec, reasonPrec.toString(),
                                        finalRec, reasonRec.toString(),
                                        finalCorr, reasonCorr.toString(),
                                        overall));

                        log.info("Question {}/{} done (Consensus) — overall={}", i + 1, total, overall);
                }

                writeResultCsv(results, OUTPUT_CSV_PATH);
                log.info("Completed. Output written to: {}", OUTPUT_CSV_PATH);
        }

        List<CsvQuestion> loadCsv(String classpathResource) throws IOException {
                try (Reader reader = new InputStreamReader(
                                Objects.requireNonNull(getClass().getResourceAsStream(classpathResource), "CSV not found"),
                                StandardCharsets.UTF_8);
                                CSVParser parser = CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(true).setTrim(true).setIgnoreEmptyLines(true).build().parse(reader)) {
                        List<CsvQuestion> questions = new ArrayList<>();
                        for (CSVRecord record : parser) {
                                questions.add(new CsvQuestion(Integer.parseInt(record.get("id")), record.get("question"), record.get("ground_truth"), record.get("context")));
                        }
                        return questions;
                }
        }

        void writeResultCsv(List<EvaluationCsvResult> results, String outputPath) throws IOException {
                CSVFormat format = CSVFormat.DEFAULT.builder().setHeader("id", "question", "ground_truth", "expected_context", "generated_answer", "retrieved_contexts", "faithfulness_score", "faithfulness_reason", "answer_relevance_score", "answer_relevance_reason", "context_precision_score", "context_precision_reason", "context_recall_score", "context_recall_reason", "answer_correctness_score", "answer_correctness_reason", "overall_score").build();
                try (BufferedWriter writer = new BufferedWriter(new FileWriter(outputPath, StandardCharsets.UTF_8));
                                CSVPrinter printer = new CSVPrinter(writer, format)) {
                        for (EvaluationCsvResult r : results) {
                                printer.printRecord(r.id(), r.question(), r.groundTruth(), r.expectedContext(), r.generatedAnswer(), r.retrievedContexts(), r.faithfulnessScore(), r.faithfulnessReason(), r.answerRelevanceScore(), r.answerRelevanceReason(), r.contextPrecisionScore(), r.contextPrecisionReason(), r.contextRecallScore(), r.contextRecallReason(), r.answerCorrectnessScore(), r.answerCorrectnessReason(), r.overallScore());
                        }
                }
        }

        ChatResponse generateAnswer(String question) {
                return chatClient.prompt().advisors(ragAdvisor).user(question).call().chatResponse();
        }

        @SuppressWarnings("unchecked")
        List<Document> retrieveDocuments(ChatResponse chatResponse) {
                Object raw = chatResponse.getMetadata().get(RetrievalAugmentationAdvisor.DOCUMENT_CONTEXT);
                if (raw instanceof List<?> list && !list.isEmpty() && list.get(0) instanceof Document) {
                        return (List<Document>) list;
                }
                return List.of();
        }

        MetricScore evaluateFaithfulness(String question, String generatedAnswer, List<Document> retrievedDocs, ChatClient judge) {
                String prompt = "Evaluate the FAITHFULNESS of this answer. " +
                                "Question: " + question + "\n" +
                                "Context: " + buildRetrievedContextsText(retrievedDocs) + "\n" +
                                "Answer: " + generatedAnswer + "\n" +
                                "Is the answer grounded in the context? Return 1.0 for yes, 0.0 for no, and a reason in JSON: {\"score\": 1.0, \"reason\": \"...\"}";

                String raw = judge.prompt().user(prompt).call().content();
                return JsonScoreParser.parse(raw != null ? raw : "{\"score\": 0.0, \"reason\": \"No response from judge\"}");
        }

        MetricScore evaluateAnswerRelevance(String question, String generatedAnswer, List<Document> retrievedDocs, ChatClient judge) {
                String prompt = "Evaluate the ANSWER RELEVANCE. " +
                                "Question: " + question + "\n" +
                                "Answer: " + generatedAnswer + "\n" +
                                "Does the answer directly address the question? Return 1.0 for yes, 0.0 for no, and a reason in JSON: {\"score\": 1.0, \"reason\": \"...\"}";

                String raw = judge.prompt().user(prompt).call().content();
                return JsonScoreParser.parse(raw != null ? raw : "{\"score\": 0.0, \"reason\": \"No response from judge\"}");
        }

        MetricScore evaluateContextPrecision(String question, String expectedContext, List<Document> retrievedDocs, ChatClient judge) {
                return new ContextPrecisionEvaluator(judge).evaluate(question, expectedContext, retrievedDocs);
        }

        MetricScore evaluateContextRecall(String question, String expectedContext, List<Document> retrievedDocs, ChatClient judge) {
                return new ContextRecallEvaluator(judge).evaluate(question, expectedContext, retrievedDocs);
        }

        MetricScore evaluateAnswerCorrectness(String question, String groundTruth, String generatedAnswer, ChatClient judge) {
                return new AnswerCorrectnessEvaluator(judge).evaluate(question, groundTruth, generatedAnswer);
        }

        double calculateOverallScore(double f, double r, double p, double rec, double c) {
                double raw = (f + r + p + rec + c) / 5.0;
                return BigDecimal.valueOf(raw).setScale(3, RoundingMode.HALF_UP).doubleValue();
        }

        private String buildRetrievedContextsText(List<Document> docs) {
                if (docs == null || docs.isEmpty()) return "(none)";
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < docs.size(); i++) {
                        if (i > 0) sb.append(" | ");
                        sb.append("[").append(i + 1).append("] ").append(docs.get(i).getText());
                }
                return sb.toString();
        }

        private void logModelDetails(String label, ChatModel model) {
                String modelName = "unknown";
                try {
                        if (model.getDefaultOptions() != null) modelName = model.getDefaultOptions().getModel();
                } catch (Exception e) {
                    log.warn("Could not retrieve model details for {}: {}", label, e.getMessage());
                }
                log.info("\n===================================================================\n {} INFO:\n   -> Provider Class : {}\n   -> Running Model   : {}\n===================================================================", label, model.getClass().getName(), modelName);
        }
    }
