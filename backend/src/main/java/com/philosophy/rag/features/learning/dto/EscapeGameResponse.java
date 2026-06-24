package com.philosophy.rag.features.learning.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EscapeGameResponse {
    private int phongBatPercentage;
    private String title;
    private String analysis;
    private String rehabilitationSuggestion;
    private int xpGained;
    private int newTotalXp;
}
