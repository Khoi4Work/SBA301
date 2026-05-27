package com.philosophy.rag.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

/**
 * Thực thể: Lịch sử làm bài (UserQuizResult)
 * Ghi nhận kết quả mỗi lần người dùng thực hiện thử thách.
 *
 * Logic XP: Khi isCorrectAnswer = true,
 * hệ thống lấy Quiz.xpReward để cộng vào User.totalXp.
 */
@Entity
@Table(name = "user_quiz_results",
        indexes = {
                @Index(name = "idx_result_user_id", columnList = "user_id"),
                @Index(name = "idx_result_quiz_id", columnList = "quiz_id"),
                @Index(name = "idx_result_completed_at", columnList = "completed_at"),
                @Index(name = "idx_result_correct", columnList = "is_correct_answer")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserQuizResult extends BaseEntity {

    /** Mã kết quả — Khóa chính, tự tăng */
    @Id
    @Column(name = "result_id", nullable = false, updatable = false)
    private UUID resultId;

    @PrePersist
    public void generateId() {
        if (resultId == null) {
            resultId = UuidCreator.getTimeOrderedEpoch();
        }
    }

    /**
     * Người dùng thực hiện bài kiểm tra — Khóa ngoại.
     * Quan hệ Nhiều-1: nhiều UserQuizResult thuộc một User.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_result_user"))
    private User user;

    /**
     * Câu hỏi được trả lời — Khóa ngoại.
     * Quan hệ Nhiều-1: nhiều UserQuizResult thuộc một Quiz.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quiz_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_result_quiz"))
    private Quiz quiz;

    /**
     * Trạng thái trả lời (IsCorrectAnswer).
     * True  → trả lời đúng → kích hoạt cộng XP cho User.
     * False → trả lời sai  → không cộng điểm.
     */
    @Column(name = "is_correct_answer", nullable = false)
    private Boolean isCorrectAnswer;

    /**
     * Thời gian hoàn thành bài làm — tự động gán khi persist.
     * Dùng để thống kê và sắp xếp lịch sử trên Dashboard.
     */
    @CreationTimestamp
    @Column(name = "completed_at", nullable = false, updatable = false)
    private Instant completedAt;
}
