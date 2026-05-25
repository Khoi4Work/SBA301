# Developer Agent Guide — Philosophy RAG Project

This file gives immediate, actionable knowledge for an AI coding agent (or developer) to be productive in this repository.

1) Big picture / architecture
- Backend: Spring Boot app (backend/) implementing a small RAG pipeline using Spring AI primitives: VectorStore, ChatClient, TextSplitter. Key implementation: `RagServiceImpl` (service logic), `RagController` (REST surface).
- Data: Postgres (pgvector) stores vector chunks in table `vector_store`; repository helpers in `repository/custom/VectorStoreRepository.java` query JSON metadata (metadata->>'source') and truncate the store.
- Frontend: React + Vite (frontend/) — minimal UI that talks to backend at `http://localhost:8080/api` via `src/services/apiClient.js`.

2) Important files to read first (order matters)
- `backend/src/main/java/com/philosophy/rag/service/impl/RagServiceImpl.java` — ingestion, splitting, indexing, retrieval, prompt-building and cleaning rules.
- `backend/src/main/java/com/philosophy/rag/controller/RagController.java` — API endpoints: `/api/rag/upload` (POST multipart file), `/api/rag/ask?query=...` (GET), `/api/rag/documents` (GET), `/api/rag/reset` (DELETE).
- `backend/src/main/resources/application.properties` — runtime config: Postgres URL, pgvector config, Ollama endpoints & models, multipart limits, JWT secret placeholder.
- `backend/src/main/java/com/philosophy/rag/repository/custom/VectorStoreRepository.java` — raw SQL expectations for `vector_store` (aggregate query and TRUNCATE).
- `frontend/src/services/apiClient.js` — baseURL and axios interceptors; CORS origin in `CorsConfig.java` matches Vite default.

3) How to run / reproduce locally (quick commands)
- Start pgvector postgres (docker-compose, from project root):
```powershell
docker compose up -d
```
- Start backend (from repo root):
```powershell
cd backend; mvn spring-boot:run
```
If you need remote debugging attach: (example)
```powershell
cd backend; mvn -Dspring-boot.run.jvmArguments="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005" spring-boot:run
```
- Start frontend (in separate shell):
```powershell
cd frontend; npm install; npm run dev
```

4) Environment & external dependencies to satisfy before testing
- Postgres with pgvector extension (docker-compose yaml provided). DB name/user/password match `application.properties` (philoverse/postgres/12345).
- Ollama service expected at `http://localhost:11434` and models configured in `application.properties`: `nomic-embed-text` (embeddings) and `gemma4:31b-cloud` (chat). If Ollama is not present, the ChatClient/embeddings will fail.
- JWT secret: `JWT_SECRET_KEY` environment variable (application.properties references `${JWT_SECRET_KEY}`). The code falls back to a default secret if unset.

5) Project-specific patterns & gotchas
- Unified response wrapper: All endpoints return `ApiResponse<T>` (see `base/response/ApiResponse.java`) — build responses using `ApiResponse.success(...)` or let `GlobalExceptionHandler` wrap exceptions.
- Controller validation: `RagController` uses `@Validated` + parameter-level validation (e.g., `@NotBlank` on query); validation errors produce `ApiResponse` with ErrorCode.VALIDATION_ERROR.
- Vector store assumptions: SQL in `VectorStoreRepository` expects a table named `vector_store` with a JSON `metadata` column; code relies on metadata keys: `source`, `upload_date`, `contentType`, `contentLength`.
- File upload size: limited to 5MB in `application.properties` — increase if you need larger PDFs.
- CORS: configured in `CorsConfig.java` to allow `http://localhost:5173` (Vite default). If you run the frontend on a different host/port, update this bean.
- Text cleaning & splitting: `RagServiceImpl.cleanText(...)` contains regex rules to remove control chars, fix hyphenated breaks, and merge single newlines. Splitting uses `TokenTextSplitter(800, 400, 5, 10000, true)` — these hyperparameters are important for chunk size and therefore retrieval behavior.

6) API surface (examples)
- Upload a PDF (multipart): POST http://localhost:8080/api/rag/upload form field `file` (multipart/form-data). Backend saves a temp file, extracts text with PDFBox, cleans and splits, then calls `vectorStore.accept(chunks)`.
- Ask a question: GET http://localhost:8080/api/rag/ask?query=Who+is+Marx
- List documents: GET http://localhost:8080/api/rag/documents
- Reset vector store (destructive): DELETE http://localhost:8080/api/rag/reset

7) Troubleshooting tips for an AI agent
- If embeddings or chat calls fail, verify Ollama is reachable at `http://localhost:11434` and the model names exist. Check `application.properties` for configured models.
- If vector queries return no results, ensure the `vector_store` table exists (the Spring AI pgvector starter should initialize it when `spring.ai.vectorstore.pgvector.initialize-schema=true`) and the DB URL matches the running container.
- Look at logs: `spring.jpa.show-sql=true` will print SQL; `RagServiceImpl` has logging at key points (upload, query). Debugging queries in `retrieveCandidates()` can reveal issues with the keyword cleaning regex.

8) Code change conventions
- Prefer adding behavior via interfaces/services (see `RagService` interface and `RagServiceImpl`) — controller expects a `RagService` bean.
- Use `ApiException` + `ErrorCode` for thrown application errors so `GlobalExceptionHandler` produces consistent responses.

9) Where to add tests or extend behavior
- Add unit tests around `RagServiceImpl.cleanText`, `rankDocuments`, and `buildPrompt` (these are deterministic and critical to RAG correctness).
- Integration tests can run against the docker-compose pgvector instance; use testcontainers or point `spring.datasource.url` to the container.

10) Quick references
- CORS: `backend/.../CorsConfig.java`
- Endpoints: `backend/.../controller/RagController.java`
- Core RAG logic: `backend/.../service/impl/RagServiceImpl.java`
- Vector SQL: `backend/.../repository/custom/VectorStoreRepository.java`
- Config: `backend/src/main/resources/application.properties`
- Frontend API client: `frontend/src/services/apiClient.js`

If you want, I can also: generate a small Postman collection, add a short CONTRIBUTING.md, or implement a smoke-test that uploads the sample PDFs (docs/) and issues a sample query to verify the pipeline end-to-end.
