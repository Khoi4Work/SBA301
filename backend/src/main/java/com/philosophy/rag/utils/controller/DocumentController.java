package com.philosophy.rag.utils.controller;

import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.base.response.ApiResponse;
import com.philosophy.rag.utils.dto.DocumentDistributionResponse;
import com.philosophy.rag.utils.dto.DocumentUploadResponse;
import com.philosophy.rag.utils.service.S3StorageService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import com.philosophy.rag.features.auth.repository.UserRepository;
import com.philosophy.rag.features.learning.repository.LearningProgressRepository;
import com.philosophy.rag.features.learning.entity.LearningProgress;
import com.philosophy.rag.utils.repository.DocumentRepository;
import com.philosophy.rag.features.learning.repository.QuizSetRepository;
import com.philosophy.rag.features.learning.service.SessionService;
import com.philosophy.rag.features.learning.dto.SessionContentResponse;
import com.philosophy.rag.utils.entity.Document;
import com.philosophy.rag.features.learning.entity.QuizSet;
import org.springframework.transaction.annotation.Transactional;
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
        private final DocumentRepository documentRepository;
        private final QuizSetRepository quizSetRepository;
        private final SessionService sessionService;

        @Operation(summary = "Upload document to S3 (Requires ADMIN, STAFF or INSTRUCTOR)")
        @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'INSTRUCTOR')")
        public ResponseEntity<ApiResponse<DocumentUploadResponse>> uploadDocument(
                        @RequestPart("file") MultipartFile file,
                        @RequestParam(value = "title", required = false) String title,
                        @RequestParam(value = "description", required = false) String description,
                        @RequestPart(value = "image", required = false) MultipartFile image,
                        @RequestParam(value = "category", required = false) String category) throws ApiException {

                log.info("Uploading file: {}, title: {}, category: {}", file.getOriginalFilename(), title, category);

                DocumentUploadResponse response = s3StorageService.uploadDocument(file, title, description, image, category);

                try {
                        String s3Key = response.getKey();
                        SessionContentResponse contentResponse = sessionService.getContent(s3Key);
                        Document newDoc = Document.builder()
                                        .title(response.getTitle())
                                        .s3Key(s3Key)
                                        .category(response.getCategory() != null ? response.getCategory() : "Tài liệu ôn tập")
                                        .fullText(contentResponse.getContent())
                                        .totalSections(1)
                                        .build();
                        documentRepository.save(newDoc);
                        log.info("Successfully created Document record in database for key: {}", s3Key);
                } catch (Exception e) {
                        log.error("Failed to auto-save Document to PostgreSQL database on upload", e);
                }

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
                if (authentication != null && authentication.isAuthenticated()
                                && !(authentication instanceof AnonymousAuthenticationToken)) {
                        String username = authentication.getName();
                        log.info("=== listDocuments Logged in user: {} ===", username);
                        userRepository.findByUsername(username).ifPresent(user -> {
                                List<LearningProgress> progresses = learningProgressRepository.findByUser(user);
                                log.info("=== listDocuments Progresses size: {} ===", progresses.size());
                                for (DocumentDistributionResponse doc : documents) {
                                        boolean isCompleted = progresses.stream()
                                                        .anyMatch(p -> {
                                                                boolean keyMatch = p.getDocument().getS3Key()
                                                                                .equals(doc.getKey());
                                                                boolean completed = p.getIsCompleted();
                                                                log.info("=== DB Key: '{}' | S3 Key: '{}' | Match: {} | Completed: {} ===",
                                                                                p.getDocument().getS3Key(),
                                                                                doc.getKey(), keyMatch, completed);
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

        @Operation(summary = "Update a document's metadata (Requires ADMIN, STAFF or INSTRUCTOR)")
        @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'INSTRUCTOR')")
        @Transactional
        public ResponseEntity<ApiResponse<Void>> updateDocument(
                        @RequestParam("key") String key,
                        @RequestParam(value = "title", required = false) String title,
                        @RequestParam(value = "description", required = false) String description,
                        @RequestParam(value = "category", required = false) String category,
                        @RequestPart(value = "image", required = false) MultipartFile image) throws ApiException {
                log.info("Request to update document key: {}, title: {}, category: {}", key, title, category);
                
                s3StorageService.updateDocumentMetadata(key, title, description, category, image);
                
                documentRepository.findByS3Key(key).ifPresent(doc -> {
                        if (title != null && !title.isBlank()) {
                                doc.setTitle(title);
                        }
                        if (category != null && !category.isBlank()) {
                                doc.setCategory(category);
                        }
                        documentRepository.save(doc);
                        log.info("Updated Document in PostgreSQL database for key: {}", key);
                });
                
                return ResponseEntity.ok(ApiResponse.success(null, "Document updated successfully"));
        }

        @Operation(summary = "Delete a document from S3 and database (Requires ADMIN, STAFF or INSTRUCTOR)")
        @DeleteMapping
        @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'INSTRUCTOR')")
        @Transactional
        public ResponseEntity<ApiResponse<Void>> deleteDocument(@RequestParam("key") String key) throws ApiException {
                log.info("Request to delete document with key: {}", key);
                
                s3StorageService.deleteDocument(key);
                
                documentRepository.findByS3Key(key).ifPresent(doc -> {
                        documentRepository.delete(doc);
                        log.info("Deleted Document from PostgreSQL database with key: {}", key);
                });
                
                List<QuizSet> quizSets = quizSetRepository.findByDocumentS3Key(key);
                if (!quizSets.isEmpty()) {
                        quizSetRepository.deleteAll(quizSets);
                        log.info("Deleted {} QuizSets from MongoDB for key: {}", quizSets.size(), key);
                }
                
                return ResponseEntity.ok(ApiResponse.success(null, "Document deleted successfully"));
        }

}