# Cohere Reranker Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace primitive keyword-based document ranking with Cohere Rerank API to improve RAG retrieval precision.

**Architecture:** Introduce a dedicated `CohereRerankService` to handle API communication and update `GeminiRagServiceImpl` to use this service for re-ranking the top candidates from the vector store.

**Tech Stack:** Java 21, Spring Boot 3.3.0, Cohere Rerank API, RestTemplate.

## Global Constraints
- `cohere.api.key`: Required API key from Cohere.
- `cohere.rerank.model`: `rerank-multilingual-v3.0`.
- `cohere.top.k`: `30`.
- Retrieval limit: `topK(150)` from VectorStore.
- Fallback: Revert to basic top-K if API fails.

---

### Task 1: Configuration Setup

**Files:**
- Modify: `backend/src/main/resources/application-dev.properties`
- Modify: `backend/src/main/resources/application-prod.properties`

- [ ] **Step 1: Add Cohere properties to dev profile**
```properties
cohere.api.key=${COHERE_API_KEY}
cohere.rerank.model=rerank-multilingual-v3.0
cohere.top.k=30
```

- [ ] **Step 2: Add Cohere properties to prod profile**
```properties
cohere.api.key=${COHERE_API_KEY}
cohere.rerank.model=rerank-multilingual-v3.0
cohere.top.k=30
```

- [ ] **Step 3: Commit**
```bash
git add backend/src/main/resources/application-dev.properties backend/src/main/resources/application-prod.properties
git commit -m "config: add cohere reranker properties"
```

### Task 2: CohereRerankService Implementation

**Files:**
- Create: `backend/src/main/java/com/philosophy/rag/service/impl/CohereRerankService.java`

**Interfaces:**
- Produces: `public List<Document> rerank(String query, List<Document> candidates)`

- [ ] **Step 1: Implement the service class**
Create `CohereRerankService` with `@Service` and `@Slf4j`. Inject configuration values using `@Value`.
Include a private record for Request/Response DTOs.

```java
@Service
@Slf4j
public class CohereRerankService {
    @Value("${cohere.api.key}")
    private String apiKey;
    
    @Value("${cohere.rerank.model}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();

    public List<Document> rerank(String query, List<Document> candidates) {
        // Implementation using RestTemplate to call https://api.cohere.ai/v1/rerank
        // 1. Prepare request body: {model, query, documents}
        // 2. Set headers: "Authorization: Beared " + apiKey, "Content-Type: application/json"
        // 3. Execute POST request
        // 4. Parse response results and sort candidates based on index and score
    }
}
```

- [ ] **Step 2: Implement API mapping logic**
Map the `results` array from Cohere's response (which contains `index` and `relevance_score`) back to the original `List<Document>`.

- [ ] **Step 3: Commit**
```bash
git add backend/src/main/java/com/philosophy/rag/service/impl/CohereRerankService.java
git commit -m "feat: implement CohereRerankService for API integration"
```

### Task 3: Integration into GeminiRagServiceImpl

**Files:**
- Modify: `backend/src/main/java/com/philosophy/rag/service/impl/GeminiRagServiceImpl.java`

**Interfaces:**
- Consumes: `CohereRerankService.rerank(String, List<Document>)`

- [ ] **Step 1: Inject CohereRerankService**
Add `private final CohereRerankService cohereRerankService;` to the class and update the constructor.

- [ ] **Step 2: Update retrieveCandidates to increase topK**
Change `topK(500)` to `topK(150)` for both `queryDocs` and `keywordDocs`.

- [ ] **Step 3: Replace rankDocuments implementation**
Replace the manual keyword loop with a call to `cohereRerankService`. Implement the fallback mechanism.

```java
private List<Document> rankDocuments(String query, List<Document> candidates) {
    try {
        log.info("[Gemini RAG] Reranking {} candidates with Cohere...", candidates.size());
        return cohereRerankService.rerank(query, candidates);
    } catch (Exception e) {
        log.error("[Gemini RAG] Cohere Rerank failed, falling back to basic top-K: {}", e.getMessage());
        return candidates.stream().limit(30).collect(Collectors.toList());
    }
}
```

- [ ] **Step 4: Commit**
```bash
git add backend/src/main/java/com/philosophy/rag/service/impl/GeminiRagServiceImpl.java
git commit -m "feat: integrate Cohere Reranker into RAG flow"
```
