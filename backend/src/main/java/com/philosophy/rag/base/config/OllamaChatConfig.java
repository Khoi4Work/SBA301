package com.philosophy.rag.base.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.ai.ollama.api.OllamaApi;
import org.springframework.ai.ollama.api.OllamaChatOptions;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * Registers an Ollama-backed model as the {@code @Primary} {@link ChatModel} bean.
 *
 * <p>Active only when {@code app.llm.provider=ollama} is set in application properties.</p>
 *
 * <p>Ollama server must be running at the configured {@code app.llm.ollama.base-url}.
 * The chosen model should support tool-calling (e.g., {@code llama3.2}, {@code mistral-nemo})
 * if the main RAG ask() flow with PhilosopherTools is used.</p>
 */
@Configuration
@ConditionalOnProperty(
        name = "app.llm.provider",
        havingValue = "ollama"
)
@RequiredArgsConstructor
@Slf4j
public class OllamaChatConfig {

    private final LlmProperties llmProperties;

    /**
     * Builds and registers an {@link OllamaChatModel} as the application-wide primary ChatModel.
     *
     * <p>Configuration is sourced from {@code app.llm.ollama.*} properties:
     * <ul>
     *   <li>{@code base-url} — Ollama server URL (default: {@code http://localhost:11434})</li>
     *   <li>{@code model} — Model name (default: {@code llama3.2})</li>
     *   <li>{@code temperature} — Sampling temperature (default: {@code 0.7})</li>
     * </ul>
     * </p>
     *
     * @return the primary ChatModel backed by Ollama
     */
    @Bean
    @Primary
    public ChatModel primaryChatModel() {
        LlmProperties.Ollama cfg = llmProperties.getOllama();

        log.info("[AI-PROVIDER] Active provider: Ollama | base-url={} | model={}",
                cfg.getBaseUrl(), cfg.getModel());

        OllamaApi ollamaApi = OllamaApi.builder()
                .baseUrl(cfg.getBaseUrl())
                .build();

        OllamaChatOptions options = OllamaChatOptions.builder()
                .model(cfg.getModel())
                .temperature(cfg.getTemperature())
                .build();

        return OllamaChatModel.builder()
                .ollamaApi(ollamaApi)
                .defaultOptions(options)
                .build();
    }
}
