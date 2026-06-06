package com.philosophy.rag.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import com.philosophy.rag.base.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Thực thể: Bộ đề ôn tập (QuizSet)
 * Nhóm các câu hỏi ôn tập (thường gồm 20 câu hỏi) thuộc về một tài liệu nhất định.
 */
@Entity
@Table(name = "quiz_sets", indexes = {
        @Index(name = "idx_quiz_set_document", columnList = "document_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizSet extends BaseEntity {

    /** Mã bộ đề — Khóa chính */
    @Id
    @Column(name = "quiz_set_id", nullable = false, updatable = false)
    private UUID quizSetId;

    @PrePersist
    public void generateId() {
        if (quizSetId == null) {
            quizSetId = UuidCreator.getTimeOrderedEpoch();
        }
    }

    /** Tiêu đề bộ đề ôn tập */
    @Column(name = "title", nullable = false, length = 500)
    private String title;

    /**
     * Tài liệu liên quan.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "document_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_quiz_set_document"))
    private Document document;

    /**
     * Danh sách câu hỏi trong bộ đề này.
     */
    @OneToMany(mappedBy = "quizSet", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Quiz> quizzes = new ArrayList<>();
}
