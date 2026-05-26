package com.philosophy.rag.controller;

import com.philosophy.rag.base.response.ApiResponse;
import com.philosophy.rag.dto.request.TtsRequest;
import lombok.extern.slf4j.Slf4j;
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
public class VoiceController {

    @PostMapping("/speak")
    public ApiResponse<String> textToSpeak(@RequestBody TtsRequest request) {
        String text = request.text();
        String voice = (request.voice() != null) ? request.voice() : "vi-VN-HoaiMyNeural";

        log.info("Bắt đầu xử lý TTS. Text length: {} ký tự, Voice: {}", text.length(), voice);

        // Khởi tạo tên file tạm chung
        String tempDir = System.getProperty("java.io.tmpdir");
        String baseFileName = tempDir + File.separator + UUID.randomUUID().toString();

        // Tạo 2 file: 1 file chứa text đầu vào, 1 file chứa mp3 đầu ra
        File textFile = new File(baseFileName + ".txt");
        File outputFile = new File(baseFileName + ".mp3");

        try {
            // 1. Ghi text ra file txt (sử dụng UTF-8 để không bị lỗi font tiếng Việt)
            Files.writeString(textFile.toPath(), text, StandardCharsets.UTF_8);

            // 2. Gọi lệnh CMD, dùng cờ -f (viết tắt của --file) để đọc từ file thay vì --text
            ProcessBuilder processBuilder = new ProcessBuilder(
                    "cmd.exe", "/c", "edge-tts",
                    "--voice", voice,
                    "-f", textFile.getAbsolutePath(),
                    "--write-media", outputFile.getAbsolutePath()
            );

            log.info("Đang thực thi edge-tts qua file txt tạm...");
            processBuilder.redirectErrorStream(true);
            Process process = processBuilder.start();

            // Đọc luồng output phòng khi có lỗi
            String processOutput = new BufferedReader(new InputStreamReader(process.getInputStream()))
                    .lines().collect(Collectors.joining("\n"));

            int exitCode = process.waitFor();

            if (exitCode != 0) {
                log.error("Lệnh CMD thất bại. Exit code: {}", exitCode);
                log.error(">>> HỆ ĐIỀU HÀNH BÁO LỖI: {}", processOutput);
                throw new RuntimeException("Lệnh edge-tts chạy thất bại. Chi tiết: " + processOutput);
            }

            // 3. Đọc file MP3 và encode sang Base64
            byte[] fileContent = Files.readAllBytes(outputFile.toPath());
            String base64Audio = Base64.getEncoder().encodeToString(fileContent);

            log.info("Tạo giọng nói và mã hóa Base64 thành công!");
            return ApiResponse.success(base64Audio, "Tạo giọng nói thành công");

        } catch (Exception e) {
            log.error("Lỗi hệ thống trong VoiceController: ", e);
            throw new RuntimeException("Lỗi hệ thống: " + e.getMessage());
        } finally {
            // 4. Dọn dẹp cả 2 file tạm (rất quan trọng)
            if (textFile.exists()) {
                textFile.delete();
            }
            if (outputFile.exists()) {
                outputFile.delete();
            }
        }
    }
}