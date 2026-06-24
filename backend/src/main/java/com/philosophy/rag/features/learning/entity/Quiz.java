package com.philosophy.rag.features.learning.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import com.philosophy.rag.base.persistence.BaseEntity;
import com.philosophy.rag.utils.entity.Document;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Thực thể: Câu hỏi thử thách (Quiz / Minigame)
 * Quản lý các câu hỏi trắc nghiệm hoặc kéo thả ghép thẻ bài
 * thuộc Học viện Triết học.
 * Được mở khi LearningProgress.isCompleted = true cho DocumentID tương ứng.
 */
@Entity
@Table(name = "quizzes", indexes = {
        @Index(name = "idx_quiz_document_id", columnList = "document_id"),
        @Index(name = "idx_quiz_type", columnList = "quiz_type")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quiz extends BaseEntity {

    /** Mã câu hỏi — Khóa chính, tự tăng */
    @Id
    @Column(name = "quiz_id", nullable = false, updatable = false)
    private UUID quizId;

    @PrePersist
    public void generateId() {
        if (quizId == null) {
            quizId = UuidCreator.getTimeOrderedEpoch();
        }
    }

    /**
     * Tài liệu liên quan — Khóa ngoại.
     * Quan hệ Nhiều-1: nhiều Quiz thuộc một Document.
     * Dùng để truy vấn quiz khi người dùng hoàn thành một tài liệu.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "document_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_quiz_document"))
    private Document document;

    /** Bộ đề ôn tập chứa câu hỏi này (nếu có) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_set_id",
                foreignKey = @ForeignKey(name = "fk_quiz_quiz_set"))
    private QuizSet quizSet;

    /** Nội dung câu hỏi */
    @Column(name = "question_text", columnDefinition = "TEXT", nullable = false)
    private String questionText;

    /** Giải thích đáp án */
    @Column(name = "explanation", columnDefinition = "TEXT")
    private String explanation;

    /**
     * Loại hình Minigame (QuizType).
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "quiz_type", nullable = false, length = 30)
    private QuizType quizType;

    /**
     * Điểm thưởng XP (XPReward).
     * Cộng vào User.totalXp khi trả lời đúng (UserQuizResult.isCorrectAnswer = true).
     */
    @Column(name = "xp_reward", nullable = false)
    @Builder.Default
    private Integer xpReward = 10;

    // ── Quan hệ 1-Nhiều ───────────────────────────────────────────────────────

    /**
     * Danh sách phương án đáp án của câu hỏi này.
     * Quan hệ 1-Nhiều: một Quiz chứa nhiều QuizOption.
     */
    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<QuizOption> options = new ArrayList<>();

    /**
     * Lịch sử làm bài của người dùng với câu hỏi này.
     */
    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<UserQuizResult> userQuizResults = new ArrayList<>();

    // ── Enum nội bộ ──────────────────────────────────────────────────────────

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
