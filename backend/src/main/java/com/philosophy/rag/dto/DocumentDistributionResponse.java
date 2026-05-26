package com.philosophy.rag.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentDistributionResponse {
    private String title;
    private String description;
    private String fileName;
    private String bucket;
    private String key;
    private String downloadUrl;
    private Long fileSize;
    private String contentType;
    private String lastModified;
}