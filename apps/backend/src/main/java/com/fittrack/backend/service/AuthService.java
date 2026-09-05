package com.fittrack.backend.service;

import com.fittrack.backend.dto.AuthResponse;
import com.fittrack.backend.dto.LoginRequest;
import com.fittrack.backend.dto.RefreshTokenRequest;
import com.fittrack.backend.dto.RegisterRequest;
import com.fittrack.backend.dto.RequestPasswordResetRequest;
import com.fittrack.backend.dto.ResetPasswordRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refresh(RefreshTokenRequest request);

    void requestPasswordReset(RequestPasswordResetRequest request);

    void resetPassword(ResetPasswordRequest request);
}

