package com.philosophy.rag.features.learning.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DebateGameResponse {
    private int winMarginPercentage;
    private String resultTitle;
    private String analysis;
    private String suggestion;
    private int xpGained;
    private int newTotalXp;
}
