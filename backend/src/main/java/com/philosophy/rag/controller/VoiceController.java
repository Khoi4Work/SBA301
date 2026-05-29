package com.philosophy.rag.controller;

import com.philosophy.rag.base.response.ApiResponse;
import com.philosophy.rag.dto.request.TtsRequest;
import com.philosophy.rag.dto.response.ChatResponse;
import com.philosophy.rag.service.VoiceService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.Base64;
import java.util.UUID;
import java.util.stream.Collectors;

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
                "Tạo giọng nói thành công"
        );
    }

    @PostMapping("/chat")
    public ApiResponse<ChatResponse> chat(@RequestBody TtsRequest request) {
        return ApiResponse.success(voiceService.chat(request),"Chat response successfully");
    }

}