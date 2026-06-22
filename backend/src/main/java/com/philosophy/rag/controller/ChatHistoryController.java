package com.philosophy.rag.controller;

import com.philosophy.rag.base.response.ApiResponse;
import com.philosophy.rag.dto.response.ChatHistoryResponse;
import com.philosophy.rag.service.ChatHistoryService;
import com.philosophy.rag.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat-history")
@RequiredArgsConstructor
@Tag(name = "chat-history-controller")
@CrossOrigin(origins = "*")
public class ChatHistoryController {

    private final ChatHistoryService chatHistoryService;
    private final UserService userService;

    @Operation(summary = "Get chat history for the authenticated user")
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<ChatHistoryResponse>>> getMyHistory() {
        UUID userId = userService.getCurrentUserId();
        List<ChatHistoryResponse> history = chatHistoryService.getUserHistory(userId);
        return ResponseEntity.ok(ApiResponse.success(history, "Successfully retrieved chat history"));
    }

    @Operation(summary = "Get details of a specific chat interaction")
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ChatHistoryResponse>> getInteractionDetails(@PathVariable UUID id) {
        UUID userId = userService.getCurrentUserId();
        ChatHistoryResponse interaction = chatHistoryService.getUserHistory(userId).stream()
                .filter(h -> h.historyId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Interaction not found or access denied"));

        return ResponseEntity.ok(ApiResponse.success(interaction, "Successfully retrieved interaction details"));
    }

    @Operation(summary = "Get chat history for a specific session")
    @GetMapping("/session/{sessionId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<ChatHistoryResponse>>> getSessionHistory(@PathVariable UUID sessionId) {
        List<ChatHistoryResponse> history = chatHistoryService.getHistoryBySession(sessionId);
        return ResponseEntity.ok(ApiResponse.success(history, "Successfully retrieved session history"));
    }
}
