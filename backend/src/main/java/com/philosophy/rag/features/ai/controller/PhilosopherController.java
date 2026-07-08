package com.philosophy.rag.features.ai.controller;

import com.philosophy.rag.base.response.ApiResult;
import com.philosophy.rag.features.ai.dto.PageResponse;
import com.philosophy.rag.features.ai.dto.PhilosopherRequest;
import com.philosophy.rag.features.ai.dto.PhilosopherResponse;
import com.philosophy.rag.features.ai.service.PhilosopherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/philosophers")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "philosopher-controller")
public class PhilosopherController {

    private final PhilosopherService philosopherService;

    @Operation(summary = "Get all philosophers with pagination (Requires authentication)")
    @GetMapping("/")
    public ResponseEntity<ApiResult<PageResponse<PhilosopherResponse>>> getAllPhilosophers(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "2") int size) {
        log.info("Request to get philosophers list: page={}, size={}", page, size);
        PageResponse<PhilosopherResponse> response = philosopherService.findAllPhilosophers(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResult.success(response, "Successfully retrieved philosopher list"));
    }

    @Operation(summary = "Get philosopher by ID (Requires authentication)")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResult<PhilosopherResponse>> getPhilosopherById(@PathVariable UUID id) {
        PhilosopherResponse response = philosopherService.findPhilosopherById(id);
        return ResponseEntity.ok(ApiResult.success(response, "Successfully retrieved philosopher details"));
    }

    @Operation(summary = "Add new philosopher (Requires ADMIN, STAFF or INSTRUCTOR)")
    @PostMapping(value = "/", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResult<PhilosopherResponse>> createPhilosopher(
            @ModelAttribute @Valid PhilosopherRequest request,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "idleFile", required = false) MultipartFile idleFile,
            @RequestParam(value = "talkingFile", required = false) MultipartFile talkingFile,
            @RequestParam(value = "thinkingFile", required = false) MultipartFile thinkingFile) {
        PhilosopherResponse response = philosopherService.createPhilosopher(request, file, idleFile, talkingFile, thinkingFile);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResult.success(response, "Successfully added philosopher"));
    }

    @Operation(summary = "Update philosopher (Requires ADMIN, STAFF or INSTRUCTOR)")
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'INSTRUCTOR')")
    public ResponseEntity<ApiResult<PhilosopherResponse>> updatePhilosopher(
            @PathVariable UUID id,
            @ModelAttribute @Valid PhilosopherRequest request,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "idleFile", required = false) MultipartFile idleFile,
            @RequestParam(value = "talkingFile", required = false) MultipartFile talkingFile,
            @RequestParam(value = "thinkingFile", required = false) MultipartFile thinkingFile) {
        PhilosopherResponse response = philosopherService.updatePhilosopher(id, request, file, idleFile, talkingFile, thinkingFile);
        return ResponseEntity.ok(ApiResult.success(response, "Successfully updated philosopher"));
    }

    @Operation(summary = "Delete all philosophers (Requires ADMIN)")
    @DeleteMapping("/")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResult<Void>> deleteAllPhilosophers() {
        philosopherService.deleteAllPhilosophers();
        return ResponseEntity.ok(ApiResult.success(null, "Successfully deleted all philosophers"));
    }

    @Operation(summary = "Delete philosopher by ID (Requires ADMIN)")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResult<Void>> deletePhilosopher(
            @PathVariable UUID id) {

        philosopherService.deletePhilosopherById(id);

        return ResponseEntity.ok(
                ApiResult.success(null, "Successfully deleted philosopher")
        );
    }
}
