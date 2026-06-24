package com.philosophy.rag.features.auth.service;

import com.philosophy.rag.features.auth.dto.ForgotPasswordRequest;
import com.philosophy.rag.features.auth.dto.LoginRequest;
import com.philosophy.rag.features.auth.dto.RegisterRequest;
import com.philosophy.rag.features.auth.dto.ResetPasswordRequest;
import com.philosophy.rag.features.auth.dto.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    void logout(String token);
    AuthResponse refreshAccessToken(String refreshToken);
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
}
