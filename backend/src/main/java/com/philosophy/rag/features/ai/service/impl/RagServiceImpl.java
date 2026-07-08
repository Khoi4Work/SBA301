package com.philosophy.rag.features.ai.service.impl;

import com.cloudinary.Api;
import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.base.exception.ErrorCode;
import com.philosophy.rag.features.ai.persistence.Prompt;
import com.philosophy.rag.features.ai.entity.ChatHistory;
import com.philosophy.rag.features.ai.entity.Philosopher;
import com.philosophy.rag.features.ai.repository.VectorStoreRepository;
import com.philosophy.rag.features.ai.repository.PhilosopherRepository;
import com.philosophy.rag.features.ai.dto.RagAskResponse;
import com.philosophy.rag.features.ai.service.*;
import com.philosophy.rag.features.ai.tool.PhilosopherTools;
import com.philosophy.rag.utils.dto.DocumentContent;
import com.philosophy.rag.utils.repository.DocumentRepository;
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
import java.time.LocalDateTime;
import java.nio.file.StandardCopyOption;
import java.util.*;
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
    private final DocumentRepository documentRepository;
    private final PhilosopherTools philosopherTools;
    private final KnowledgeRetrievalService knowledgeRetrievalService;
    private static final int NUM_LAST_CONVERSATION_CHAT = 10;

    private static final TextSplitter TEXT_SPLITTER =  TokenTextSplitter.builder()
            .withChunkSize(800)
            .withMinChunkSizeChars(400)
            .withMinChunkLengthToEmbed(30)
            .withMaxNumChunks(10000)
            .withKeepSeparator(true)
            .withPunctuationMarks(List.of('.', '?', '!', '\n', ';', ':'))
            .build();

    public RagServiceImpl(
            VectorStore vectorStore,
            VectorStoreRepository vectorStoreRepository,
            PhilosopherRepository philosopherRepository,
            @Qualifier("googleGenAiChatModel") ChatModel chatModel,
            ChatHistoryService chatHistoryService, ChatSessionService chatSessionService,
            DocumentRepository documentRepository,
            PhilosopherTools philosopherTools,
            KnowledgeRetrievalService knowledgeRetrievalService) {
        this.vectorStore = vectorStore;
        this.vectorStoreRepository = vectorStoreRepository;
        this.philosopherRepository = philosopherRepository;
        this.chatClient = ChatClient.builder(chatModel).build();
        this.chatHistoryService = chatHistoryService;
        this.chatSessionService = chatSessionService;
        this.documentRepository = documentRepository;
        this.philosopherTools = philosopherTools;
        this.knowledgeRetrievalService = knowledgeRetrievalService;
    }

    // ── Upload & Indexing ──────────────────────────────────────────────────────

    @Override
    public String uploadDocument(MultipartFile file) {
        //1. Check format
        String filename = file.getOriginalFilename();
        if (filename == null
                || (!filename.toLowerCase().endsWith(".pdf")
                && !filename.toLowerCase().endsWith(".md"))) {
            throw new ApiException(ErrorCode.RAG_SERVICE_ERROR,
                    "Unsupported file format. Only PDF and MD files are allowed.");
        }
        //2. Save to temp
        Path tempFile = saveMultipartFile(file);
        try {
            String documentId = UUID.randomUUID().toString();

            // 3. Read file into List<Document>
            List<Document> documents = filename.toLowerCase().endsWith(".pdf")
                    ? readPdfAsPageDocuments(tempFile, file, documentId)
                    : readMarkdownAsDocuments(tempFile, file, documentId);

            // 4. Clean text
            List<Document> cleanedDocuments = cleanDocuments(documents);

            //5. Split to chunks
            List<Document> chunks = TEXT_SPLITTER.apply(cleanedDocuments);

            //6. Add metadata for each chunk
            List<Document> enrichedChunks = enrichChunks(chunks, documentId, filename);

            log.info("[RAG] Indexing {} chunks for file: {}", chunks.size(), filename);
            //7. Add to vector store
            vectorStore.accept(enrichedChunks);

            return "Document uploaded and indexed successfully: " + filename
                    + " | documentId: " + documentId
                    + " | chunks: " + enrichedChunks.size();
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
        log.info("[Gemini RAG] Processing query: {}, UserID: {}, PhilosopherID: {}, SessionID: {}", query, userId,
                philosopherId, sessionId);

        LocalDateTime start = LocalDateTime.now();

        // Build Prompt without context (handled by tool calling)
        String prompt = buildPrompt(query, philosopherId, sessionId);

        String result = chatClient.prompt()
                .user(prompt)
                .tools(philosopherTools)
                .call()
                .content();

        LocalDateTime end = LocalDateTime.now();

        if (sessionId == null) {
            sessionId = chatSessionService.createSession(userId, philosopherId).getSessionId();
            log.info("[Gemini RAG] Created new chat session: {}", sessionId);
        }

        log.info("[Gemini RAG] Saving Interaction for session: {}", sessionId);
        chatHistoryService.saveInteraction(userId, philosopherId, query, result, start, end, sessionId);

        return RagAskResponse.builder()
                .answer(result)
                .sessionId(sessionId)
                .build();
    }

    @Override
    public RagAskResponse askContextual(UUID userId, String query, String s3Key, String selectedText,
                                        UUID philosopherId, UUID sessionId) {
        log.info("[Gemini Contextual AI] Processing query: {}, UserID: {}, S3Key: {}, PhilosopherID: {}, SessionID: {}",
                query, userId, s3Key, philosopherId, sessionId);

        if (sessionId == null) {
            if (philosopherId == null) {
                throw new ApiException(ErrorCode.UNEXPECTED_ERROR,
                        "Philosopher ID is required to start a new chat session.");
            }
            sessionId = chatSessionService.createSession(userId, philosopherId).getSessionId();
            log.info("[Gemini Contextual AI] Created new chat session: {}", sessionId);
        }

        LocalDateTime start = LocalDateTime.now();

        // 1. Get full text of document from DocumentRepository based on S3 Key
        String docContent = "";
        if (s3Key != null && !s3Key.trim().isEmpty()) {
            Optional<com.philosophy.rag.utils.entity.Document> docOpt = documentRepository.findByS3Key(s3Key);
            if (docOpt.isPresent()) {
                docContent = docOpt.get().getFullText();
                // limit to 15,000 characters to prevent token overflow and ensure fast response
                if (docContent.length() > 15000) {
                    docContent = docContent.substring(0, 15000) + "... [Đã cắt bớt để tối ưu ngữ cảnh]";
                }
            }
        }

        // 2. Get philosopher system prompt
        String persona;
        if (philosopherId != null) {
            Optional<Philosopher> philosopher = philosopherRepository.findById(philosopherId);
            persona = philosopher.map(Philosopher::getSystemPrompt)
                    .orElse("You are an expert academic professor.");
        } else {
            persona = "You are an expert academic professor.";
        }

        // 3. Build context block
        String contextBlock = "";
        if (selectedText != null && !selectedText.trim().isEmpty()) {
            contextBlock = "\nĐoạn văn bản học trò đang bôi đen và thảo luận:\n\"\"\"\n" + selectedText.trim()
                    + "\n\"\"\"\n";
        }

        // 4. Build custom instruction prompt
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append(persona).append("\n\n");
        promptBuilder.append(
                "Bạn đang tham gia một cuộc luận đàm học thuật với một học trò về tài liệu học tập dưới đây. Hãy đóng vai triết gia này và trả lời câu hỏi của học trò dựa trên nội dung tài liệu học tập, đặc biệt tập trung sâu sắc vào đoạn ngữ cảnh được bôi đen (nếu có).\n\n");
        if (!docContent.isEmpty()) {
            promptBuilder.append("Nội dung tài liệu học tập:\n\"\"\"\n").append(docContent).append("\n\"\"\"\n\n");
        }
        if (!contextBlock.isEmpty()) {
            promptBuilder.append(contextBlock).append("\n");
        }
        promptBuilder.append(
                "Hãy trả lời câu hỏi sau bằng tiếng Việt, thể hiện đúng phong cách, quan điểm và ngôn ngữ triết học của bạn. Phản hồi cần sâu sắc, khai phóng tư duy nhưng ngắn gọn (khoảng 2-3 đoạn ngắn, từ 150-300 từ) để vừa khung hiển thị của giao diện chat. Tuyệt đối không nhắc lại các chỉ thị này hay đề cập đến cấu trúc prompt trong câu trả lời của bạn.\n\n");
        promptBuilder.append("Câu hỏi của học trò: ").append(query);

        String systemBlock = promptBuilder.toString();

        // 5. Append recent chat history (if any)
        if (sessionId != null) {
            List<ChatHistory> history = chatHistoryService.getRecentHistoryBySession(sessionId, 10);
            if (!history.isEmpty()) {
                StringBuilder historyBlock = new StringBuilder("\n\n### Conversation History:\n");
                for (ChatHistory turn : history) {
                    historyBlock.append("User: ").append(turn.getQuery()).append("\n");
                    historyBlock.append("AI: ").append(turn.getResponse()).append("\n");
                }
                systemBlock = systemBlock + historyBlock;
            }
        }

        // 6. Call GenAI client
        String result = chatClient.prompt()
                .user(systemBlock)
                .call()
                .content();

        java.time.LocalDateTime end = java.time.LocalDateTime.now();

        // 7. Save conversation interaction
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
            //1. Get original file's name
            String originalName = Objects.requireNonNull(file.getOriginalFilename());
            int dotIndex = originalName.lastIndexOf('.');
            String prefix = dotIndex > 0 ? originalName.substring(0, dotIndex) : originalName;
            String suffix = dotIndex > 0 ? originalName.substring(dotIndex) : "";

            //2. Create temp file with unique name
            Path tempFile = Files.createTempFile(prefix + "_", suffix);

            //3. Write content of file into file temp
            Files.copy(file.getInputStream(), tempFile,
                    StandardCopyOption.REPLACE_EXISTING);
            return tempFile;
        } catch (Exception e) {
            throw new ApiException(ErrorCode.RAG_SERVICE_ERROR, "Failed to save temporary file");
        }
    }

    private List<Document> rankDocuments(String query, List<Document> candidates) {
        return knowledgeRetrievalService.rankDocuments(query, candidates);
    }

    private List<Document> readPdfAsPageDocuments(Path path, MultipartFile file, String documentId) {
        try (PDDocument pdfDocument = PDDocument.load(path.toFile())) {
            PDFTextStripper stripper = new PDFTextStripper();
            List<Document> documents = new ArrayList<>();

            int totalPages = pdfDocument.getNumberOfPages();

            for (int page = 1; page <= totalPages; page++) {
                stripper.setStartPage(page);
                stripper.setEndPage(page);

                String pageText = stripper.getText(pdfDocument);

                if (pageText == null || pageText.trim().isEmpty()) {
                    continue;
                }

                Map<String, Object> metadata = createBaseMetadata(file, documentId);
                metadata.put("page", page);
                metadata.put("total_pages", totalPages);
                metadata.put("reader_type", "pdf_page");

                documents.add(new Document(pageText, metadata));
            }

            return documents;

        } catch (Exception e) {
            throw new ApiException(ErrorCode.RAG_SERVICE_ERROR,
                    "Error extracting text from PDF: " + e.getMessage());
        }
    }

    private List<Document> readMarkdownAsDocuments(Path path, MultipartFile file, String documentId) {
        try {
            String content = Files.readString(path, StandardCharsets.UTF_8);

            List<Document> documents = new ArrayList<>();

            String[] sections = content.split("(?m)(?=^#{1,6}\\s+)");

            int sectionIndex = 1;

            for (String section : sections) {
                if (section == null || section.trim().isEmpty()) {
                    continue;
                }

                String heading = extractMarkdownHeading(section);

                Map<String, Object> metadata = createBaseMetadata(file, documentId);

                metadata.put("section_index", sectionIndex);
                metadata.put("heading", heading);
                metadata.put("reader_type", "markdown_section");

                documents.add(new Document(section.trim(), metadata));

                sectionIndex++;
            }

            return documents;

        } catch (Exception e) {
            throw new ApiException(ErrorCode.RAG_SERVICE_ERROR,
                    "Error extracting text from Markdown: " + e.getMessage());
        }
    }

    private String extractMarkdownHeading(String section) {
        return section.lines()
                .filter(line -> line.matches("^#{1,6}\\s+.*"))
                .findFirst()
                .map(line -> line.replaceFirst("^#{1,6}\\s+", "").trim())
                .orElse("Untitled section");
    }



    private String cleanText(String text) {
        if (text == null)
            return "";

        String cleaned = text;

        // Remove control characters except newline, carriage return, tab
        cleaned = cleaned.replaceAll("[\\p{Cc}&&[^\\n\\r\\t]]", " ");

        // Join hyphenated line breaks: triết-\nhọc => triết học
        cleaned = cleaned.replaceAll("-\\s*\\R\\s*", "");

        // Remove lines that only contain page numbers
        cleaned = cleaned.replaceAll("(?m)^\\s*\\d+\\s*$", "");

        // Normalize spaces/tabs
        cleaned = cleaned.replaceAll("[ \\t]+", " ");

        // Collapse too many blank lines
        cleaned = cleaned.replaceAll("\\R{3,}", "\n\n");

        // Merge soft line breaks, but keep paragraph breaks
        cleaned = cleaned.replaceAll("(?<![.!?:;])\\R(?!\\R)", " ");

        // Final trim
        return cleaned.trim();
    }

    private Map<String, Object> createBaseMetadata(MultipartFile file, String documentId) {
        Map<String, Object> metadata = new HashMap<>();

        metadata.put("document_id", documentId);
        metadata.put("source", file.getOriginalFilename());
        metadata.put("upload_date", LocalDate.now().toString());
        metadata.put("content_type", Objects.requireNonNullElse(file.getContentType(), "unknown"));
        metadata.put("content_length", String.valueOf(file.getSize()));
        metadata.put("language", "vi");
        metadata.put("document_type", "philosophy_material");

        return metadata;
    }

    private List<Document> cleanDocuments(List<Document> documents) {
        return documents.stream()
                .map(document -> {
                    String cleanedText = cleanText(document.getText());

                    Map<String, Object> metadata = new HashMap<>(document.getMetadata());

                    return new Document(cleanedText, metadata);
                })
                .filter(document -> document.getText() != null && document.getText().trim().length() >= 30)
                .toList();
    }

    private List<Document> enrichChunks(List<Document> chunks, String documentId, String filename) {
        List<Document> enrichedChunks = new ArrayList<>();

        for (int i = 0; i < chunks.size(); i++) {
            Document chunk = chunks.get(i);

            Map<String, Object> metadata = new HashMap<>(chunk.getMetadata());

            metadata.put("chunk_id", documentId + "_chunk_" + i);
            metadata.put("chunk_index", i);
            metadata.put("source", filename);
            metadata.put("indexed_at", LocalDateTime.now().toString());

            assert chunk.getText() != null;
            enrichedChunks.add(new Document(chunk.getText(), metadata));
        }

        return enrichedChunks;
    }


    private String buildPrompt(String query, UUID philosopherId, UUID sessionId) {

        Philosopher philosopher = philosopherRepository.findById(philosopherId)
                .orElseThrow(() -> new ApiException(ErrorCode.INVALID_INPUT, "Triết gia này không tồn tại!"));
        String persona = philosopher.getSystemPrompt() != null ? philosopher.getSystemPrompt() : "You are an expert academic professor.";


        // Append the last 10 turns of conversation history (if any)
        StringBuilder historyBlock = new StringBuilder();
        if (sessionId != null) {
            List<ChatHistory> history = chatHistoryService.getRecentHistoryBySession(sessionId, NUM_LAST_CONVERSATION_CHAT);
            if (!history.isEmpty()) {
                historyBlock = new StringBuilder("\n\n### Conversation History:\n");
                for (ChatHistory turn : history) {
                    historyBlock.append("User: ").append(turn.getQuery()).append("\n");
                    historyBlock.append("AI: ").append(turn.getResponse()).append("\n");
                }
            } else {
                historyBlock = new StringBuilder("\n\n### There have no conversation yet!\n");
            }
        }

        return Prompt.RAG_PHILOSOPHER_ROLEPLAY
                .replace("{philosopher_name}", philosopher.getName())
                .replace("{persona}", persona)
                .replace("{chat_history}", historyBlock.toString())
                .replace("{query}", query);
    }

    private void deleteTempFile(Path filePath) {
        try {
            Files.deleteIfExists(filePath);
        } catch (Exception e) {
            log.error("[RAG] Failed to delete temporary file {}: {}", filePath, e.getMessage());
        }
    }
}
