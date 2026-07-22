package com.philosophy.rag.features.learning.entity;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserQuizAnswer {
    private UUID quizId;
    private Boolean isCorrectAnswer;
    private UUID selectedOptionId;
    private String blankText;
    private List<MatchingPair> matches;
    private List<UUID> orderedOptionIds;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MatchingPair {
        private String left;
        private String right;
    }
}
