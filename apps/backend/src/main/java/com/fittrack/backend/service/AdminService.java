package com.fittrack.backend.service;

import com.fittrack.backend.dto.AdminDashboardDTO;
import com.fittrack.backend.dto.HierarchyAuditDTO;
import java.util.List;

/**
 * Service for admin dashboard operations
 */
public interface AdminService {

    /**
     * Get organization statistics for the admin dashboard
     */
    AdminDashboardDTO.StatsDTO getOrganizationStats(Long organizationId);

    /**
     * Get recent activities for the organization
     */
    List<AdminDashboardDTO.RecentActivityDTO> getRecentActivities(Long organizationId);

    /**
     * Get organization/user hierarchy audit findings for admins and super admins.
     */
    HierarchyAuditDTO.SnapshotDTO getHierarchyAudit(String requesterRole, Long organizationId);
}

