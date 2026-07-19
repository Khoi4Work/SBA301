package com.philosophy.rag;

/**
 * Aggregates all RAGAS-style evaluation results for a single CSV row.
 *
 * <p>This record is populated during {@code evaluateCsv()} and serialised to
 * {@code evaluation_result.csv} via Apache Commons CSV.
 *
 * <h3>Metrics</h3>
 * <ul>
 *   <li><b>Faithfulness</b>           — Is the answer grounded in the retrieved context?</li>
 *   <li><b>Answer Relevance</b>       — Does the answer address the question?</li>
 *   <li><b>Context Precision</b>      — Do retrieved chunks match the gold context?</li>
 *   <li><b>Context Recall</b>         — Did the retriever surface the gold context information?</li>
 *   <li><b>Answer Correctness</b>     — Is the answer semantically correct vs ground truth?</li>
 *   <li><b>Overall Score</b>          — Arithmetic mean of all five metrics.</li>
 * </ul>
 */
public record EvaluationCsvResult(
        int    id,
        String question,
        String groundTruth,
        String expectedContext,
        String generatedAnswer,
        String retrievedContexts,

        // Faithfulness
        double faithfulnessScore,
        String faithfulnessReason,

        // Answer Relevance
        double answerRelevanceScore,
        String answerRelevanceReason,

        // Context Precision
        double contextPrecisionScore,
        String contextPrecisionReason,

        // Context Recall (NEW)
        double contextRecallScore,
        String contextRecallReason,

        // Answer Correctness (NEW)
        double answerCorrectnessScore,
        String answerCorrectnessReason,

        // Aggregate
        double overallScore
) {}
