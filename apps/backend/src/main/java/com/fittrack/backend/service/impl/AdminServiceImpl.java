package com.fittrack.backend.service.impl;

import com.fittrack.backend.dto.AdminDashboardDTO;
import com.fittrack.backend.entity.AuditLog;
import com.fittrack.backend.entity.enums.MemberStatus;
import com.fittrack.backend.repository.AuditLogRepository;
import com.fittrack.backend.repository.MemberRepository;
import com.fittrack.backend.service.AdminService;
import java.time.Instant;
import java.util.List;
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





