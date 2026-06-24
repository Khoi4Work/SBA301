package com.philosophy.rag.features.auth.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import com.philosophy.rag.base.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "password_reset_tokens",
        indexes = {
                @Index(name = "idx_password_reset_token_hash", columnList = "token_hash"),
                @Index(name = "idx_password_reset_user_id", columnList = "user_id")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_password_reset_token_hash", columnNames = "token_hash")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResetToken extends BaseEntity {

    @Id
    @Column(name = "reset_token_id", nullable = false, updatable = false)
    private UUID resetTokenId;

    @PrePersist
    public void generateId() {
        if (resetTokenId == null) {
            resetTokenId = UuidCreator.getTimeOrderedEpoch();
        }
    }

    /**
     * User sở hữu reset token này.
     * Không cascade User, vì xóa token không được xóa user.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Chỉ lưu hash của token, không lưu token thật.
     */
    @Column(name = "token_hash", nullable = false, length = 64)
    private String tokenHash;

    /**
     * Thời điểm token hết hạn.
     */
    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    /**
     * Nếu khác null nghĩa là token đã dùng rồi.
     */
    @Column(name = "used_at")
    private Instant usedAt;

    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }

    public boolean isUsed() {
        return usedAt != null;
    }

    public void markAsUsed() {
        this.usedAt = Instant.now();
    }
}
