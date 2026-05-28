package com.philosophy.rag.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import com.philosophy.rag.base.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

/**
 * Thực thể: Tiến trình học tập (LearningProgress)
 * Theo dõi trạng thái đọc dở và ghi chú cá nhân của người dùng
 * đối với từng tài liệu triết học.
 *
 * Đóng vai trò thực thể trung gian cho quan hệ Nhiều-Nhiều
 * giữa User và Document (với các thuộc tính bổ sung).
 */
@Entity
@Table(name = "learning_progresses",
        uniqueConstraints = {
                // Mỗi người dùng chỉ có một bản ghi tiến trình cho mỗi tài liệu
                @UniqueConstraint(name = "uq_progress_user_document",
                        columnNames = {"user_id", "document_id"})
        },
        indexes = {
                @Index(name = "idx_progress_user_id", columnList = "user_id"),
                @Index(name = "idx_progress_document_id", columnList = "document_id"),
                @Index(name = "idx_progress_completed", columnList = "is_completed")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearningProgress extends BaseEntity {

    /** Mã tiến trình — Khóa chính, tự tăng */
    @Id
    @Column(name = "progress_id", nullable = false, updatable = false)
    private UUID progressId;

    @PrePersist
    public void generateId() {
        if (progressId == null) {
            progressId = UuidCreator.getTimeOrderedEpoch();
        }
    }

    /**
     * Người dùng — Khóa ngoại.
     * Quan hệ Nhiều-1: nhiều LearningProgress thuộc một User.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_progress_user"))
    private User user;

    /**
     * Tài liệu đang theo dõi — Khóa ngoại.
     * Quan hệ Nhiều-1: nhiều LearningProgress thuộc một Document.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "document_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_progress_document"))
    private Document document;

    /**
     * Vị trí đọc cuối cùng (LastReadPosition).
     * Lưu số trang hoặc số đoạn để tua lại đúng chỗ khi mở lại tài liệu.
     * Mặc định = 0 (chưa đọc trang nào).
     */
    @Column(name = "last_read_position", nullable = false)
    @Builder.Default
    private Integer lastReadPosition = 0;

    /**
     * Dữ liệu Highlight và Ghi chú (HighlightsAndNotes).
     * Lưu dưới dạng JSON: [{page, text, color, note}, ...]
     * Được cập nhật liên tục khi người dùng bôi đậm trong trang đọc.
     */
    @Column(name = "highlights_and_notes", columnDefinition = "TEXT")
    private String highlightsAndNotes;

    /**
     * Trạng thái hoàn thành (IsCompleted).
     * Khi = true → kích hoạt mở khóa Cổng Thử thách (Quiz) cho tài liệu này.
     * Mặc định = false.
     */
    @Column(name = "is_completed", nullable = false)
    @Builder.Default
    private Boolean isCompleted = false;

    /**
     * Thời gian xem gần nhất (LastViewedAt).
     * Tự động cập nhật mỗi khi bản ghi được thay đổi.
     * Dùng để hiển thị "Đọc gần đây" trên Dashboard.
     */
    @UpdateTimestamp
    @Column(name = "last_viewed_at")
    private Instant lastViewedAt;
}
