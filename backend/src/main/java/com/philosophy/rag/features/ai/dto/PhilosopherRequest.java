package com.philosophy.rag.features.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record PhilosopherRequest(
    @NotBlank(message = "Tên triết gia không được để trống")
    String name,

    String avatarUrl,

    String shortQuote,

    String category,

    String core,

    String biography,

    @NotBlank(message = "System prompt không được để trống")
    String systemPrompt
) {}
