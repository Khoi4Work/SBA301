package com.philosophy.rag.controller;

import com.philosophy.rag.base.response.ApiResponse;
import com.philosophy.rag.dto.request.TtsRequest;
import com.philosophy.rag.dto.response.ChatResponse;
import com.philosophy.rag.service.ChatHistoryService;
import com.philosophy.rag.service.UserService;
import com.philosophy.rag.service.VoiceService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/voice")
@CrossOrigin(origins = "*")
@AllArgsConstructor
@Validated
public class VoiceController {

    private final VoiceService voiceService;
    private final ChatHistoryService chatHistoryService;
    private final UserService userService;
    private final com.philosophy.rag.service.ChatSessionService chatSessionService;

    @PostMapping("/speak")
    public ApiResponse<String> textToSpeak(@RequestBody TtsRequest request) {
        return ApiResponse.success(
                voiceService.textToSpeak(request),
                "Tạo giọng nói thành công");
    }

    @PostMapping("/chat")
    public ApiResponse<ChatResponse> chat(@RequestBody TtsRequest request) {
        UUID userId = userService.getCurrentUserId();
        UUID sessionId = request.sessionId();

        if (sessionId == null) {
            sessionId = chatSessionService.createSession(userId, request.philosopherId()).getSessionId();
            log.info("Created new chat session for voice chat: {}", sessionId);
        }

        java.time.LocalDateTime start = java.time.LocalDateTime.now();

        // We need to pass the sessionId to voiceService.chat if we want the AI to have context
        // But VoiceService.chat takes TtsRequest. TtsRequest is a record (immutable).
        // We must create a new TtsRequest with the sessionId.
        TtsRequest sessionRequest = new TtsRequest(
                request.text(),
                request.voice(),
                request.philosopherId(),
                sessionId
        );

        ChatResponse response = voiceService.chat(sessionRequest);
        java.time.LocalDateTime end = java.time.LocalDateTime.now();

        chatHistoryService.saveInteraction(userId, request.philosopherId(), request.text(), response.text(), start, end, sessionId);

        return ApiResponse.success(response, "Chat response successfully");
    }

}