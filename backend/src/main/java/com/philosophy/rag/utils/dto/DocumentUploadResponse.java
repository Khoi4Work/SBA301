package com.philosophy.rag.utils.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentUploadResponse {
    private String title;
    private String fileName;
    private String bucket;
    private String key;
    private String url;
    private Long fileSize;
    private String contentType;
    private String imageUrl;
    private String category;
}