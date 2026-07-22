# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Frontend (React/Vite)
- Develop: `cd frontend && npm run dev`
- Build: `cd frontend && npm run build`
- Lint: `cd frontend && npm run lint`
- Preview: `cd frontend && npm run preview`

### Backend (Spring Boot/Maven)
- Build: `cd backend && mvn clean install`
- Compile: `cd backend && mvn compile`
- Run: `cd backend && mvn spring-boot:run`
- Test: `cd backend && mvn test`

## Architecture & Structure

The project is a RAG (Retrieval-Augmented Generation) application for philosophy, split into a frontend and backend.

### Backend (Java 21 / Spring Boot 3.3.0)
- **Layered Architecture**: `Controller` $\rightarrow$ `Service` $\rightarrow$ `Repository` $\rightarrow$ `Entity`.
- **Structure**: Organise by feature (e.g., `auth/` folder containing `AuthController`, `AuthService`, `AuthServiceImpl`, etc.).
- **AI Integration**: Uses `Spring AI` with `Ollama` for LLMs/embeddings and `pgvector` for vector storage.
- **Document Processing**: `Apache POI` (DOCX) and `PDFBox` (PDF) for parsing, with `AWS S3` for storage.
- **Cross-Cutting Concerns**: Extensive use of AOP (`com.philosophy.rag.base.aop`) for logging, security, validation, and performance monitoring.
- **Security**: JWT-based authentication implemented via `Spring Security`.
- **Error Handling**: 
  - Centralized via `ErrorCode` and `ApiException`.
  - Caught by `GlobalExceptionHandler` and returned as a unified `ApiResponse<T>`.
  - All controllers must return `ResponseEntity<ApiResponse<T>>`.

### Frontend (React 18 / Vite)
- **Styling**: Tailwind CSS v4 and Bootstrap/React-Bootstrap.
- **3D Visualization**: `Three.js` with `@react-three/fiber` and `@react-three/drei`.
- **State/Routing**: `react-router-dom` for navigation, `axios` for API calls.

## Development Guidelines

### AI Collaboration Principles (Karpathy's Guidelines)
- **Think Before Coding**: State assumptions explicitly before implementation. If a request is ambiguous, present interpretations and ask for clarification instead of guessing.
- **Simplicity First**: Implement the minimum code required. Avoid over-engineering, speculative features, or unnecessary abstractions.
- **Surgical Changes**: Modify only the lines necessary to satisfy the request. Match existing style and avoid "drive-by refactoring" of unrelated code.
- **Goal-Driven Execution**: Define verifiable success criteria. Prefer a "test-first" approach (repro-test $\rightarrow$ fix $\rightarrow$ verify) and use checkpoints for multi-step tasks.

### Custom Skills & Workflows
- Custom agent behaviors and workflows are documented in `.claude/skills/`.
- Always check these guidelines before completing tasks to ensure compliance with project-specific quality gates (e.g., testing loop).

### Technical Standards
- **Strict Execution**: Follow the "Silent Action $\rightarrow$ Verified Result $\rightarrow$ Detailed Report" workflow.
- **Dependency Inversion**: Inject interfaces rather than concrete implementations.
- **Naming & Implementation**: Use feature-based naming. A single service interface may have multiple implementations (e.g., `RagService` $\rightarrow$ `OllamaRagServiceImpl`, `GeminiRagServiceImpl`).
- **DTOs**: Use Java `record` for all Data Transfer Objects.
- **Persistence**: Avoid `@Query` wherever possible; prefer Spring Data JPA's derived query methods.
- **Service Granularity**: Group related functions within a single service to avoid over-fragmentation (e.g., `PasswordReset` logic should be a function within `AuthService` rather than a separate service class).
- **Localization**: 
  - **Vietnamese**: Used ONLY for `ApiResponse` messages and `ApiException` messages (User-facing).
  - **English**: Used for everything else, including logs, comments, variable names, and class names.
- **Logging**: Use `@Slf4j` for logging; avoid `System.out.println`.
- **Validation**: Use `@Validated` and standard constraints (`@NotBlank`, `@NotNull`) in controllers.
- **Error Flow**: `Service/Controller` $\rightarrow$ `throw new ApiException(ErrorCode.XXX)` $\rightarrow$ `GlobalExceptionHandler` $\rightarrow$ `ApiResponse`.
- **Git Commits**: 
  - Use a prefix in brackets for the commit type (e.g., `[FEAT]`, `[FIX]`, `[REFACTOR]`, `[CONFIG]`, `[DELETE]`).
  - Provide a clear description: a summary line followed by a more detailed explanation of what was changed and why.
  - Do NOT include "Co-Authored-By" tags in commit messages.
