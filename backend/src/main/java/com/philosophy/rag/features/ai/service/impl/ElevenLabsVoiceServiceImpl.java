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

    public ElevenLabsVoiceServiceImpl(RagService ragService, WebClient.Builder webClientBuilder,
            UserService userService) {
        this.ragService = ragService;
        this.webClient = webClientBuilder.baseUrl("https://api.elevenlabs.io").build();
        this.userService = userService;
    }

    @Override
    public ChatResponse chat(TtsRequest request) {
        UserResponse userResponse = userService.getCurrentUser();
        String chatResponseText = cleanTextForTTS(
                ragService.ask(userResponse.userId(), request.text(), request.philosopherId(), request.sessionId()));
        String audioBase64 = textToSpeak(
                new TtsRequest(chatResponseText, voiceId, request.philosopherId(), request.sessionId()));
        return new ChatResponse(chatResponseText, audioBase64, request.sessionId());
    }

    @Override
    public String textToSpeak(TtsRequest request) {
        String text = request.text();
        String voice = this.voiceId;
        if (request.voice() != null && !request.voice().trim().isEmpty() && !request.voice().startsWith("vi-VN-")) {
            voice = request.voice();
        }

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
            String errorBody = e.getResponseBodyAsString();
            log.warn("Lỗi từ ElevenLabs API (HTTP {}): {}. Thực hiện fallback sang Edge-TTS...", e.getStatusCode(), errorBody);
            return fallbackToEdgeTts(text, "vi-VN-HoaiMyNeural");
        } catch (Exception e) {
            log.warn("Lỗi kết nối ElevenLabs API: {}. Thực hiện fallback sang Edge-TTS...", e.getMessage());
            return fallbackToEdgeTts(text, "vi-VN-HoaiMyNeural");
        }
    }

    private String fallbackToEdgeTts(String text, String voice) {
        log.info("Bắt đầu xử lý Edge-TTS Fallback. Text length: {} ký tự, Voice: {}", text.length(), voice);

        String tempDir = System.getProperty("java.io.tmpdir");
        String baseFileName = tempDir + java.io.File.separator + java.util.UUID.randomUUID().toString();

        java.io.File textFile = new java.io.File(baseFileName + ".txt");
        java.io.File outputFile = new java.io.File(baseFileName + ".mp3");

        try {
            java.nio.file.Files.writeString(textFile.toPath(), text, java.nio.charset.StandardCharsets.UTF_8);
            ProcessBuilder processBuilder = new ProcessBuilder(
                    "cmd.exe", "/c", "py", "-m", "edge_tts",
                    "--voice", voice,
                    "-f", textFile.getAbsolutePath(),
                    "--write-media", outputFile.getAbsolutePath());

            processBuilder.redirectErrorStream(true);
            Process process = processBuilder.start();

            String processOutput = new java.io.BufferedReader(new java.io.InputStreamReader(process.getInputStream()))
                    .lines().collect(java.util.stream.Collectors.joining("\n"));

            int exitCode = process.waitFor();

            if (exitCode != 0) {
                log.error("Lệnh CMD thất bại khi chạy Edge-TTS Fallback. Exit code: {}", exitCode);
                log.error(">>> HỆ ĐIỀU HÀNH BÁO LỖI: {}", processOutput);
                throw new RuntimeException("Lệnh edge-tts chạy thất bại. Chi tiết: " + processOutput);
            }

            byte[] fileContent = java.nio.file.Files.readAllBytes(outputFile.toPath());
            String base64Audio = Base64.getEncoder().encodeToString(fileContent);

            log.info("Tạo giọng nói Edge-TTS Fallback và mã hóa Base64 thành công!");
            return base64Audio;

        } catch (Exception ex) {
            log.error("Lỗi hệ thống trong Edge-TTS Fallback: ", ex);
            throw new RuntimeException("ElevenLabs failed and Edge-TTS fallback also failed: " + ex.getMessage());
        } finally {
            if (textFile.exists()) {
                textFile.delete();
            }
            if (outputFile.exists()) {
                outputFile.delete();
            }
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
    private record ElevenLabsRequest(String model_id, String text, VoiceSettings voice_settings) {
    }

    private record VoiceSettings(float stability, float similarity_boost, float style_exaggeration) {
    }
}
