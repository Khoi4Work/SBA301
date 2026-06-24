package com.philosophy.rag.features.ai.dto;

import lombok.Builder;
import java.util.UUID;

@Builder
public record PhilosopherResponse(
    UUID id,
    String name,
    String category,
    String quote,
    String core,
    String imageUrl
) {}
