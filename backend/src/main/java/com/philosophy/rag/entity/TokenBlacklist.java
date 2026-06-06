package com.philosophy.rag.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long blacklistId;

    @Column(nullable = false, unique = true, columnDefinition = "text")
    private String token;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;
}
