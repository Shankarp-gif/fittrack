package com.fittrack.backend.service.impl;

import com.fittrack.backend.dto.AdminDashboardDTO;
import com.fittrack.backend.dto.HierarchyAuditDTO;
import com.fittrack.backend.entity.AuditLog;
import com.fittrack.backend.entity.Organization;
import com.fittrack.backend.entity.User;
import com.fittrack.backend.entity.enums.RoleName;
import com.fittrack.backend.entity.enums.MemberStatus;
import com.fittrack.backend.repository.AuditLogRepository;
import com.fittrack.backend.repository.MemberRepository;
import com.fittrack.backend.repository.OrganizationRepository;
import com.fittrack.backend.repository.UserRepository;
import com.fittrack.backend.service.AdminService;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of AdminService for dashboard statistics
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminServiceImpl implements AdminService {

    private final MemberRepository memberRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;

    @Override
    public AdminDashboardDTO.StatsDTO getOrganizationStats(Long organizationId) {
        // Get member statistics
        long totalMembers = memberRepository.countByOrganizationId(organizationId);
        long activeMembers = memberRepository.countByOrganizationIdAndStatus(
            organizationId, MemberStatus.ACTIVE);
        long expiredMembers = memberRepository.countByOrganizationIdAndStatus(
            organizationId, MemberStatus.EXPIRED);

        // Get today's check-ins (placeholder - would need proper implementation)
        long todayCheckIns = 0;  // TODO: Implement with attendance data

        // Get weekly active members (placeholder - would need proper implementation)
        long weeklyActiveMembers = activeMembers / 2;  // Approximate for now

        // Calculate revenue metrics (placeholder - would need payment table)
        double totalRevenue = calculateTotalRevenue(organizationId);
        double pendingCollections = calculatePendingCollections(organizationId);

        // Calculate monthly growth (placeholder for now)
        long monthlyGrowth = 8;  // TODO: Calculate from actual member creation dates

        return AdminDashboardDTO.StatsDTO.builder()
            .totalMembers(totalMembers)
            .activeMembers(activeMembers)
            .expiredMembers(expiredMembers)
            .totalRevenue(totalRevenue)
            .pendingCollections(pendingCollections)
            .todayCheckIns(todayCheckIns)
            .weeklyActiveMembers(weeklyActiveMembers)
            .monthlyGrowth(monthlyGrowth)
            .build();
    }

    @Override
    public List<AdminDashboardDTO.RecentActivityDTO> getRecentActivities(Long organizationId) {
        // Get recent audit logs for this organization (up to 10 most recent)
        List<AuditLog> recentLogs = auditLogRepository.findByOrganizationIdOrderByCreatedAtDesc(organizationId);

        return recentLogs.stream()
            .limit(10)  // Limit to 10 most recent
            .map(log -> AdminDashboardDTO.RecentActivityDTO.builder()
                .id(log.getId())
                .memberName(log.getUser() != null && log.getUser().getFullName() != null
                    ? log.getUser().getFullName()
                    : "N/A")
                .action(log.getAction())
                .timestamp(log.getCreatedAt() != null
                    ? log.getCreatedAt().toString()
                    : Instant.now().toString())
                .type(mapActionToType(log.getAction()))
                .build())
            .collect(Collectors.toList());
    }

    @Override
    public HierarchyAuditDTO.SnapshotDTO getHierarchyAudit(String requesterRole, Long organizationId) {
        boolean superAdminScope = RoleName.SUPER_ADMIN.name().equalsIgnoreCase(requesterRole);

        List<User> scopedUsers = userRepository.findAll()
            .stream()
            .filter(user -> superAdminScope || belongsToOrganization(user, organizationId))
            .sorted(Comparator.comparing(User::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
            .toList();

        Map<Long, User> userById = scopedUsers.stream()
            .collect(Collectors.toMap(User::getId, user -> user, (left, right) -> left, HashMap::new));

        List<HierarchyAuditDTO.IssueDTO> issues = new ArrayList<>();
        long usersWithoutOrganization = 0;
        long usersWithoutBranch = 0;
        long usersWithBranchMismatch = 0;
        long usersWithoutSupervisor = 0;
        long usersWithInvalidSupervisor = 0;
        long usersWithInactiveSupervisor = 0;
        long usersWithHierarchyCycle = 0;

        for (User user : scopedUsers) {
            if (user.getRole() == null) {
                continue;
            }

            RoleName roleName = user.getRole().getName();
            boolean requiresOrganization = roleName != RoleName.SUPER_ADMIN;
            boolean requiresSupervisor = roleName != RoleName.SUPER_ADMIN;

            if (requiresOrganization && user.getOrganization() == null) {
                usersWithoutOrganization++;
                issues.add(issue(user, "MISSING_ORGANIZATION", "critical",
                    "User is not assigned to an organization.",
                    "Assign the user to the correct organization from user management."));
            }

            if (requiresOrganization && user.getBranch() == null) {
                usersWithoutBranch++;
                issues.add(issue(user, "MISSING_BRANCH", "warning",
                    "User is not assigned to a branch.",
                    "Assign or auto-create a branch for the user's organization."));
            }

            if (user.getOrganization() != null && user.getBranch() != null
                && user.getBranch().getOrganization() != null
                && !user.getOrganization().getId().equals(user.getBranch().getOrganization().getId())) {
                usersWithBranchMismatch++;
                issues.add(issue(user, "BRANCH_ORG_MISMATCH", "critical",
                    "User branch belongs to a different organization.",
                    "Move the user to a branch inside the same organization."));
            }

            User supervisor = user.getSupervisor();
            if (requiresSupervisor && supervisor == null) {
                usersWithoutSupervisor++;
                issues.add(issue(user, "MISSING_SUPERVISOR", "warning",
                    "User has no supervisor assigned.",
                    "Assign a supervisor using the hierarchy management page."));
                continue;
            }

            if (supervisor == null) {
                continue;
            }

            if (!supervisor.isActive()) {
                usersWithInactiveSupervisor++;
                issues.add(issue(user, "INACTIVE_SUPERVISOR", "warning",
                    "Assigned supervisor is inactive.",
                    "Reassign the user to an active supervisor."));
            }

            if (!isSupervisorAllowed(roleName, supervisor.getRole() != null ? supervisor.getRole().getName() : null)) {
                usersWithInvalidSupervisor++;
                issues.add(issue(user, "INVALID_SUPERVISOR_ROLE", "critical",
                    "Supervisor role is not allowed for this user role.",
                    "Choose a supervisor with a valid hierarchy level."));
            }

            if (supervisor.getRole() != null && supervisor.getRole().getName() != RoleName.SUPER_ADMIN) {
                if (user.getOrganization() == null || supervisor.getOrganization() == null
                    || !user.getOrganization().getId().equals(supervisor.getOrganization().getId())) {
                    usersWithInvalidSupervisor++;
                    issues.add(issue(user, "SUPERVISOR_ORG_MISMATCH", "critical",
                        "Supervisor belongs to a different organization.",
                        "Assign a supervisor from the same organization or use a super admin."));
                }
            }

            if (hasHierarchyCycle(user, userById)) {
                usersWithHierarchyCycle++;
                issues.add(issue(user, "HIERARCHY_CYCLE", "critical",
                    "User is part of a circular supervisor chain.",
                    "Remove or reassign supervisors to break the cycle."));
            }
        }

        Organization organization = organizationId != null
            ? organizationRepository.findById(organizationId).orElse(null)
            : null;

        HierarchyAuditDTO.SummaryDTO summary = HierarchyAuditDTO.SummaryDTO.builder()
            .generatedAt(Instant.now())
            .scope(superAdminScope ? "GLOBAL" : "ORGANIZATION")
            .organizationId(organization != null ? organization.getId() : null)
            .organizationName(organization != null ? organization.getName() : null)
            .totalOrganizations(superAdminScope ? organizationRepository.count() : (organization != null ? 1 : 0))
            .totalUsers(scopedUsers.size())
            .usersWithoutOrganization(usersWithoutOrganization)
            .usersWithoutBranch(usersWithoutBranch)
            .usersWithBranchMismatch(usersWithBranchMismatch)
            .usersWithoutSupervisor(usersWithoutSupervisor)
            .usersWithInvalidSupervisor(usersWithInvalidSupervisor)
            .usersWithInactiveSupervisor(usersWithInactiveSupervisor)
            .usersWithHierarchyCycle(usersWithHierarchyCycle)
            .build();

        return HierarchyAuditDTO.SnapshotDTO.builder()
            .summary(summary)
            .issues(issues)
            .build();
    }

    private boolean belongsToOrganization(User user, Long organizationId) {
        return organizationId != null
            && user.getOrganization() != null
            && organizationId.equals(user.getOrganization().getId());
    }

    private HierarchyAuditDTO.IssueDTO issue(User user, String code, String severity, String message, String action) {
        return HierarchyAuditDTO.IssueDTO.builder()
            .userId(user.getId())
            .fullName(user.getFullName())
            .email(user.getEmail())
            .role(user.getRole() != null ? user.getRole().getName() : null)
            .active(user.isActive())
            .organizationId(user.getOrganization() != null ? user.getOrganization().getId() : null)
            .organizationName(user.getOrganization() != null ? user.getOrganization().getName() : null)
            .branchId(user.getBranch() != null ? user.getBranch().getId() : null)
            .branchName(user.getBranch() != null ? user.getBranch().getName() : null)
            .supervisorId(user.getSupervisor() != null ? user.getSupervisor().getId() : null)
            .supervisorName(user.getSupervisor() != null ? user.getSupervisor().getFullName() : null)
            .issueCode(code)
            .severity(severity)
            .message(message)
            .recommendedAction(action)
            .build();
    }

    private boolean isSupervisorAllowed(RoleName targetRole, RoleName supervisorRole) {
        if (targetRole == null || supervisorRole == null) {
            return false;
        }

        return switch (targetRole) {
            case SUPER_ADMIN -> false;
            case ADMIN -> supervisorRole == RoleName.SUPER_ADMIN;
            case TRAINER, GYM_MAINTENANCE_MANAGER -> supervisorRole == RoleName.SUPER_ADMIN || supervisorRole == RoleName.ADMIN;
            case USER -> supervisorRole == RoleName.SUPER_ADMIN
                || supervisorRole == RoleName.ADMIN
                || supervisorRole == RoleName.TRAINER
                || supervisorRole == RoleName.GYM_MAINTENANCE_MANAGER;
        };
    }

    private boolean hasHierarchyCycle(User user, Map<Long, User> scopedUsersById) {
        Map<Long, Boolean> seen = new HashMap<>();
        User current = user;
        while (current != null && current.getSupervisor() != null) {
            if (seen.put(current.getId(), Boolean.TRUE) != null) {
                return true;
            }

            User next = scopedUsersById.get(current.getSupervisor().getId());
            if (next == null) {
                next = current.getSupervisor();
            }
            current = next;
        }
        return false;
    }

    /**
     * Map audit log action to activity type for frontend
     */
    private String mapActionToType(String action) {
        if (action == null) return "alert";

        String lower = action.toLowerCase();
        if (lower.contains("create") || lower.contains("enroll")) {
            return "enrollment";
        } else if (lower.contains("pay") || lower.contains("payment")) {
            return "payment";
        } else if (lower.contains("check") || lower.contains("attend")) {
            return "attendance";
        } else if (lower.contains("alert") || lower.contains("warning")) {
            return "alert";
        }
        return "alert";
    }

    /**
     * Calculate total revenue for organization (placeholder)
     * Would integrate with payment system
     */
    private double calculateTotalRevenue(Long organizationId) {
        // TODO: Integrate with payment/membership system
        // For now, return sample data
        return 125000.0;
    }

    /**
     * Calculate pending collections for organization (placeholder)
     * Would integrate with payment system
     */
    private double calculatePendingCollections(Long organizationId) {
        // TODO: Integrate with payment/membership system
        // For now, return sample data
        return 45000.0;
    }
}





