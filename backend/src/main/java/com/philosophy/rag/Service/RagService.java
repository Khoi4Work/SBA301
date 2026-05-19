package com.philosophy.rag.service;

import com.philosophy.rag.dto.DocumentContent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.pdf.ParagraphPdfDocumentReader;
import org.springframework.ai.transformer.splitter.TextSplitter;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.UrlResource;
import org.springframework.jdbc.core.JdbcTemplate;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@Slf4j
public class RagService {
    private final VectorStore vectorStore;
    private final ChatClient chatClient;
    private final TextSplitter textSplitter = new TokenTextSplitter(800, 400, 5, 10000, true);

    public RagService(VectorStore vectorStore, ChatClient.Builder chatClientBuilder, JdbcTemplate jdbcTemplate) {
        this.vectorStore = vectorStore;
        this.chatClient = chatClientBuilder.build();
        this.jdbcTemplate = jdbcTemplate;
    }

    private final JdbcTemplate jdbcTemplate;

    public String uploadDocument(MultipartFile file) throws Exception {
        // Save file locally to be read by PdfReader
        Path tempDir = Paths.get(System.getProperty("java.io.tmpdir"));
        Path filePath = tempDir.resolve(Objects.requireNonNull(file.getOriginalFilename()));
        Files.copy(file.getInputStream(), filePath);

        // Read PDF
        ParagraphPdfDocumentReader pdfReader = new ParagraphPdfDocumentReader(new UrlResource("file:" + filePath.toAbsolutePath().toString()));

        List<Document> documents = pdfReader.read();
        
        // CRITICAL: Manually add source metadata to each document fragment
        // Because ParagraphPdfDocumentReader might not add it automatically
        documents.forEach(doc -> doc.getMetadata().put("source", file.getOriginalFilename()));

        vectorStore.accept(textSplitter.apply(documents));

        return "Document uploaded and indexed successfully: " + file.getOriginalFilename();
    }

    public String ask(String query) {
        // 1. Search for similar documents in VectorStore (RAG - Retrieval)
        List<Document> similarDocuments = vectorStore.similaritySearch(
                SearchRequest.query(query).withTopK(5)
        );

        // 2. Build context from retrieved documents
        String context = similarDocuments.stream()
                .map(Document::getContent)
                .collect(Collectors.joining("\n\n"));

        // 3. Generate answer using LLM (Generation)
        String prompt = "You are a helpful assistant. Use the following context to answer the user's question. " +
                "If the answer is not in the context, say that you don't know. " +
                "Context:\n" + context + "\n\nQuestion: " + query;

        return chatClient.prompt()
                .user(prompt)
                .call()
                .content();
    }

    public List<DocumentContent> listDocuments() {
        // Query both metadata (source) and the content of the documents
        // In pgvector, the content is usually in the 'content' column (or similar depending on Spring AI version)
        String sql = "SELECT metadata->>'source' as source, content FROM vector_store";
        
        return jdbcTemplate.query(sql, (rs, rowNum) -> 
            new DocumentContent(rs.getString("source"), rs.getString("content"))
        );
    }
}
