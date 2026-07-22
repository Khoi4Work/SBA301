package com.philosophy.rag.features.ai.controller;

import com.philosophy.rag.features.ai.dto.TtsRequest;
import com.philosophy.rag.features.ai.service.VoiceService;
import lombok.AllArgsConstructor;
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
@AllArgsConstructor
@Validated
public class VoiceController {

    private final VoiceService voiceService;

    @GetMapping(value = "/speak", produces = "audio/mpeg")
    public ResponseEntity<StreamingResponseBody> textToSpeak(
            @RequestParam String text,
            @RequestParam(required = false) String voice,
            @RequestParam(required = false) UUID philosopherId,
            @RequestParam(required = false) UUID sessionId
    ) {
        TtsRequest request = new TtsRequest(text, voice, philosopherId, sessionId);

        // 1. Lấy luồng Flux từ Service
        Flux<DataBuffer> audioFlux = voiceService.textToSpeak(request);

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

        // 3. Trả về Response với Header khai báo "Tôi đang gửi dữ liệu dạng chunk (từng mảnh)"
        return ResponseEntity.ok()
                .header(HttpHeaders.TRANSFER_ENCODING, "chunked")
                .body(responseBody);
    }


}