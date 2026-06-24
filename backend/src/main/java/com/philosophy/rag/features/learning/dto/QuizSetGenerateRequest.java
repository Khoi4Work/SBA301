package com.philosophy.rag.features.learning.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class QuizSetGenerateRequest {
    @NotBlank(message = "S3 key is required")
    private String s3Key;

    private String title;
}
