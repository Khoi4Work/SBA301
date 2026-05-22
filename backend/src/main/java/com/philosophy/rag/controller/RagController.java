package com.philosophy.rag.controller;

import com.philosophy.rag.base.response.ApiResponse;
import com.philosophy.rag.dto.DocumentContent;
import com.philosophy.rag.service.impl.RagServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/rag")
@RequiredArgsConstructor
public class RagController {
    private final RagServiceImpl ragServiceImpl;

    @PostMapping(value = "/upload", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<String>> upload(@RequestPart("file") MultipartFile file) throws Exception {
        String result = ragServiceImpl.uploadDocument(file);
        return ResponseEntity.ok(ApiResponse.success(result, "Document uploaded and indexed successfully"));
    }

    @GetMapping("/ask")
    public ResponseEntity<ApiResponse<String>> ask(@RequestParam("query") String query) {
        String result = ragServiceImpl.ask(query);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/documents")
    public ResponseEntity<ApiResponse<List<DocumentContent>>> listDocuments() {
        List<com.philosophy.rag.dto.DocumentContent> result = ragServiceImpl.listDocuments();
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @DeleteMapping("/reset")
    public ResponseEntity<ApiResponse<String>> resetDatabase() {
        ragServiceImpl.resetVectorStore();
        return ResponseEntity.ok(ApiResponse.success("Vector store has been reset successfully!"));
    }

}
