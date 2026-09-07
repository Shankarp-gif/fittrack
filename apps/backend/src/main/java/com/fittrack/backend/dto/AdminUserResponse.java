package com.fittrack.backend.dto;

import com.fittrack.backend.entity.enums.RoleName;
import java.time.Instant;

public record AdminUserResponse(
    Long id,
    String fullName,
    String email,
    RoleName role,
    Long organizationId,
    String organizationName,
    boolean active,
    Instant createdAt
) {
}

