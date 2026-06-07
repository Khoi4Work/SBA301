package com.philosophy.rag.service.impl;

import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.base.exception.ErrorCode;
import com.philosophy.rag.base.persistence.Prompt;
import com.philosophy.rag.dto.response.DocumentContent;
import com.philosophy.rag.entity.Philosopher;
import com.philosophy.rag.repository.custom.VectorStoreRepository;
import com.philosophy.rag.repository.itf.PhilosopherRepository;
import com.philosophy.rag.service.RagService;
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
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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
@ConditionalOnProperty(name = "ai.provider", havingValue = "google")
public class GeminiRagServiceImpl implements RagService {
    private final VectorStore vectorStore;
    private final VectorStoreRepository vectorStoreRepository;
    private final PhilosopherRepository philosopherRepository;
    private final ChatClient chatClient;
    private final TextSplitter textSplitter = new TokenTextSplitter(800, 400, 5, 10000, true, java.util.List.of('\n', '\r', ' '));

    public GeminiRagServiceImpl(VectorStore vectorStore, VectorStoreRepository vectorStoreRepository, PhilosopherRepository philosopherRepository, @Qualifier("googleGenAiChatModel") ChatModel chatModel) {
        this.vectorStore = vectorStore;
        this.vectorStoreRepository = vectorStoreRepository;
        this.philosopherRepository = philosopherRepository;
        this.chatClient = ChatClient.builder(chatModel).build();
    }

    @Override
    public String uploadDocument(MultipartFile file) {
        String filename = file.getOriginalFilename();
        if (filename == null || (!filename.toLowerCase().endsWith(".pdf") && !filename.toLowerCase().endsWith(".md"))) {
            throw new ApiException(ErrorCode.RAG_SERVICE_ERROR, "Unsupported file format. Only PDF and MD files are allowed.");
        }

        Path tempFile = saveMultipartFile(file);
        try {
            String rawText = "";

            if (filename.toLowerCase().endsWith(".pdf")) {
                rawText = extractTextFromPdf(tempFile);
            } else if (filename.toLowerCase().endsWith(".md")) {
                rawText = extractTextFromMarkdown(tempFile);
            }

            String cleanedText = cleanText(rawText);

            Document document = createDocument(cleanedText, file);
            List<Document> chunks = textSplitter.apply(List.of(document));

            log.info("[Gemini RAG] Indexing {} chunks for file: {}", chunks.size(), filename);
            vectorStore.accept(chunks);

            return "Document uploaded and indexed successfully (Gemini): " + filename;
        } catch (Exception e) {
            log.error("Error uploading document {}: {}", filename, e.getMessage());
            throw new ApiException(ErrorCode.RAG_SERVICE_ERROR, "Failed to process document: " + e.getMessage());
        } finally {
            deleteTempFile(tempFile);
        }
    }

    @Override
    public String ask(String query, UUID philosopherId) {
        log.info("[Gemini RAG DEBUG] Incoming Query: {}, PhilosopherID: {}", query, philosopherId);

        List<Document> candidates = retrieveCandidates(query);
        List<Document> prioritizedDocs = rankDocuments(query, candidates);

        String context = buildContext(prioritizedDocs);
        String prompt = buildPrompt(query, context, philosopherId);

        return chatClient.prompt()
                .user(prompt)
                .call()
                .content();
    }

    @Override
    public List<DocumentContent> listDocuments() {
        return vectorStoreRepository.getDocumentContent();
    }

