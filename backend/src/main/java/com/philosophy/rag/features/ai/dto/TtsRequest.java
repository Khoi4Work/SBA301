package com.philosophy.rag.features.ai.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record TtsRequest(@NotNull String text, @NotNull String voice, UUID philosopherId, UUID sessionId) {
}
