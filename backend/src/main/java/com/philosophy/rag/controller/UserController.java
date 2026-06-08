package com.philosophy.rag.controller;

import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.base.exception.ErrorCode;
import com.philosophy.rag.base.response.ApiResponse;
import com.philosophy.rag.dto.request.UserUpdateRequest;
import com.philosophy.rag.dto.request.CompleteFileRequest;
import com.philosophy.rag.dto.response.UserResponse;
import com.philosophy.rag.dto.response.UserDashboardResponse;
import com.philosophy.rag.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;

    @Operation(summary = "Get user by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUser(@PathVariable UUID id) {

        log.info("Received request to get user with id: {}", id);

        UserResponse response = userService.getUser(id);

        return ResponseEntity.ok(
                ApiResponse.success(response, "User retrieved successfully")
        );
    }

    @Operation(summary = "Get all users")
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {

        log.info("Received request to get all users");
        List<UserResponse> response = userService.getAllUsers();

        return ResponseEntity.ok(
                ApiResponse.success(response, "Users retrieved successfully")
        );
    }

    @Operation(summary = "Update user")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable UUID id,
            @RequestBody UserUpdateRequest request) {

        log.info("Received request to update user with id: {}", id);
        UserResponse response = userService.updateUser(id, request);

        return ResponseEntity.ok(
                ApiResponse.success(response, "User updated successfully")
        );
    }

    @Operation(summary = "Delete user")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable UUID id) {

        log.info("Received request to delete user with id: {}", id);
        userService.deleteUser(id);

        return ResponseEntity.ok(
                ApiResponse.success(null, "User deleted successfully")
        );
    }

    @Operation(summary = "Upload user avatar")
    @PostMapping(value = "/{id}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<UserResponse>> uploadAvatar(
            @PathVariable UUID id,
            @RequestPart("file") MultipartFile file)
            throws ApiException {

        log.info("Received request to upload avatar for user: {}", id);
        UserResponse response = userService.uploadAvatar(id, file);

        return ResponseEntity.ok(
                ApiResponse.success(response, "Avatar uploaded successfully")
        );
    }

    @Operation(summary = "Test Admin Endpoint")
    @GetMapping("/test-admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> testAdmin() {
        return ResponseEntity.ok(ApiResponse.success("Hello Admin!", "Success"));
    }

    @Operation(summary = "Get user dashboard stats")
    @GetMapping("/dashboard-stats")
    public ResponseEntity<ApiResponse<UserDashboardResponse>> getDashboardStats() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
            throw new ApiException(ErrorCode.UNAUTHENTICATED, "Bạn chưa đăng nhập");
        }
        String username = authentication.getName();
        log.info("Received request to get dashboard stats for user: {}", username);
        UserDashboardResponse response = userService.getDashboardStats(username);
        return ResponseEntity.ok(
                ApiResponse.success(response, "Dashboard stats retrieved successfully")
        );
    }

    @Operation(summary = "Complete a study file")
    @PostMapping("/complete-file")
    public ResponseEntity<ApiResponse<Void>> completeFile(@RequestBody CompleteFileRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
            throw new ApiException(ErrorCode.UNAUTHENTICATED, "Bạn chưa đăng nhập");
        }
        String username = authentication.getName();
        log.info("Received request to complete file for user: {}, key: {}", username, request.getKey());
        userService.completeFile(username, request.getKey());
        return ResponseEntity.ok(
                ApiResponse.success(null, "File marked as completed and streak updated")
        );
    }
}
