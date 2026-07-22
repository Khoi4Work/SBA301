package com.philosophy.rag.features.auth.controller;


import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.base.exception.ErrorCode;
import com.philosophy.rag.base.response.ApiResult;
import com.philosophy.rag.features.auth.dto.UserGrowthStatsResponse;
import com.philosophy.rag.features.auth.dto.UserResponse;
import com.philosophy.rag.features.auth.dto.UserUpdateRequest;
import com.philosophy.rag.features.learning.dto.CompleteFileRequest;
import com.philosophy.rag.features.learning.dto.UserDashboardResponse;
import com.philosophy.rag.features.auth.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
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

    @Operation(summary = "Get current authenticated user (Requires authentication)")
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResult<UserResponse>> getCurrentUser() {
        UserResponse response = userService.getCurrentUser();
        return ResponseEntity.ok(ApiResult.success(response, "Current user retrieved successfully"));
    }

    @Operation(summary = "Get user by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResult<UserResponse>> getUser(@PathVariable UUID id) {

        log.info("Received request to get user with id: {}", id);

        UserResponse response = userService.getUser(id);

        return ResponseEntity.ok(
                ApiResult.success(response, "User retrieved successfully")
        );
    }

    @Operation(summary = "Get all users with pagination (Requires ADMIN or STAFF)")
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResult<Page<UserResponse>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("Received request to get all users - page: {}, size: {}", page, size);
        Page<UserResponse> response = userService.getAllUsers(page, size);

        return ResponseEntity.ok(
                ApiResult.success(response, "Users retrieved successfully")
        );
    }

    @Operation(summary = "Get learner growth statistics (Requires ADMIN or STAFF)")
    @GetMapping("/growth-stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResult<UserGrowthStatsResponse>> getGrowthStats() {
        log.info("Received request to get user growth stats");
        return ResponseEntity.ok(
                ApiResult.success(userService.getGrowthStats(), "Growth stats retrieved successfully")
        );
    }

    @Operation(summary = "Update user (Requires authentication - Self or Admin/Staff)")
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResult<UserResponse>> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody UserUpdateRequest request) {

        UserResponse currentUser = userService.getCurrentUser();
        boolean isAdminOrStaff = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_STAFF"));

        if (!isAdminOrStaff && !currentUser.userId().equals(id)) {
            throw new ApiException(ErrorCode.FORBIDDEN_ACTION, "Bạn chỉ có thể cập nhật thông tin của chính mình");
        }

        log.info("Received request to update user with id: {}", id);
        UserResponse response = userService.updateUser(id, request);

        return ResponseEntity.ok(
                ApiResult.success(response, "User updated successfully")
        );
    }

    @Operation(summary = "Delete user (Requires ADMIN)")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResult<Void>> deleteUser(@PathVariable UUID id) {

        log.info("Received request to delete user with id: {}", id);
        userService.deleteUser(id);

        return ResponseEntity.ok(
                ApiResult.success(null, "User deleted successfully")
        );
    }

    @Operation(summary = "Upload user avatar (Requires authentication - Self or Admin/Staff)")
    @PostMapping(value = "/{id}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResult<UserResponse>> uploadAvatar(
            @PathVariable UUID id,
            @RequestPart("file") MultipartFile file)
            throws ApiException {

        UserResponse currentUser = userService.getCurrentUser();
        boolean isAdminOrStaff = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_STAFF"));

        if (!isAdminOrStaff && !currentUser.userId().equals(id)) {
            throw new ApiException(ErrorCode.FORBIDDEN_ACTION, "Bạn chỉ có thể cập nhật ảnh đại diện của chính mình");
        }

        log.info("Received request to upload avatar for user: {}", id);
        UserResponse response = userService.uploadAvatar(id, file);

        return ResponseEntity.ok(
                ApiResult.success(response, "Avatar uploaded successfully")
        );
    }

    @Operation(summary = "Test Admin Endpoint (Requires ADMIN)")
    @GetMapping("/test-admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResult<String>> testAdmin() {
        return ResponseEntity.ok(ApiResult.success("Hello Admin!", "Success"));
    }

    @Operation(summary = "Get user dashboard stats")
    @GetMapping("/dashboard-stats")
    public ResponseEntity<ApiResult<UserDashboardResponse>> getDashboardStats() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
            throw new ApiException(ErrorCode.UNAUTHENTICATED, "Bạn chưa đăng nhập");
        }
        String username = authentication.getName();
        log.info("Received request to get dashboard stats for user: {}", username);
        UserDashboardResponse response = userService.getDashboardStats(username);
        return ResponseEntity.ok(
                ApiResult.success(response, "Dashboard stats retrieved successfully")
        );
    }

    @Operation(summary = "Complete a study file")
    @PostMapping("/complete-file")
    public ResponseEntity<ApiResult<Void>> completeFile(@Valid @RequestBody CompleteFileRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
            throw new ApiException(ErrorCode.UNAUTHENTICATED, "Bạn chưa đăng nhập");
        }
        String username = authentication.getName();
        log.info("Received request to complete file for user: {}, key: {}", username, request.getKey());
        userService.completeFile(username, request.getKey());
        return ResponseEntity.ok(
                ApiResult.success(null, "File marked as completed and streak updated")
        );
    }
}
