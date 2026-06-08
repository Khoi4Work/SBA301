package com.philosophy.rag.service;

import com.philosophy.rag.dto.request.UserUpdateRequest;
import com.philosophy.rag.dto.response.UserDashboardResponse;
import com.philosophy.rag.dto.response.UserResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface UserService {

    UserResponse getUser(UUID userId);

    UserResponse getCurrentUser();

    List<UserResponse> getAllUsers();

    UserResponse updateUser(UUID userId, UserUpdateRequest request);

    void deleteUser(UUID userId);

    UserResponse uploadAvatar(UUID userId, MultipartFile file);

    UserDashboardResponse getDashboardStats(String username);

    void completeFile(String username, String s3Key);
}
