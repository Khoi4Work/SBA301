package com.philosophy.rag.features.ai.dto;

import lombok.Builder;

import java.time.LocalDateTime;
import java.util.UUID;
@Builder
public record ChatHistoryResponse(
    UUID historyId,
    UUID userId,
    UUID philosopherId,
    String philosopherName,
    String query,
    String response,
    LocalDateTime startTime,
    LocalDateTime endTime,
    Long durationMillis,
    LocalDateTime createdAt
) {}
