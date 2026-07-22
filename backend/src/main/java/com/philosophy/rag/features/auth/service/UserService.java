package com.philosophy.rag.features.auth.service;

import com.philosophy.rag.features.auth.dto.UserGrowthStatsResponse;
import com.philosophy.rag.features.auth.dto.UserResponse;
import com.philosophy.rag.features.auth.dto.UserUpdateRequest;
import com.philosophy.rag.features.learning.dto.UserDashboardResponse;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface UserService {

    UserResponse getUser(UUID userId);

    UserResponse getCurrentUser();

    UUID getCurrentUserId();

    Page<UserResponse> getAllUsers(int page, int size);

    UserResponse updateUser(UUID userId, UserUpdateRequest request);

    void deleteUser(UUID userId);

    UserResponse uploadAvatar(UUID userId, MultipartFile file);

    UserDashboardResponse getDashboardStats(String username);

    void completeFile(String username, String s3Key);

    UserGrowthStatsResponse getGrowthStats();
}
