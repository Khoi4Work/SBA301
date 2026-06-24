package com.philosophy.rag.features.auth.dto;

public record UserUpdateRequest(
    String username,
    String email,
    String fullName,
    String biography
) {}
