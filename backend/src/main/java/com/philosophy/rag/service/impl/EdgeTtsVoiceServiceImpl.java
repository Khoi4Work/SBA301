package com.philosophy.rag.service.impl;

import com.philosophy.rag.dto.request.TtsRequest;
import com.philosophy.rag.dto.response.ChatResponse;
import com.philosophy.rag.service.RagService;
import com.philosophy.rag.service.VoiceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.Base64;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@ConditionalOnProperty(name = "ai.provider", havingValue = "ollama")
public class EdgeTtsVoiceServiceImpl implements VoiceService {
    private final RagService ragService;

    public EdgeTtsVoiceServiceImpl(RagService ragService) {
        this.ragService = ragService;
    }

    @Override
    public ChatResponse chat(TtsRequest request) {
        String chatResponseText = cleanTextForTTS(ragService.ask(request.text()));
        TtsRequest newResponse = new TtsRequest(chatResponseText, request.voice());
        String audioBase64 = textToSpeak(newResponse);
        return new ChatResponse(chatResponseText, audioBase64);
    }

    @Override
    public String textToSpeak(TtsRequest request) {
        String text = request.text();
        String voice = (request.voice() != null) ? request.voice() : "vi-VN-HoaiMyNeural";

        log.info("Bắt đầu xử lý Edge-TTS. Text length: {} ký tự, Voice: {}", text.length(), voice);

        String tempDir = System.getProperty("java.io.tmpdir");
        String baseFileName = tempDir + File.separator + UUID.randomUUID().toString();

        File textFile = new File(baseFileName + ".txt");
        File outputFile = new File(baseFileName + ".mp3");

        try {
            Files.writeString(textFile.toPath(), text, StandardCharsets.UTF_8);
            ProcessBuilder processBuilder = new ProcessBuilder(
                    "cmd.exe", "/c", "py", "-m", "edge_tts",
                    "--voice", voice,
                    "-f", textFile.getAbsolutePath(),
                    "--write-media", outputFile.getAbsolutePath());

            log.info("Đang thực thi edge-tts qua file txt tạm...");
            processBuilder.redirectErrorStream(true);
            Process process = processBuilder.start();

            String processOutput = new BufferedReader(new InputStreamReader(process.getInputStream()))
                    .lines().collect(Collectors.joining("\n"));

            int exitCode = process.waitFor();

            if (exitCode != 0) {
                log.error("Lệnh CMD thất bại. Exit code: {}", exitCode);
                log.error(">>> HỆ ĐIỀU HÀNH BÁO LỖI: {}", processOutput);
                throw new RuntimeException("Lệnh edge-tts chạy thất bại. Chi tiết: " + processOutput);
            }

            byte[] fileContent = Files.readAllBytes(outputFile.toPath());
            String base64Audio = Base64.getEncoder().encodeToString(fileContent);

            log.info("Tạo giọng nói Edge-TTS và mã hóa Base64 thành công!");
            return base64Audio;

        } catch (Exception e) {
            log.error("Lỗi hệ thống trong EdgeTtsVoiceServiceImpl: ", e);
            throw new RuntimeException("Lỗi hệ thống: " + e.getMessage());
        } finally {
            if (textFile.exists()) {
                textFile.delete();
            }
            if (outputFile.exists()) {
                outputFile.delete();
            }
        }
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
}
