package com.philosophy.rag.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import com.philosophy.rag.base.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * Thực thể: Phương án đáp án (QuizOption)
 * Lưu trữ các lựa chọn trả lời cho từng câu hỏi Minigame.
 * Mỗi Quiz có nhiều QuizOption, trong đó ít nhất một option là đáp án đúng.
 */
@Entity
@Table(name = "quiz_options", indexes = {
        @Index(name = "idx_option_quiz_id", columnList = "quiz_id"),
        @Index(name = "idx_option_is_correct", columnList = "is_correct")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizOption extends BaseEntity {

    /** Mã đáp án — Khóa chính, tự tăng */
    @Id
    @Column(name = "option_id", nullable = false, updatable = false)
    private UUID optionId;

    @PrePersist
    public void generateId() {
        if (optionId == null) {
            optionId = UuidCreator.getTimeOrderedEpoch();
        }
    }

    /**
     * Câu hỏi chủ — Khóa ngoại.
     * Quan hệ Nhiều-1: nhiều QuizOption thuộc một Quiz.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quiz_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_option_quiz"))
    private Quiz quiz;

    /**
     * Nội dung phương án (OptionText).
     * Có thể là:
     * - Tên triết gia (cho game ghép chữ DragAndDrop)
     * - Câu nói nổi tiếng (cho game ghép câu trích dẫn)
     * - Phương án text thông thường (cho MultipleChoice)
     */
    @Column(name = "option_text", columnDefinition = "TEXT", nullable = false)
    private String optionText;

    /**
     * Là đáp án đúng (IsCorrect).
     * True → đây là lựa chọn chính xác cho câu hỏi.
     * Mặc định = false.
     */
    @Column(name = "is_correct", nullable = false)
    @Builder.Default
    private Boolean isCorrect = false;
}