    @Override
    public void resetVectorStore() {
        try {
            log.info("Resetting vector store data (Gemini)...");
            vectorStoreRepository.truncateStore();
        } catch (Exception e) {
            log.error("Failed to reset vector store: {}", e.getMessage());
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

    private Path saveMultipartFile(MultipartFile file) {
        try {
            Path tempDir = Paths.get(System.getProperty("java.io.tmpdir"));
            Path filePath = tempDir.resolve(Objects.requireNonNull(file.getOriginalFilename()));
            Files.copy(file.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            return filePath;
        } catch (Exception e) {
            throw new ApiException(ErrorCode.RAG_SERVICE_ERROR, "Failed to save temporary file");
        }
    }

    private String extractTextFromMarkdown(Path path) {
        try {
            return Files.readString(path, java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new ApiException(ErrorCode.RAG_SERVICE_ERROR, "Error extracting text from Markdown");
        }
    }

    private String extractTextFromPdf(Path path) {
        try (PDDocument document = PDDocument.load(path.toFile())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        } catch (Exception e) {
            throw new ApiException(ErrorCode.RAG_SERVICE_ERROR, "Error extracting text from PDF");
        }
    }

    private String cleanText(String text) {
        if (text == null) return "";
        String cleaned = text.replaceAll("[\\p{Cc}&&[^\n]]", " ");
        cleaned = cleaned.replaceAll("-\s*\n", " ");
        cleaned = cleaned.replaceAll("(?<!\n)\n(?!\n)", " ");
        cleaned = cleaned.replaceAll("\s{2,}", " ").trim();
        return cleaned;
    }

    private Document createDocument(String content, MultipartFile file) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("source", file.getOriginalFilename());
        metadata.put("upload_date", LocalDate.now().toString());
        metadata.put("contentType", Objects.requireNonNull(file.getContentType()));
        metadata.put("contentLength", String.valueOf(file.getSize()));
        return new Document(content, metadata);
    }

    private List<Document> retrieveCandidates(String query) {
        String keywordQuery = query.replaceAll("(?i)c?\s+kh?ng|c?\s+ph?i\s+l?|l?\s+g?|t?i\s+sao", " ").trim();
        List<Document> queryDocs = vectorStore.similaritySearch(SearchRequest.builder().query(query).topK(500).build());
        List<Document> keywordDocs = vectorStore.similaritySearch(SearchRequest.builder().query(keywordQuery).topK(500).build());
        return Stream.concat(queryDocs.stream(), keywordDocs.stream())
                .distinct()
                .collect(Collectors.toList());
    }

    private List<Document> rankDocuments(String query, List<Document> candidates) {
        String[] keywords = query.split("\s+");
        List<Document> highPriority = new java.util.ArrayList<>();
        List<Document> lowPriority = new java.util.ArrayList<>();

        for (Document doc : candidates) {
            boolean isMatch = false;
            String text = doc.getText().toLowerCase();
            for (String kw : keywords) {
                if (kw.length() > 2 && text.contains(kw.toLowerCase())) {
                    isMatch = true;
                    break;
                }
            }
            if (isMatch) highPriority.add(doc); else lowPriority.add(doc);
        }

        List<Document> result = new java.util.ArrayList<>();
        int highLimit = 295;
        for (int i = 0; i < Math.min(highPriority.size(), highLimit); i++) {
            result.add(highPriority.get(i));
        }

        int totalLimit = 300;
        for (int i = 0; i < Math.min(lowPriority.size(), totalLimit - result.size()); i++) {
            result.add(lowPriority.get(i));
        }

        return result;
    }

    private String buildContext(List<Document> docs) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < docs.size(); i++) {
            sb.append("[Source ").append(i + 1).append("]: ").append(docs.get(i).getText()).append("\n\n");
        }
        return sb.toString();
    }

    private String buildPrompt(String query, String context, UUID philosopherId) {
        String systemGuidelines = Prompt.RAG_ACADEMIC_PROFESSOR
                .replace("You are an expert academic professor.", "") // Remove default persona
                .trim();

        String finalSystemPrompt;
        if (philosopherId != null) {
            Optional<Philosopher> philosopher = philosopherRepository.findById(philosopherId);
            if (philosopher.isPresent()) {
                finalSystemPrompt = philosopher.get().getSystemPrompt() + "\n\n" + systemGuidelines;
            } else {
                finalSystemPrompt = "You are an expert academic professor." + systemGuidelines;
            }
        } else {
            finalSystemPrompt = "You are an expert academic professor." + systemGuidelines;
        }

        return finalSystemPrompt
                .replace("{context}", context)
                .replace("{query}", query);
    }

    private void deleteTempFile(Path filePath) {
        try {
            Files.deleteIfExists(filePath);
        } catch (Exception e) {
            log.error("Failed to delete temporary file {}: {}", filePath, e.getMessage());
        }
    }
}
