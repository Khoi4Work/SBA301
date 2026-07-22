package com.philosophy.rag;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;

import java.util.List;

/**
 * Evaluates <em>Context Precision</em> in the RAGAS sense:
 * measures how much of the <strong>retrieved</strong> context is actually relevant
 * to the expected (gold) context from the ground-truth dataset.
 *
 * <h3>Why the signature changed</h3>
 * <p>The previous implementation compared retrieved documents only against the
 * <em>question</em>, which measured retrieval usefulness but not precision against
 * a known-good reference. RAGAS defines Context Precision as:
 * <blockquote>
 *   Of all retrieved chunks, what fraction overlaps with the gold context?
 * </blockquote>
 * By passing in the gold {@code expectedContext} from the CSV we get a true
 * precision signal — retrieved chunks that match the gold context score high,
 * off-topic chunks drag the score down.
 *
 * <h3>LLM judge prompt contract</h3>
 * <pre>{@code
 * {
 *   "score": 0.91,
 *   "reason": "Most retrieved chunks match the expected context."
 * }
 * }</pre>
 * Parsed by {@link JsonScoreParser}.
 */
public class ContextPrecisionEvaluator {

    private static final String PROMPT_TEMPLATE = """
            You are an expert RAG evaluator specializing in RAGAS metrics.

            Question:
            %s

            Expected (Gold) Context:
            %s

            Retrieved Context:
            %s

            Task: Evaluate CONTEXT PRECISION.
            Context Precision measures what fraction of the retrieved chunks are relevant
            to the expected (gold) context. High precision means the retriever did not
            include unnecessary or off-topic chunks.

            Scoring guide:
            - 1.0 = All retrieved chunks are present in or directly support the gold context.
            - 0.5 = About half of the retrieved chunks match the gold context.
            - 0.0 = None of the retrieved chunks relate to the gold context.

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
    public ContextPrecisionEvaluator(ChatClient judgeClient) {
        this.judgeClient = judgeClient;
    }

    /**
     * Evaluates context precision by comparing retrieved documents against the gold context.
     *
     * <p>The gold {@code expectedContext} comes from the {@code context} column of the input CSV.
     * A high score means the retriever fetched the right chunks; a low score means it fetched
     * irrelevant material even if those chunks happen to be related to the question.
     *
     * @param question        the original user question
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
     * Joins all retrieved document texts with a numbered separator so the LLM can
     * reason about individual chunks independently.
     *
     * @param documents retrieved documents from VectorStore
     * @return formatted multi-chunk string
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
