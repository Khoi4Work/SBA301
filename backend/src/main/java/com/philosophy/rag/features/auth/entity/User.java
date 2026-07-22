package com.philosophy.rag.features.auth.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import com.philosophy.rag.base.persistence.BaseEntity;
import com.philosophy.rag.features.ai.entity.GeneratedContent;
import com.philosophy.rag.features.auth.entity.enums.Role;
import com.philosophy.rag.features.learning.entity.LearningProgress;
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

    @Column(name = "fullName", length = 255)
    private String fullName;

    @Column(name = "biography", length = 255)
    private String biography;

    /** Mật khẩu đã mã hóa (BCrypt) */
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    /** Avatar URL trả về từ cloudinary */
    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    /** Public ID của Cloudinary */
    @Column(name = "cloudinary_public_id", length = 255)
    private String cloudinaryPublicId;

    @Column(name = "token_version")
    @Builder.Default
    private Long tokenVersion = 0L;

    /**
     * Phân quyền người dùng.
     * Mặc định là LEARNER.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    @Builder.Default
    private Role role = Role.LEARNER;

    /**
     * Điểm kinh nghiệm tích lũy (TotalXP).
     * Hiển thị trên Dashboard, cập nhật khi hoàn thành Minigame.
     * Mặc định = 0.
     */
    @Column(name = "total_xp", nullable = false)
    @Builder.Default
    private Integer totalXp = 0;

    /**
     * Chuỗi ngày học (Streak).
     * Tăng thêm 1 mỗi khi học xong hoặc làm quiz.
     * Mặc định = 0.
     */
    @Column(name = "streak", nullable = false, columnDefinition = "integer default 0")
    @Builder.Default
    private Integer streak = 0;

    // ── Quan hệ 1-Nhiều ───────────────────────────────────────────────────────


    /** Danh sách nội dung sáng tạo do người dùng tạo */
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<GeneratedContent> generatedContents = new ArrayList<>();

    /** Danh sách tiến trình học tập của người dùng */
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<LearningProgress> learningProgresses = new ArrayList<>();
}
