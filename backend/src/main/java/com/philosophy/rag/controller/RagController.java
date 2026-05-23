package com.philosophy.rag.controller;

import com.philosophy.rag.base.response.ApiResponse;
import com.philosophy.rag.dto.DocumentContent;
import com.philosophy.rag.service.RagService; // Thay đổi 1: Dùng Interface
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j // Thay đổi 2: Thêm Logging
@Validated // Thay đổi 3: Kích hoạt validate tham số
@RestController
@RequestMapping("/api/rag")
@RequiredArgsConstructor
@Tag(name = "RAG Operations", description = "APIs for interacting with Document Vector Store") // Thay đổi 4: OpenAPI/Swagger
public class RagController {

    // TIÊM INTERFACE: Dependency Inversion Principle (SOLID)
    private final RagService ragService;

    @Operation(summary = "Upload and index a document")
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    // Thay đổi 5: Bỏ `throws Exception` ở Controller
    public ResponseEntity<ApiResponse<String>> upload(@RequestPart("file") MultipartFile file) throws Exception {
        // Thay đổi 6: Xử lý file rỗng
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file cannot be empty");
        }

        log.info("Uploading file to RAG system: {}", file.getOriginalFilename());
        String result = ragService.uploadDocument(file);

        return ResponseEntity.ok(ApiResponse.success(result, "Document uploaded and indexed successfully"));
    }

    @Operation(summary = "Ask a question based on indexed documents")
    @GetMapping("/ask")
    public ResponseEntity<ApiResponse<String>> ask(
            @RequestParam("query") @NotBlank(message = "Query cannot be blank") String query) {

        log.info("Received RAG query: {}", query);
        String result = ragService.ask(query);

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "List all indexed documents")
    @GetMapping("/documents")
    public ResponseEntity<ApiResponse<List<DocumentContent>>> listDocuments() {
        log.info("Fetching document list");
        List<DocumentContent> result = ragService.listDocuments(); // Sửa lại import cho gọn

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "Reset the Vector Store")
    @DeleteMapping("/reset")
    public ResponseEntity<ApiResponse<String>> resetDatabase() {
        log.warn("Triggered vector store reset");
        ragService.resetVectorStore();

        return ResponseEntity.ok(ApiResponse.success("Vector store has been reset successfully!"));
    }
}