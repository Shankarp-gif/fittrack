package com.fittrack.backend.dto;

import com.fittrack.backend.entity.enums.RoleName;

public record ChangeRoleRequest(
    Long userId,
    RoleName newRole
) {
}

