package com.philosophy.rag.controller;

import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.base.exception.ErrorCode;
import com.philosophy.rag.dto.DocumentContent;
import com.philosophy.rag.service.RagService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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
@Tag(name = "RAG Operations", description = "APIs for interacting with Document Vector Store") // Thay đổi 4:
                                                                                               // OpenAPI/Swagger
public class RagController {

    // TIÊM INTERFACE: Dependency Inversion Principle (SOLID)
    private final RagService ragService;

    @Operation(summary = "Upload and index a document", description = "Uploads a file (PDF, TXT, etc.), extracts content, and stores it in the vector database for RAG.")
    @ApiResponses(value = {

            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "File uploaded and indexed successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid file or empty file uploaded"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error during indexing process")
    })
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<com.philosophy.rag.base.response.ApiResponse<String>> upload(
            @RequestPart("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file cannot be empty");
        }

        log.info("Uploading file to RAG system: {}", file.getOriginalFilename());
        try {
            String result = ragService.uploadDocument(file);
            return ResponseEntity.ok(com.philosophy.rag.base.response.ApiResponse.success(result,
                    "Document uploaded and indexed successfully"));
        } catch (Exception e) {
            log.error("RAG upload failed: {}", e.getMessage());
            throw new ApiException(ErrorCode.RAG_SERVICE_ERROR, "Failed to index document: " + e.getMessage());
        }
    }

    @Operation(summary = "Ask a question based on indexed documents", description = "Retrieves the most relevant context from the vector store and generates an answer using the RAG pipeline.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Answer generated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Query parameter is blank or invalid"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error occurred during retrieval or generation")
    })
    @GetMapping("/ask")
    public ResponseEntity<com.philosophy.rag.base.response.ApiResponse<String>> ask(
            @RequestParam("query") @NotBlank(message = "Query cannot be blank") String query) {

        log.info("Received RAG query: {}", query);
        String result = ragService.ask(query);

        return ResponseEntity.ok(com.philosophy.rag.base.response.ApiResponse.success(result));
    }

    @Operation(summary = "List all indexed documents", description = "Retrieves a list of all documents currently stored in the vector database.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Document list retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error occurred while fetching documents")
    })
    @GetMapping("/documents")
    public ResponseEntity<com.philosophy.rag.base.response.ApiResponse<List<DocumentContent>>> listDocuments() {
        log.info("Fetching document list");
        List<DocumentContent> result = ragService.listDocuments();

        return ResponseEntity.ok(com.philosophy.rag.base.response.ApiResponse.success(result));
    }

    @Operation(summary = "Reset the Vector Store", description = "Completely wipes all indexed documents from the vector store. This operation is irreversible.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Vector store reset successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Failed to reset the vector store")
    })
    @DeleteMapping("/reset")
    public ResponseEntity<com.philosophy.rag.base.response.ApiResponse<String>> resetDatabase() {
        log.warn("Triggered vector store reset");
        ragService.resetVectorStore();

        return ResponseEntity
                .ok(com.philosophy.rag.base.response.ApiResponse.success("Vector store has been reset successfully!"));
    }
}