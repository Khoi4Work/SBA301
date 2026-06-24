package com.philosophy.rag.features.ai.dto;

import java.util.UUID;

public record ChatResponse(String text, String audioBase64, UUID sessionId) {}
