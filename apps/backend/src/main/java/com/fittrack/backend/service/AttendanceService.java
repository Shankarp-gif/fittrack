package com.fittrack.backend.service;

import com.fittrack.backend.dto.AttendanceDTO;
import com.fittrack.backend.dto.CheckInRequest;
import com.fittrack.backend.dto.CheckOutRequest;
import java.time.LocalDate;
import java.util.List;

public interface AttendanceService {
    /**
     * Check in a member for the day
     * Validates: Not already checked in on the same day
     * @param memberId ID of the member checking in
     * @param userId ID of the staff member performing the check-in
     */
    AttendanceDTO checkIn(Long memberId, Long userId);

    /**
     * Check out a member for the day
     * Validates: Must have checked in first on the same day
     * @param memberId ID of the member checking out
     * @param userId ID of the staff member performing the check-out
     */
    AttendanceDTO checkOut(Long memberId, Long userId);

    /**
     * Get today's attendance record for a member
     */
    AttendanceDTO getTodayAttendance(Long memberId);

    /**
     * Get all attendance records for a branch on a specific date
     */
    List<AttendanceDTO> getAttendanceByDate(Long branchId, LocalDate date);

    /**
     * Get attendance history for a member within a date range
     */
    List<AttendanceDTO> getMemberAttendanceHistory(Long memberId, LocalDate startDate, LocalDate endDate);

    /**
     * Get total days attended (with checkout) in a date range
     */
    long getTotalDaysAttended(Long memberId, LocalDate startDate, LocalDate endDate);

    /**
     * Check if member is currently checked in today
     */
    boolean isCheckedInToday(Long memberId);

    /**
     * Get attendance records for members under a supervisor
     */
    List<AttendanceDTO> getAttendanceByDateForSupervisor(Long supervisorId, LocalDate date);

    /**
     * Get attendance history for members under a supervisor
     */
    List<AttendanceDTO> getSupervisedAttendanceHistory(Long supervisorId, LocalDate startDate, LocalDate endDate);
}
