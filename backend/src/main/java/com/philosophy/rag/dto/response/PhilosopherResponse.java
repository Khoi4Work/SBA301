package com.philosophy.rag.dto.response;

import lombok.*;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhilosopherResponse {
    private Long id;
    private String name;
    private String category;
    private String quote;
    private String core;
    private String imageUrl;
}
