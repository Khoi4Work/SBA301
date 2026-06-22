package com.philosophy.rag.service.impl;

import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.base.exception.ErrorCode;
import com.philosophy.rag.base.security.JwtTokenProvider;
import com.philosophy.rag.dto.request.ForgotPasswordRequest;
import com.philosophy.rag.dto.request.LoginRequest;
import com.philosophy.rag.dto.request.RegisterRequest;
import com.philosophy.rag.dto.request.ResetPasswordRequest;
import com.philosophy.rag.dto.response.AuthResponse;
import com.philosophy.rag.entity.PasswordResetToken;
import com.philosophy.rag.entity.RefreshToken;
import com.philosophy.rag.entity.TokenBlacklist;
import com.philosophy.rag.entity.User;
import com.philosophy.rag.repository.custom.PasswordResetTokenRepository;
import com.philosophy.rag.repository.RefreshTokenRepository;
import com.philosophy.rag.repository.TokenBlacklistRepository;
import com.philosophy.rag.repository.UserRepository;
import com.philosophy.rag.service.AuthService;
import com.philosophy.rag.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final TokenBlacklistRepository tokenBlacklistRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${app.password-reset.token-minutes:15}")
    private long tokenMinutes;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "Email already exists");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .build();
        userRepository.save(user);

        return generateAuthResponse(user);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        log.info("Attempting login for user: {}", request.getUsernameOrEmail());
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsernameOrEmail(),
                            request.getPassword()
                    )
            );
            log.info("Authentication successful for user: {}", request.getUsernameOrEmail());
        } catch (Exception e) {
            log.error("Authentication failed for user: {}. Error: {}", request.getUsernameOrEmail(), e.getMessage());
            throw new ApiException(ErrorCode.INVALID_INPUT, "Sai tài khoản hoặc mật khẩu");
        }

        User user = userRepository
                .findByUsername(request.getUsernameOrEmail())
                .or(() -> userRepository.findByEmail(request.getUsernameOrEmail()))
                .orElseThrow(() -> {
                        log.error("User not found in database after authentication: {}", request.getUsernameOrEmail());
                        return new UsernameNotFoundException(
                                "User not found: " + request.getUsernameOrEmail()
                                );
                });
        Long currentVersion = user.getTokenVersion() == null ? 0L : user.getTokenVersion();
        user.setTokenVersion(currentVersion + 1);
        userRepository.save(user);

        log.info("User {} found with role {}. Generating tokens...", user.getUsername(), user.getRole());
        return generateAuthResponse(user);
    }

    @Override
    @Transactional
    public void logout(String token) {
        // 1. Blacklist the current access token
        var expiresAt = jwtTokenProvider.extractExpiration(token).toInstant();
        TokenBlacklist blacklistedToken = TokenBlacklist.builder()
                .token(token)
                .expiresAt(expiresAt)
                .build();
        tokenBlacklistRepository.save(blacklistedToken);

        // 2. Revoke all refresh tokens for this user
        String username = jwtTokenProvider.extractUsername(token);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException(ErrorCode.INVALID_INPUT, "User not found"));

        refreshTokenRepository.deleteByUser_UserId(user.getUserId());
    }

    @Override
    @Transactional
    public AuthResponse refreshAccessToken(String refreshTokenString) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenString)
                .orElseThrow(() -> new ApiException(ErrorCode.INVALID_INPUT, "Refresh token not found or invalid"));

        if (refreshToken.getExpiresAt().isBefore(Instant.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new ApiException(ErrorCode.INVALID_INPUT, "Refresh token expired");
        }

        User user = refreshToken.getUser();
        String newAccessToken = jwtTokenProvider.createToken(user.getUsername(), user.getRole().name(), user.getTokenVersion(), JwtTokenProvider.ACCESS_TOKEN_VALIDITY);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshTokenString) // Keep same refresh token
                .tokenType("Bearer")
                .username(user.getUsername())
                .email(user.getEmail())
                .expiresIn(JwtTokenProvider.ACCESS_TOKEN_VALIDITY / 1000)
                .build();
    }

    @Override
    @jakarta.transaction.Transactional
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
    @jakarta.transaction.Transactional
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
                user.getTokenVersion() == null ? 1L : user.getTokenVersion() + 1
        );

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

    private AuthResponse generateAuthResponse(User user) {
        log.info("Generating auth response for user: {} (Role: {})", user.getUsername(), user.getRole());
        // Create Access Token
        String accessToken = jwtTokenProvider.createToken(user.getUsername(), user.getRole().name(), user.getTokenVersion(), JwtTokenProvider.ACCESS_TOKEN_VALIDITY);
        log.debug("Access token generated successfully for user: {}", user.getUsername());

        // Create Refresh Token
        String refreshTokenString = UUID.randomUUID().toString();
        RefreshToken refreshToken = RefreshToken.builder()
                .token(refreshTokenString)
                .user(user)
                .expiresAt(Instant.now().plusMillis(JwtTokenProvider.REFRESH_TOKEN_VALIDITY))
                .build();
        refreshTokenRepository.save(refreshToken);
        log.debug("Refresh token generated and saved for user: {}", user.getUsername());

        return AuthResponse.builder()
                .id(user.getUserId())
                .accessToken(accessToken)
                .refreshToken(refreshTokenString)
                .tokenType("Bearer")
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .biography(user.getBiography())
                .avatarUrl(user.getAvatarUrl())
                .expiresIn(JwtTokenProvider.ACCESS_TOKEN_VALIDITY / 1000)
                .build();
    }
}
