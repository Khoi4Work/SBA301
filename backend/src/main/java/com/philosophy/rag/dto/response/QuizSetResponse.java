package com.philosophy.rag.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizSetResponse {
    private UUID quizSetId;
    private String title;
    private UUID documentId;
    private String documentTitle;
    private int questionCount;
    private LocalDateTime createdAt;
}
