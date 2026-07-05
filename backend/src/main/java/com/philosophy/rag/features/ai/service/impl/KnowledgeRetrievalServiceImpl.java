package com.philosophy.rag.features.ai.service.impl;

import com.philosophy.rag.features.ai.service.CohereRerankService;
import com.philosophy.rag.features.ai.service.KnowledgeRetrievalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import static com.philosophy.rag.features.ai.common.DocumentMetadataUtils.getMetadataValue;

@Service
@RequiredArgsConstructor
@Slf4j
public class KnowledgeRetrievalServiceImpl implements KnowledgeRetrievalService {


    private static final int QUERY_TOP_K = 80;
    private static final int KEYWORD_TOP_K = 60;
    private static final int FINAL_CONTEXT_TOP_K = 12;
    private static final double SIMILARITY_THRESHOLD = 0.5;

    private final VectorStore vectorStore;
    private final CohereRerankService cohereRerankService;

    @Override
    public List<Document> retrieveCandidates(String query) {

        String keywordQuery = normalizeKeywordQuery(query);

        List<Document> queryDocs = similaritySearch(query, QUERY_TOP_K);

        List<Document> keywordDocs = List.of();
        if (!keywordQuery.isBlank() && !keywordQuery.equalsIgnoreCase(query.trim())) {
            keywordDocs = similaritySearch(keywordQuery, KEYWORD_TOP_K);
        }

        List<Document> merged = new ArrayList<>();
        merged.addAll(queryDocs);
        merged.addAll(keywordDocs);

        List<Document> deduplicated = deduplicateDocuments(merged);

        log.info("[KnowledgeRetrieval] Retrieved {} candidates, deduplicated to {}",
                merged.size(), deduplicated.size());

        return deduplicated;
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
        if (docs == null || docs.isEmpty()) {
            return "No relevant knowledge was found in the indexed documents.";
        }

        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < docs.size(); i++) {
            Document doc = docs.get(i);
            Map<String, Object> metadata = doc.getMetadata();

            String source = getMetadataValue(metadata, "source", "unknown");
            String page = getMetadataValue(metadata, "page", null);
            String totalPages = getMetadataValue(metadata, "total_pages", null);
            String chunkIndex = getMetadataValue(metadata, "chunk_index", null);
            String heading = getMetadataValue(metadata, "heading", null);
            String sectionIndex = getMetadataValue(metadata, "section_index", null);
            String readerType = getMetadataValue(metadata, "reader_type", null);

            sb.append("[Source ").append(i + 1);

            sb.append(" | File: ").append(source);

            if (page != null) {
                sb.append(" | Page: ").append(page);

                if (totalPages != null) {
                    sb.append("/").append(totalPages);
                }
            }

            if (sectionIndex != null) {
                sb.append(" | Section: ").append(sectionIndex);
            }

            if (heading != null) {
                sb.append(" | Heading: ").append(heading);
            }

            if (chunkIndex != null) {
                sb.append(" | Chunk: ").append(chunkIndex);
            }

            if (readerType != null) {
                sb.append(" | Type: ").append(readerType);
            }

            sb.append("]\n");
            sb.append(doc.getText().trim());
            sb.append("\n\n");
        }

        return sb.toString();
    }

    private String normalizeKeywordQuery(String query) {
        if (query == null) {
            return "";
        }

        return query
                .replaceAll("(?i)có\\s+không", " ")
                .replaceAll("(?i)có\\s+phải\\s+là", " ")
                .replaceAll("(?i)là\\s+gì", " ")
                .replaceAll("(?i)tại\\s+sao", " ")
                .replaceAll("(?i)hãy\\s+giải\\s+thích", " ")
                .replaceAll("(?i)giải\\s+thích", " ")
                .replaceAll("(?i)cho\\s+tôi\\s+biết", " ")
                .replaceAll("\\s{2,}", " ")
                .trim();
    }

    private List<Document> similaritySearch(String query, int topK) {
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }

        return vectorStore.similaritySearch(
                SearchRequest.builder()
                        .query(query)
                        .topK(topK)
                        .similarityThreshold(SIMILARITY_THRESHOLD)
                        .build()
        );
    }

    private List<Document> deduplicateDocuments(List<Document> documents) {
        Map<String, Document> uniqueDocuments = new LinkedHashMap<>();

        for (Document document : documents) {
            String key = buildDeduplicationKey(document);
            uniqueDocuments.putIfAbsent(key, document);
        }

        return new ArrayList<>(uniqueDocuments.values());
    }

    private String buildDeduplicationKey(Document document) {
        Map<String, Object> metadata = document.getMetadata();

        String chunkId = getMetadataValue(metadata, "chunk_id", null);
        if (chunkId != null) {
            return "chunk_id:" + chunkId;
        }

        String documentId = getMetadataValue(metadata, "document_id", null);
        String page = getMetadataValue(metadata, "page", null);
        String chunkIndex = getMetadataValue(metadata, "chunk_index", null);

        if (documentId != null && chunkIndex != null) {
            return "document_id:" + documentId + "|chunk_index:" + chunkIndex;
        }

        if (documentId != null && page != null) {
            return "document_id:" + documentId + "|page:" + page + "|text:" + document.getText().hashCode();
        }

        return "text:" + document.getText().hashCode();
    }


}
