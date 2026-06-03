package com.philosophy.rag.controller;

import com.philosophy.rag.base.response.ApiResponse;
import com.philosophy.rag.dto.response.PhilosopherResponse;
import com.philosophy.rag.service.PhilosopherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
