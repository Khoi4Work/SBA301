# Design Spec: Cohere Reranker Integration

## 1. Purpose
Improve the retrieval quality of the RAG system by introducing a professional reranking stage. This replaces the primitive keyword-based filtering with a Cross-Encoder model from Cohere to ensure the most relevant documents are sent to the LLM, reducing noise and improving answer accuracy.

## 2. Architecture & Data Flow
The flow in `GeminiRagServiceImpl.ask()` is updated as follows:

**Current Flow:**
`Vector Search (Top 500)` $\rightarrow$ `Keyword Filter (Top 300)` $\rightarrow$ `Gemini LLM`

**New Flow:**
`Vector Search (Top 150)` $\rightarrow$ `Cohere Rerank API` $\rightarrow$ `Top 30 (High Relevance)` $\rightarrow$ `Gemini LLM`

### Detailed Steps:
1.  **Candidate Retrieval:** Fetch top 150 documents using `vectorStore.similaritySearch`.
2.  **Hybrid Expansion:** Continue using keyword-based retrieval to ensure term-matching coverage, then merge and distinct the results.
3.  **Reranking:** Pass the query and the merged candidate list to `CohereRerankService`.
4.  **Precision Selection:** Keep only the top 30 documents with the highest relevance scores.
5.  **Context Construction:** Build the final prompt context using these 30 documents.

## 3. Technical Implementation

### 3.1 Configuration
New properties in `application.properties`:
- `cohere.api.key`: The API key for Cohere.
- `cohere.rerank.model`: `rerank-multilingual-v3.0` (supports Vietnamese and English).
- `cohere.top.k`: `30` (number of final documents to retain).

### 3.2 Components
- **`CohereRerankService`**: A new service responsible for:
    - Making HTTP POST requests to `https://api.cohere.ai/v1/rerank`.
    - Mapping API responses back to `Document` objects.
    - Handling API-specific exceptions.
- **`GeminiRagServiceImpl`**:
    - Inject `CohereRerankService`.
    - Replace the logic in `rankDocuments` with a call to the new service.

### 3.3 Fallback Mechanism
To ensure system availability, the `rankDocuments` method will wrap the Cohere call in a try-catch block:
- **Success:** Use Cohere's reranked list.
- **Failure (API error, Timeout, Quota):** Fallback to a simple `Top 30` slice from the original Vector Search results to ensure the user still receives an answer.

## 4. Constraints & Performance
- **Latency:** Adding an API call increases response time. This is mitigated by limiting the candidate list to 150 documents.
- **Cost:** Using Cohere's free/trial tier.
- **Context Window:** Reducing input from 300 to 30 chunks significantly reduces tokens, preventing "Lost in the Middle" and reducing Gemini's processing time.

## 5. Success Criteria
- The system successfully calls the Cohere API.
- The `ask` method returns a response based on reranked documents.
- The system doesn't crash if the Cohere API is unavailable (fallback works).
