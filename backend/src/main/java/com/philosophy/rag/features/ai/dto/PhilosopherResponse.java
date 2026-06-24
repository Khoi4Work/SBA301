package com.philosophy.rag.features.ai.dto;

import lombok.*;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhilosopherResponse {
    private UUID id;
    private String name;
    private String category;
    private String quote;
    private String core;
    private String imageUrl;
}
