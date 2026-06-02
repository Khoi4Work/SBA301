package com.philosophy.rag.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "token_blacklist")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenBlacklist {
    @Id
    @Column(name = "blacklist_id", nullable = false, updatable = false)
    private UUID blacklistId;

    @PrePersist
    public void generateId() {
        if (blacklistId == null) {
            blacklistId = UuidCreator.getTimeOrderedEpoch();
        }
    }

    @Column(nullable = false, unique = true, columnDefinition = "text")
    private String token;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;
}
