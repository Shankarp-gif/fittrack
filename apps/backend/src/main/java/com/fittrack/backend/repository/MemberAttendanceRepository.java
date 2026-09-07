package com.fittrack.backend.repository;

import com.fittrack.backend.entity.MemberAttendance;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MemberAttendanceRepository extends JpaRepository<MemberAttendance, Long> {
    List<MemberAttendance> findByMemberIdAndAttendanceDate(Long memberId, LocalDate date);

    Optional<MemberAttendance> findTopByMemberIdAndAttendanceDateOrderByCheckInTimeDesc(Long memberId, LocalDate date);

    Optional<MemberAttendance> findTopByMemberIdAndAttendanceDateAndStatusOrderByCheckInTimeDesc(
        Long memberId,
        LocalDate date,
        String status
    );

    List<MemberAttendance> findByUserIdAndAttendanceDate(Long userId, LocalDate date);

    Optional<MemberAttendance> findTopByUserIdAndAttendanceDateOrderByCheckInTimeDesc(Long userId, LocalDate date);

    Optional<MemberAttendance> findTopByUserIdAndAttendanceDateAndStatusOrderByCheckInTimeDesc(
        Long userId,
        LocalDate date,
        String status
    );

    Page<MemberAttendance> findByBranchIdAndAttendanceDate(Long branchId, LocalDate date, Pageable pageable);

    /**
     * Get all attendance records for a member between dates (inclusive)
     */
    List<MemberAttendance> findByMemberIdAndAttendanceDateBetween(Long memberId, LocalDate startDate, LocalDate endDate);

    /**
     * Count completed attendances (with checkout) in a date range
     */
    @Query("SELECT COUNT(ma) FROM MemberAttendance ma WHERE ma.member.id = :memberId AND ma.attendanceDate >= :startDate AND ma.attendanceDate <= :endDate AND ma.checkOutTime IS NOT NULL AND ma.status = :status")
    long countByMemberIdAndAttendanceDateBetweenAndStatusAndCheckOutTimeIsNotNull(
        @Param("memberId") Long memberId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        @Param("status") String status
    );

    @Query("SELECT COUNT(ma) FROM MemberAttendance ma WHERE ma.branch.id = :branchId AND ma.attendanceDate = :date AND ma.checkOutTime IS NOT NULL")
    long countCheckedOutToday(@Param("branchId") Long branchId, @Param("date") LocalDate date);

    @Query("SELECT COUNT(ma) FROM MemberAttendance ma WHERE ma.branch.id = :branchId AND ma.attendanceDate = :date AND ma.checkOutTime IS NULL")
    long countCheckedInToday(@Param("branchId") Long branchId, @Param("date") LocalDate date);

    @Query("SELECT COUNT(DISTINCT ma.member.id) FROM MemberAttendance ma WHERE ma.branch.id = :branchId AND ma.attendanceDate = :date")
    long countUniqueAttendanceToday(@Param("branchId") Long branchId, @Param("date") LocalDate date);

    @Query("SELECT COUNT(ma) FROM MemberAttendance ma WHERE ma.member.id = :memberId AND ma.attendanceDate >= :startDate AND ma.attendanceDate <= :endDate")
    long countAttendanceInRange(@Param("memberId") Long memberId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    /**
     * Get attendance records by supervisor
     */
    Page<MemberAttendance> findBySupervisorIdAndAttendanceDate(Long supervisorId, LocalDate date, Pageable pageable);

    /**
     * Get attendance records by supervisor between dates
     */
    List<MemberAttendance> findBySupervisorIdAndAttendanceDateBetween(Long supervisorId, LocalDate startDate, LocalDate endDate);
}
