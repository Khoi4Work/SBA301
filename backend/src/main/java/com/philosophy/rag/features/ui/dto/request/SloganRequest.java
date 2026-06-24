package com.philosophy.rag.features.ui.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SloganRequest {
    @NotBlank(message = "Nội dung slogan không được để trống")
    @Size(max = 500, message = "Nội dung slogan không được vượt quá 500 ký tự")
    private String content;

    @NotBlank(message = "Tác giả không được để trống")
    private String author;

    private boolean isActive = true;
}
