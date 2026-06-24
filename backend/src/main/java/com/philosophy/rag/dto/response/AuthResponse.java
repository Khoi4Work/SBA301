package com.philosophy.rag.dto.response;

import com.philosophy.rag.entity.enums.Role;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class AuthResponse {
    private UUID id;
    private String accessToken;
    private String refreshToken;
    private Long expiresIn;
    private String tokenType;
    private String username;
    private String fullName;
    private String biography;
    private String avatarUrl;
    private String email;
    private Role role;
}
