package com.philosophy.rag.dto.response;

import lombok.*;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatSessionResponse {
    private UUID sessionId;
    private String title;
    private String philosopherName;
}
