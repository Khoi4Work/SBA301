package com.philosophy.rag.features.ai.controller;

import com.philosophy.rag.base.response.ApiResult;
import com.philosophy.rag.features.ai.dto.ChatHistoryResponse;
import com.philosophy.rag.features.ai.service.ChatHistoryService;
import com.philosophy.rag.features.auth.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat-history")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "chat-history-controller")
@CrossOrigin(origins = "*")
public class ChatHistoryController {

    private final ChatHistoryService chatHistoryService;
    private final UserService userService;

    @Operation(summary = "Get chat history for the authenticated user")
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResult<List<ChatHistoryResponse>>> getMyHistory() {
        UUID userId = userService.getCurrentUserId();
        List<ChatHistoryResponse> history = chatHistoryService.getUserHistory(userId);
        return ResponseEntity.ok(ApiResult.success(history, "Successfully retrieved chat history"));
    }

    @Operation(summary = "Get details of a specific chat interaction")
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResult<ChatHistoryResponse>> getInteractionDetails(@PathVariable UUID id) {
        UUID userId = userService.getCurrentUserId();
        ChatHistoryResponse interaction = chatHistoryService.getUserHistory(userId).stream()
                .filter(h -> h.historyId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Interaction not found or access denied"));

        return ResponseEntity.ok(ApiResult.success(interaction, "Successfully retrieved interaction details"));
    }

    @Operation(summary = "Get chat history for a specific session")
    @GetMapping("/session/{sessionId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResult<List<ChatHistoryResponse>>> getSessionHistory(@PathVariable UUID sessionId) {
        List<ChatHistoryResponse> history = chatHistoryService.getHistoryBySession(sessionId);
        return ResponseEntity.ok(ApiResult.success(history, "Successfully retrieved session history"));
    }
}
