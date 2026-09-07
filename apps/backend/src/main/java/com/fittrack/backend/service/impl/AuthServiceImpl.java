package com.fittrack.backend.service.impl;

import com.fittrack.backend.dto.AuthResponse;
import com.fittrack.backend.dto.LoginRequest;
import com.fittrack.backend.dto.RefreshTokenRequest;
import com.fittrack.backend.dto.RegisterRequest;
import com.fittrack.backend.dto.RequestPasswordResetRequest;
import com.fittrack.backend.dto.ResetPasswordRequest;
import com.fittrack.backend.dto.UserMeResponse;
import com.fittrack.backend.entity.Branch;
import com.fittrack.backend.entity.Member;
import com.fittrack.backend.entity.Organization;
import com.fittrack.backend.entity.RefreshToken;
import com.fittrack.backend.entity.Role;
import com.fittrack.backend.entity.User;
import com.fittrack.backend.entity.UserProfile;
import com.fittrack.backend.entity.enums.RoleName;
import com.fittrack.backend.exception.AppException;
import com.fittrack.backend.mapper.UserMapper;
import com.fittrack.backend.repository.BranchRepository;
import com.fittrack.backend.repository.MemberRepository;
import com.fittrack.backend.repository.OrganizationRepository;
import com.fittrack.backend.repository.RefreshTokenRepository;
import com.fittrack.backend.repository.RoleRepository;
import com.fittrack.backend.repository.UserProfileRepository;
import com.fittrack.backend.repository.UserRepository;
import com.fittrack.backend.security.JwtService;
import com.fittrack.backend.service.AuthService;
import com.fittrack.backend.util.MemberIdGenerator;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final UserProfileRepository profileRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final OrganizationRepository organizationRepository;
    private final BranchRepository branchRepository;
    private final MemberRepository memberRepository;
    private final MemberIdGenerator memberIdGenerator;

    public AuthServiceImpl(
            UserRepository userRepository,
            UserProfileRepository profileRepository,
            RoleRepository roleRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            OrganizationRepository organizationRepository,
            BranchRepository branchRepository,
            MemberRepository memberRepository,
            MemberIdGenerator memberIdGenerator
    ) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.roleRepository = roleRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.organizationRepository = organizationRepository;
        this.branchRepository = branchRepository;
        this.memberRepository = memberRepository;
        this.memberIdGenerator = memberIdGenerator;
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new AppException(HttpStatus.CONFLICT, "Email is already registered");
        }

        // Verify organization exists
        Organization organization = organizationRepository.findById(request.organizationId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Organization not found"));

        // Get first branch of the organization, or throw error if none exists
        Branch branch = branchRepository.findByOrganizationId(request.organizationId())
                .stream()
                .findFirst()
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, 
                    "No branch found for the selected organization. Please contact support."));

        Role userRole = roleRepository.findByName(RoleName.USER)
                .orElseThrow(() -> new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "USER role not configured"));

        User user = new User();
        user.setFullName(request.fullName());
        user.setEmail(request.email().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setMobile(request.mobile());
        user.setAddress(request.address());
        user.setRole(userRole);
        user.setOrganization(organization);
        user = userRepository.save(user);

        UserProfile profile = new UserProfile();
        profile.setUser(user);
        profile.setDateOfBirth(request.dateOfBirth());
        profile.setGender(request.gender());
        profile.setHeightCm(request.heightCm() != null ? BigDecimal.valueOf(request.heightCm()) : null);
        profile.setWeightKg(request.weightKg() != null ? BigDecimal.valueOf(request.weightKg()) : null);
        profile.setFitnessLevel(request.fitnessLevel());
        profile.setPrimaryGoal(request.goal());
        profile.setTrainingPreference(request.trainingPreference());
        profile.setWorkoutFrequency(request.workoutFrequency());
        profileRepository.save(profile);

        // Create member record with auto-generated ID
        Member member = new Member();
        member.setMemberIdNumber(memberIdGenerator.generateMemberId());
        member.setFullName(request.fullName());
        member.setEmail(request.email());
        member.setMobile(request.mobile());
        member.setDateOfBirth(request.dateOfBirth());
        member.setGender(request.gender() != null ? request.gender().name() : null);
        member.setAddress(request.address());
        member.setOrganization(organization);
        member.setBranch(branch);
        member.setActive(true);
        memberRepository.save(member);

        return createTokenResponse(user, profile, false);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedEmail, request.password())
            );
        } catch (AuthenticationException ex) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        UserProfile profile = profileRepository.findByUserId(user.getId()).orElse(null);
        return createTokenResponse(user, profile, request.rememberSession());
    }

    @Override
    public AuthResponse refresh(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByTokenAndRevokedFalse(request.refreshToken())
                .orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));

        if (refreshToken.getExpiresAt().isBefore(Instant.now()) || !jwtService.isValid(request.refreshToken())) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Refresh token expired");
        }

        User user = refreshToken.getUser();
        UserProfile profile = profileRepository.findByUserId(user.getId()).orElse(null);

        String accessToken = jwtService.generateAccessToken(
                user.getEmail(),
                Map.of("role", user.getRole().getName().name())
        );

        return new AuthResponse(
                accessToken,
                refreshToken.getToken(),
                "Bearer",
                jwtService.getAccessTokenTtl().toSeconds(),
                UserMapper.toMeResponse(user, profile)
        );
    }

    @Override
    public void requestPasswordReset(RequestPasswordResetRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Email not found"));

        // In a real implementation, you would:
        // 1. Generate a reset token
        // 2. Store it with expiration time
        // 3. Send email with reset link
        // For now, we just verify the user exists
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Email not found"));

        // Validate password
        if (request.newPassword() == null || request.newPassword().length() < 6) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Password must be at least 6 characters");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    private AuthResponse createTokenResponse(User user, UserProfile profile, boolean rememberSession) {
        String accessToken = jwtService.generateAccessToken(
                user.getEmail(),
                Map.of("role", user.getRole().getName().name())
        );
        String refreshTokenValue = jwtService.generateRefreshToken(user.getEmail(), rememberSession);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(refreshTokenValue);
        refreshToken.setExpiresAt(jwtService.extractExpiration(refreshTokenValue));
        refreshTokenRepository.save(refreshToken);

        UserMeResponse userMe = UserMapper.toMeResponse(user, profile);
        return new AuthResponse(accessToken, refreshTokenValue, "Bearer", jwtService.getAccessTokenTtl().toSeconds(), userMe);
    }
}



