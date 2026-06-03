package com.philosophy.rag.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import com.philosophy.rag.base.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Thực thể: Người dùng (User)
 * Lưu trữ thông tin tài khoản, trạng thái đăng nhập
 * và tổng điểm tích lũy để hiển thị trên Dashboard.
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    /** Mã người dùng — Khóa chính, tự tăng */
    @Id
    @Column(name = "user_id", nullable = false, updatable = false)
    private UUID userId;

    @PrePersist
    public void generateId() {
        if (userId == null) {
            userId = UuidCreator.getTimeOrderedEpoch();
        }
    }

    /** Tên đăng nhập — duy nhất, không null */
    @Column(name = "username", nullable = false, unique = true, length = 100)
    private String username;

    /** Email — duy nhất, không null */
    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    /** Mật khẩu đã mã hóa (BCrypt) */
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    /**
     * Điểm kinh nghiệm tích lũy (TotalXP).
     * Hiển thị trên Dashboard, cập nhật khi hoàn thành Minigame.
     * Mặc định = 0.
     */
    @Column(name = "total_xp", nullable = false)
    @Builder.Default
    private Integer totalXp = 0;

//    /** Ngày tạo tài khoản — tự động gán khi persist */
//    @CreationTimestamp
//    @Column(name = "created_at", nullable = false, updatable = false)
//    private Instant createdAt;

    // ── Quan hệ 1-Nhiều ───────────────────────────────────────────────────────

    /** Danh sách tin nhắn hội thoại của người dùng */
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ChatMessage> chatMessages = new ArrayList<>();

    /** Danh sách nội dung sáng tạo do người dùng tạo */
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<GeneratedContent> generatedContents = new ArrayList<>();

    /** Danh sách tiến trình học tập của người dùng */
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<LearningProgress> learningProgresses = new ArrayList<>();

    /** Lịch sử làm bài kiểm tra */
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<UserQuizResult> quizResults = new ArrayList<>();
}
