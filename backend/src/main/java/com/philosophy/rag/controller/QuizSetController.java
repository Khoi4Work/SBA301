package com.philosophy.rag.controller;

import com.philosophy.rag.base.response.ApiResponse;
import com.philosophy.rag.dto.request.QuizSetGenerateRequest;
import com.philosophy.rag.dto.request.QuizSubmitRequest;
import com.philosophy.rag.dto.response.QuizSetDetailResponse;
import com.philosophy.rag.dto.response.QuizSetResponse;
import com.philosophy.rag.dto.response.QuizSubmitResponse;
import com.philosophy.rag.service.QuizSetService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/quiz-sets")
@RequiredArgsConstructor
@Validated
public class QuizSetController {

    private final QuizSetService quizSetService;

    @Operation(summary = "Get list of quiz sets for a specific S3 file key")
    @GetMapping
    public ResponseEntity<ApiResponse<List<QuizSetResponse>>> getQuizSets(
            @RequestParam("s3Key") String s3Key) {
        log.info("Request to get quiz sets for S3 key: {}", s3Key);
        List<QuizSetResponse> response = quizSetService.getQuizSets(s3Key);
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy danh sách bộ đề thành công"));
    }

    @Operation(summary = "Generate a 20-question quiz set using AI from S3 file content")
    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<QuizSetResponse>> generateQuizSet(
            @Valid @RequestBody QuizSetGenerateRequest request) {
        log.info("Request to generate quiz set for S3 key: {}", request.getS3Key());
        QuizSetResponse response = quizSetService.generateQuizSet(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Bộ đề ôn tập mới đã được tạo thành công"));
    }

    @Operation(summary = "Get quiz set detail with questions and options (answers stripped for safety)")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<QuizSetDetailResponse>> getQuizSetDetail(
            @PathVariable("id") UUID id) {
        log.info("Request to get quiz set details for id: {}", id);
        QuizSetDetailResponse response = quizSetService.getQuizSetDetail(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy chi tiết bộ đề thành công"));
    }

    @Operation(summary = "Grade a quiz set submission and update user XP points")
    @PostMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<QuizSubmitResponse>> submitQuizSet(
            @PathVariable("id") UUID id,
            @Valid @RequestBody QuizSubmitRequest request) {
        log.info("Request to submit answers for quiz set id: {}", id);
        QuizSubmitResponse response = quizSetService.gradeQuizSet(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Nộp bài thành công và đã ghi nhận kết quả"));
    }
}
