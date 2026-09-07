package com.fittrack.backend.dto;

import com.fittrack.backend.entity.enums.RoleName;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateUserWithDefaultPasswordRequest(
        @NotBlank(message = "Full name is required")
        String fullName,

        @Email(message = "Email should be valid")
        @NotBlank(message = "Email is required")
        String email,

        @NotNull(message = "Role is required")
        RoleName role,

        Long organizationId
) {
}

