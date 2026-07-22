package com.philosophy.rag.features.ui.dto.request;

import jakarta.validation.constraints.NotBlank;

public record UpdateTitleRequest(
        @NotBlank(message = "Title không được trống")
        String title
) {
}
