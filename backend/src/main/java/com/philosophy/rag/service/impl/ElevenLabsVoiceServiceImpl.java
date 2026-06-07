package com.philosophy.rag.service.impl;

import com.philosophy.rag.dto.request.TtsRequest;
import com.philosophy.rag.dto.response.ChatResponse;
import com.philosophy.rag.service.RagService;
import com.philosophy.rag.service.VoiceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Base64;

@Slf4j
@Service
@ConditionalOnProperty(name = "ai.provider", havingValue = "google")
public class ElevenLabsVoiceServiceImpl implements VoiceService {
    private final RagService ragService;
    private final WebClient webClient;

    @Value("${elevenlabs.api-key}")
    private String apiKey;

    @Value("${elevenlabs.voice-id}")
    private String voiceId;

    public ElevenLabsVoiceServiceImpl(RagService ragService, WebClient.Builder webClientBuilder) {
        this.ragService = ragService;
        this.webClient = webClientBuilder.baseUrl("https://api.elevenlabs.io").build();
    }

    @Override
    public ChatResponse chat(TtsRequest request) {
        String chatResponseText = cleanTextForTTS(ragService.ask(request.text(), request.philosopherId()));
        String audioBase64 = textToSpeak(new TtsRequest(chatResponseText, request.voice(), request.philosopherId()));
        return new ChatResponse(chatResponseText, audioBase64);
    }

    @Override
    public String textToSpeak(TtsRequest request) {
        String text = request.text();
        String voice = (request.voice() != null) ? request.voice() : this.voiceId;

        log.info("Bắt đầu xử lý ElevenLabs TTS. Text length: {} ký tự, Voice: {}", text.length(), voice);

        try {
            // Gọi API ElevenLabs: POST /v1/text-to-speech/{voice_id}
            byte[] audioBytes = webClient.post()
                    .uri("/v1/text-to-speech/{voice_id}", voice)
                    .header("xi-api-key", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(new ElevenLabsRequest(text, getVoiceSettings()))
                    .retrieve()
                    .bodyToMono(byte[].class)
                    .block();

            if (audioBytes == null) {
                throw new RuntimeException("ElevenLabs API returned null audio content");
            }

            String base64Audio = Base64.getEncoder().encodeToString(audioBytes);
            log.info("Tạo giọng nói ElevenLabs và mã hóa Base64 thành công!");
            return base64Audio;

        } catch (Exception e) {
            log.error("Lỗi khi gọi ElevenLabs API: ", e);
            throw new RuntimeException("Lỗi ElevenLabs TTS: " + e.getMessage());
        }
    }

    private VoiceSettings getVoiceSettings() {
        return new VoiceSettings(0.5f, 1.0f, "v2");
    }

    public String cleanTextForTTS(String rawText) {
        if (rawText == null || rawText.isEmpty()) {
            return "";
        }
        return rawText
                .replaceAll("\\[Source\\s+\\d+\\]", "")
                .replaceAll("\\*", "")
                .replaceAll("(?m)^\\s*-\\s+", "")
                .replaceAll("\\n+", ". ")
                .replaceAll("\\s{2,}", " ")
                .replaceAll("\\.{2,}", ".")
                .trim();
    }

    // Inner classes for API requests
    private record ElevenLabsRequest(String text, VoiceSettings voice_settings) {}
    private record VoiceSettings(float stability, float similarity_boost, String style) {}
}
