package com.philosophy.rag.controller;

import com.philosophy.rag.service.RagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/rag")
@RequiredArgsConstructor
public class RagController {
    private final RagService ragService;

    @PostMapping(value = "/upload", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> upload(@RequestPart("file") MultipartFile file) {
        try {
            return ResponseEntity.ok(ragService.uploadDocument(file));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Upload failed: " + e.getMessage());
        }
    }

    @GetMapping("/ask")
    public ResponseEntity<String> ask(@RequestParam("query") String query) {
        return ResponseEntity.ok(ragService.ask(query));
    }

    @GetMapping("/documents")
    public ResponseEntity<List<com.philosophy.rag.dto.DocumentContent>> listDocuments() {
        return ResponseEntity.ok(ragService.listDocuments());
    }
}
