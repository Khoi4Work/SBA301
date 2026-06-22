package com.philosophy.rag.controller;

import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.base.response.ApiResponse;
import com.philosophy.rag.dto.response.DocumentDistributionResponse;
import com.philosophy.rag.dto.response.DocumentUploadResponse;
import com.philosophy.rag.service.S3StorageService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import com.philosophy.rag.repository.itf.UserRepository;
import com.philosophy.rag.repository.itf.LearningProgressRepository;
import com.philosophy.rag.entity.LearningProgress;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.AnonymousAuthenticationToken;

@Slf4j
@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

        private final S3StorageService s3StorageService;
        private final UserRepository userRepository;
        private final LearningProgressRepository learningProgressRepository;

        @Operation(summary = "Upload document to S3 (Requires ADMIN, STAFF or INSTRUCTOR)")
        @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'INSTRUCTOR')")
        public ResponseEntity<ApiResponse<DocumentUploadResponse>> uploadDocument(
                        @RequestPart("file") MultipartFile file,
                        @RequestParam(value = "title", required = false) String title,
                        @RequestParam(value = "description", required = false) String description,
                        @RequestPart(value = "image", required = false) MultipartFile image,
                        @RequestParam(value = "imageUrl", required = false) String imageUrl,
                        @RequestParam(value = "category", required = false) String category) throws ApiException {

                log.info("Uploading file: {}, title: {}, category: {}", file.getOriginalFilename(), title, category);

                DocumentUploadResponse response = s3StorageService.uploadDocument(file, title, description, image,
                                imageUrl, category);

                return ResponseEntity.ok(
                                ApiResponse.success(response, "Upload successful"));
        }

        @Operation(summary = "List documents stored in S3")
        @GetMapping
        public ResponseEntity<ApiResponse<List<DocumentDistributionResponse>>> listDocuments() {
                log.info("Listing documents from S3");

                List<DocumentDistributionResponse> documents = s3StorageService.listDocuments();
                String downloadBaseUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                                .path("/api/documents/download")
                                .toUriString();

                documents.forEach(document -> document.setDownloadUrl(
                                downloadBaseUrl + "?key="
                                                + URLEncoder.encode(document.getKey(), StandardCharsets.UTF_8)));

                // Check completed files if user is logged in
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                log.info("=== listDocuments Authentication: {} ===", authentication);
                if (authentication != null && authentication.isAuthenticated() && !(authentication instanceof AnonymousAuthenticationToken)) {
                        String username = authentication.getName();
                        log.info("=== listDocuments Logged in user: {} ===", username);
                        userRepository.findByUsername(username).ifPresent(user -> {
                                List<LearningProgress> progresses = learningProgressRepository.findByUser(user);
                                log.info("=== listDocuments Progresses size: {} ===", progresses.size());
                                for (DocumentDistributionResponse doc : documents) {
                                        boolean isCompleted = progresses.stream()
                                                        .anyMatch(p -> {
                                                                boolean keyMatch = p.getDocument().getS3Key().equals(doc.getKey());
                                                                boolean completed = p.getIsCompleted();
                                                                log.info("=== DB Key: '{}' | S3 Key: '{}' | Match: {} | Completed: {} ===", 
                                                                        p.getDocument().getS3Key(), doc.getKey(), keyMatch, completed);
                                                                return keyMatch && completed;
                                                        });
                                        doc.setIsCompleted(isCompleted);
                                }
                        });
                } else {
                        log.info("=== listDocuments User is not logged in / Anonymous ===");
                        documents.forEach(doc -> doc.setIsCompleted(false));
                }

                return ResponseEntity.ok(ApiResponse.success(documents, "Document list retrieved successfully"));
        }

//        @Operation(summary = "Download a document from S3 by key")
//        @GetMapping("/download")
//        public ResponseEntity<byte[]> downloadDocument(
//                        @RequestParam("key") String key) throws ApiException {
//
//                log.info("Downloading document with key: {}", key);
//                byte[] fileBytes = s3StorageService.downloadDocument(key);
//                String contentType = s3StorageService.getContentType(key);
//
//                // Extract readable filename from key (format: documents/date/uuid-filename)
//                String fileName = key.substring(key.lastIndexOf('/') + 1);
//                if (fileName.length() > 37 && fileName.charAt(36) == '-') {
//                        fileName = fileName.substring(37);
//                }
//
//                return ResponseEntity.ok()
//                                .contentType(MediaType.parseMediaType(contentType))
//                                .header(HttpHeaders.CONTENT_DISPOSITION,
//                                                "attachment; filename=\"" + fileName + "\"")
//                                .header("Access-Control-Expose-Headers", HttpHeaders.CONTENT_DISPOSITION)
//                                .body(fileBytes);
//        }

}