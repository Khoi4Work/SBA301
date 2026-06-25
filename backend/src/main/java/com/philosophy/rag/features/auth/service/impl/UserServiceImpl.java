package com.philosophy.rag.features.auth.service.impl;

import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.base.exception.ErrorCode;
import com.philosophy.rag.features.ai.repository.ChatHistoryRepository;
import com.philosophy.rag.features.auth.dto.UserResponse;
import com.philosophy.rag.features.auth.dto.UserUpdateRequest;
import com.philosophy.rag.features.auth.entity.User;
import com.philosophy.rag.features.auth.repository.UserRepository;
import com.philosophy.rag.features.auth.service.UserService;
import com.philosophy.rag.utils.dto.UploadResponse;
import com.philosophy.rag.features.learning.dto.UserDashboardResponse;
import com.philosophy.rag.features.learning.dto.SessionContentResponse;
import com.philosophy.rag.features.learning.entity.LearningProgress;
import com.philosophy.rag.utils.entity.Document;
import com.philosophy.rag.features.learning.repository.LearningProgressRepository;
import com.philosophy.rag.utils.repository.DocumentRepository;
import com.philosophy.rag.utils.service.MediaStorageService;
import com.philosophy.rag.utils.service.S3StorageService;
import com.philosophy.rag.features.learning.service.SessionService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
    private final MediaStorageService cloudinaryService;
    private final LearningProgressRepository learningProgressRepository;
    private final DocumentRepository documentRepository;
    private final ChatHistoryRepository chatHistoryRepository;
    private final S3StorageService s3StorageService;
    private final SessionService sessionService;

    @Override
    public UserResponse getUser(UUID userId) {

        User user = userRepository.findById(userId).orElseThrow(() ->
                        new ApiException(ErrorCode.USER_NOT_FOUND));

        return toResponse(user);
    }

    @Override
    public UserResponse getCurrentUser() {
        User user = findCurrentUser();
        return toResponse(user);
    }

    @Override
    public UUID getCurrentUserId() {
        return findCurrentUser().getUserId();
    }

    private User findCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new ApiException(ErrorCode.UNAUTHENTICATED);
        }
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
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

        validateUsername(request.username(), user);

        if (request.username() != null) {
            user.setUsername(request.username());
        }

        validateEmail(request.email(), user);

        if (request.email() != null) {
            user.setEmail(request.email());
        }

        if (request.fullName() != null) {
            user.setFullName(request.fullName());
        }

        if (request.biography() != null) {
            user.setBiography(request.biography());
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

        String oldPublicId = user.getCloudinaryPublicId();

        UploadResponse uploadResult = cloudinaryService.uploadImage(file,"philosophy/avatars");
        user.setAvatarUrl(uploadResult.getSecureUrl());
        user.setCloudinaryPublicId(uploadResult.getPublicId());

        userRepository.save(user);

        if (oldPublicId != null) {
            cloudinaryService.deleteImage(oldPublicId);
        }

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
                .streak(user.getStreak())
                .createdAt(user.getCreatedAt())
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

        Double totalChatTime = chatHistoryRepository.calculateTotalChatHours(user.getUserId());

        return UserDashboardResponse.builder()
                .learningProgress(progressPercent)
                .totalXp(user.getTotalXp())
                .streak(user.getStreak())
                .totalChatTime(totalChatTime != null ? totalChatTime : 0.0)
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
