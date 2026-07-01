package com.philosophy.rag.features.ai.service.impl;

import com.philosophy.rag.features.ai.service.CohereRerankService;
import com.philosophy.rag.features.ai.service.KnowledgeRetrievalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Slf4j
public class KnowledgeRetrievalServiceImpl implements KnowledgeRetrievalService {

    private final VectorStore vectorStore;
    private final CohereRerankService cohereRerankService;

    @Override
    public List<Document> retrieveCandidates(String query) {
        String keywordQuery = query
                .replaceAll("(?i)có\\s+không|có\\s+phải\\s+là|là\\s+gì|tại\\s+sao", " ")
                .replaceAll("\\s{2,}", " ")
                .trim();

        List<Document> queryDocs = vectorStore.similaritySearch(
                SearchRequest.builder().query(query).topK(150).similarityThreshold(0.5).build());
        List<Document> keywordDocs = vectorStore.similaritySearch(
                SearchRequest.builder().query(keywordQuery).topK(150).similarityThreshold(0.5).build());

        return Stream.concat(queryDocs.stream(), keywordDocs.stream())
                .distinct()
                .collect(Collectors.toList());
    }

    @Override
    public List<Document> rankDocuments(String query, List<Document> candidates) {
        try {
            log.info("[KnowledgeRetrieval] Reranking {} candidates with Cohere...", candidates.size());
            return cohereRerankService.rerank(query, candidates);
        } catch (Exception e) {
            log.error("[KnowledgeRetrieval] Cohere Rerank failed, falling back to basic top-K: {}", e.getMessage());
            return candidates.stream().limit(30).collect(Collectors.toList());
        }
    }

    @Override
    public String buildContext(List<Document> docs) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < docs.size(); i++) {
            sb.append("[Source ").append(i + 1).append("]: ")
                    .append(docs.get(i).getText())
                    .append("\n\n");
        }
        return sb.toString();
    }
}
