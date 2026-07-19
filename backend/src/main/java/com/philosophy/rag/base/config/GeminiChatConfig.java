package com.philosophy.rag.base.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * Registers the Google Gemini model as the {@code @Primary} {@link ChatModel} bean.
 *
 * <p>Active when {@code app.llm.provider=gemini} (or when the property is absent — default).</p>
 */
@Configuration
@ConditionalOnProperty(
        name = "app.llm.provider",
        havingValue = "gemini",
        matchIfMissing = true
)
@RequiredArgsConstructor
@Slf4j
public class GeminiChatConfig {

    /**
     * Wraps the auto-configured Google GenAI ChatModel as the application-wide primary.
     *
     * @param googleModel the ChatModel auto-configured by spring-ai-starter-model-google-genai
     * @return the primary ChatModel backed by Gemini
     */
    @Bean
    @Primary
    public ChatModel primaryChatModel(
            @Qualifier("googleGenAiChatModel") ChatModel googleModel) {
        log.info("[AI-PROVIDER] Active provider: Google Gemini");
        return googleModel;
    }
}
