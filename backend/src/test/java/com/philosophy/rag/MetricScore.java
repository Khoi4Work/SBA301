package com.philosophy.rag;

/**
 * Holds a numeric score and the evaluator's textual reasoning for a single metric.
 * Used as the return type for all three evaluators:
 *   - Faithfulness (FactCheckingEvaluator)
 *   - Answer Relevance (RelevancyEvaluator)
 *   - Context Precision (ContextPrecisionEvaluator)
 */
public record MetricScore(
        double score,
        String reason
) {
    /** Convenience factory when no explicit score is derivable from a boolean pass/fail. */
    public static MetricScore of(boolean pass, String reason) {
        return new MetricScore(pass ? 1.0 : 0.0, reason);
    }
}
