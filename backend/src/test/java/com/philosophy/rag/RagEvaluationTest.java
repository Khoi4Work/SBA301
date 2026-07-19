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
import org.springframework.ai.chat.evaluation.FactCheckingEvaluator;
import org.springframework.ai.chat.evaluation.RelevancyEvaluator;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.document.Document;
import org.springframework.ai.evaluation.EvaluationRequest;
import org.springframework.ai.evaluation.EvaluationResponse;
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
 * <p>Reads questions from {@code src/test/resources/rag_evaluation_input.csv},
 * runs the full RAG pipeline for each row, evaluates <strong>five</strong> RAGAS metrics,
 * and writes the results to {@code evaluation_result.csv} in the working directory.
 *
 * <h3>Metrics evaluated</h3>
 * <ol>
 *   <li><b>Faithfulness</b>       — Is the generated answer grounded in the retrieved context?
 *       Uses {@link FactCheckingEvaluator}.</li>
 *   <li><b>Answer Relevance</b>   — Does the generated answer address the question?
 *       Uses {@link RelevancyEvaluator}.</li>
 *   <li><b>Context Precision</b>  — What fraction of retrieved chunks match the gold context?
 *       Uses {@link ContextPrecisionEvaluator} (LLM judge, continuous score).</li>
 *   <li><b>Context Recall</b>     — What fraction of the gold context was retrieved?
 *       Uses {@link ContextRecallEvaluator} (LLM judge, continuous score).</li>
 *   <li><b>Answer Correctness</b> — How semantically correct is the answer vs ground truth?
 *       Uses {@link AnswerCorrectnessEvaluator} (LLM judge, continuous score).</li>
 * </ol>
 *
 * <h3>Overall score</h3>
 * <pre>overall = (faithfulness + answerRelevance + contextPrecision + contextRecall + answerCorrectness) / 5</pre>
 */
@SpringBootTest
@Tag("ai-eval")
@ActiveProfiles("dev")
public class RagEvaluationTest {

    private static final Logger log = LoggerFactory.getLogger(RagEvaluationTest.class);

    // -----------------------------------------------------------------------
    // Constants
    // -----------------------------------------------------------------------

    private static final String INPUT_CSV_CLASSPATH = "/rag_evaluation_input.csv";
    private static final String OUTPUT_CSV_PATH     = "evaluation_result.csv";

    private static final String OLLAMA_BASE_URL     = "http://localhost:11434";
    private static final String OLLAMA_JUDGE_MODEL  = "gemma4:31b-cloud";

    // -----------------------------------------------------------------------
    // Spring-managed beans (injected from application context)
    // -----------------------------------------------------------------------

    /** Main RAG model — Gemini or whichever model is wired in the active profile. */
    @Autowired
    private ChatModel chatModel;

    @Autowired
    private VectorStore vectorStore;

    // -----------------------------------------------------------------------
    // Fields initialised in @BeforeEach
    // -----------------------------------------------------------------------

    /** ChatClient wrapping the main RAG model. */
    private ChatClient chatClient;

    /** RAG retrieval advisor — uses VectorStore with top-K = 6, threshold = 0.50. */
    private Advisor ragAdvisor;

    /** Ollama-backed judge ChatClient shared by all LLM-judge evaluators. */
    private ChatClient judgeClient;

    // Spring AI built-in evaluators (binary pass/fail internally)
    private RelevancyEvaluator relevancyEvaluator;
    private FactCheckingEvaluator factCheckingEvaluator;

    // Custom RAGAS-style evaluators (continuous [0,1] scores)
    private ContextPrecisionEvaluator contextPrecisionEvaluator;
    private ContextRecallEvaluator contextRecallEvaluator;
    private AnswerCorrectnessEvaluator answerCorrectnessEvaluator;

    // -----------------------------------------------------------------------
    // Setup
    // -----------------------------------------------------------------------

