package com.philosophy.rag.features.auth.repository;

import com.philosophy.rag.features.auth.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {

        Optional<PasswordResetToken> findByTokenHashAndUsedAtIsNull(String tokenHash);

        @Modifying
        @Query("""
                        delete from PasswordResetToken token
                        where token.user.userId = :userId
                        and token.usedAt is null
                        """)
        void deleteUnusedTokensByUserId(UUID userId);

        @Modifying
        @Query("""
                        delete from PasswordResetToken token
                        where token.expiresAt < :now
                        """)
        void deleteExpiredTokens(Instant now);
}
