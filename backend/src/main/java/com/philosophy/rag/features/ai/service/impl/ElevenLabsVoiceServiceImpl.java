package com.philosophy.rag.features.ai.service.impl;

import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.base.exception.ErrorCode;
import com.philosophy.rag.features.ai.dto.TtsRequest;
import com.philosophy.rag.features.ai.service.VoiceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

@Slf4j
@Service("elevenLabsVoiceService")
public class ElevenLabsVoiceServiceImpl implements VoiceService {
    private final WebClient webClient;

    @Value("${elevenlabs.api-key:}")
    private String apiKey;

    @Value("${elevenlabs.voice-id}")
    private String voiceId;

    public ElevenLabsVoiceServiceImpl(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("https://api.elevenlabs.io").build();
    }

    @Override
    public Flux<DataBuffer> textToSpeak(TtsRequest request) {
        String text = request.text();
        String voice = this.voiceId;
        if (request.voice() != null && !request.voice().trim().isEmpty() && !request.voice().startsWith("vi-VN-")) {
            voice = request.voice();
        }

        log.info("Bắt đầu xử lý ElevenLabs TTS. Text length: {} ký tự, Voice: {}", text.length(), voice);

        return webClient.post()
                .uri("/v1/text-to-speech/{voice_id}/stream", voice)
                .header("xi-api-key", apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.valueOf("audio/mpeg"))
                .bodyValue(new ElevenLabsRequest("eleven_turbo_v2_5", text, getVoiceSettings()))
                .retrieve()
                .bodyToFlux(DataBuffer.class)
                .doOnComplete(() -> log.info("Stream ElevenLabs thành công!"))
                .onErrorResume(e -> {
                    // Fallback
                    log.warn("Lỗi ElevenLabs API: {}. Fallback sang Edge-TTS...", e.getMessage());
                    throw new ApiException(ErrorCode.RAG_SERVICE_ERROR, "Lỗi ElevenLabs API: " + e.getMessage());
                    // return fallbackToEdgeTts(new TtsRequest(
                    // request.text(), "vi-VN-HoaiMyNeural", request.philosopherId(),
                    // request.sessionId()
                    // ));
                });
    }

    // private Flux<DataBuffer> fallbackToEdgeTts(TtsRequest request) {
    // log.info("Bắt đầu xử lý Edge-TTS Fallback. Text length: {} ký tự, Voice: {}",
    // request.text().length(), request.voice());
    // return edgeTtsVoiceServiceImpl.textToSpeak(request);
    // }

    private VoiceSettings getVoiceSettings() {
        return new VoiceSettings(0.5f, 0.75f, 0.0f);
    }

    // Inner classes for API requests
    private record ElevenLabsRequest(String model_id, String text, VoiceSettings voice_settings) {
    }

    private record VoiceSettings(float stability, float similarity_boost, float style_exaggeration) {
    }
}
