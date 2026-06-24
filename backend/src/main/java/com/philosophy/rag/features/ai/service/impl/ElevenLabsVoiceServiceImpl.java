package com.philosophy.rag.features.ai.service.impl;

import com.philosophy.rag.features.ai.dto.TtsRequest;
import com.philosophy.rag.features.ai.dto.ChatResponse;
import com.philosophy.rag.features.ai.dto.RagAskResponse;
import com.philosophy.rag.features.ai.service.RagService;
import com.philosophy.rag.features.auth.dto.UserResponse;
import com.philosophy.rag.features.auth.service.UserService;
import com.philosophy.rag.features.ai.service.VoiceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.Base64;

@Slf4j
@Service
@ConditionalOnProperty(name = "voice.provider", havingValue = "elevenlabs")
public class ElevenLabsVoiceServiceImpl implements VoiceService {
    private final RagService ragService;
    private final WebClient webClient;
    private final UserService userService;

    @Value("${elevenlabs.api-key}")
    private String apiKey;

    @Value("${elevenlabs.voice-id}")
    private String voiceId;

    public ElevenLabsVoiceServiceImpl(RagService ragService, WebClient.Builder webClientBuilder, UserService userService) {
        this.ragService = ragService;
        this.webClient = webClientBuilder.baseUrl("https://api.elevenlabs.io").build();
        this.userService = userService;
    }

    @Override
    public ChatResponse chat(TtsRequest request) {
        UserResponse userResponse = userService.getCurrentUser();
        String chatResponseText = cleanTextForTTS(ragService.ask(userResponse.userId(), request.text(), request.philosopherId(), request.sessionId()));
        String audioBase64 = textToSpeak(new TtsRequest(chatResponseText, voiceId, request.philosopherId(), request.sessionId()));
        return new ChatResponse(chatResponseText, audioBase64, request.sessionId());
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
                    .bodyValue(new ElevenLabsRequest("eleven_turbo_v2_5", text, getVoiceSettings()))
                    .retrieve()
                    .bodyToMono(byte[].class)
                    .block();

            if (audioBytes == null) {
                throw new RuntimeException("ElevenLabs API returned null audio content");
            }

            String base64Audio = Base64.getEncoder().encodeToString(audioBytes);
            log.info("Tạo giọng nói ElevenLabs và mã hóa Base64 thành công!");
            return base64Audio;

        } catch (WebClientResponseException e) {
            // ĐÂY LÀ ĐOẠN QUAN TRỌNG NHẤT ĐỂ TÌM LỖI 400
            String errorBody = e.getResponseBodyAsString();
            log.error("Lỗi từ ElevenLabs API (HTTP {}): {}", e.getStatusCode(), errorBody);

            throw new RuntimeException("Lỗi cấu hình ElevenLabs: " + errorBody);
        } catch (Exception e) {
            log.error("Lỗi kết nối ElevenLabs API: ", e);
            throw new RuntimeException("Lỗi hệ thống khi gọi TTS: " + e.getMessage());
        }
    }

    private VoiceSettings getVoiceSettings() {
        return new VoiceSettings(0.5f, 0.75f, 0.0f);
    }

    public String cleanTextForTTS(RagAskResponse rawText) {
        if (rawText.answer() == null || rawText.answer().isEmpty()) {
            return "";
        }
        return rawText.answer()
                .replaceAll("\\[Source\\s+\\d+\\]", "")
                .replaceAll("\\*", "")
                .replaceAll("(?m)^\\s*-\\s+", "")
                .replaceAll("\\n+", ". ")
                .replaceAll("\\s{2,}", " ")
                .replaceAll("\\.{2,}", ".")
                .trim();
    }

    // Inner classes for API requests
    private record ElevenLabsRequest(String model_id, String text, VoiceSettings voice_settings) {}
    private record VoiceSettings(float stability, float similarity_boost, float style_exaggeration) {}
}
