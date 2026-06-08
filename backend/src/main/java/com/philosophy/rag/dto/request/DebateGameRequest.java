package com.philosophy.rag.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class DebateGameRequest {
    @NotNull(message = "Player HP cannot be null")
    private Integer playerHp;

    @NotNull(message = "Opponent HP cannot be null")
    private Integer opponentHp;

    private List<String> arguments;
}
