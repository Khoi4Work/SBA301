package com.philosophy.rag.controller;

import com.philosophy.rag.base.response.ApiResponse;
import com.philosophy.rag.dto.request.TtsRequest;
import com.philosophy.rag.dto.response.ChatResponse;
import com.philosophy.rag.service.VoiceService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/voice")
@CrossOrigin(origins = "*")
@AllArgsConstructor
@Validated
public class VoiceController {

    private final VoiceService voiceService;

    @PostMapping("/speak")
    public ApiResponse<String> textToSpeak(@RequestBody TtsRequest request) {
        return ApiResponse.success(
                voiceService.textToSpeak(request),
                "Tạo giọng nói thành công");
    }

    @PostMapping("/chat")
    public ApiResponse<ChatResponse> chat(@RequestBody TtsRequest request) {
        return ApiResponse.success(voiceService.chat(request), "Chat response successfully");
    }

}