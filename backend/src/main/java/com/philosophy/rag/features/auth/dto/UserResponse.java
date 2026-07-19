package com.philosophy.rag.features.auth.dto;

import com.philosophy.rag.features.auth.entity.enums.Role;
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
    LocalDateTime createdAt,
    Role role
) {}
