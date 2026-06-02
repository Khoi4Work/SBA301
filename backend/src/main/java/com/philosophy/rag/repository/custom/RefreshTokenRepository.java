package com.philosophy.rag.repository.custom;

import com.philosophy.rag.entity.RefreshToken;
import com.philosophy.rag.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    Optional<RefreshToken> findByToken(String token);
    void deleteByUserId(UUID userId);
    void deleteByToken(String token);
}
