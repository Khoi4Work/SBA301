package com.philosophy.rag.service.impl;

import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.base.exception.ErrorCode;
import com.philosophy.rag.dto.request.UserUpdateRequest;
import com.philosophy.rag.dto.response.CloudinaryUploadResponse;
import com.philosophy.rag.dto.response.UserResponse;
import com.philosophy.rag.entity.User;
import com.philosophy.rag.repository.itf.UserRepository;
import com.philosophy.rag.service.CloudinaryService;
import com.philosophy.rag.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Service
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    @Override
    public UserResponse getUser(UUID userId) {

        User user = userRepository.findById(userId).orElseThrow(() ->
                        new ApiException(ErrorCode.USER_NOT_FOUND));

        return toResponse(user);
    }

    @Override
    public List<UserResponse> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public UserResponse updateUser(UUID userId, UserUpdateRequest request) {

        User user = userRepository.findById(userId).orElseThrow(() ->
                        new ApiException(ErrorCode.USER_NOT_FOUND));

        validateUsername(request.getUsername(), user);

        if (request.getUsername() != null) {
            user.setUsername(request.getUsername());
        }

        validateEmail(request.getEmail(), user);

        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }

        if (request.getBiography() != null) {
            user.setBiography(request.getBiography());
        }

        userRepository.save(user);
        return toResponse(user);
    }

    @Override
    @Transactional
    public void deleteUser(UUID userId) {

        User user = userRepository.findById(userId).orElseThrow(() ->
                        new ApiException(ErrorCode.USER_NOT_FOUND));

        if (user.getCloudinaryPublicId() != null) {
            cloudinaryService.deleteImage(user.getCloudinaryPublicId());
        }

        userRepository.delete(user);
    }

    @Override
    @Transactional
    public UserResponse uploadAvatar(UUID userId, MultipartFile file) {

        User user = userRepository.findById(userId).orElseThrow(() ->
                        new ApiException(ErrorCode.USER_NOT_FOUND));

        if (user.getCloudinaryPublicId() != null) {
            cloudinaryService.deleteImage(user.getCloudinaryPublicId());
        }

        CloudinaryUploadResponse uploadResult = cloudinaryService.uploadImage(file,"philosophy/avatars");
        user.setAvatarUrl(uploadResult.getSecureUrl());
        user.setCloudinaryPublicId(uploadResult.getPublicId());

        userRepository.save(user);
        return toResponse(user);
    }

    private void validateUsername(String username, User currentUser) {

        if (username == null) {
            return;
        }

        if (userRepository.existsByUsername(username) && !username.equals(currentUser.getUsername())) {
            throw new ApiException(ErrorCode.DUPLICATE_RESOURCE, "Username already exists");
        }
    }

    private void validateEmail(String email, User currentUser) {

        if (email == null) {
            return;
        }

        if (userRepository.existsByEmail(email) && !email.equals(currentUser.getEmail())) {
            throw new ApiException(ErrorCode.DUPLICATE_RESOURCE, "Email already exists");
        }
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .biography(user.getBiography())
                .avatarUrl(user.getAvatarUrl())
                .totalXp(user.getTotalXp())
                .build();
    }
}
