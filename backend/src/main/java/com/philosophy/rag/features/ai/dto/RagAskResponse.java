package com.philosophy.rag.features.ai.dto;

import lombok.Builder;
import java.util.UUID;

@Builder
public record RagAskResponse(String answer, UUID sessionId) {}
