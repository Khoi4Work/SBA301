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
public class QuizSetDetailResponse {
    private UUID quizSetId;
    private String title;
    private List<QuizQuestionItem> questions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuizQuestionItem {
        private UUID quizId;
        private String questionText;
        private String quizType;
        private List<QuizOptionItem> options;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuizOptionItem {
        private UUID optionId;
        private String optionText;
    }
}
