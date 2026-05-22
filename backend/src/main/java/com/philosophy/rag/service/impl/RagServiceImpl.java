package com.philosophy.rag.service.impl;

import com.philosophy.rag.dto.DocumentContent;
import com.philosophy.rag.repository.custom.VectorStoreRepository;
import com.philosophy.rag.service.RagService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
import org.springframework.ai.transformer.splitter.TextSplitter;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.UrlResource;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

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
    public String uploadDocument(MultipartFile file) throws Exception {
        Path tempDir = Paths.get(System.getProperty("java.io.tmpdir"));
        Path filePath = tempDir.resolve(Objects.requireNonNull(file.getOriginalFilename()));

        try {
            Files.copy(file.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            log.info("Uploading document: {}", file.getOriginalFilename());
            PagePdfDocumentReader pdfReader =
                    new PagePdfDocumentReader(new UrlResource("file:" + filePath.toAbsolutePath().toString()));

            List<Document> documents = pdfReader.read();

            documents.forEach(doc -> {
                String uploadDate = LocalDate.now().toString();
                doc.getMetadata().putAll(
                        Map.of("upload_date", uploadDate,
                                "source", file.getOriginalFilename(),
                                "contentType", Objects.requireNonNull(file.getContentType()),
                                "contentLength", String.valueOf(file.getSize())
                        )
                );
            });

            log.info("Uploaded document: {}", file.getOriginalFilename());
            vectorStore.accept(textSplitter.apply(documents));

            return "Document uploaded and indexed successfully: " + file.getOriginalFilename();
        } finally {
            Files.deleteIfExists(filePath);
        }
    }

    @Override
    public String ask(String query) {
        List<Document> similarDocuments = vectorStore.similaritySearch(
                SearchRequest.query(query).withTopK(5)
        );

        log.info("[RAG DEBUG] Query: {}", query);
        log.info("[RAG DEBUG] Retrieved {} documents", similarDocuments.size());
        
        String context = similarDocuments.stream()
                .map(Document::getContent)
                .collect(Collectors.joining("\n\n"));

        String prompt = "You are a helpful assistant. Use the following context to answer the user's question. " +
                "If the answer is not in the context, say that you don't know. " +
                "Context:\n" + context + "\n\nQuestion: " + query;

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
            log.info("Starting to reset vector store data...");
            vectorStoreRepository.truncateStore();
            log.info("Vector store has been reset successfully.");
        } catch (Exception e) {
            log.error("Failed to reset vector store: {}", e.getMessage());
            throw new RuntimeException("Could not reset vector store. Please check database connection.");
        }
    }
}
