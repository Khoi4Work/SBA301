package com.philosophy.rag.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizSubmitResponse {
    private int score;
    private int xpGained;
    private int newTotalXp;
    private List<FeedbackItem> details;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FeedbackItem {
        private UUID quizId;
        private boolean isCorrect;
        private String explanation;
        private List<UUID> correctOptionIds;
        private String correctText;
        private List<String> correctPairs;
        private List<UUID> correctTimelineOrder;
    }
}
