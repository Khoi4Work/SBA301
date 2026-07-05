package com.philosophy.rag.base.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.philosophy.rag.base.exception.ErrorCode;
import com.philosophy.rag.base.response.ApiResult;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Xử lý các lỗi xác thực (401 Unauthorized).
 * Thay vì để Spring trả về trang lỗi mặc định, class này sẽ trả về ApiResponse chuẩn của hệ thống.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {

        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        // Sử dụng đúng ErrorCode và Builder của ApiResult
        ApiResult<String> apiResult = ApiResult.<String>builder()
                .code(ErrorCode.UNAUTHENTICATED.getCode())
                .message("Unauthorized: Access is denied due to invalid credentials or expired token")
                .build();

        response.getWriter().write(objectMapper.writeValueAsString(apiResult));
    }
}
