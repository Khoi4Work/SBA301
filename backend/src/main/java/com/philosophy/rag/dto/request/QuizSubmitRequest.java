package com.philosophy.rag.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class QuizSubmitRequest {
    @NotEmpty(message = "Answers list cannot be empty")
    private List<AnswerItem> answers;

    @Data
    public static class AnswerItem {
        private UUID quizId;
        
        // For MULTIPLE_CHOICE, TRUE_FALSE, SCENARIO
        private UUID selectedOptionId; 
        
        // For FILL_IN_THE_BLANK
        private String blankText; 
        
        // For MATCHING
        private List<MatchingPair> matches; 
        
        // For TIMELINE
        private List<UUID> orderedOptionIds; 
    }

    @Data
    public static class MatchingPair {
        private String left;
        private String right;
    }
}
