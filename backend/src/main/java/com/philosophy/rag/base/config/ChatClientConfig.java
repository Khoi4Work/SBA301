package com.philosophy.rag.base.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * Wires the application-level {@link ChatClient} and {@link ChatClient.Builder} beans.
 *
 * <p>This class is intentionally provider-agnostic. It depends only on the
 * {@code @Primary ChatModel} bean, which is supplied by either
 * {@link GeminiChatConfig} or {@link OllamaChatConfig} depending on the
 * {@code app.llm.provider} property. No provider-specific qualifier is used here.</p>
 *
 * <p>The embedding model is always backed by Google GenAI, regardless of the active
 * chat provider, because PGVector is indexed with 768-dimensional Google embeddings.
 * Switching embedding providers mid-lifecycle would invalidate the entire vector store.</p>
 */
@Configuration
public class ChatClientConfig {

    /**
     * Provides the default {@link ChatClient} backed by whichever {@code @Primary}
     * {@link ChatModel} is active (Gemini or Ollama).
     *
     * <p>Injected into {@link com.philosophy.rag.features.ai.service.impl.RagServiceImpl}
     * and any other service that needs a plain {@code ChatClient}.</p>
     *
     * @param primaryChatModel resolved by Spring from {@link GeminiChatConfig} or
     *                         {@link OllamaChatConfig}
     * @return the primary {@link ChatClient} ready for use
     */
    @Bean
    @Primary
    public ChatClient primaryChatClient(ChatModel primaryChatModel) {
        return ChatClient.builder(primaryChatModel).build();
    }

    /**
     * Provides a dedicated {@link ChatClient.Builder} for quiz generation.
     *
     * <p>Kept as a named qualifier ({@code quizChatClientBuilder}) so that
     * {@link com.philosophy.rag.features.learning.service.impl.QuizSetServiceImpl}
     * can be wired without ambiguity. Uses the same primary model as the main client.</p>
     *
     * @param primaryChatModel the active primary model
     * @return a {@link ChatClient.Builder} ready to build quiz-specific clients
     */
    @Bean
    public ChatClient.Builder quizChatClientBuilder(ChatModel primaryChatModel) {
        return ChatClient.builder(primaryChatModel);
    }

    /**
     * Designates the Google GenAI embedding model as the primary {@link EmbeddingModel} bean.
     *
     * <p>PGVector uses this bean to embed both documents at index time and queries at
     * retrieval time. This is always Google regardless of the chat provider.</p>
     *
     * @param googleEmbeddingModel the embedding model auto-configured by
     *                             spring-ai-starter-model-google-genai-embedding
     * @return the primary embedding model
     */
    @Bean
    @Primary
    public EmbeddingModel primaryEmbeddingModel(
            @Qualifier("googleGenAiTextEmbedding") EmbeddingModel googleEmbeddingModel) {
        return googleEmbeddingModel;
    }
}
