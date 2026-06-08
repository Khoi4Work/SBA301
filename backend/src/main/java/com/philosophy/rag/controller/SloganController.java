package com.philosophy.rag.controller;


import com.philosophy.rag.base.response.ApiResponse;
import com.philosophy.rag.entity.Slogan;
import com.philosophy.rag.service.SloganService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/slogan")
@RequiredArgsConstructor
public class SloganController {

    private final SloganService sloganService;

    @GetMapping("")
    public ResponseEntity<ApiResponse<Slogan>> getSlogan() {
        return ResponseEntity.ok(ApiResponse.success(sloganService.getRandomSlogan(), "Successfully retrieved slogan"));
    }


    @PostMapping("")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'INSTRUCTOR')")
    @Operation(summary = "Add new slogan (Requires ADMIN, STAFF or INSTRUCTOR)")
    public ResponseEntity<ApiResponse<Slogan>> addSlogan(@RequestBody Slogan slogan) {
        sloganService.addSlogan(slogan);
        return ResponseEntity.ok(ApiResponse.success(slogan, "Slogan added successfully"));
    }
}
