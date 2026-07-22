package com.philosophy.rag.features.ai.service.impl;

import com.philosophy.rag.features.ai.dto.TtsRequest;
import com.philosophy.rag.features.ai.dto.ChatResponse;
import com.philosophy.rag.features.ai.dto.RagAskResponse;
import com.philosophy.rag.features.ai.service.RagService;
import com.philosophy.rag.features.auth.dto.UserResponse;
import com.philosophy.rag.features.auth.service.UserService;
import com.philosophy.rag.features.ai.service.VoiceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.core.io.buffer.DefaultDataBufferFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

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
@ConditionalOnProperty(name = "voice.provider", havingValue = "edge", matchIfMissing = true)
public class EdgeTtsVoiceServiceImpl implements VoiceService {

    @Override
    public Flux<DataBuffer> textToSpeak(TtsRequest request) {
        String text = request.text();
        String voice = (request.voice() != null) ? request.voice() : "vi-VN-HoaiMyNeural";

        log.info("Bắt đầu xử lý Edge-TTS (Streaming). Text length: {} ký tự, Voice: {}", text.length(), voice);

        String tempDir = System.getProperty("java.io.tmpdir");
        String baseFileName = tempDir + File.separator + UUID.randomUUID().toString();

        File textFile = new File(baseFileName + ".txt");
        File outputFile = new File(baseFileName + ".mp3");

        // Dùng Mono.fromCallable để gói các thao tác I/O (chặn luồng) lại
        return Mono.fromCallable(() -> {
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

                    log.info("Khởi tạo file mp3 thành công. Chuẩn bị stream...");
                    return outputFile;
                })
                // Chạy trên thread pool riêng biệt (boundedElastic) để không block WebFlux event-loop
                .subscribeOn(Schedulers.boundedElastic())

                // Chuyển Mono<File> thành Flux<DataBuffer> để stream
                .flatMapMany(file -> {
                    FileSystemResource resource = new FileSystemResource(file);
                    // Đọc file thành từng chunk 4KB (4096 bytes) đẩy xuống client
                    return DataBufferUtils.read(resource, new DefaultDataBufferFactory(), 4096);
                })

                // Xóa dọn dẹp file tạm BẤT KỂ kết quả stream thành công hay bị lỗi
                .doFinally(signalType -> {
                    if (textFile.exists()) {
                        boolean deleted = textFile.delete();
                        log.debug("Đã xóa file text tạm: {}", deleted);
                    }
                    if (outputFile.exists()) {
                        boolean deleted = outputFile.delete();
                        log.debug("Đã xóa file mp3 tạm sau khi stream xong: {}", deleted);
                    }
                });
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
}
