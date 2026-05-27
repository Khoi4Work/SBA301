package com.philosophy.rag.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Thực thể: Tài liệu triết học (Document)
 * Lưu trữ kho dữ liệu văn bản chính thống phục vụ việc đọc sách
 *
 *
 * Lưu ý: Tên bảng là "philosophy_documents" để tránh xung đột
 * với từ khóa "document" trong một số DB engine.
 */
@Entity
@Table(name = "philosophy_documents", indexes = {
        @Index(name = "idx_doc_category", columnList = "category")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document extends BaseEntity {

    /** Mã tài liệu — Khóa chính, tự tăng */
    @Id
    @Column(name = "document_id", nullable = false, updatable = false)
    private UUID documentId;

    @PrePersist
    public void generateId() {
        if (documentId == null) {
            documentId = UuidCreator.getTimeOrderedEpoch();
        }
    }

    /** Tiêu đề tài liệu */
    @Column(name = "title", nullable = false, length = 500)
    private String title;

    /**
     * Phân loại chuyên mục (Category).
     * Ví dụ: "Triết học Cổ đại", "Thần thoại Bắc Âu", "Triết học Phương Tây".
     */
    @Column(name = "category", nullable = false, length = 200)
    private String category;

    /**
     * Nội dung văn bản đầy đủ (FullText).
     * Phục vụ tính năng đọc sách
     */
    @Column(name = "full_text", columnDefinition = "TEXT", nullable = false)
    private String fullText;

    /**
     * Tổng số phần hoặc trang (TotalSections).
     * Dùng để tính toán vị trí đọc và hiển thị thanh tiến trình đọc.
     */
    @Column(name = "total_sections", nullable = false)
    @Builder.Default
    private Integer totalSections = 1;

    // ── Quan hệ 1-Nhiều ───────────────────────────────────────────────────────

    /**
     * Danh sách tiến trình đọc của các người dùng cho tài liệu này.
     * LearningProgress đóng vai trò trung gian (User ↔ Document).
     */
    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<LearningProgress> learningProgresses = new ArrayList<>();

    /**
     * Danh sách câu hỏi thử thách liên kết với tài liệu này.
     * Quiz được mở khi LearningProgress.isCompleted = true.
     */
    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Quiz> quizzes = new ArrayList<>();
}
