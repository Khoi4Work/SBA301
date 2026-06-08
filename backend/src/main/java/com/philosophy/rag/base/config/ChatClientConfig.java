package com.philosophy.rag.base.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class ChatClientConfig {

    /**
     * Resolves the conflict when multiple ChatModel beans are present (Google and Ollama).
     * By defining a @Primary ChatModel, we satisfy the requirements of
     * ChatClientAutoConfiguration which expects a single ChatModel to create the default ChatClient.Builder.
     */
    @Bean
    @Primary
    public ChatModel primaryChatModel(
            @Qualifier("googleGenAiChatModel") ObjectProvider<ChatModel> googleProvider,
            @Qualifier("ollamaChatModel") ObjectProvider<ChatModel> ollamaProvider,
            @Value("${ai.provider:google}") String provider) {
        log.info("[AI-PROVIDER] {}", provider);

        if ("ollama".equalsIgnoreCase(provider)) {
            ChatModel model = ollamaProvider.getIfAvailable();
            if (model == null) {
                throw new RuntimeException("Ollama provider is selected but Ollama model is not available");
            }
            return model;
        }

        ChatModel model = googleProvider.getIfAvailable();
        if (model == null) {
            throw new RuntimeException("Google provider is selected but Google AI model is not available");
        }
        return model;
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
            @Qualifier("googleGenAiChatModel") ObjectProvider<ChatModel> googleProvider,
            @Qualifier("ollamaChatModel") ObjectProvider<ChatModel> ollamaProvider,
            @Value("${quiz.ai.provider:google}") String provider) {

        ChatModel model;
        if ("ollama".equalsIgnoreCase(provider)) {
            model = ollamaProvider.getIfAvailable();
            if (model == null) {
                throw new RuntimeException("Ollama provider is selected for quizzes but Ollama model is not available");
            }
        } else {
            model = googleProvider.getIfAvailable();
            if (model == null) {
                throw new RuntimeException("Google provider is selected for quizzes but Google AI model is not available");
            }
        }
        return ChatClient.builder(model);
    }

    /**
     * Resolves the conflict for EmbeddingModel.
     * PgVectorStore will use this @Primary bean to embed queries and documents.
     */
    @Bean
    @Primary
    public EmbeddingModel primaryEmbeddingModel(
            @Qualifier("googleGenAiTextEmbedding") ObjectProvider<EmbeddingModel> googleProvider,
            @Qualifier("ollamaEmbeddingModel") ObjectProvider<EmbeddingModel> ollamaProvider,
            @Value("${ai.provider:google}") String provider) {

        log.info("[EMBEDDING-PROVIDER] {}", provider);

        if ("ollama".equalsIgnoreCase(provider)) {
            EmbeddingModel model = ollamaProvider.getIfAvailable();
            if (model == null) {
                throw new RuntimeException("Ollama provider is selected but Ollama embedding model is not available");
            }
            return model;
        }

        EmbeddingModel model = googleProvider.getIfAvailable();
        if (model == null) {
            throw new RuntimeException("Google provider is selected but Google AI embedding model is not available");
        }
        return model;
    }
}
