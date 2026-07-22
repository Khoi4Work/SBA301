package com.philosophy.rag.features.ai.service;

import org.springframework.ai.document.Document;
import java.util.List;

public interface CohereRerankService {
    /**
     * Reranks the given candidates based on their relevance to the query using Cohere Rerank API.
     *
     * @param query      The user query.
     * @param candidates The list of candidate documents from the vector store.
     * @return A list of documents sorted by relevance score.
     */
    List<Document> rerank(String query, List<Document> candidates);
}
