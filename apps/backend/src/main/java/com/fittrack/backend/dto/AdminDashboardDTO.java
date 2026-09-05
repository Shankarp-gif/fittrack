package com.fittrack.backend.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTOs for Admin Dashboard data
 */
public class AdminDashboardDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatsDTO {
        private long totalMembers;
        private long activeMembers;
        private long expiredMembers;
        private double totalRevenue;
        private double pendingCollections;
        private long todayCheckIns;
        private long weeklyActiveMembers;
        private long monthlyGrowth;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentActivityDTO {
        private long id;
        private String memberName;
        private String action;
        private String timestamp;
        private String type;  // enrollment, payment, attendance, alert
    }
}

