package com.philosophy.rag.features.learning.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class EscapeGameRequest {
    @NotNull(message = "Prestige points cannot be null")
    private Integer prestige;

    @NotNull(message = "Wisdom points cannot be null")
    private Integer wisdom;

    @NotNull(message = "Budget cannot be null")
    private Integer budget;

    @NotNull(message = "Happiness cannot be null")
    private Integer happiness;

    @NotNull(message = "Health cannot be null")
    private Integer health;

    @NotNull(message = "Social connection cannot be null")
    private Integer social;

    private List<String> choices;
}
