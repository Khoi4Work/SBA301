package com.philosophy.rag.features.learning.dto;

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
public class QuizHistoryResponse {
    private UUID submissionId;
    private UUID quizSetId;
    private String quizSetTitle;
    private String documentTitle;
    private int score;
    private int totalQuestions;
    private int xpGained;
    private LocalDateTime completedAt;
}
