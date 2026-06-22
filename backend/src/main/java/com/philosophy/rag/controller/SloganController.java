package com.philosophy.rag.controller;

import com.philosophy.rag.base.response.ApiResponse;
import com.philosophy.rag.dto.request.SloganRequest;
import com.philosophy.rag.dto.response.SloganResponse;
import com.philosophy.rag.entity.Slogan;
import com.philosophy.rag.service.SloganService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/slogan")
@RequiredArgsConstructor
@Slf4j
public class SloganController {

    private final SloganService sloganService;

    @GetMapping("")
    public ResponseEntity<ApiResponse<Slogan>> getSlogan() {
        return ResponseEntity.ok(ApiResponse.success(sloganService.getRandomSlogan(), "Successfully retrieved slogan"));
    }

    @PostMapping("")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'INSTRUCTOR')")
    @Operation(summary = "Add new slogan (Requires ADMIN, STAFF or INSTRUCTOR)")
    public ResponseEntity<ApiResponse<SloganResponse>> addSlogan(@Valid @RequestBody SloganRequest request) {
        SloganResponse response = sloganService.addSlogan(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Slogan added successfully"));
    }
}
