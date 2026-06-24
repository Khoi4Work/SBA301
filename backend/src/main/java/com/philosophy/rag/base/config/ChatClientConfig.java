package com.philosophy.rag.base.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class ChatClientConfig {

    /**
     * Designates the Google GenAI chat model as the primary ChatModel bean,
     * satisfying Spring AI's ChatClientAutoConfiguration which requires exactly one.
     */
    @Bean
    @Primary
    public ChatModel primaryChatModel(
            @Qualifier("googleGenAiChatModel") ChatModel googleModel) {
        System.out.println("[AI-PROVIDER] google (Gemini)");
        return googleModel;
    }

    /**
     * Provides the default ChatClient.Builder backed by the primary (Gemini) model.
     */
    @Bean
    @Primary
    public ChatClient.Builder chatClientBuilder(ChatModel primaryChatModel) {
        return ChatClient.builder(primaryChatModel);
    }

    /**
     * Provides a dedicated ChatClient.Builder for quiz generation.
     * Uses the same Gemini model; kept as a separate qualifier so
     * QuizSetServiceImpl can be wired without ambiguity.
     */
    @Bean
    public ChatClient.Builder quizChatClientBuilder(
            @Qualifier("googleGenAiChatModel") ChatModel googleModel) {
        return ChatClient.builder(googleModel);
    }

    /**
     * Designates the Google GenAI embedding model as the primary EmbeddingModel bean.
     * PgVectorStore uses this bean to embed both documents and queries.
     */
    @Bean
    @Primary
    public EmbeddingModel primaryEmbeddingModel(
            @Qualifier("googleGenAiTextEmbedding") EmbeddingModel googleEmbeddingModel) {
        System.out.println("[EMBEDDING-PROVIDER] google (Gemini)");
        return googleEmbeddingModel;
    }
}
