package com.fittrack.backend.service;

import com.fittrack.backend.dto.AdminDashboardDTO;
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
}

