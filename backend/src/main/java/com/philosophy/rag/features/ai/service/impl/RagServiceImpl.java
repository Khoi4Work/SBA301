package com.philosophy.rag.features.ai.service.impl;

import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.base.exception.ErrorCode;
import com.philosophy.rag.base.persistence.Prompt;
import com.philosophy.rag.features.ai.entity.ChatHistory;
import com.philosophy.rag.features.ai.entity.Philosopher;
import com.philosophy.rag.features.ai.repository.VectorStoreRepository;
import com.philosophy.rag.features.ai.repository.PhilosopherRepository;
import com.philosophy.rag.features.ai.dto.RagAskResponse;
import com.philosophy.rag.features.ai.service.ChatHistoryService;
import com.philosophy.rag.features.ai.service.ChatSessionService;
import com.philosophy.rag.features.ai.service.RagService;
import com.philosophy.rag.features.ai.service.CohereRerankService;
import com.philosophy.rag.utils.dto.DocumentContent;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.document.Document;
import org.springframework.ai.transformer.splitter.TextSplitter;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@Slf4j
public class RagServiceImpl implements RagService {

    private final VectorStore vectorStore;
    private final VectorStoreRepository vectorStoreRepository;
    private final PhilosopherRepository philosopherRepository;
    private final ChatClient chatClient;
    private final ChatHistoryService chatHistoryService;
    private final ChatSessionService chatSessionService;
    private final CohereRerankService cohereRerankService;

    private static final TextSplitter TEXT_SPLITTER =
            new TokenTextSplitter(800, 400, 5, 10000, true, List.of('\n', '\r', ' '));

    public RagServiceImpl(
            VectorStore vectorStore,
            VectorStoreRepository vectorStoreRepository,
            PhilosopherRepository philosopherRepository,
            @Qualifier("googleGenAiChatModel") ChatModel chatModel,
            ChatHistoryService chatHistoryService, ChatSessionService chatSessionService,
            CohereRerankService cohereRerankService) {
        this.vectorStore = vectorStore;
        this.vectorStoreRepository = vectorStoreRepository;
        this.philosopherRepository = philosopherRepository;
        this.chatClient = ChatClient.builder(chatModel).build();
        this.chatHistoryService = chatHistoryService;
        this.chatSessionService = chatSessionService;
        this.cohereRerankService = cohereRerankService;
    }

    // ── Upload & Indexing ──────────────────────────────────────────────────────

    @Override
    public String uploadDocument(MultipartFile file) {
        String filename = file.getOriginalFilename();
        if (filename == null
                || (!filename.toLowerCase().endsWith(".pdf")
                        && !filename.toLowerCase().endsWith(".md"))) {
            throw new ApiException(ErrorCode.RAG_SERVICE_ERROR,
                    "Unsupported file format. Only PDF and MD files are allowed.");
        }

        Path tempFile = saveMultipartFile(file);
        try {
            String rawText = filename.toLowerCase().endsWith(".pdf")
                    ? extractTextFromPdf(tempFile)
                    : extractTextFromMarkdown(tempFile);

            String cleanedText = cleanText(rawText);
            Document document = createDocument(cleanedText, file);
            List<Document> chunks = TEXT_SPLITTER.apply(List.of(document));

            log.info("[RAG] Indexing {} chunks for file: {}", chunks.size(), filename);
            vectorStore.accept(chunks);

            return "Document uploaded and indexed successfully: " + filename;
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            log.error("[RAG] Error uploading document {}: {}", filename, e.getMessage());
            throw new ApiException(ErrorCode.RAG_SERVICE_ERROR,
                    "Failed to process document: " + e.getMessage());
        } finally {
            deleteTempFile(tempFile);
        }
    }

    // ── Question Answering ─────────────────────────────────────────────────────

    @Override
    public RagAskResponse ask(UUID userId, String query, UUID philosopherId, UUID sessionId) {
        log.info("[Gemini RAG] Processing query: {}, UserID: {}, PhilosopherID: {}, SessionID: {}", query, userId, philosopherId, sessionId);

        if (sessionId == null) {
            sessionId = chatSessionService.createSession(userId, philosopherId).getSessionId();
            log.info("[Gemini RAG] Created new chat session: {}", sessionId);
        }

        java.time.LocalDateTime start = java.time.LocalDateTime.now();

        List<Document> candidates = retrieveCandidates(query);
        List<Document> prioritizedDocs = rankDocuments(query, candidates);

        String context = buildContext(prioritizedDocs);
        String prompt = buildPrompt(query, context, philosopherId, sessionId);

        String result = chatClient.prompt()
                .user(prompt)
                .call()
                .content();

        java.time.LocalDateTime end = java.time.LocalDateTime.now();

        chatHistoryService.saveInteraction(userId, philosopherId, query, result, start, end, sessionId);

        return RagAskResponse.builder()
                .answer(result)
                .sessionId(sessionId)
                .build();
    }

    // ── Management ────────────────────────────────────────────────────────────

    @Override
    public List<DocumentContent> listDocuments() {
        return vectorStoreRepository.getDocumentContent();
    }

    @Override
    public void resetVectorStore() {
        try {
            log.warn("[RAG] Resetting vector store...");
            vectorStoreRepository.truncateStore();
        } catch (Exception e) {
            log.error("[RAG] Failed to reset vector store: {}", e.getMessage());
            throw new ApiException(ErrorCode.RAG_SERVICE_ERROR, "Could not reset vector store");
        }
    }

