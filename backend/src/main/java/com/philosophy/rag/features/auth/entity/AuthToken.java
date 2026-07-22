package com.philosophy.rag.features.auth.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import com.philosophy.rag.base.persistence.BaseEntity;
import com.philosophy.rag.features.auth.entity.enums.TokenType;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

/**
 * Thực thể: Refresh Token
 * Lưu trữ token dài hạn để cấp mới Access Token mà không cần login lại.
 */
@Entity
@Table(name = "auth_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthToken extends BaseEntity {

    /** Mã token — Khóa chính */
    @Id
    @Column(name = "auth_token_id", nullable = false, updatable = false)
    private UUID authTokenId;

    @PrePersist
    public void generateId() {
        if (authTokenId == null) {
            authTokenId = UuidCreator.getTimeOrderedEpoch();
        }
    }

    @Column(nullable = false, unique = true, columnDefinition = "text")
    private String token;

    @Enumerated(EnumType.STRING)
    private TokenType tokenType;

    @Column(name = "used_at")
    private Instant usedAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }
}
