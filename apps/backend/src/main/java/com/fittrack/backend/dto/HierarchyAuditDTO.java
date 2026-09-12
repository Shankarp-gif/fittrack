package com.fittrack.backend.dto;

import com.fittrack.backend.entity.enums.RoleName;
import java.time.Instant;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class HierarchyAuditDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SummaryDTO {
        private Instant generatedAt;
        private String scope;
        private Long organizationId;
        private String organizationName;
        private long totalOrganizations;
        private long totalUsers;
        private long usersWithoutOrganization;
        private long usersWithoutBranch;
        private long usersWithBranchMismatch;
        private long usersWithoutSupervisor;
        private long usersWithInvalidSupervisor;
        private long usersWithInactiveSupervisor;
        private long usersWithHierarchyCycle;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class IssueDTO {
        private Long userId;
        private String fullName;
        private String email;
        private RoleName role;
        private boolean active;
        private Long organizationId;
        private String organizationName;
        private Long branchId;
        private String branchName;
        private Long supervisorId;
        private String supervisorName;
        private String issueCode;
        private String severity;
        private String message;
        private String recommendedAction;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SnapshotDTO {
        private SummaryDTO summary;
        private List<IssueDTO> issues;
    }
}

