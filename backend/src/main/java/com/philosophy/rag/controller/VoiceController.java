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

    @PostMapping("/speak")
    public ApiResponse<String> textToSpeak(@RequestBody TtsRequest request) {
        return ApiResponse.success(
                voiceService.textToSpeak(request),
                "Tạo giọng nói thành công");
    }

    @PostMapping("/chat")
    public ApiResponse<ChatResponse> chat(@RequestBody TtsRequest request) {
        java.time.LocalDateTime start = java.time.LocalDateTime.now();
        ChatResponse response = voiceService.chat(request);
        java.time.LocalDateTime end = java.time.LocalDateTime.now();

        chatHistoryService.saveInteraction(userService.getCurrentUserId(), request.philosopherId(), request.text(), response.text(), start, end);

        return ApiResponse.success(response, "Chat response successfully");
    }

}