    @BeforeEach
    void setUp() {
        // 1. RAG CHÍNH: Vẫn dùng mô hình thật (Gemini) để sinh câu trả lời
        this.chatClient = ChatClient.builder(chatModel).build();

        this.ragAdvisor = RetrievalAugmentationAdvisor.builder()
                .documentRetriever(VectorStoreDocumentRetriever.builder()
                        .vectorStore(vectorStore)
                        .topK(6)
                        .similarityThreshold(0.50)
                        .build())
                .build();

        // 2. GIÁM KHẢO: Khởi tạo mô hình Ollama chạy hoàn toàn dưới máy local
        OllamaApi ollamaApi = OllamaApi.builder().baseUrl(OLLAMA_BASE_URL).build();
        ChatModel ollamaEvaluatorModel = OllamaChatModel.builder()
                .ollamaApi(ollamaApi)
                .defaultOptions(OllamaChatOptions.builder()
                        .model(OLLAMA_JUDGE_MODEL)
                        .temperature(0.0)
                        .build())
                .build();

        // 3. ĐÁNH GIÁ: Đưa Giám khảo Ollama vào tất cả Evaluator
        this.judgeClient = ChatClient.builder(ollamaEvaluatorModel).build();

        // Spring AI built-in evaluators (backed by Ollama judge)
        this.relevancyEvaluator     = new RelevancyEvaluator(ChatClient.builder(ollamaEvaluatorModel));
        this.factCheckingEvaluator  = FactCheckingEvaluator.builder(ChatClient.builder(ollamaEvaluatorModel)).build();

        // Custom RAGAS-style evaluators (all use the same judgeClient)
        this.contextPrecisionEvaluator  = new ContextPrecisionEvaluator(judgeClient);
        this.contextRecallEvaluator     = new ContextRecallEvaluator(judgeClient);
        this.answerCorrectnessEvaluator = new AnswerCorrectnessEvaluator(judgeClient);
    }

    // -----------------------------------------------------------------------
    // Main test entry point
    // -----------------------------------------------------------------------

    /**
     * Reads the input CSV, runs the full RAGAS evaluation pipeline for every row,
     * and writes the results to {@value #OUTPUT_CSV_PATH}.
     *
     * @throws IOException if the input CSV cannot be read or the output CSV cannot be written
     */
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

            // Step 1: generate answer via RAG pipeline
            log.info("Generating answer...");
            ChatResponse chatResponse = generateAnswer(q.question());
            String generatedAnswer = chatResponse.getResult().getOutput().getText();

            // Step 2: extract retrieved documents from advisor metadata
            log.info("Retrieving documents from response metadata...");
            List<Document> retrievedDocs = retrieveDocuments(chatResponse);

            // Step 3: evaluate all five RAGAS metrics
            log.info("Evaluating Faithfulness...");
            MetricScore faithfulness = evaluateFaithfulness(q.question(), generatedAnswer, retrievedDocs);

            log.info("Evaluating Answer Relevance...");
            MetricScore answerRelevance = evaluateAnswerRelevance(q.question(), generatedAnswer, retrievedDocs);

            log.info("Evaluating Context Precision...");
            MetricScore contextPrecision = evaluateContextPrecision(q.question(), q.context(), retrievedDocs);

            log.info("Evaluating Context Recall...");
            MetricScore contextRecall = evaluateContextRecall(q.question(), q.context(), retrievedDocs);

            log.info("Evaluating Answer Correctness...");
            MetricScore answerCorrectness = evaluateAnswerCorrectness(q.question(), q.groundTruth(), generatedAnswer);

            // Step 4: compute overall score
            double overall = calculateOverallScore(
                    faithfulness.score(),
                    answerRelevance.score(),
                    contextPrecision.score(),
                    contextRecall.score(),
                    answerCorrectness.score()
            );

            String retrievedContextsText = buildRetrievedContextsText(retrievedDocs);

            results.add(new EvaluationCsvResult(
                    q.id(),
                    q.question(),
                    q.groundTruth(),
                    q.context(),
                    generatedAnswer,
                    retrievedContextsText,
                    faithfulness.score(),
                    faithfulness.reason(),
                    answerRelevance.score(),
                    answerRelevance.reason(),
                    contextPrecision.score(),
                    contextPrecision.reason(),
                    contextRecall.score(),
                    contextRecall.reason(),
                    answerCorrectness.score(),
                    answerCorrectness.reason(),
                    overall
            ));

