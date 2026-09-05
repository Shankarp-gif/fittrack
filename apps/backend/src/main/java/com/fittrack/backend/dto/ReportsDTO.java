package com.fittrack.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class ReportsDTO {

    public record MemberReportDTO(
        long totalMembers,
        long activeMembers,
        long expiringSoonMembers,
        long expiredMembers,
        long newMembersThisMonth,
        double memberGrowthPercentage
    ) {
    }

    public record FinancialReportDTO(
        BigDecimal totalRevenue,
        BigDecimal thisMonthRevenue,
        BigDecimal pendingPayments,
        BigDecimal overduePayments,
        BigDecimal averageMembershipValue,
        List<MonthlySalesDTO> revenueTrend
    ) {
    }

    public record MonthlySalesDTO(
        String month,
        BigDecimal amount
    ) {
    }

    public record AttendanceReportDTO(
        double averageAttendanceRate,
        long thisMonthAttendance,
        long dailyAverage,
        List<PeakHourDTO> peakHours
    ) {
    }

    public record PeakHourDTO(
        String hour,
        long count
    ) {
    }

    public record ReportsResponseDTO(
        MemberReportDTO memberReport,
        FinancialReportDTO financialReport,
        AttendanceReportDTO attendanceReport,
        String generatedAt
    ) {
    }
}

