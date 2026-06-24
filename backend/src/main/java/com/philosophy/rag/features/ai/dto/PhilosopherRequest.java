package com.philosophy.rag.features.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhilosopherRequest {

    @NotBlank(message = "Tên triết gia không được để trống")
    private String name;

    private String avatarUrl;

    private String shortQuote;

    private String category;

    private String core;

    private String biography;

    @NotBlank(message = "System prompt không được để trống")
    private String systemPrompt;
}
