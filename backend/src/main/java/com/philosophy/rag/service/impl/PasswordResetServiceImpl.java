package com.philosophy.rag.service.impl;

import com.philosophy.rag.dto.request.ForgotPasswordRequest;
import com.philosophy.rag.dto.request.ResetPasswordRequest;
import com.philosophy.rag.entity.PasswordResetToken;
import com.philosophy.rag.entity.User;
import com.philosophy.rag.repository.itf.RefreshTokenRepository;
import com.philosophy.rag.repository.itf.PasswordResetTokenRepository;
import com.philosophy.rag.repository.itf.UserRepository;
import com.philosophy.rag.service.EmailService;
import com.philosophy.rag.service.PasswordResetService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
public class PasswordResetServiceImpl implements PasswordResetService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${app.password-reset.token-minutes:15}")
    private long tokenMinutes;

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail())
                .ifPresent(user -> {
                    passwordResetTokenRepository.deleteUnusedTokensByUserId(user.getUserId());

                    String rawToken = generateRawToken();
                    String tokenHash = hashToken(rawToken);

                    PasswordResetToken resetToken = PasswordResetToken.builder()
                            .user(user)
                            .tokenHash(tokenHash)
                            .expiresAt(Instant.now().plus(tokenMinutes, ChronoUnit.MINUTES))
                            .build();

                    passwordResetTokenRepository.save(resetToken);

                    String resetLink = frontendUrl + "/reset-password?token=" + rawToken;

                    emailService.sendPasswordResetEmail(user.getEmail(), resetLink);
                });
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String tokenHash = hashToken(request.getToken());

        PasswordResetToken resetToken = passwordResetTokenRepository
                .findByTokenHashAndUsedAtIsNull(tokenHash)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token"));

        if (resetToken.isExpired()) {
            throw new IllegalArgumentException("Reset token has expired");
        }

        User user = resetToken.getUser();

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));

        user.setTokenVersion(
                user.getTokenVersion() == null ? 1L : user.getTokenVersion() + 1);

        userRepository.save(user);

        refreshTokenRepository.deleteAllByUser_UserId(user.getUserId());

        resetToken.markAsUsed();
        passwordResetTokenRepository.save(resetToken);
    }

    private String generateRawToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(bytes);
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashedBytes = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));

            return HexFormat.of().formatHex(hashedBytes);
        } catch (Exception exception) {
            throw new IllegalStateException("Could not hash password reset token", exception);
        }
    }
}