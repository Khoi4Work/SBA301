package com.philosophy.rag.features.learning.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserNoteRequest {
    @NotBlank(message = "S3 Key cannot be blank")
    private String documentS3Key;

    private String selectedText;

    @NotBlank(message = "Note text cannot be blank")
    private String noteText;
}
