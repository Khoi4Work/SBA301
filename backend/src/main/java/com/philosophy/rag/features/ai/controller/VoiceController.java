package com.philosophy.rag.features.ai.controller;

import com.philosophy.rag.base.response.ApiResult;
import com.philosophy.rag.features.ai.dto.TtsRequest;
import com.philosophy.rag.features.ai.service.VoiceService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;
import reactor.core.publisher.Flux;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/voice")
@CrossOrigin(origins = "*")
@Validated
public class VoiceController {

    private final VoiceService elevenLabsVoiceService;
    private final VoiceService edgeTtsVoiceService;

    @org.springframework.beans.factory.annotation.Value("${voice.provider.chat:elevenlabs}")
    private String chatProvider;

    @org.springframework.beans.factory.annotation.Value("${voice.provider.lesson:edge}")
    private String lessonProvider;

    public VoiceController(
            @org.springframework.beans.factory.annotation.Qualifier("elevenLabsVoiceService") VoiceService elevenLabsVoiceService,
            @org.springframework.beans.factory.annotation.Qualifier("edgeTtsVoiceService") VoiceService edgeTtsVoiceService) {
        this.elevenLabsVoiceService = elevenLabsVoiceService;
        this.edgeTtsVoiceService = edgeTtsVoiceService;
    }

    @GetMapping(value = "/speak", produces = "audio/mpeg")
    public ResponseEntity<StreamingResponseBody> textToSpeak(
            @RequestParam String text,
            @RequestParam(required = false) String voice,
            @RequestParam(required = false) UUID philosopherId,
            @RequestParam(required = false) UUID sessionId) {
        TtsRequest request = new TtsRequest(text, voice, philosopherId, sessionId);

        // Routing based on configuration for chat (GET /speak)
        VoiceService activeService = "edge".equalsIgnoreCase(chatProvider) ? edgeTtsVoiceService
                : elevenLabsVoiceService;
        Flux<DataBuffer> audioFlux = activeService.textToSpeak(request);

        // 2. Chuyển đổi Flux thành luồng tương thích với Spring MVC
        StreamingResponseBody responseBody = outputStream -> {
            try {
                // Ghi trực tiếp các gói DataBuffer vào đường truyền HTTP của client
                DataBufferUtils.write(audioFlux, outputStream)
                        .blockLast(); // Ép luồng phải chờ đến khi ghi xong toàn bộ
            } catch (Exception e) {
                log.error("Lỗi khi ghi luồng âm thanh ra client: ", e);
            }
        };

        // 3. Trả về Response với Header khai báo "Tôi đang gửi dữ liệu dạng chunk (từng
        // mảnh)"
        return ResponseEntity.ok()
                .header(HttpHeaders.TRANSFER_ENCODING, "chunked")
                .body(responseBody);
    }

    @PostMapping(value = "/speak")
    public ResponseEntity<ApiResult<String>> speak(
            @Valid @RequestBody TtsRequest request) {
        log.info("POST request to convert text to speech (Base64) with voice: {}", request.voice());

        // Routing based on configuration for lesson reading (POST /speak)
        VoiceService activeService = "elevenlabs".equalsIgnoreCase(lessonProvider) ? elevenLabsVoiceService
                : edgeTtsVoiceService;
        Flux<DataBuffer> audioFlux = activeService.textToSpeak(request);

        byte[] audioBytes = DataBufferUtils.join(audioFlux)
                .map(dataBuffer -> {
                    byte[] bytes = new byte[dataBuffer.readableByteCount()];
                    dataBuffer.read(bytes);
                    DataBufferUtils.release(dataBuffer);
                    return bytes;
                })
                .defaultIfEmpty(new byte[0])
                .block();

        String base64Audio = java.util.Base64.getEncoder().encodeToString(audioBytes);
        return ResponseEntity.ok(ApiResult.success(base64Audio));
    }

}