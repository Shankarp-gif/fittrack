package com.fittrack.backend.dto;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    // Member statistics
    private long totalMembers;
    private long activeMembers;
    private long newMembersThisMonth;
    private long expiringMemberships;
    private long expiredMemberships;

    // Attendance statistics
    private long todayAttendance;
    private long todayPresent;
    private long todayAbsent;
    private double avgDailyAttendance;

    // Financial statistics
    private BigDecimal pendingPayments;
    private BigDecimal todayCollection;
    private BigDecimal monthlyRevenue;
    private BigDecimal monthlyExpenses;
    private BigDecimal netRevenue;

    // Staff & classes
    private long activeTrainers;
    private long todaysClasses;
    private long newLeads;
    private double leadConversionRate;

    // Membership renewals
    private long renewalsThisMonth;
}

