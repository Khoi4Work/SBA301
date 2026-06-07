package com.philosophy.rag.service.impl;

import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.base.exception.ErrorCode;
import com.philosophy.rag.base.security.JwtTokenProvider;
import com.philosophy.rag.dto.request.LoginRequest;
import com.philosophy.rag.dto.request.RegisterRequest;
import com.philosophy.rag.dto.response.AuthResponse;
import com.philosophy.rag.entity.RefreshToken;
import com.philosophy.rag.entity.TokenBlacklist;
import com.philosophy.rag.entity.User;
import com.philosophy.rag.repository.itf.RefreshTokenRepository;
import com.philosophy.rag.repository.itf.TokenBlacklistRepository;
import com.philosophy.rag.repository.itf.UserRepository;
import com.philosophy.rag.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final TokenBlacklistRepository tokenBlacklistRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

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
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsernameOrEmail(),
                            request.getPassword()
                    )
            );
        } catch (Exception e) {
            throw new ApiException(ErrorCode.INVALID_INPUT, "Sai tài khoản hoặc mật khẩu");
        }

        User user = userRepository
                .findByUsername(request.getUsernameOrEmail())
                .or(() -> userRepository.findByEmail(request.getUsernameOrEmail()))
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User not found: " + request.getUsernameOrEmail()
                        )
                );

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
        String newAccessToken = jwtTokenProvider.createToken(user.getUsername(), JwtTokenProvider.ACCESS_TOKEN_VALIDITY);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshTokenString) // Keep same refresh token
                .tokenType("Bearer")
                .username(user.getUsername())
                .email(user.getEmail())
                .expiresIn(JwtTokenProvider.ACCESS_TOKEN_VALIDITY / 1000)
                .build();
    }

    private AuthResponse generateAuthResponse(User user) {
        // Create Access Token
        String accessToken = jwtTokenProvider.createToken(user.getUsername(), JwtTokenProvider.ACCESS_TOKEN_VALIDITY);

        // Create Refresh Token
        String refreshTokenString = UUID.randomUUID().toString();
        RefreshToken refreshToken = RefreshToken.builder()
                .token(refreshTokenString)
                .user(user)
                .expiresAt(Instant.now().plusMillis(JwtTokenProvider.REFRESH_TOKEN_VALIDITY))
                .build();
        refreshTokenRepository.save(refreshToken);

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
