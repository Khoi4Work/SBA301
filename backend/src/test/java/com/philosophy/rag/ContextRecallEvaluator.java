package com.philosophy.rag;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;

import java.util.List;

/**
 * Evaluates <em>Context Recall</em> in the RAGAS sense:
 * measures how much of the information in the <strong>gold/expected context</strong>
 * was successfully retrieved by the RAG retriever.
 *
 * <h3>RAGAS definition</h3>
 * <blockquote>
 *   Context Recall = fraction of the gold context sentences that can be attributed
 *   to the retrieved context.
 * </blockquote>
 * A recall of 1.0 means every piece of relevant information from the reference context
 * was retrieved. A recall of 0.0 means the retriever missed everything important.
 *
 * <h3>LLM judge prompt contract</h3>
 * <pre>{@code
 * {
 *   "score": 0.80,
 *   "reason": "Most key facts from the gold context appear in the retrieved chunks."
 * }
 * }</pre>
 * Parsed by {@link JsonScoreParser}.
 */
public class ContextRecallEvaluator {

    private static final String PROMPT_TEMPLATE = """
            You are an expert RAG evaluator specializing in RAGAS metrics.

            Question:
            %s

            Expected (Gold) Context:
            %s

            Retrieved Context:
            %s

            Task: Evaluate CONTEXT RECALL.
            Context Recall measures what fraction of the important information in the
            gold context was successfully retrieved. High recall means the retriever
            found all the necessary information; low recall means important facts were missed.

            Scoring guide:
            - 1.0 = All key information from the gold context appears in the retrieved chunks.
            - 0.5 = About half the key information from the gold context was retrieved.
            - 0.0 = None of the key information from the gold context was retrieved.

            Return ONLY a JSON object, no markdown, no extra text:
            {
              "score": <0.0 to 1.0>,
              "reason": "<brief justification>"
            }
            """;

    private final ChatClient judgeClient;

    /**
     * @param judgeClient a {@link ChatClient} backed by the Ollama judge model (temperature 0)
     */
    public ContextRecallEvaluator(ChatClient judgeClient) {
        this.judgeClient = judgeClient;
    }

    /**
     * Evaluates context recall by checking whether the retrieved documents cover
     * the important information contained in the gold context.
     *
     * @param question        the original user question (used to focus the evaluation)
     * @param expectedContext the gold/reference context loaded from the input CSV
     * @param retrievedDocs   documents returned by the VectorStore retriever
     * @return a {@link MetricScore} with a continuous score in [0, 1] and a textual reason
     */
    public MetricScore evaluate(String question, String expectedContext, List<Document> retrievedDocs) {
        String retrievedText = buildContextText(retrievedDocs);
        String prompt = PROMPT_TEMPLATE.formatted(question, expectedContext, retrievedText);

        String raw = judgeClient.prompt()
                .user(prompt)
                .call()
                .content();

        return JsonScoreParser.parse(raw);
    }

    // -------------------------------------------------------------------------
    // private helpers
    // -------------------------------------------------------------------------

    /**
     * Formats the retrieved documents as a numbered list for the LLM judge.
     *
     * @param documents retrieved documents from VectorStore
     * @return formatted multi-chunk string, or a placeholder when empty
     */
    private String buildContextText(List<Document> documents) {
        if (documents == null || documents.isEmpty()) {
            return "(no documents retrieved)";
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < documents.size(); i++) {
            sb.append("[Chunk ").append(i + 1).append("]\n");
            sb.append(documents.get(i).getText()).append("\n\n");
        }
        return sb.toString().trim();
    }
}
