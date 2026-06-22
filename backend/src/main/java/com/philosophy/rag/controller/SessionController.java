package com.philosophy.rag.controller;

import com.philosophy.rag.base.response.ApiResponse;
import com.philosophy.rag.dto.request.SessionContentRequest;
import com.philosophy.rag.dto.response.QuizGenerateResponse;
import com.philosophy.rag.dto.response.SessionContentResponse;
import com.philosophy.rag.service.SessionService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/session")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    /**
     * Retrieve text content of a file from S3 for display in the study session.
     * Body: { "key": "documents/2026-05-25/xxx.docx" }
     */
    @Operation(summary = "Get lesson content from S3 file (Requires authentication)")
    @PostMapping("/content")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<SessionContentResponse>> getContent(
            @Valid @RequestBody SessionContentRequest request) {

        log.info("Session content request for key: {}", request.key());
        SessionContentResponse content = sessionService.getContent(request.key());
        return ResponseEntity.ok(ApiResponse.success(content, "Nội dung bài học được tải thành công"));
    }

    /**
     * Generate 10 quiz questions from S3 file content using AI.
     * Body: { "key": "documents/2026-05-25/xxx.docx" }
     */
    @Operation(summary = "Generate 10-question quiz from S3 file content using AI (Requires authentication)")
    @PostMapping("/quiz")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<QuizGenerateResponse>> generateQuiz(
            @Valid @RequestBody SessionContentRequest request) {

        log.info("Quiz generation request for key: {}", request.key());
        QuizGenerateResponse quiz = sessionService.generateQuiz(request.key());
        return ResponseEntity.ok(ApiResponse.success(quiz, "Bài quiz được tạo thành công"));
    }
}
