package com.philosophy.rag.utils.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CloudinaryUploadResponse {
    private String publicId;
    private String url;
    private String secureUrl;
    private String fileName;
    private String format;
    private String resourceType;
    private Long bytes;
    private String createdAt;
}
