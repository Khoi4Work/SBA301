package com.philosophy.rag.features.ai.service.impl;

import com.philosophy.rag.features.ai.common.DocumentMetadataUtils;
import com.philosophy.rag.features.ai.service.CohereRerankService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

import static com.philosophy.rag.features.ai.common.DocumentMetadataUtils.getMetadataValue;

@Service
@Slf4j
public class CohereRerankServiceImpl implements CohereRerankService {

    @Value("${cohere.api.key}")
    private String apiKey;

    @Value("${cohere.rerank.model}")
    private String model;

    @Value("${cohere.top.k}")
    private int topK;

    @Value("${cohere.max.candidates}")
    private int maxCandidates;

    @Value("${cohere.max.document.chars}")
    private int maxDocumentChars;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public List<Document> rerank(String query, List<Document> candidates) {

        if (query == null || query.trim().isEmpty()) {
            log.warn("[Cohere Rerank] Query is empty. Skip reranking.");
            return Collections.emptyList();
        }

        if (candidates == null || candidates.isEmpty()) {
            log.info("[Cohere Rerank] No candidates to rerank.");
            return Collections.emptyList();
        }

        List<Document> safeCandidates = candidates.stream()
                .filter(Objects::nonNull)
                .filter(doc -> doc.getText() != null && !doc.getText().trim().isEmpty())
                .limit(maxCandidates)
                .toList();

        if (safeCandidates.isEmpty()) {
            log.info("[Cohere Rerank] All candidates are empty after filtering.");
            return Collections.emptyList();
        }

        try {
            int safeTopK = Math.min(topK, safeCandidates.size());

            log.info("[Cohere Rerank] Reranking {} candidates. topK={}",
                    safeCandidates.size(), safeTopK);

            List<String> documentsForRerank = safeCandidates.stream()
                    .map(this::toRerankText)
                    .collect(Collectors.toList());

            CohereRerankRequest request = new CohereRerankRequest(
                    model,
                    query,
                    documentsForRerank,
                    safeTopK
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            HttpEntity<CohereRerankRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<CohereRerankResponse> response = restTemplate.postForEntity(
                    "https://api.cohere.ai/v1/rerank",
                    entity,
                    CohereRerankResponse.class
            );

            if (response.getBody() == null || response.getBody().results() == null) {
                log.warn("[Cohere Rerank] Empty response from Cohere API.");
                return fallbackTopK(safeCandidates);
            }

            List<CohereRerankResponse.RerankResult> results = response.getBody().results();

            return results.stream()
                    .filter(result -> result.index() >= 0 && result.index() < safeCandidates.size())
                    .map(result -> addRerankScore(
                            safeCandidates.get(result.index()),
                            result.relevance_score()
                    ))
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("[Cohere Rerank] API call failed: {}", e.getMessage());
            return fallbackTopK(safeCandidates);
        }
    }

    // DTOs for Cohere API
    private record CohereRerankRequest(
            String model,
            String query,
            List<String> documents,
            int top_n
    ) {}

    private record CohereRerankResponse(
            List<RerankResult> results
    ) {
        public record RerankResult(
                int index,
                float relevance_score
        ) {}
    }

    private String toRerankText(Document document) {
        Map<String, Object> metadata = document.getMetadata();

        String text = document.getText();
        if (text == null) {
            text = "";
        }

        text = text.trim();

        if (text.length() > maxDocumentChars) {
            text = text.substring(0, maxDocumentChars);
        }

        String heading = getMetadataValue(metadata, "heading", null);;
        String readerType = getMetadataValue(metadata, "reader_type", null);

        StringBuilder sb = new StringBuilder();

        if (heading != null && !heading.isBlank()) {
            sb.append("Heading: ").append(heading).append("\n");
        }

        if (readerType != null && readerType.contains("markdown")) {
            String sectionIndex = getMetadataValue(metadata, "section_index", null);
            if (sectionIndex != null) {
                sb.append("Section: ").append(sectionIndex).append("\n");
            }
        }

        sb.append("Content: ").append(text);

        return sb.toString();
    }



    private List<Document> fallbackTopK(List<Document> candidates) {
        return candidates.stream()
                .limit(topK)
                .collect(Collectors.toList());
    }

    private Document addRerankScore(Document document, float score) {
        Map<String, Object> metadata = new HashMap<>(document.getMetadata());
        metadata.put("rerank_score", score);

        assert document.getText() != null;
        return new Document(document.getText(), metadata);
    }

}
