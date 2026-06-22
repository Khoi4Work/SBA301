package com.philosophy.rag.repository;

import com.philosophy.rag.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    Optional<RefreshToken> findByToken(String token);
    void deleteByUser_UserId(UUID userUserId);
    void deleteByToken(String token);
    void deleteAllByUser_UserId(UUID userId);
}
