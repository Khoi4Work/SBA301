package com.philosophy.rag.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private UUID userId;

    private String username;

    private String email;

    private String fullName;

    private String biography;

    private String avatarUrl;

    private Integer totalXp;
}
