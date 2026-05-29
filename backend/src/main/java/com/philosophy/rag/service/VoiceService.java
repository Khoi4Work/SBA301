package com.philosophy.rag.service;

import com.philosophy.rag.base.response.ApiResponse;
import com.philosophy.rag.dto.request.TtsRequest;
import com.philosophy.rag.dto.response.ChatResponse;

public interface VoiceService {
    ChatResponse chat(TtsRequest request);

    String textToSpeak(TtsRequest request);
}
