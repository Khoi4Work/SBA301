package com.philosophy.rag.features.learning.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class UserNoteResponse {
    private UUID noteId;
    private String documentS3Key;
    private String selectedText;
    private String noteText;
    private Instant createdAt;
}
