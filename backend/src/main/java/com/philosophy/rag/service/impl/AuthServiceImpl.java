package com.philosophy.rag.service.impl;

import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.base.exception.ErrorCode;
import com.philosophy.rag.base.security.JwtTokenProvider;
import com.philosophy.rag.dto.request.LoginRequest;
import com.philosophy.rag.dto.request.RegisterRequest;
import com.philosophy.rag.dto.response.AuthResponse;
import com.philosophy.rag.entity.TokenBlacklist;
import com.philosophy.rag.entity.User;
import com.philosophy.rag.repository.custom.TokenBlacklistRepository;
import com.philosophy.rag.repository.custom.UserRepository;
import com.philosophy.rag.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final TokenBlacklistRepository tokenBlacklistRepository;
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

        return AuthResponse.builder()
                .tokenType("Bearer")
                .username(user.getUsername())
                .email(user.getEmail())
                .build();
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
        String token = jwtTokenProvider.createToken(user.getUsername());
        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .username(user.getUsername())
                .email(user.getEmail())
                .build();
    }

    @Override
    @Transactional
    public void logout(String token) {
        var expiresAt = jwtTokenProvider.extractExpiration(token).toInstant();
        TokenBlacklist blacklistedToken = TokenBlacklist.builder()
                .token(token)
                .expiresAt(expiresAt)
                .build();
        tokenBlacklistRepository.save(blacklistedToken);
    }
}