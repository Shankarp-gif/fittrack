package com.fittrack.backend.controller;

import com.fittrack.backend.dto.common.ApiResponse;
import com.fittrack.backend.dto.AdminDashboardDTO;
import com.fittrack.backend.dto.HierarchyAuditDTO;
import com.fittrack.backend.service.AdminService;
import com.fittrack.backend.util.AuthenticationContextHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final AuthenticationContextHelper authContextHelper;

    /**
     * Get admin dashboard statistics for the authenticated user's organization
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminDashboardDTO.StatsDTO>> getStats(Authentication authentication) {
        Long orgId = authContextHelper.getOrganizationId(authentication);
        AdminDashboardDTO.StatsDTO stats = adminService.getOrganizationStats(orgId);
        return ResponseEntity.ok(ApiResponse.success("Stats fetched successfully", stats));
    }

    /**
     * Get recent activities for the authenticated user's organization
     */
    @GetMapping("/recent-activities")
    public ResponseEntity<ApiResponse<List<AdminDashboardDTO.RecentActivityDTO>>> getRecentActivities(
        Authentication authentication) {
        Long orgId = authContextHelper.getOrganizationId(authentication);
        List<AdminDashboardDTO.RecentActivityDTO> activities = adminService.getRecentActivities(orgId);
        return ResponseEntity.ok(ApiResponse.success("Recent activities fetched successfully", activities));
    }

    @GetMapping("/hierarchy-audit")
    public ResponseEntity<ApiResponse<HierarchyAuditDTO.SnapshotDTO>> getHierarchyAudit(Authentication authentication) {
        String role = authContextHelper.getUserRole(authentication);
        Long orgId = "SUPER_ADMIN".equalsIgnoreCase(role) ? null : authContextHelper.getOrganizationId(authentication);

        HierarchyAuditDTO.SnapshotDTO snapshot = adminService.getHierarchyAudit(role, orgId);
        return ResponseEntity.ok(ApiResponse.success("Hierarchy audit fetched successfully", snapshot));
    }
}

