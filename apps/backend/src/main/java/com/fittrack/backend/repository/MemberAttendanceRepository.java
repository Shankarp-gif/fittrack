package com.fittrack.backend.repository;

import com.fittrack.backend.entity.MemberAttendance;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MemberAttendanceRepository extends JpaRepository<MemberAttendance, Long> {
    List<MemberAttendance> findByMemberIdAndAttendanceDate(Long memberId, LocalDate date);

    List<MemberAttendance> findByUserIdAndAttendanceDate(Long userId, LocalDate date);

    Page<MemberAttendance> findByBranchIdAndAttendanceDate(Long branchId, LocalDate date, Pageable pageable);

    @Query("SELECT COUNT(ma) FROM MemberAttendance ma WHERE ma.branch.id = :branchId AND ma.attendanceDate = :date AND ma.checkOutTime IS NOT NULL")
    long countCheckedOutToday(@Param("branchId") Long branchId, @Param("date") LocalDate date);

    @Query("SELECT COUNT(ma) FROM MemberAttendance ma WHERE ma.branch.id = :branchId AND ma.attendanceDate = :date AND ma.checkOutTime IS NULL")
    long countCheckedInToday(@Param("branchId") Long branchId, @Param("date") LocalDate date);

    @Query("SELECT COUNT(DISTINCT ma.member.id) FROM MemberAttendance ma WHERE ma.branch.id = :branchId AND ma.attendanceDate = :date")
    long countUniqueAttendanceToday(@Param("branchId") Long branchId, @Param("date") LocalDate date);

    @Query("SELECT COUNT(ma) FROM MemberAttendance ma WHERE ma.member.id = :memberId AND ma.attendanceDate >= :startDate AND ma.attendanceDate <= :endDate")
    long countAttendanceInRange(@Param("memberId") Long memberId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}

