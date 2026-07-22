package com.philosophy.rag.features.learning.entity;

import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Lớp Quiz (Câu hỏi thử thách) - Nhúng trực tiếp (Embedded) trong QuizSet.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quiz {

    /** Mã câu hỏi */
    private UUID quizId;

    /** Nội dung câu hỏi */
    private String questionText;

    /** Giải thích đáp án */
    private String explanation;

    /** Loại hình Minigame (QuizType) */
    private QuizType quizType;

    /** Điểm thưởng XP (XPReward) */
    @Builder.Default
    private Integer xpReward = 10;

    /** Danh sách phương án đáp án của câu hỏi này (Embedded) */
    @Builder.Default
    private List<QuizOption> options = new ArrayList<>();

    /**
     * Loại hình trò chơi Minigame.
     */
    public enum QuizType {
        /** Câu hỏi trắc nghiệm nhiều lựa chọn */
        MULTIPLE_CHOICE,
        /** Trò chơi kéo thả ghép thẻ bài */
        DRAG_AND_DROP,
        /** Điền vào chỗ trống */
        FILL_IN_THE_BLANK,
        /** Đúng - Sai */
        TRUE_FALSE,
        /** Nối cột */
        MATCHING,
        /** Sắp xếp dòng thời gian */
        TIMELINE,
        /** Scenario-based Quiz */
        SCENARIO
    }
}
