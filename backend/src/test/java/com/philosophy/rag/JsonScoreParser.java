package com.philosophy.rag;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Parses a JSON object returned by the LLM judge and extracts {@code score} and {@code reason}.
 *
 * <p>Expected JSON shape:
 * <pre>{@code
 * {
 *   "score": 0.91,
 *   "reason": "Most retrieved chunks are relevant."
 * }
 * }</pre>
 *
 * <p>The parser is lenient: if the LLM wraps the JSON in a markdown code-fence
 * (e.g., {@code ```json ... ```}), it strips the fence before parsing.
 */
public class JsonScoreParser {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private JsonScoreParser() {
        // utility class — no instantiation
    }

    /**
     * Parses the raw LLM output and returns a {@link MetricScore}.
     *
     * @param raw the raw text returned by the LLM judge
     * @return parsed {@link MetricScore}
     * @throws IllegalArgumentException when the JSON cannot be parsed
     */
    public static MetricScore parse(String raw) {
        String cleaned = stripMarkdownFence(raw.trim());
        try {
            JsonNode root = MAPPER.readTree(cleaned);
            double score = root.path("score").asDouble(0.0);
            String reason = root.path("reason").asText("No reason provided.");
            return new MetricScore(score, reason);
        } catch (Exception e) {
            throw new IllegalArgumentException(
                    "Failed to parse LLM judge response as JSON. Raw response:\n" + raw, e);
        }
    }

    // -------------------------------------------------------------------------
    // private helpers
    // -------------------------------------------------------------------------

    /**
     * Strips leading/trailing markdown code fences ({@code ```json} … {@code ```})
     * that some models add around their JSON output.
     */
    private static String stripMarkdownFence(String text) {
        if (text.startsWith("```")) {
            int firstNewline = text.indexOf('\n');
            int lastFence = text.lastIndexOf("```");
            if (firstNewline != -1 && lastFence > firstNewline) {
                return text.substring(firstNewline + 1, lastFence).trim();
            }
        }
        return text;
    }
}
