package com.philosophy.rag.features.auth.dto;

import jakarta.validation.constraints.NotNull;

public record RefreshTokenRequest(
        @NotNull(message = "USER_NAME_NOT_NULL")
        String refreshToken
) {}
