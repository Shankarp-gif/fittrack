package com.fittrack.backend.service.impl;

import com.fittrack.backend.dto.ReportsDTO;
import com.fittrack.backend.entity.enums.MemberStatus;
import com.fittrack.backend.repository.MemberAttendanceRepository;
import com.fittrack.backend.repository.MemberRepository;
import com.fittrack.backend.repository.MembershipRepository;
import com.fittrack.backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private final MemberRepository memberRepository;
    private final MembershipRepository membershipRepository;
    private final MemberAttendanceRepository memberAttendanceRepository;

    @Override
    public ReportsDTO.ReportsResponseDTO getReports(Long organizationId) {
        return new ReportsDTO.ReportsResponseDTO(
            getMemberReport(organizationId),
            getFinancialReport(organizationId),
            getAttendanceReport(organizationId),
            LocalDate.now().toString()
        );
    }

    @Override
    public ReportsDTO.MemberReportDTO getMemberReport(Long organizationId) {
        long totalMembers = memberRepository.countByOrganizationId(organizationId);
        long activeMembers = memberRepository.countByOrganizationIdAndStatus(organizationId, MemberStatus.ACTIVE);
        long expiringSoonMembers = memberRepository.countByOrganizationIdAndStatus(organizationId, MemberStatus.EXPIRING_SOON);
        long expiredMembers = memberRepository.countByOrganizationIdAndStatus(organizationId, MemberStatus.EXPIRED);

        // Calculate new members this month
        long newMembersThisMonth = calculateNewMembersThisMonth(organizationId);

        // Calculate growth percentage (simplified: new members / total * 100)
        double memberGrowthPercentage = totalMembers > 0 ? (double) newMembersThisMonth / totalMembers : 0;

        return new ReportsDTO.MemberReportDTO(
            totalMembers,
            activeMembers,
            expiringSoonMembers,
            expiredMembers,
            newMembersThisMonth,
            memberGrowthPercentage
        );
    }

    @Override
    public ReportsDTO.FinancialReportDTO getFinancialReport(Long organizationId) {
        // For demo purposes, using placeholder values
        // In a real application, this would aggregate from Payment/Invoice tables
        BigDecimal totalRevenue = BigDecimal.valueOf(125000);
        BigDecimal thisMonthRevenue = BigDecimal.valueOf(15000);
        BigDecimal pendingPayments = BigDecimal.valueOf(5000);
        BigDecimal overduePayments = BigDecimal.valueOf(2000);

        long totalMembers = memberRepository.countByOrganizationId(organizationId);
        BigDecimal averageMembershipValue = totalMembers > 0
            ? totalRevenue.divide(BigDecimal.valueOf(totalMembers))
            : BigDecimal.ZERO;

        // Generate 12-month revenue trend
        List<ReportsDTO.MonthlySalesDTO> revenueTrend = generateRevenueTrend();

        return new ReportsDTO.FinancialReportDTO(
            totalRevenue,
            thisMonthRevenue,
            pendingPayments,
            overduePayments,
            averageMembershipValue,
            revenueTrend
        );
    }

    @Override
    public ReportsDTO.AttendanceReportDTO getAttendanceReport(Long organizationId) {
        LocalDate today = LocalDate.now();
        LocalDate monthStart = today.withDayOfMonth(1);

        // For demo, using placeholder calculations
        long thisMonthAttendance = 250; // This would be calculated from actual attendance data
        long daysInMonth = today.lengthOfMonth();
        long dailyAverage = daysInMonth > 0 ? thisMonthAttendance / daysInMonth : 0;

        double averageAttendanceRate = 0.85; // 85% average attendance rate

        // Generate peak hours
        List<ReportsDTO.PeakHourDTO> peakHours = generatePeakHours();

        return new ReportsDTO.AttendanceReportDTO(
            averageAttendanceRate,
            thisMonthAttendance,
            dailyAverage,
            peakHours
        );
    }

    private long calculateNewMembersThisMonth(Long organizationId) {
        LocalDate monthStart = LocalDate.now().withDayOfMonth(1);
        LocalDate monthEnd = LocalDate.now();

        // This would need a proper query in the repository
        // For now, returning a placeholder value
        return 5L;
    }

    private List<ReportsDTO.MonthlySalesDTO> generateRevenueTrend() {
        List<ReportsDTO.MonthlySalesDTO> trend = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM");

        for (int i = 11; i >= 0; i--) {
            YearMonth month = YearMonth.now().minusMonths(i);
            LocalDate date = month.atDay(1);
            String monthName = date.format(formatter);

            // Generate varying revenue values
            double baseRevenue = 10000 + (Math.random() * 10000);
            trend.add(new ReportsDTO.MonthlySalesDTO(
                monthName,
                BigDecimal.valueOf(baseRevenue)
            ));
        }

        return trend;
    }

    private List<ReportsDTO.PeakHourDTO> generatePeakHours() {
        List<ReportsDTO.PeakHourDTO> peakHours = new ArrayList<>();

        String[] hours = {"6 AM", "7 AM", "8 AM", "9 AM", "5 PM", "6 PM", "7 PM", "8 PM"};
        long[] counts = {45, 85, 120, 95, 110, 150, 130, 80};

        for (int i = 0; i < hours.length; i++) {
            peakHours.add(new ReportsDTO.PeakHourDTO(hours[i], counts[i]));
        }

        return peakHours;
    }
}

