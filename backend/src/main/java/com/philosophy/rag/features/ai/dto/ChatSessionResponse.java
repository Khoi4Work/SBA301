package com.philosophy.rag.features.ai.dto;

import lombok.Builder;
import java.util.UUID;

@Builder
public record ChatSessionResponse(
    UUID sessionId,
    String title,
    UUID philosopherId,
    String philosopherName
) {}
