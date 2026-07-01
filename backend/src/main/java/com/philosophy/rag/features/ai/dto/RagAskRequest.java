package com.philosophy.rag.features.ai.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record RagAskRequest(
        @NotNull
        String query,
        @NotNull
        UUID philosopherId,
        UUID sessionId) {}




