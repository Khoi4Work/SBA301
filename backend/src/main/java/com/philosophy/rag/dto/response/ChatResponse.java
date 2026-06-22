package com.philosophy.rag.dto.response;

import java.util.UUID;

public record ChatResponse(String text, String audioBase64, UUID sessionId) {}
