package com.philosophy.rag.features.learning.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Document(collection = "user_quiz_submissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserQuizSubmission {
    @Id
    private UUID submissionId;
    private UUID userId;
    private UUID quizSetId;
    private String quizSetTitle;
    private String documentTitle;
    private Integer score;
    private Integer totalQuestions;
    private Integer xpGained;
    
    private List<UserQuizAnswer> answers;

    @Indexed(expireAfterSeconds = 2592000) // Tự động xóa sau 30 ngày (TTL)
    private Instant completedAt;
}
