package com.philosophy.rag.service;

import com.philosophy.rag.dto.DocumentContent;
import com.philosophy.rag.service.impl.RagServiceImpl;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
import org.springframework.ai.reader.pdf.ParagraphPdfDocumentReader;
import org.springframework.ai.transformer.splitter.TextSplitter;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.UrlResource;
import org.springframework.jdbc.core.JdbcTemplate;

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
public class RagService implements RagServiceImpl {
    private final VectorStore vectorStore;
    private final ChatClient chatClient;
    private final TextSplitter textSplitter = new TokenTextSplitter(800, 400, 5, 10000, true);

    public RagService(VectorStore vectorStore, ChatClient.Builder chatClientBuilder, JdbcTemplate jdbcTemplate) {
        this.vectorStore = vectorStore;
        this.chatClient = chatClientBuilder.build();
        this.jdbcTemplate = jdbcTemplate;
    }

    private final JdbcTemplate jdbcTemplate;

    @Override
    public String uploadDocument(MultipartFile file) throws Exception {
        Path tempDir = Paths.get(System.getProperty("java.io.tmpdir"));
        Path filePath = tempDir.resolve(Objects.requireNonNull(file.getOriginalFilename()));
        
        try {
            // Sử dụng StandardCopyOption.REPLACE_EXISTING để tránh lỗi file đã tồn tại
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
            // Luôn luôn xóa file tạm để tránh leak và lock file
            Files.deleteIfExists(filePath);
        }
    }

    @Override
    public String ask(String query) {
        // 1. Search for similar documents in VectorStore (RAG - Retrieval)
        List<Document> similarDocuments = vectorStore.similaritySearch(
                SearchRequest.query(query).withTopK(5)
        );

        log.info("[RAG DEBUG] Query: {}", query);
        log.info("[RAG DEBUG] Retrieved {} documents", similarDocuments.size());
        similarDocuments.forEach(doc -> log.info("[RAG DEBUG] Chunk: {} | Score: {} | Source: {}",
                doc.getContent().substring(0, Math.min(doc.getContent().length(), 100)) + "...",
                doc.getMetadata().get("similarity_score"), // Nếu VectorStore trả về score
                doc.getMetadata().get("source")));

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

    @Override
    public List<DocumentContent> listDocuments() {
        // Sử dụng GROUP BY để tính toán số lượng chunk và độ dài trung bình cho mỗi file
        String sql = "SELECT " +
                     "metadata->>'source' as source, " +
                     "MAX(metadata->>'upload_date') as upload_date, " +
                     "MAX(metadata->>'contentType') as content_type, " +
                     "MAX(metadata->>'contentLength') as content_length, " +
                     "COUNT(*) as chunk_count, " +
                     "AVG(LENGTH(content)) as avg_chunk_length " +
                     "FROM vector_store " +
                     "GROUP BY metadata->>'source'";

        return jdbcTemplate.query(sql, (rs, rowNum) ->
                new DocumentContent(
                        rs.getString("source"),
                        rs.getString("upload_date"),
                        rs.getString("content_type"),
                        rs.getString("content_length"),
                        rs.getLong("chunk_count"),
                        rs.getDouble("avg_chunk_length")
                )
        );
    }

    public void resetVectorStore() {
        try {
            log.info("Starting to reset vector store data...");
            // Sử dụng TRUNCATE để xóa sạch dữ liệu nhanh hơn DELETE
            jdbcTemplate.execute("TRUNCATE TABLE vector_store");
            log.info("Vector store has been reset successfully.");
        } catch (Exception e) {
            log.error("Failed to reset vector store: {}", e.getMessage());
            throw new RuntimeException("Could not reset vector store. Please check database connection.");
        }
    }

}
