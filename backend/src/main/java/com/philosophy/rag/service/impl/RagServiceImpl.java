package com.philosophy.rag.service.impl;

import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.base.exception.ErrorCode;
import com.philosophy.rag.dto.DocumentContent;
import com.philosophy.rag.repository.custom.VectorStoreRepository;
import com.philosophy.rag.service.RagService;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.transformer.splitter.TextSplitter;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
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
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@Slf4j
public class RagServiceImpl implements RagService {
    private final VectorStore vectorStore;
    private final VectorStoreRepository vectorStoreRepository;
    private final ChatClient chatClient;
    private final TextSplitter textSplitter = new TokenTextSplitter(800, 400, 5, 10000, true);

    public RagServiceImpl(VectorStore vectorStore, VectorStoreRepository vectorStoreRepository, ChatClient.Builder chatClientBuilder) {
        this.vectorStore = vectorStore;
        this.vectorStoreRepository = vectorStoreRepository;
        this.chatClient = chatClientBuilder.build();
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

            // Phân loại luồng đọc text theo đuôi file
            if (filename.toLowerCase().endsWith(".pdf")) {
                rawText = extractTextFromPdf(tempFile);
            } else if (filename.toLowerCase().endsWith(".md")) {
                rawText = extractTextFromMarkdown(tempFile);
            }

            String cleanedText = cleanText(rawText);

            Document document = createDocument(cleanedText, file);
            List<Document> chunks = textSplitter.apply(List.of(document));

            log.info("Indexing {} chunks for file: {}", chunks.size(), filename);
            vectorStore.accept(chunks);

            return "Document uploaded and indexed successfully: " + filename;
        } catch (Exception e) {
            log.error("Error uploading document {}: {}", filename, e.getMessage());
            throw new ApiException(ErrorCode.RAG_SERVICE_ERROR, "Failed to process document: " + e.getMessage());
        } finally {
            deleteTempFile(tempFile);
        }
    }

    @Override
    public String ask(String query) {
        log.info("[RAG DEBUG] Incoming Query: {}", query);

        List<Document> candidates = retrieveCandidates(query);
        List<Document> prioritizedDocs = rankDocuments(query, candidates);

        String context = buildContext(prioritizedDocs);
        String prompt = buildPrompt(query, context);

        return chatClient.prompt()
                .user(prompt)
                .call()
                .content();
    }

    @Override
    public List<DocumentContent> listDocuments() {
        return vectorStoreRepository.getDocumentContent();
    }

    public void resetVectorStore() {
        try {
            log.info("Resetting vector store data...");
            vectorStoreRepository.truncateStore();
        } catch (Exception e) {
            log.error("Failed to reset vector store: {}", e.getMessage());
            throw new ApiException(ErrorCode.RAG_SERVICE_ERROR, "Could not reset vector store");
        }
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
            // Đọc toàn bộ nội dung file text/markdown bằng UTF-8
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

        // 1. Remove all control characters except newline
        // \p{Cc} matches any control character. [^\n] ensures we don't remove newlines yet.
        String cleaned = text.replaceAll("[\\p{Cc}&&[^\n]]", " ");

        // 2. Handle hyphenated line breaks
        cleaned = cleaned.replaceAll("-\s*\n", " ");

        // 3. Replace single newlines (not paragraphs) with space
        cleaned = cleaned.replaceAll("(?<!\n)\n(?!\n)", " ");

        // 4. Standardize all whitespace to a single space
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

        List<Document> queryDocs = vectorStore.similaritySearch(SearchRequest.query(query).withTopK(500));
        List<Document> keywordDocs = vectorStore.similaritySearch(SearchRequest.query(keywordQuery).withTopK(500));

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
            String text = doc.getContent().toLowerCase();
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
            sb.append("[Source ").append(i + 1).append("]: ").append(docs.get(i).getContent()).append("\n\n");
        }
        return sb.toString();
    }

    private String buildPrompt(String query, String context) {
        return "You are an expert academic professor. Your goal is to provide a structured and clear answer based STRICTLY on the provided context. " +
                "Guidelines:\n" +
                "1. Use Markdown formatting for the response to make it easy to read on a UI (use bold text for key terms, bullet points for lists).\n" +
                "2. When citing, use the format [Source X] directly after the relevant information.\n" +
                "3. If the context contains a statement that proves the fact, explicitly state 'Yes' or 'No' and then explain using a bulleted list of evidence from the sources.\n" +
                "4. If the information is not available, state clearly that it's not in the provided documents.\n" +
                "5. Always respond in the same language as the user's question.\n\n" +
                "Context:\n" + context + "\n\nQuestion: " + query;
    }

    private void deleteTempFile(Path filePath) {
        try {
            Files.deleteIfExists(filePath);
        } catch (Exception e) {
            log.error("Failed to delete temporary file {}: {}", filePath, e.getMessage());
        }
    }
}