    @Override
    public String prompt(String prompt) {
        return chatClient.prompt()
                .user(prompt)
                .call()
                .content();
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    /**
     * Saves the uploaded multipart file to a uniquely-named temporary file
     * to avoid race conditions when concurrent uploads share the same filename.
     */
    private Path saveMultipartFile(MultipartFile file) {
        try {
            String originalName = Objects.requireNonNull(file.getOriginalFilename());
            int dotIndex = originalName.lastIndexOf('.');
            String prefix = dotIndex > 0 ? originalName.substring(0, dotIndex) : originalName;
            String suffix = dotIndex > 0 ? originalName.substring(dotIndex) : "";
            Path tempFile = Files.createTempFile(prefix + "_", suffix);
            Files.copy(file.getInputStream(), tempFile,
                    java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            return tempFile;
        } catch (Exception e) {
            throw new ApiException(ErrorCode.RAG_SERVICE_ERROR, "Failed to save temporary file");
        }
    }

    private List<Document> rankDocuments(String query, List<Document> candidates) {
        try {
            log.info("[Gemini RAG] Reranking {} candidates with Cohere...", candidates.size());
            return cohereRerankService.rerank(query, candidates);
        } catch (Exception e) {
            log.error("[Gemini RAG] Cohere Rerank failed, falling back to basic top-K: {}", e.getMessage());
            return candidates.stream().limit(30).collect(Collectors.toList());
        }
    }

    private String extractTextFromPdf(Path path) {
        try (PDDocument document = PDDocument.load(path.toFile())) {
            return new PDFTextStripper().getText(document);
        } catch (Exception e) {
            throw new ApiException(ErrorCode.RAG_SERVICE_ERROR,
                    "Error extracting text from PDF: " + e.getMessage());
        }
    }

    private String extractTextFromMarkdown(Path path) {
        try {
            return Files.readString(path, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new ApiException(ErrorCode.RAG_SERVICE_ERROR,
                    "Error extracting text from Markdown: " + e.getMessage());
        }
    }

    private String cleanText(String text) {
        if (text == null) return "";
        // Remove control characters except newline
        String cleaned = text.replaceAll("[\\p{Cc}&&[^\\n]]", " ");
        // Join hyphenated line breaks
        cleaned = cleaned.replaceAll("-\\s*\\n", " ");
        // Collapse single newlines (not paragraph breaks)
        cleaned = cleaned.replaceAll("(?<!\\n)\\n(?!\\n)", " ");
        // Collapse multiple spaces
        return cleaned.replaceAll("\\s{2,}", " ").trim();
    }

    private Document createDocument(String content, MultipartFile file) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("source", file.getOriginalFilename());
        metadata.put("upload_date", LocalDate.now().toString());
        metadata.put("contentType", Objects.requireNonNull(file.getContentType()));
        metadata.put("contentLength", String.valueOf(file.getSize()));
        return new Document(content, metadata);
    }

    /**
     * Performs two similarity searches (original query + cleaned keyword query)
     * and merges the distinct results as retrieval candidates.
     */
    private List<Document> retrieveCandidates(String query) {
        // Strip common Vietnamese question words to create a keyword-only variant
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

    /**
     * Uses Cohere Rerank to order candidate documents by relevance.
     * Falls back to the top-30 candidates if the API call fails.
     */
    private List<Document> rerankWithCohere(String query, List<Document> candidates) {
        try {
            log.info("[RAG] Reranking {} candidates with Cohere...", candidates.size());
            return cohereRerankService.rerank(query, candidates);
        } catch (Exception e) {
            log.error("[RAG] Cohere Rerank failed, falling back to top-30: {}", e.getMessage());
            return candidates.stream().limit(30).collect(Collectors.toList());
        }
    }


    private String buildContext(List<Document> docs) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < docs.size(); i++) {
            sb.append("[Source ").append(i + 1).append("]: ")
              .append(docs.get(i).getText())
              .append("\n\n");
        }
        return sb.toString();
    }

    private String buildPrompt(String query, String context,
                               UUID philosopherId, UUID sessionId) {
        // Build system persona
        String persona;
        if (philosopherId != null) {
            Optional<Philosopher> philosopher = philosopherRepository.findById(philosopherId);
            persona = philosopher.map(Philosopher::getSystemPrompt)
                                 .orElse("You are an expert academic professor.");
        } else {
            persona = "You are an expert academic professor.";
        }

        // Build the instruction block from the template (context + query already substituted)
        String instructions = Prompt.RAG_ACADEMIC_PROFESSOR
                .replace("{context}", context)
                .replace("{query}", query);

        // Prepend the persona
        String systemBlock = persona + "\n\n" + instructions;

        // Append the last 10 turns of conversation history (if any)
        if (sessionId != null) {
            List<ChatHistory> history =
                    chatHistoryService.getRecentHistoryBySession(sessionId, 10);
            if (!history.isEmpty()) {
                StringBuilder historyBlock = new StringBuilder("\n\n### Conversation History:\n");
                for (ChatHistory turn : history) {
                    historyBlock.append("User: ").append(turn.getQuery()).append("\n");
                    historyBlock.append("AI: ").append(turn.getResponse()).append("\n");
                }
                return systemBlock + historyBlock;
            }
        }

        return systemBlock;
    }

    private void deleteTempFile(Path filePath) {
        try {
            Files.deleteIfExists(filePath);
        } catch (Exception e) {
            log.error("[RAG] Failed to delete temporary file {}: {}", filePath, e.getMessage());
        }
    }
}
