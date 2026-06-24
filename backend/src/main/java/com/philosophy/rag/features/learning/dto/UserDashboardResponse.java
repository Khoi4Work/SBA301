package com.philosophy.rag.features.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDashboardResponse {
    private Integer learningProgress;
    private Integer totalXp;
    private Integer streak;
    private Double totalChatTime;
}
