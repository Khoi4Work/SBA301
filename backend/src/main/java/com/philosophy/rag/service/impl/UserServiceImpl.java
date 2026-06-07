package com.philosophy.rag.service.impl;

import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.base.exception.ErrorCode;
import com.philosophy.rag.dto.request.UserUpdateRequest;
import com.philosophy.rag.dto.response.CloudinaryUploadResponse;
import com.philosophy.rag.dto.response.UserResponse;
import com.philosophy.rag.dto.response.UserDashboardResponse;
import com.philosophy.rag.dto.response.SessionContentResponse;
import com.philosophy.rag.entity.User;
import com.philosophy.rag.entity.LearningProgress;
import com.philosophy.rag.entity.Document;
import com.philosophy.rag.repository.itf.UserRepository;
import com.philosophy.rag.repository.itf.LearningProgressRepository;
import com.philosophy.rag.repository.itf.DocumentRepository;
import com.philosophy.rag.service.CloudinaryService;
import com.philosophy.rag.service.UserService;
import com.philosophy.rag.service.S3StorageService;
import com.philosophy.rag.service.SessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.time.Instant;

@RequiredArgsConstructor
@Service
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;
    private final LearningProgressRepository learningProgressRepository;
    private final DocumentRepository documentRepository;
    private final S3StorageService s3StorageService;
    private final SessionService sessionService;

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
                .avatarUrl(user.getAvatarUrl())
                .totalXp(user.getTotalXp())
                .streak(user.getStreak())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserDashboardResponse getDashboardStats(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));

        int totalDocs = Math.max(1, s3StorageService.listDocuments().size());
        int completedDocs = (int) learningProgressRepository.countByUserAndIsCompletedTrue(user);
        int progressPercent = Math.min(100, (int) Math.round((double) completedDocs / totalDocs * 100));

        return UserDashboardResponse.builder()
                .learningProgress(progressPercent)
                .totalXp(user.getTotalXp())
                .streak(user.getStreak())
                .build();
    }

    @Override
    @Transactional
    public void completeFile(String username, String s3Key) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));

        // 1. Find or create Document
        Document doc = documentRepository.findByS3Key(s3Key)
                .orElseGet(() -> {
                    log.info("Creating new Document record in database for key: {}", s3Key);
                    SessionContentResponse contentResponse = sessionService.getContent(s3Key);
                    Document newDoc = Document.builder()
                            .title(contentResponse.getTitle())
                            .s3Key(s3Key)
                            .category("Tài liệu ôn tập")
                            .fullText(contentResponse.getContent())
                            .totalSections(1)
                            .build();
                    return documentRepository.save(newDoc);
                });

        // 2. Find or create LearningProgress
        LearningProgress progress = learningProgressRepository.findByUserAndDocument(user, doc)
                .orElseGet(() -> LearningProgress.builder()
                        .user(user)
                        .document(doc)
                        .isCompleted(false)
                        .lastReadPosition(0)
                        .build());

        // 3. Mark completed and update streak
        progress.setIsCompleted(true);
        progress.setLastViewedAt(Instant.now());
        learningProgressRepository.save(progress);

        user.setStreak(user.getStreak() + 1);
        userRepository.save(user);
    }
}