            log.info("Question {}/{} done — faith={}, rel={}, prec={}, recall={}, correct={}, overall={}",
                    i + 1, total,
                    faithfulness.score(), answerRelevance.score(),
                    contextPrecision.score(), contextRecall.score(),
                    answerCorrectness.score(), overall);
        }

        log.info("Writing CSV...");
        writeResultCsv(results, OUTPUT_CSV_PATH);
        log.info("Completed. Output written to: {}", OUTPUT_CSV_PATH);
    }

    // -----------------------------------------------------------------------
    // CSV I/O
    // -----------------------------------------------------------------------

    /**
     * Reads the evaluation input CSV from the classpath.
     *
     * <p>Expected columns: {@code id, question, ground_truth, context}
     *
     * @param classpathResource classpath-relative path starting with {@code /}
     * @return ordered list of {@link CsvQuestion}
     * @throws IOException on classpath resource resolution or CSV parse error
     */
    List<CsvQuestion> loadCsv(String classpathResource) throws IOException {
        try (Reader reader = new InputStreamReader(
                Objects.requireNonNull(
                        getClass().getResourceAsStream(classpathResource),
                        "CSV not found on classpath: " + classpathResource),
                StandardCharsets.UTF_8);
             CSVParser parser = CSVFormat.DEFAULT
                     .builder()
                     .setHeader()
                     .setSkipHeaderRecord(true)
                     .setTrim(true)
                     .setIgnoreEmptyLines(true)
                     .build()
                     .parse(reader)) {

            List<CsvQuestion> questions = new ArrayList<>();
            for (CSVRecord record : parser) {
                questions.add(new CsvQuestion(
                        Integer.parseInt(record.get("id")),
                        record.get("question"),
                        record.get("ground_truth"),
                        record.get("context")
                ));
            }
            return questions;
        }
    }

    /**
     * Writes all evaluation results to {@code outputPath} using Apache Commons CSV.
     *
     * <p>Column order matches the RAGAS-extended schema:
     * {@code id, question, ground_truth, expected_context, generated_answer, retrieved_contexts,
     * faithfulness_score, faithfulness_reason, answer_relevance_score, answer_relevance_reason,
     * context_precision_score, context_precision_reason, context_recall_score, context_recall_reason,
     * answer_correctness_score, answer_correctness_reason, overall_score}
     *
     * @param results    list of fully populated {@link EvaluationCsvResult} objects
     * @param outputPath file-system path for the output CSV file
     * @throws IOException on write error
     */
    void writeResultCsv(List<EvaluationCsvResult> results, String outputPath) throws IOException {
        CSVFormat format = CSVFormat.DEFAULT
                .builder()
                .setHeader(
                        "id",
                        "question",
                        "ground_truth",
                        "expected_context",
                        "generated_answer",
                        "retrieved_contexts",
                        "faithfulness_score",
                        "faithfulness_reason",
                        "answer_relevance_score",
                        "answer_relevance_reason",
                        "context_precision_score",
                        "context_precision_reason",
                        "context_recall_score",
                        "context_recall_reason",
                        "answer_correctness_score",
                        "answer_correctness_reason",
                        "overall_score"
                )
                .build();

        try (BufferedWriter writer = new BufferedWriter(new FileWriter(outputPath, StandardCharsets.UTF_8));
             CSVPrinter printer = new CSVPrinter(writer, format)) {

            for (EvaluationCsvResult r : results) {
                printer.printRecord(
                        r.id(),
                        r.question(),
                        r.groundTruth(),
                        r.expectedContext(),
                        r.generatedAnswer(),
                        r.retrievedContexts(),
                        r.faithfulnessScore(),
                        r.faithfulnessReason(),
                        r.answerRelevanceScore(),
                        r.answerRelevanceReason(),
                        r.contextPrecisionScore(),
                        r.contextPrecisionReason(),
                        r.contextRecallScore(),
                        r.contextRecallReason(),
                        r.answerCorrectnessScore(),
                        r.answerCorrectnessReason(),
                        r.overallScore()
                );
            }
        }
    }

    // -----------------------------------------------------------------------
    // RAG pipeline helpers
    // -----------------------------------------------------------------------

    /**
     * Sends the question to the RAG pipeline and returns the full {@link ChatResponse}.
     *
     * <p>Only the {@code question} is passed — the {@link #ragAdvisor} handles
     * vector-store retrieval automatically and attaches documents to the response metadata.
     *
     * @param question the user question
     * @return full {@link ChatResponse} containing the answer text and retrieval metadata
     */
    ChatResponse generateAnswer(String question) {
        return chatClient.prompt()
                .advisors(ragAdvisor)
                .user(question)
                .call()
                .chatResponse();
    }

    /**
     * Extracts the list of retrieved {@link Document}s from the RAG response metadata.
     *
     * <p>The {@link RetrievalAugmentationAdvisor} stores retrieved documents under the
     * {@link RetrievalAugmentationAdvisor#DOCUMENT_CONTEXT} metadata key.
     *
     * @param chatResponse response produced by {@link #generateAnswer(String)}
     * @return retrieved documents, or an empty list when the advisor did not attach any
     */
    @SuppressWarnings("unchecked")
    List<Document> retrieveDocuments(ChatResponse chatResponse) {
        Object raw = chatResponse.getMetadata().get(RetrievalAugmentationAdvisor.DOCUMENT_CONTEXT);
        if (raw instanceof List<?> list && !list.isEmpty() && list.get(0) instanceof Document) {
            return (List<Document>) raw;
        }
        return List.of();
    }

    // -----------------------------------------------------------------------
    // Metric evaluators
    // -----------------------------------------------------------------------

    /**
     * Evaluates <strong>Faithfulness</strong> using {@link FactCheckingEvaluator}.
     *
     * <p>Faithfulness measures whether the generated answer is grounded in the
     * retrieved context and does not contain hallucinations. A score of 1.0 means
     * every claim in the answer can be traced back to a retrieved chunk; 0.0 means
     * the answer contains fabricated information.
     *
     * @param question        the user question
     * @param generatedAnswer the answer produced by the RAG pipeline
     * @param retrievedDocs   documents used as context during generation
     * @return {@link MetricScore} — 1.0 (pass) or 0.0 (fail) with evaluator feedback
     */
    MetricScore evaluateFaithfulness(String question, String generatedAnswer, List<Document> retrievedDocs) {
        EvaluationRequest request = new EvaluationRequest(question, retrievedDocs, generatedAnswer);
        EvaluationResponse response = factCheckingEvaluator.evaluate(request);

        String feedback = response.getFeedback();
        if (feedback == null || feedback.trim().isEmpty()) {
            feedback = response.isPass()
                    ? "Passed: Answer is grounded in the retrieved context."
                    : "Failed: Answer may contain hallucinated information.";
        }

        return MetricScore.of(response.isPass(), feedback);
    }

    /**
     * Evaluates <strong>Answer Relevance</strong> using {@link RelevancyEvaluator}.
     *
     * <p>Answer Relevance measures whether the generated answer directly addresses
     * the question asked. A score of 1.0 means the answer is focused and on-topic;
     * 0.0 means the answer is tangential or unrelated to the question.
     *
     * @param question        the user question
     * @param generatedAnswer the answer produced by the RAG pipeline
     * @param retrievedDocs   documents used as context (required by the evaluator API)
     * @return {@link MetricScore} — 1.0 (pass) or 0.0 (fail) with evaluator feedback
     */
    MetricScore evaluateAnswerRelevance(String question, String generatedAnswer, List<Document> retrievedDocs) {
        EvaluationRequest request = new EvaluationRequest(question, retrievedDocs, generatedAnswer);
        EvaluationResponse response = relevancyEvaluator.evaluate(request);

        String feedback = response.getFeedback();
        if (feedback == null || feedback.trim().isEmpty()) {
            feedback = response.isPass()
                    ? "Passed: Answer is relevant to the question."
                    : "Failed: Answer is not relevant to the question.";
        }

        return MetricScore.of(response.isPass(), feedback);
    }

    /**
     * Evaluates <strong>Context Precision</strong> using {@link ContextPrecisionEvaluator}.
     *
     * <p>Context Precision is the RAGAS metric that measures what fraction of the
     * <em>retrieved</em> documents are relevant to the <em>gold/expected</em> context.
     * This is evaluated against the {@code context} column from the input CSV, not just
     * against the question — enabling a true precision signal.
     *
     * <p>Returns a continuous score in [0, 1] produced by the LLM judge.
     *
     * @param question        the user question
     * @param expectedContext the gold context loaded from the input CSV ({@code context} column)
     * @param retrievedDocs   documents returned by the vector-store retriever
     * @return {@link MetricScore} with a continuous score in [0, 1] and a textual reason
     */
    MetricScore evaluateContextPrecision(String question, String expectedContext, List<Document> retrievedDocs) {
        return contextPrecisionEvaluator.evaluate(question, expectedContext, retrievedDocs);
    }

    /**
     * Evaluates <strong>Context Recall</strong> using {@link ContextRecallEvaluator}.
     *
     * <p>Context Recall is the RAGAS metric that measures what fraction of the important
     * information in the <em>gold/expected</em> context was successfully retrieved.
     * High recall means the retriever found all the necessary information; low recall
     * means key facts from the reference context were missed.
     *
     * <p>Returns a continuous score in [0, 1] produced by the LLM judge.
     *
     * @param question        the user question (used to focus the evaluation)
     * @param expectedContext the gold context loaded from the input CSV ({@code context} column)
     * @param retrievedDocs   documents returned by the vector-store retriever
     * @return {@link MetricScore} with a continuous score in [0, 1] and a textual reason
     */
    MetricScore evaluateContextRecall(String question, String expectedContext, List<Document> retrievedDocs) {
        return contextRecallEvaluator.evaluate(question, expectedContext, retrievedDocs);
    }

    /**
     * Evaluates <strong>Answer Correctness</strong> using {@link AnswerCorrectnessEvaluator}.
     *
     * <p>Answer Correctness is the RAGAS metric that measures the semantic similarity
     * and factual accuracy of the generated answer relative to the ground-truth answer.
     * Unlike Faithfulness (which checks against retrieved context), this metric checks
     * the answer against the expert-written reference answer in the CSV.
     *
     * <p>Returns a continuous score in [0, 1] produced by the LLM judge, enabling partial
     * credit for answers that are mostly correct but miss some facts.
     *
     * @param question        the user question (context for the judge)
     * @param groundTruth     the reference answer from the input CSV ({@code ground_truth} column)
     * @param generatedAnswer the answer produced by the RAG pipeline
     * @return {@link MetricScore} with a continuous score in [0, 1] and a textual reason
     */
    MetricScore evaluateAnswerCorrectness(String question, String groundTruth, String generatedAnswer) {
        return answerCorrectnessEvaluator.evaluate(question, groundTruth, generatedAnswer);
    }

    // -----------------------------------------------------------------------
    // Scoring helpers
    // -----------------------------------------------------------------------

    /**
     * Computes the RAGAS overall score as the arithmetic mean of all five metrics,
     * rounded to 3 decimal places.
     *
     * <pre>
     * overall = (faithfulness + answerRelevance + contextPrecision + contextRecall + answerCorrectness) / 5
     * </pre>
     *
     * @param faithfulness      Faithfulness score in [0, 1]
     * @param answerRelevance   Answer Relevance score in [0, 1]
     * @param contextPrecision  Context Precision score in [0, 1]
     * @param contextRecall     Context Recall score in [0, 1]
     * @param answerCorrectness Answer Correctness score in [0, 1]
     * @return overall score rounded to 3 decimal places
     */
    double calculateOverallScore(double faithfulness, double answerRelevance,
                                 double contextPrecision, double contextRecall,
                                 double answerCorrectness) {
        double raw = (faithfulness + answerRelevance + contextPrecision + contextRecall + answerCorrectness) / 5.0;
        return BigDecimal.valueOf(raw).setScale(3, RoundingMode.HALF_UP).doubleValue();
    }

    // -----------------------------------------------------------------------
    // Formatting helpers
    // -----------------------------------------------------------------------

    /**
     * Concatenates all retrieved document texts with a numbered separator,
     * formatted for storage in a single CSV cell.
     *
     * @param docs retrieved documents from the VectorStore
     * @return formatted string like {@code "[1] text | [2] text"}, or {@code "(none)"} when empty
     */
    private String buildRetrievedContextsText(List<Document> docs) {
        if (docs == null || docs.isEmpty()) {
            return "(none)";
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < docs.size(); i++) {
            if (i > 0) sb.append(" | ");
            sb.append("[").append(i + 1).append("] ");
            sb.append(docs.get(i).getText());
        }
        return sb.toString();
    }
}
