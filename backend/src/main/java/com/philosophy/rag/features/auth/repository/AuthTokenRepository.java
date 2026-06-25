package com.philosophy.rag.features.auth.repository;

import com.philosophy.rag.features.auth.entity.AuthToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AuthTokenRepository extends JpaRepository<AuthToken, UUID> {
    Optional<AuthToken> findByToken(String token);
    void deleteByUser_UserId(UUID userUserId);
    @Modifying
    @Query("""
            delete from AuthToken token
            where token.user.userId = :userId
            and token.usedAt is null
            """)
    void deleteUnusedTokensByUserId(UUID userId);

    Optional<AuthToken> findByTokenAndUsedAtIsNull(String tokenHash);
}
