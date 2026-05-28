package com.philosophy.rag.service;

import com.philosophy.rag.dto.request.LoginRequest;
import com.philosophy.rag.dto.request.RegisterRequest;
import com.philosophy.rag.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    void logout(String token);
}