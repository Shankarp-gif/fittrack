package com.fittrack.backend.dto;

import jakarta.validation.constraints.NotNull;

public record AssignAdminToOrganizationRequest(
        @NotNull(message = "User ID is required")
        Long userId,

        @NotNull(message = "Organization ID is required")
        Long organizationId
) {
}

