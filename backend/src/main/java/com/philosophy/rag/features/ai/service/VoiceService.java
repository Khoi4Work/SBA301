package com.philosophy.rag.features.ai.service;

import com.philosophy.rag.features.ai.dto.TtsRequest;
import com.philosophy.rag.features.ai.dto.ChatResponse;

public interface VoiceService {
    ChatResponse chat(TtsRequest request);

    String textToSpeak(TtsRequest request);
}
