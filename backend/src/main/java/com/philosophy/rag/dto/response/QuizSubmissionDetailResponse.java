package com.philosophy.rag.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.philosophy.rag.dto.request.QuizSubmitRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizSubmissionDetailResponse {
    private UUID submissionId;
    private UUID quizSetId;
    private String quizSetTitle;
    private String documentTitle;
    private int score;
    private int totalQuestions;
    private int xpGained;
    private LocalDateTime completedAt;
    private List<QuestionDetailItem> questions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionDetailItem {
        private UUID quizId;
        private String questionText;
        private String explanation;
        private String quizType;
        private List<OptionItem> options;
        
        // User's answers
        private Boolean isCorrect;
        private UUID selectedOptionId;
        private String blankText;
        private List<QuizSubmitRequest.MatchingPair> matches;
        private List<UUID> orderedOptionIds;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OptionItem {
        private UUID optionId;
        private String optionText;
        private Boolean isCorrect;
        private Integer orderIndex;
    }
}
