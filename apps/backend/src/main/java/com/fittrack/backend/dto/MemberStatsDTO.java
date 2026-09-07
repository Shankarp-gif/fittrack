package com.fittrack.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberStatsDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CurrentMembership {
        private String planName;
        private Integer daysRemaining;
        private LocalDate endDate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttendanceStats {
        private Integer days;
        private Double percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyStats {
        private Integer workoutsCompleted;
        private Integer personalTrainingSessions;
        private Integer totalMinutes;
        private Integer caloriesBurned;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NextFeePayment {
        private BigDecimal amount;
        private LocalDate dueDate;
        private String status;  // PAID, PENDING, OVERDUE
    }

    private CurrentMembership currentMembership;
    private AttendanceStats thisMonthAttendance;
    private MonthlyStats thisMonthStats;
    private NextFeePayment nextFeePayment;
}

