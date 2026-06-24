package com.philosophy.rag.features.learning.controller;

import com.philosophy.rag.base.response.ApiResponse;
import com.philosophy.rag.features.learning.dto.DebateGameResponse;
import com.philosophy.rag.features.learning.dto.EscapeGameResponse;
import com.philosophy.rag.features.learning.dto.DebateGameRequest;
import com.philosophy.rag.features.learning.dto.EscapeGameRequest;
import com.philosophy.rag.features.learning.service.GameService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/games")
@RequiredArgsConstructor
@Validated
@CrossOrigin(origins = "*")
public class GameController {

    private final GameService gameService;

    @Operation(summary = "Analyze the results of the Consumerist Escape game")
    @PostMapping("/escape/analyze")
    public ResponseEntity<ApiResponse<EscapeGameResponse>> analyzeEscapeGame(
            @Valid @RequestBody EscapeGameRequest request) {
        log.info("Request to analyze Escape game. Prestige: {}, Wisdom: {}, Budget: {}", 
                request.getPrestige(), request.getWisdom(), request.getBudget());
        EscapeGameResponse response = gameService.analyzeEscapeGame(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Phân tích kết quả game thành công"));
    }

    @Operation(summary = "Analyze the results of the Dialectical Debate game")
    @PostMapping("/debate/analyze")
    public ResponseEntity<ApiResponse<DebateGameResponse>> analyzeDebateGame(
            @Valid @RequestBody DebateGameRequest request) {
        log.info("Request to analyze Debate game. Player HP: {}, Opponent HP: {}", 
                request.getPlayerHp(), request.getOpponentHp());
        DebateGameResponse response = gameService.analyzeDebateGame(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Phân tích kết quả tranh biện thành công"));
    }
}
