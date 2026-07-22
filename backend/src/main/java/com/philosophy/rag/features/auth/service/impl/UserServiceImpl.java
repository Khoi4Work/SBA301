package com.philosophy.rag.features.auth.service.impl;

import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.base.exception.ErrorCode;
import com.philosophy.rag.features.ai.repository.ChatHistoryRepository;
import com.philosophy.rag.features.auth.dto.UserGrowthStatsResponse;
import com.philosophy.rag.features.auth.dto.UserGrowthStatsResponse.DataPoint;
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

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
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
    public Page<UserResponse> getAllUsers(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return userRepository.findAll(pageRequest)
                .map(this::toResponse);
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

    @Override
    @Transactional(readOnly = true)
    public UserGrowthStatsResponse getGrowthStats() {
        LocalDateTime now = LocalDateTime.now();

        // ── Boundaries ──────────────────────────────────────────────────────────
        LocalDateTime todayStart      = now.toLocalDate().atStartOfDay();
        LocalDateTime weekStart        = now.toLocalDate()
                .with(DayOfWeek.MONDAY).atStartOfDay();
        LocalDateTime monthStart       = now.toLocalDate().withDayOfMonth(1).atStartOfDay();
        LocalDateTime yearStart        = now.toLocalDate().withDayOfYear(1).atStartOfDay();
        LocalDateTime lastWeekStart    = weekStart.minusWeeks(1);
        LocalDateTime lastWeekEnd      = weekStart.minusNanos(1);
        LocalDateTime lastMonthStart   = monthStart.minusMonths(1);
        LocalDateTime lastMonthEnd     = monthStart.minusNanos(1);

        // ── Summary counts ───────────────────────────────────────────────────
        long totalUsers    = userRepository.count();
        long newToday      = userRepository.countByCreatedAtBetween(todayStart, now);
        long newThisWeek   = userRepository.countByCreatedAtBetween(weekStart, now);
        long newThisMonth  = userRepository.countByCreatedAtBetween(monthStart, now);
        long newThisYear   = userRepository.countByCreatedAtBetween(yearStart, now);
        long newLastWeek   = userRepository.countByCreatedAtBetween(lastWeekStart, lastWeekEnd);
        long newLastMonth  = userRepository.countByCreatedAtBetween(lastMonthStart, lastMonthEnd);

        double growthRateWeek  = computeGrowthRate(newThisWeek, newLastWeek);
        double growthRateMonth = computeGrowthRate(newThisMonth, newLastMonth);

        // ── Daily: 7 days ────────────────────────────────────────────────────
        LocalDateTime since7Days = todayStart.minusDays(6);
        List<LocalDateTime> allDates = userRepository.findCreatedAtSince(since7Days);
        DateTimeFormatter dayFmt = DateTimeFormatter.ofPattern("dd/MM");
        List<DataPoint> dailyPoints = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = now.toLocalDate().minusDays(i);
            long count = allDates.stream()
                    .filter(dt -> dt.toLocalDate().equals(d))
                    .count();
            dailyPoints.add(DataPoint.builder().label(d.format(dayFmt)).count(count).build());
        }

        // ── Weekly: 8 weeks ──────────────────────────────────────────────────
        List<DataPoint> weeklyPoints = new ArrayList<>();
        for (int i = 7; i >= 0; i--) {
            LocalDateTime wStart = weekStart.minusWeeks(i);
            LocalDateTime wEnd   = wStart.plusWeeks(1).minusNanos(1);
            long count = userRepository.countByCreatedAtBetween(wStart, wEnd);
            String label = "T" + wStart.toLocalDate().with(DayOfWeek.MONDAY)
                    .format(DateTimeFormatter.ofPattern("dd/MM"));
            weeklyPoints.add(DataPoint.builder().label(label).count(count).build());
        }

        // ── Monthly: 12 months ───────────────────────────────────────────────
        List<DataPoint> monthlyPoints = new ArrayList<>();
        for (int i = 11; i >= 0; i--) {
            LocalDateTime mStart = monthStart.minusMonths(i);
            LocalDateTime mEnd   = mStart.plusMonths(1).minusNanos(1);
            long count = userRepository.countByCreatedAtBetween(mStart, mEnd);
            String label = "T" + mStart.getMonthValue() + "/" + mStart.getYear();
            monthlyPoints.add(DataPoint.builder().label(label).count(count).build());
        }

        // ── Yearly: 5 years ──────────────────────────────────────────────────
        List<DataPoint> yearlyPoints = new ArrayList<>();
        for (int i = 4; i >= 0; i--) {
            LocalDateTime yStart = yearStart.minusYears(i);
            LocalDateTime yEnd   = yStart.plusYears(1).minusNanos(1);
            long count = userRepository.countByCreatedAtBetween(yStart, yEnd);
            yearlyPoints.add(DataPoint.builder().label(String.valueOf(yStart.getYear())).count(count).build());
        }

        return UserGrowthStatsResponse.builder()
                .totalUsers(totalUsers)
                .newToday(newToday)
                .newThisWeek(newThisWeek)
                .newThisMonth(newThisMonth)
                .newThisYear(newThisYear)
                .growthRateWeek(growthRateWeek)
                .growthRateMonth(growthRateMonth)
                .dailyPoints(dailyPoints)
                .weeklyPoints(weeklyPoints)
                .monthlyPoints(monthlyPoints)
                .yearlyPoints(yearlyPoints)
                .build();
    }

    private double computeGrowthRate(long current, long previous) {
        if (previous == 0) return current > 0 ? 100.0 : 0.0;
        return Math.round(((double)(current - previous) / previous) * 1000.0) / 10.0;
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
                .role(user.getRole())
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
