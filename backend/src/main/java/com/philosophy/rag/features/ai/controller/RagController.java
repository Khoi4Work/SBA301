package com.philosophy.rag.features.ai.controller;

import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.base.exception.ErrorCode;
import com.philosophy.rag.base.response.ApiResult;
import com.philosophy.rag.features.ai.dto.RagAskRequest;
import com.philosophy.rag.features.ai.dto.RagAskResponse;
import com.philosophy.rag.features.ai.service.RagService;
import com.philosophy.rag.utils.dto.DocumentContent;
import com.philosophy.rag.features.auth.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
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
    private final UserService userService;

    @Operation(summary = "Upload and index a document (Requires ADMIN, STAFF or INSTRUCTOR)", description = "Uploads a file (PDF, TXT, etc.), extracts content, and stores it in the vector database for RAG.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "File uploaded and indexed successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid file or empty file uploaded"),
            @ApiResponse(responseCode = "500", description = "Internal server error during indexing process")
    })
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'INSTRUCTOR')")
    public ResponseEntity<ApiResult<String>> upload(
            @RequestPart("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file cannot be empty");
        }

        log.info("Uploading file to RAG system: {}", file.getOriginalFilename());
        try {
            String result = ragService.uploadDocument(file);
            return ResponseEntity.ok(ApiResult.success(result,
                    "Tải lên và lập chỉ mục tài liệu thành công"));
        } catch (Exception e) {
            log.error("RAG upload failed: {}", e.getMessage());
            throw new ApiException(ErrorCode.RAG_SERVICE_ERROR, "Lỗi lập chỉ mục tài liệu: " + e.getMessage());
        }
    }

    @Operation(summary = "Ask a question based on indexed documents", description = "Retrieves the most relevant context from the vector store and generates an answer using the RAG pipeline.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Answer generated successfully"),
            @ApiResponse(responseCode = "400", description = "Query parameter is blank or invalid"),
            @ApiResponse(responseCode = "500", description = "Error occurred during retrieval or generation")
    })
    @PostMapping("/ask")
    public ResponseEntity<ApiResult<RagAskResponse>> ask(@RequestBody @Valid RagAskRequest request) {

        log.info("Received RAG query: {}, PhilosopherID: {}, SessionID: {}", request.query(), request.philosopherId(), request.sessionId());

        //UUID userId = userService.getCurrentUserId();
        UUID userId = UUID.randomUUID();
        RagAskResponse response = ragService.ask(userId, request.query(), request.philosopherId(), request.sessionId());

        return ResponseEntity.ok(ApiResult.success(response));
    }

    @Operation(summary = "Ask a question based on the reading document content and selected text context", description = "Generates a contextual response from the selected philosopher using the full document content and selection query context.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Answer generated successfully"),
            @ApiResponse(responseCode = "400", description = "Query parameter is blank or invalid"),
            @ApiResponse(responseCode = "500", description = "Error occurred during generation")
    })
    @GetMapping("/ask-contextual")
    public ResponseEntity<ApiResult<RagAskResponse>> askContextual(
            @RequestParam("query") @NotBlank(message = "Query cannot be blank") String query,
            @RequestParam(value = "s3Key", required = false) String s3Key,
            @RequestParam(value = "selectedText", required = false) String selectedText,
            @RequestParam(value = "philosopherId", required = false) UUID philosopherId,
            @RequestParam(value = "sessionId", required = false) UUID sessionId) {

        log.info("Received contextual RAG query: {}, S3Key: {}, PhilosopherID: {}, SessionID: {}", query, s3Key, philosopherId, sessionId);

        UUID userId = userService.getCurrentUserId();
        RagAskResponse response = ragService.askContextual(userId, query, s3Key, selectedText, philosopherId, sessionId);

        return ResponseEntity.ok(ApiResult.success(response));
    }

    @Operation(summary = "List all indexed documents", description = "Retrieves a list of all documents currently stored in the vector database.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Document list retrieved successfully"),
            @ApiResponse(responseCode = "500", description = "Error occurred while fetching documents")
    })
    @GetMapping("/documents")
    public ResponseEntity<ApiResult<List<DocumentContent>>> listDocuments() {
        log.info("Fetching document list");
        List<DocumentContent> result = ragService.listDocuments();

        return ResponseEntity.ok(ApiResult.success(result));
    }

    @Operation(summary = "Reset the Vector Store (Requires ADMIN)", description = "Completely wipes all indexed documents from the vector store. This operation is irreversible.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Vector store reset successfully"),
            @ApiResponse(responseCode = "500", description = "Failed to reset the vector store")
    })
    @DeleteMapping("/reset")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResult<String>> resetDatabase() {
        log.warn("Triggered vector store reset");
        ragService.resetVectorStore();

        return ResponseEntity
                .ok(ApiResult.success("Vector store has been reset successfully!"));
    }
}