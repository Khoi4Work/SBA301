package com.philosophy.rag.base.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * Binds the {@code app.llm.*} configuration block.
 *
 * <p>Example usage in application properties:</p>
 * <pre>
 * app.llm.provider=gemini          # "gemini" (default) | "ollama"
 * app.llm.ollama.base-url=http://localhost:11434
 * app.llm.ollama.model=llama3.2
 * app.llm.ollama.timeout=PT120S
 * app.llm.ollama.temperature=0.7
 * </pre>
 */
@Component
@ConfigurationProperties(prefix = "app.llm")
@Data
public class LlmProperties {

    /**
     * Active LLM provider.
     * Accepted values: {@code gemini} (default), {@code ollama}.
     */
    private String provider = "gemini";

    /** Ollama-specific configuration. Only used when {@code provider=ollama}. */
    private Ollama ollama = new Ollama();

    @Data
    public static class Ollama {

        /** Base URL of the running Ollama server. */
        private String baseUrl = "http://localhost:11434";

        /**
         * Model name to use, e.g. {@code llama3.2}, {@code mistral-nemo}.
         * The model must support tool-calling if used in the main RAG ask() flow.
         */
        private String model = "llama3.2";

        /** Request timeout. ISO-8601 duration string (e.g. {@code PT120S} = 2 minutes). */
        private Duration timeout = Duration.ofSeconds(120);

        /** Sampling temperature for generation (0.0–1.0). */
        private Double temperature = 0.7;
    }
}
