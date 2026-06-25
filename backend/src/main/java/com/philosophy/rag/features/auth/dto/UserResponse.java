package com.philosophy.rag.features.auth.dto;

import lombok.Builder;
import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record UserResponse(
    UUID userId,
    String username,
    String email,
    String fullName,
    String biography,
    String avatarUrl,
    Integer totalXp,
    Integer streak,
    LocalDateTime createdAt
) {}
