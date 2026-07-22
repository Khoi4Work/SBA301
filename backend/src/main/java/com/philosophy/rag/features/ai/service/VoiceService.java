package com.philosophy.rag.features.ai.service;

import com.philosophy.rag.features.ai.dto.TtsRequest;
import org.springframework.core.io.buffer.DataBuffer;
import reactor.core.publisher.Flux;

public interface VoiceService {
    Flux<DataBuffer> textToSpeak(TtsRequest request);
}
