package com.philosophy.rag;

/**
 * Represents a single row from the RAG evaluation input CSV.
 * Fields map directly to CSV columns: id, question, ground_truth, context.
 */
public record CsvQuestion(
        int id,
        String question,
        String groundTruth,
        String context
) {}
