package com.philosophy.rag.features.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DocumentChunk {
    private String id;
    private String source;
    private String content;
    private Integer chunkIndex;
    private String indexedAt;
}
