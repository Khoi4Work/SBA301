package com.philosophy.rag.features.ui.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class SloganResponse {
    private UUID sloganId;
    private String content;
    private String author;
    private boolean active;
}
