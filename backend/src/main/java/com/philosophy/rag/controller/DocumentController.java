package com.philosophy.rag.controller;

import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.base.response.ApiResponse;
import com.philosophy.rag.dto.response.DocumentUploadResponse;
import com.philosophy.rag.service.S3StorageService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final S3StorageService s3StorageService;

    @Operation(summary = "Upload document to S3")
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<DocumentUploadResponse>> uploadDocument(
            @RequestPart("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description
    ) throws ApiException {

        log.info("Uploading file: {}", file.getOriginalFilename());

        DocumentUploadResponse response =
                s3StorageService.uploadDocument(file, title, description);

        return ResponseEntity.ok(
                ApiResponse.success(response, "Upload successful")
        );
    }
}