package com.philosophy.rag.features.auth.dto;

import com.philosophy.rag.features.auth.entity.enums.Role;
import lombok.Builder;
import java.util.UUID;

@Builder
public record AuthResponse(
    UUID id,
    String accessToken,
    String refreshToken,
    Long expiresIn,
    String tokenType,
    String username,
    String fullName,
    String biography,
    String avatarUrl,
    String email,
    Role role
) {}
