package com.philosophy.rag.features.ai.controller;

import com.philosophy.rag.base.response.ApiResponse;
import com.philosophy.rag.features.ui.dto.request.UpdateTitleRequest;
import com.philosophy.rag.features.ai.dto.ChatSessionResponse;
import com.philosophy.rag.features.ai.entity.ChatSession;
import com.philosophy.rag.features.ai.entity.ChatHistory;
import com.philosophy.rag.features.ai.service.ChatHistoryService;
import com.philosophy.rag.features.ai.service.ChatSessionService;
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

@Slf4j
@RestController
@RequestMapping("/api/chat-sessions")
@RequiredArgsConstructor
@Tag(name = "Chat Sessions", description = "APIs for managing chat conversation threads")
public class ChatSessionController {

    private final ChatSessionService chatSessionService;
    private final ChatHistoryService chatHistoryService;
    private final UserService userService;

    @Operation(summary = "List all chat sessions for the current user")
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<ChatSessionResponse>>> listSessions(
            @RequestParam(value = "philosopherId", required = false) UUID philosopherId) {
        UUID userId = userService.getCurrentUserId();
        log.info("Fetching chat sessions for user: {}, philosopherId: {}", userId, philosopherId);
        List<ChatSessionResponse> sessions = chatSessionService.listUserSessions(userId, philosopherId);
        return ResponseEntity.ok(ApiResponse.success(sessions));
    }

    @Operation(summary = "Start a new chat session")
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ChatSession>> createSession(
            @RequestParam(value = "philosopherId", required = false) UUID philosopherId) {
        UUID userId = userService.getCurrentUserId();
        log.info("Creating new chat session for user: {}, philosopherId: {}", userId, philosopherId);
        ChatSession session = chatSessionService.createSession(userId, philosopherId);
        return ResponseEntity.ok(ApiResponse.success(session));
    }

    @Operation(summary = "Delete a chat session")
    @DeleteMapping("/{sessionId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> deleteSession(@PathVariable UUID sessionId) {
        log.info("Deleting chat session: {}", sessionId);
        chatSessionService.deleteSession(sessionId);
        return ResponseEntity.ok(ApiResponse.success("Session deleted successfully"));
    }

    @Operation(summary = "Update chat session title")
    @PatchMapping("/{sessionId}/title")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> updateTitle(
            @PathVariable UUID sessionId,
            @RequestBody UpdateTitleRequest request) {
        String newTitle = request.title();
        log.info("Updating title for session: {} to {}", sessionId, newTitle);
        chatSessionService.updateSessionTitle(sessionId, newTitle);
        return ResponseEntity.ok(ApiResponse.success("Title updated successfully"));
    }

    @Operation(summary = "Get all messages in a session")
    @GetMapping("/{sessionId}/messages")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<ChatHistory>>> getMessages(@PathVariable UUID sessionId) {
        log.info("Fetching messages for session: {}", sessionId);
        // We fetch all history for the session.
        // Since ChatHistoryService currently has getRecentHistoryBySession,
        // we might need a method for all messages or just use a high limit.
        // For now, let's use getRecentHistoryBySession with a large limit or assume we can add a method.
        List<ChatHistory> messages = chatHistoryService.getRecentHistoryBySession(sessionId, 100);
        return ResponseEntity.ok(ApiResponse.success(messages));
    }
}
