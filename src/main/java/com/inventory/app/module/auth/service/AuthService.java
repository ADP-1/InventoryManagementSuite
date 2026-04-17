package com.inventory.app.module.auth.service;

import com.inventory.app.common.exception.DuplicateResourceException;
import com.inventory.app.module.auth.dto.AuthResponse;
import com.inventory.app.module.auth.dto.LoginRequest;
import com.inventory.app.module.auth.dto.RefreshRequest;
import com.inventory.app.module.auth.dto.RegisterRequest;
import com.inventory.app.module.auth.dto.UpdateProfileRequest;
import com.inventory.app.module.user.entity.User;
import com.inventory.app.module.user.repository.UserRepository;
import com.inventory.app.security.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    // ─── Register ────────────────────────────────────────────────────────────

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .active(true)
                .build();

        userRepository.save(user);
        log.info("Registered new user: {} with role: {}", user.getEmail(), user.getRole());

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        return buildAuthResponse(userDetails, user);
    }

    // ─── Login ───────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found after authentication"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        log.info("User logged in: {}", user.getEmail());
        return buildAuthResponse(userDetails, user);
    }

    // ─── Refresh ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public AuthResponse refresh(RefreshRequest request) {
        final String refreshToken = request.getRefreshToken();
        final String email = jwtUtil.extractEmail(refreshToken);

        UserDetails userDetails = userDetailsService.loadUserByUsername(email);

        if (!jwtUtil.isTokenValid(refreshToken, userDetails) || !jwtUtil.isRefreshToken(refreshToken)) {
            throw new org.springframework.security.authentication.BadCredentialsException(
                    "Invalid or expired refresh token");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String newAccessToken = jwtUtil.generateAccessToken(userDetails);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)   // reuse same refresh token
                .tokenType("Bearer")
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .expiresIn(jwtUtil.getJwtExpiration())
                .build();
    }

    // ─── Update Profile ──────────────────────────────────────────────────────
    
    @Transactional
    public AuthResponse updateProfile(String currentEmail, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!currentEmail.equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        userRepository.save(user);

        log.info("User updated profile: {}", user.getEmail());

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        return buildAuthResponse(userDetails, user);
    }

    // ─── Helper ──────────────────────────────────────────────────────────────

    private AuthResponse buildAuthResponse(UserDetails userDetails, User user) {
        String accessToken = jwtUtil.generateAccessToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .expiresIn(jwtUtil.getJwtExpiration())
                .build();
    }
}
