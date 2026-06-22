package com.philosophy.rag.controller;

import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.base.exception.ErrorCode;
import com.philosophy.rag.base.response.ApiResponse;
import com.philosophy.rag.dto.response.DocumentContent;
import com.philosophy.rag.dto.response.RagAskResponse;
import com.philosophy.rag.service.ChatHistoryService;
import com.philosophy.rag.service.ChatSessionService;
import com.philosophy.rag.service.RagService;
import com.philosophy.rag.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Slf4j
@Validated
@RestController
@RequestMapping("/api/rag")
@RequiredArgsConstructor
@Tag(name = "RAG Operations", description = "APIs for interacting with Document Vector Store")
public class RagController {

    private final RagService ragService;
    private final ChatHistoryService chatHistoryService;
    private final UserService userService;
    private final ChatSessionService chatSessionService;

    @Operation(summary = "Upload and index a document (Requires ADMIN, STAFF or INSTRUCTOR)", description = "Uploads a file (PDF, TXT, etc.), extracts content, and stores it in the vector database for RAG.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "File uploaded and indexed successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid file or empty file uploaded"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error during indexing process")
    })
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'INSTRUCTOR')")
    public ResponseEntity<ApiResponse<String>> upload(
            @RequestPart("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file cannot be empty");
        }

        log.info("Uploading file to RAG system: {}", file.getOriginalFilename());
        try {
            String result = ragService.uploadDocument(file);
            return ResponseEntity.ok(ApiResponse.success(result,
                    "Tải lên và lập chỉ mục tài liệu thành công"));
        } catch (Exception e) {
            log.error("RAG upload failed: {}", e.getMessage());
            throw new ApiException(ErrorCode.RAG_SERVICE_ERROR, "Lỗi lập chỉ mục tài liệu: " + e.getMessage());
        }
    }

    @Operation(summary = "Ask a question based on indexed documents", description = "Retrieves the most relevant context from the vector store and generates an answer using the RAG pipeline.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Answer generated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Query parameter is blank or invalid"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error occurred during retrieval or generation")
    })
    @GetMapping("/ask")
    public ResponseEntity<ApiResponse<RagAskResponse>> ask(
            @RequestParam("query") @NotBlank(message = "Query cannot be blank") String query,
            @RequestParam(value = "philosopherId", required = false) UUID philosopherId,
            @RequestParam(value = "sessionId", required = false) UUID sessionId) {

        log.info("Received RAG query: {}, PhilosopherID: {}, SessionID: {}", query, philosopherId, sessionId);

        UUID userId = userService.getCurrentUserId();
        RagAskResponse response = ragService.ask(userId, query, philosopherId, sessionId);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "List all indexed documents", description = "Retrieves a list of all documents currently stored in the vector database.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Document list retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error occurred while fetching documents")
    })
    @GetMapping("/documents")
    public ResponseEntity<ApiResponse<List<DocumentContent>>> listDocuments() {
        log.info("Fetching document list");
        List<DocumentContent> result = ragService.listDocuments();

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "Reset the Vector Store (Requires ADMIN)", description = "Completely wipes all indexed documents from the vector store. This operation is irreversible.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Vector store reset successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Failed to reset the vector store")
    })
    @DeleteMapping("/reset")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> resetDatabase() {
        log.warn("Triggered vector store reset");
        ragService.resetVectorStore();

        return ResponseEntity
                .ok(ApiResponse.success("Vector store has been reset successfully!"));
    }
}