package com.philosophy.rag.features.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionContentResponse {
    private String key;
    private String title;
    private String fileName;
    private String content;       // Toàn bộ text đã extract
    private String contentType;
    private long fileSize;
}
