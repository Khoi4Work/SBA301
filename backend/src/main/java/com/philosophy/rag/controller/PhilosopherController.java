package com.philosophy.rag.controller;

import com.philosophy.rag.base.response.ApiResponse;
import com.philosophy.rag.dto.request.PhilosopherRequest;
import com.philosophy.rag.dto.response.PhilosopherResponse;
import com.philosophy.rag.service.PhilosopherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/philosophers")
@RequiredArgsConstructor
@Tag(name = "Philosopher", description = "Quản lý thông tin triết gia")
public class PhilosopherController {

    private final PhilosopherService philosopherService;

    @Operation(summary = "Lấy danh sách toàn bộ triết gia")
    @GetMapping("/getAll")
    public ResponseEntity<ApiResponse<List<PhilosopherResponse>>> getAllPhilosophers() {
        List<PhilosopherResponse> philosophers = philosopherService.findAllPhilosophers();
        return ResponseEntity.ok(ApiResponse.success(philosophers, "Lấy danh sách triết gia thành công"));
    }

    @Operation(summary = "Thêm triết gia mới")
    @PostMapping(value = "/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<PhilosopherResponse>> createPhilosopher(
            @ModelAttribute @Valid PhilosopherRequest request,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        PhilosopherResponse response = philosopherService.createPhilosopher(request, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response, "Thêm triết gia thành công"));
    }
}
