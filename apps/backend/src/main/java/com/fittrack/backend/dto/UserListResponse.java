package com.fittrack.backend.dto;

import com.fittrack.backend.entity.enums.RoleName;
import java.time.Instant;

public record UserListResponse(
    Long id,
    String employeeIdNumber,
    String fullName,
    String email,
    RoleName role,
    boolean active,
    Instant createdAt,
    Long organizationId,
    String organizationName
) {
}

