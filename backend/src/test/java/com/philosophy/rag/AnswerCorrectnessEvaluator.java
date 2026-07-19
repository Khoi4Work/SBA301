package com.philosophy.rag;

import org.springframework.ai.chat.client.ChatClient;

/**
 * Evaluates <em>Answer Correctness</em> in the RAGAS sense:
 * measures the semantic similarity and factual accuracy of the
 * <strong>generated answer</strong> relative to the <strong>ground truth</strong>.
 *
 * <h3>RAGAS definition</h3>
 * <blockquote>
 *   Answer Correctness is an assessment of the accuracy of the generated answer
 *   when compared to the ground truth. Answers are penalised for inaccuracies and
 *   rewarded for covering all key facts in the reference answer.
 * </blockquote>
 *
 * <h3>Scoring</h3>
 * Unlike Faithfulness and Answer Relevance — which Spring AI evaluates with a
 * binary pass/fail — Answer Correctness uses an <em>LLM-as-a-Judge</em> pattern
 * to produce a <strong>continuous</strong> score in [0.0, 1.0].
 *
 * <h3>LLM judge prompt contract</h3>
 * <pre>{@code
 * {
 *   "score": 0.85,
 *   "reason": "The generated answer covers most key facts but omits X."
 * }
 * }</pre>
 * Parsed by {@link JsonScoreParser}.
 */
public class AnswerCorrectnessEvaluator {

    private static final String PROMPT_TEMPLATE = """
            You are an expert RAG evaluator specializing in RAGAS metrics.

            Question:
            %s

            Ground Truth Answer:
            %s

            Generated Answer:
            %s

            Task: Evaluate ANSWER CORRECTNESS.
            Answer Correctness measures how semantically accurate and factually complete
            the generated answer is compared to the ground truth answer.

            Consider:
            - Factual accuracy: Does the generated answer state facts that match the ground truth?
            - Completeness: Does the generated answer cover all key points in the ground truth?
            - No penalty for extra correct information beyond the ground truth.
            - Penalise factual errors, missed key facts, or contradictions.

            Scoring guide:
            - 1.0 = Fully correct, covers all key facts, no errors.
            - 0.7 = Mostly correct, covers most key facts with minor omissions.
            - 0.4 = Partially correct, significant omissions or minor errors.
            - 0.0 = Incorrect or contradicts the ground truth.

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
    public AnswerCorrectnessEvaluator(ChatClient judgeClient) {
        this.judgeClient = judgeClient;
    }

    /**
     * Evaluates the correctness of a generated answer against the ground-truth reference.
     *
     * <p>This method uses an LLM judge to compare semantic content and factual accuracy,
     * returning a continuous score instead of a binary pass/fail so that partial credit
     * is possible (e.g., an answer that is mostly correct but omits one key fact scores
     * around 0.7 rather than 0.0).
     *
     * @param question        the original user question (context for the judge)
     * @param groundTruth     the reference answer loaded from the input CSV
     * @param generatedAnswer the answer produced by the RAG pipeline
     * @return a {@link MetricScore} with a continuous score in [0, 1] and a textual reason
     */
    public MetricScore evaluate(String question, String groundTruth, String generatedAnswer) {
        String prompt = PROMPT_TEMPLATE.formatted(question, groundTruth, generatedAnswer);

        String raw = judgeClient.prompt()
                .user(prompt)
                .call()
                .content();

        return JsonScoreParser.parse(raw);
    }
}
