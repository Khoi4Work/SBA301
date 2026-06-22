package com.philosophy.rag.dto.request;

import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.base.response.ApiResponse;
import jakarta.validation.constraints.NotNull;

import javax.annotation.meta.TypeQualifierNickname;

public record RefreshTokenRequest(
        @NotNull(message = "USER_NAME_NOT_NULL")
        String refreshToken
) {
}
