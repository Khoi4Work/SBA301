package com.philosophy.rag.dto.request;

import jakarta.validation.constraints.NotNull;

public record TtsRequest(@NotNull String text, @NotNull String voice) {
}