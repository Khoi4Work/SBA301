package com.philosophy.rag.features.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record PhilosopherRequest(
    @NotBlank(message = "Tên triết gia không được để trống")
    @Size(max = 200, message = "Tên triết gia không được vượt quá 200 ký tự")
    String name,

    @Size(max = 500, message = "Trích dẫn không được vượt quá 500 ký tự")
    String shortQuote,

    @Size(max = 200, message = "Trường phái không được vượt quá 200 ký tự")
    String category,

    @Size(max = 200, message = "Giá trị Core không được vượt quá 200 ký tự")
    String core,

    @NotBlank(message = "Tiểu sử không được để trống")
    @Size(max = 2000, message = "Tiểu sử không được vượt quá 2000 ký tự")
    String biography,

    @NotBlank(message = "System prompt không được để trống")
    @Size(max = 5000, message = "System prompt không được vượt quá 5000 ký tự")
    String systemPrompt
) {}
