package com.philosophy.rag.base.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class ChatClientConfig {

    /**
     * Resolves the conflict when multiple ChatModel beans are present (Google and Ollama).
     * By defining a @Primary ChatModel, we satisfy the requirements of
     * ChatClientAutoConfiguration which expects a single ChatModel to create the default ChatClient.Builder.
     */
    @Bean
    @Primary
    public ChatModel primaryChatModel(
            @Qualifier("googleGenAiChatModel") ChatModel googleModel,
            @Qualifier("ollamaChatModel") ChatModel ollamaModel,
            @Value("${ai.provider:google}") String provider) {

        return "ollama".equalsIgnoreCase(provider) ? ollamaModel : googleModel;
    }

    /**
     * Provides the ChatClient.Builder bean.
     * Since we now have a @Primary ChatModel, the default builder will use that model.
     */
    @Bean
    @Primary
    public ChatClient.Builder chatClientBuilder(ChatModel primaryChatModel) {
        return ChatClient.builder(primaryChatModel);
    }

    /**
     * Provides the ChatClient.Builder bean specifically for Quiz generation.
     * Uses quiz.ai.provider configuration.
     */
    @Bean
    public ChatClient.Builder quizChatClientBuilder(
            @Qualifier("googleGenAiChatModel") ChatModel googleModel,
            @Qualifier("ollamaChatModel") ChatModel ollamaModel,
            @Value("${quiz.ai.provider:google}") String provider) {

        ChatModel model = "ollama".equalsIgnoreCase(provider) ? ollamaModel : googleModel;
        return ChatClient.builder(model);
    }
}
