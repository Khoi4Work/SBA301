package com.philosophy.rag.features.ai.service.impl;

import com.philosophy.rag.features.ai.service.CohereRerankService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class CohereRerankServiceImpl implements CohereRerankService {

    @Value("${cohere.api.key}")
    private String apiKey;

    @Value("${cohere.rerank.model}")
    private String model;

    @Value("${cohere.top.k}")
    private int topK;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public List<Document> rerank(String query, List<Document> candidates) {
        if (candidates == null || candidates.isEmpty()) {
            return Collections.emptyList();
        }

        try {
            log.debug("[Cohere Rerank] Reranking {} candidates for query: {}", candidates.size(), query);

            // Prepare request body
            CohereRerankRequest request = new CohereRerankRequest(
                    model,
                    query,
                    candidates.stream().map(Document::getText).collect(Collectors.toList()),
                    topK
            );

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            HttpEntity<CohereRerankRequest> entity = new HttpEntity<>(request, headers);

            // Execute POST request
            ResponseEntity<CohereRerankResponse> response = restTemplate.postForEntity(
                    "https://api.cohere.ai/v1/rerank",
                    entity,
                    CohereRerankResponse.class
            );

            if (response.getBody() == null || response.getBody().results() == null) {
                log.warn("[Cohere Rerank] Received empty response from Cohere API");
                return candidates;
            }

            // Map results back to original candidates and sort them
            List<CohereRerankResponse.RerankResult> results = response.getBody().results();

            // We want to sort the original candidates list according to the order in 'results'
            // Cohere's 'results' array is usually already sorted by relevance score (descending)
            // Each element in 'results' has an 'index' which corresponds to the index in the 'documents' array sent.

            return results.stream()
                    .filter(result -> result.index() >= 0 && result.index() < candidates.size())
                    .map(result -> candidates.get(result.index()))
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("[Cohere Rerank] API call failed: {}", e.getMessage());
            // Return original candidates as fallback
            return candidates;
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
}
