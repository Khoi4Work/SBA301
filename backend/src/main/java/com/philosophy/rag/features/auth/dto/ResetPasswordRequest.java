package com.philosophy.rag.features.auth.dto;

import com.philosophy.rag.features.auth.entity.enums.TokenType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
    @NotBlank(message = "Token is required")
    String token,

    @NotBlank(message = "New password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    String newPassword,

    @NotNull(message = "Token type is required")
    TokenType tokenType
) {}
