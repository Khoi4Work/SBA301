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
@Tag(name = "philosopher-controller")
public class PhilosopherController {

    private final PhilosopherService philosopherService;

    @Operation(summary = "Get all philosophers")
    @GetMapping("/getAll")
    public ResponseEntity<ApiResponse<List<PhilosopherResponse>>> getAllPhilosophers() {
        List<PhilosopherResponse> philosophers = philosopherService.findAllPhilosophers();
        return ResponseEntity.ok(ApiResponse.success(philosophers, "Successfully retrieved philosopher list"));
    }

    @Operation(summary = "Add new philosopher")
    @PostMapping(value = "/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<PhilosopherResponse>> createPhilosopher(
            @ModelAttribute @Valid PhilosopherRequest request,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        PhilosopherResponse response = philosopherService.createPhilosopher(request, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response, "Successfully added philosopher"));
    }

    @Operation(summary = "Update philosopher")
    @PutMapping(value = "/update/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<PhilosopherResponse>> updatePhilosopher(
            @PathVariable java.util.UUID id,
            @ModelAttribute @Valid PhilosopherRequest request,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        PhilosopherResponse response = philosopherService.updatePhilosopher(id, request, file);
        return ResponseEntity.ok(ApiResponse.success(response, "Successfully updated philosopher"));
    }

    @Operation(summary = "Delete all philosophers")
    @DeleteMapping("/deleteAll")
    public ResponseEntity<ApiResponse<Void>> deleteAllPhilosophers() {
        philosopherService.deleteAllPhilosophers();
        return ResponseEntity.ok(ApiResponse.success(null, "Successfully deleted all philosophers"));
    }
}
