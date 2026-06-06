package com.philosophy.rag.service;

import com.philosophy.rag.dto.request.UserUpdateRequest;
import com.philosophy.rag.dto.response.UserResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface UserService {

    UserResponse getUser(UUID userId);

    List<UserResponse> getAllUsers();

    UserResponse updateUser(UUID userId, UserUpdateRequest request);

    void deleteUser(UUID userId);

    UserResponse uploadAvatar(UUID userId, MultipartFile file);
}
