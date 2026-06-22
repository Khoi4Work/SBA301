package com.philosophy.rag.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class RagAskResponse {
    private String answer;
    private UUID sessionId;
}
