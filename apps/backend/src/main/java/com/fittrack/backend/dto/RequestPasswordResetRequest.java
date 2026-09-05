package com.fittrack.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RequestPasswordResetRequest(
        @Email(message = "Email should be valid")
        @NotBlank(message = "Email is required")
        String email
) {
}

