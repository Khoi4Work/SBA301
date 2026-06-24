package com.philosophy.rag.features.learning.entity;

import lombok.*;

import java.util.UUID;

/**
 * Lớp QuizOption (Phương án đáp án) - Nhúng trực tiếp (Embedded) trong Quiz.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizOption {

    /** Mã đáp án */
    private UUID optionId;

    /** Nội dung phương án (OptionText) */
    private String optionText;

    /** Là đáp án đúng (IsCorrect) */
    @Builder.Default
    private Boolean isCorrect = false;

    /** Thứ tự sắp xếp (dùng cho Timeline / Matching) */
    private Integer orderIndex;
}
