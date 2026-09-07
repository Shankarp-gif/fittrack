package com.fittrack.backend.controller;

import com.fittrack.backend.dto.AttendanceDTO;
import com.fittrack.backend.dto.CheckInRequest;
import com.fittrack.backend.dto.CheckOutRequest;
import com.fittrack.backend.dto.MemberDTO;
import com.fittrack.backend.dto.common.ApiResponse;
import com.fittrack.backend.service.AttendanceService;
import com.fittrack.backend.service.MemberService;
import com.fittrack.backend.util.AuthenticationContextHelper;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','TRAINER','GYM_MAINTENANCE_MANAGER','USER')")
public class AttendanceController {

    private static final Logger logger = LoggerFactory.getLogger(AttendanceController.class);

    private final AttendanceService attendanceService;
    private final MemberService memberService;
    private final AuthenticationContextHelper authContextHelper;

    @PostMapping("/check-in")
    public ResponseEntity<ApiResponse<AttendanceDTO>> checkIn(
        @Valid @RequestBody CheckInRequest request,
        Authentication authentication) {

        try {
            String userEmail = authContextHelper.getUserEmail(authentication);
            Long userId = authContextHelper.getUserId(authentication);
            Long userOrgId = authContextHelper.getOrganizationId(authentication);

            logger.info("Check-in request: member={}, user={}, userId={}, org={}", request.getMemberId(), userEmail, userId, userOrgId);

            // Verify member belongs to user's organization
            MemberDTO member = memberService.getMember(request.getMemberId());
            if (member.getOrganizationId() == null || !member.getOrganizationId().equals(userOrgId)) {
                logger.warn("Unauthorized check-in attempt: user={} (org={}) trying to check in member={} (org={})",
                    userEmail, userOrgId, request.getMemberId(), member.getOrganizationId());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("FORBIDDEN", "You do not have permission to check in this member"));
            }

            AttendanceDTO attendance = attendanceService.checkIn(request.getMemberId(), userId);
            logger.info("Check-in successful: member={}, user={}, userId={}, attendanceId={}",
                request.getMemberId(), userEmail, userId, attendance.getId());

            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Check-in successful", attendance));
        } catch (Exception ex) {
            logger.error("Error during check-in for member {}", request.getMemberId(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("ERROR", "Failed to check in: " + ex.getMessage()));
        }
    }

    @PostMapping("/check-out")
    public ResponseEntity<ApiResponse<AttendanceDTO>> checkOut(
        @Valid @RequestBody CheckOutRequest request,
        Authentication authentication) {

        try {
            String userEmail = authContextHelper.getUserEmail(authentication);
            Long userId = authContextHelper.getUserId(authentication);
            Long userOrgId = authContextHelper.getOrganizationId(authentication);

            logger.info("Check-out request: member={}, user={}, userId={}, org={}", request.getMemberId(), userEmail, userId, userOrgId);

            // Verify member belongs to user's organization
            MemberDTO member = memberService.getMember(request.getMemberId());
            if (member.getOrganizationId() == null || !member.getOrganizationId().equals(userOrgId)) {
                logger.warn("Unauthorized check-out attempt: user={} (org={}) trying to check out member={} (org={})",
                    userEmail, userOrgId, request.getMemberId(), member.getOrganizationId());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("FORBIDDEN", "You do not have permission to check out this member"));
            }

            AttendanceDTO attendance = attendanceService.checkOut(request.getMemberId(), userId);
            logger.info("Check-out successful: member={}, user={}, userId={}, attendanceId={}",
                request.getMemberId(), userEmail, userId, attendance.getId());

            return ResponseEntity.ok(ApiResponse.success("Check-out successful", attendance));
        } catch (Exception ex) {
            logger.error("Error during check-out for member {}", request.getMemberId(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("ERROR", "Failed to check out: " + ex.getMessage()));
        }
    }

    @GetMapping("/today/{memberId}")
    public ResponseEntity<ApiResponse<AttendanceDTO>> getTodayAttendance(
        @PathVariable Long memberId,
        Authentication authentication) {

        try {
            String userEmail = authContextHelper.getUserEmail(authentication);
            Long userOrgId = authContextHelper.getOrganizationId(authentication);

            logger.info("Get today attendance request: member={}, user={}, org={}", memberId, userEmail, userOrgId);

             // Verify member belongs to user's organization
             MemberDTO member = memberService.getMember(memberId);
             if (member.getOrganizationId() == null || !member.getOrganizationId().equals(userOrgId)) {
                 logger.warn("Unauthorized attendance view attempt: user={} (org={}) trying to view member={} (org={})",
                     userEmail, userOrgId, memberId, member.getOrganizationId());
                 return ResponseEntity.status(HttpStatus.FORBIDDEN)
                     .body(ApiResponse.error("FORBIDDEN", "You do not have permission to view this member's attendance"));
             }

            AttendanceDTO attendance = attendanceService.getTodayAttendance(memberId);
            logger.debug("Today attendance retrieved: member={}, hasRecord={}", memberId, attendance != null);

             return ResponseEntity.ok(ApiResponse.success(attendance));
         } catch (Exception ex) {
             logger.error("Error retrieving today attendance for member {}", memberId, ex);
             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                 .body(ApiResponse.error("ERROR", "Failed to retrieve attendance: " + ex.getMessage()));
         }
     }

    /**
     * Get attendance history for a member within a date range
     * @param memberId Member ID
     * @param startDate Start date (format: yyyy-MM-dd)
     * @param endDate End date (format: yyyy-MM-dd)
     */
    @GetMapping("/history/{memberId}")
    public ResponseEntity<ApiResponse<List<AttendanceDTO>>> getAttendanceHistory(
        @PathVariable Long memberId,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
        Authentication authentication) {

        try {
            String userEmail = authContextHelper.getUserEmail(authentication);
            Long userOrgId = authContextHelper.getOrganizationId(authentication);

            logger.info("Get attendance history request: member={}, user={}, org={}, startDate={}, endDate={}",
                memberId, userEmail, userOrgId, startDate, endDate);

            MemberDTO member = memberService.getMember(memberId);
            if (member.getOrganizationId() == null || !member.getOrganizationId().equals(userOrgId)) {
                logger.warn("Unauthorized history view attempt: user={} (org={}) trying to view member={} (org={})",
                    userEmail, userOrgId, memberId, member.getOrganizationId());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("FORBIDDEN", "You do not have permission to view this member's attendance history"));
            }

            List<AttendanceDTO> history = attendanceService.getMemberAttendanceHistory(memberId, startDate, endDate);
            logger.debug("Attendance history retrieved: member={}, recordCount={}", memberId, history.size());

            return ResponseEntity.ok(ApiResponse.success("Attendance history retrieved", history));
        } catch (Exception ex) {
            logger.error("Error retrieving attendance history for member {} (dates: {} to {})", memberId, startDate, endDate, ex);
            throw ex;
        }
    }

    /**
     * Get total days attended in a date range
     */
    @GetMapping("/stats/{memberId}")
    public ResponseEntity<ApiResponse<AttendanceStatsResponse>> getAttendanceStats(
        @PathVariable Long memberId,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
        Authentication authentication) {

        try {
            String userEmail = authContextHelper.getUserEmail(authentication);
            Long userOrgId = authContextHelper.getOrganizationId(authentication);

            logger.info("Get attendance stats request: member={}, user={}, org={}, startDate={}, endDate={}",
                memberId, userEmail, userOrgId, startDate, endDate);

            MemberDTO member = memberService.getMember(memberId);
            if (member.getOrganizationId() == null || !member.getOrganizationId().equals(userOrgId)) {
                logger.warn("Unauthorized stats view attempt: user={} (org={}) trying to view member={} (org={})",
                    userEmail, userOrgId, memberId, member.getOrganizationId());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("FORBIDDEN", "You do not have permission to view this member's stats"));
            }

            long totalDaysAttended = attendanceService.getTotalDaysAttended(memberId, startDate, endDate);
            long totalDays = ChronoUnit.DAYS.between(startDate, endDate) + 1;
            double attendancePercentage = totalDays > 0 ? (totalDaysAttended * 100.0) / totalDays : 0.0;

            AttendanceStatsResponse stats = new AttendanceStatsResponse(
                totalDaysAttended,
                (int) totalDays,
                attendancePercentage
            );

            logger.debug("Attendance stats retrieved: member={}, attendance={}%", memberId, attendancePercentage);

            return ResponseEntity.ok(ApiResponse.success("Attendance stats retrieved", stats));
        } catch (Exception ex) {
            logger.error("Error retrieving attendance stats for member {} (dates: {} to {})", memberId, startDate, endDate, ex);
            throw ex;
        }
    }

    /**
     * Check if member is currently checked in
     */
    @GetMapping("/status/{memberId}")
    public ResponseEntity<ApiResponse<CheckInStatusResponse>> getCheckInStatus(
        @PathVariable Long memberId,
        Authentication authentication) {

        try {
            String userEmail = authContextHelper.getUserEmail(authentication);
            Long userOrgId = authContextHelper.getOrganizationId(authentication);

            logger.info("Get check-in status request: member={}, user={}, org={}", memberId, userEmail, userOrgId);

            MemberDTO member = memberService.getMember(memberId);
            if (member.getOrganizationId() == null || !member.getOrganizationId().equals(userOrgId)) {
                logger.warn("Unauthorized status view attempt: user={} (org={}) trying to view member={} (org={})",
                    userEmail, userOrgId, memberId, member.getOrganizationId());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("FORBIDDEN", "You do not have permission to view this member's status"));
            }

            boolean isCheckedIn = attendanceService.isCheckedInToday(memberId);
            CheckInStatusResponse response = new CheckInStatusResponse(
                memberId,
                isCheckedIn,
                isCheckedIn ? "Member is currently checked in" : "Member is not checked in"
            );

            logger.debug("Check-in status retrieved: member={}, checkedIn={}", memberId, isCheckedIn);

            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception ex) {
            logger.error("Error retrieving check-in status for member {}", memberId, ex);
            throw ex;
        }
    }

    /**
     * Get all attendance records for a specific date (for dashboard/reports)
     * This endpoint filters based on user role:
     * - USER: Only their own attendance
     * - ADMIN/GYM_MAINTENANCE_MANAGER/SUPER_ADMIN: Their organization's attendance
     * - Can also filter by supervisor for hierarchy
     */
    @GetMapping("/records")
    public ResponseEntity<ApiResponse<List<AttendanceDTO>>> getRecordsByDate(
        @RequestParam(value = "date", required = false) String date,
        Authentication authentication) {

        try {
            LocalDate attendanceDate = date != null && !date.isEmpty()
                ? LocalDate.parse(date)
                : LocalDate.now();

            Long branchId = 1L; // Default branch
            Long userId = null;
            String userRole = null;
            String userEmail = null;
            Long userOrgId = null;

            if (authentication != null) {
                try {
                    branchId = authContextHelper.getBranchId(authentication);
                    userId = authContextHelper.getUserId(authentication);
                    userRole = authContextHelper.getUserRole(authentication);
                    userEmail = authContextHelper.getUserEmail(authentication);
                    userOrgId = authContextHelper.getOrganizationId(authentication);
                } catch (Exception ignored) {
                    // Continue with default
                }
            }

            logger.info("Get records for date: {} (branch={}, userId={}, role={})", attendanceDate, branchId, userId, userRole);

            List<AttendanceDTO> records;

            // Filter based on user role
            if ("USER".equalsIgnoreCase(userRole)) {
                // Members only see their own attendance
                Long memberId = null;
                if (userEmail != null && userOrgId != null) {
                    List<MemberDTO> matches = memberService
                        .searchMembers(userOrgId, userEmail, PageRequest.of(0, 1))
                        .getContent();
                    if (!matches.isEmpty()) {
                        memberId = matches.get(0).getId();
                    }
                }

                if (memberId == null) {
                    logger.warn("No member mapping found for user={} in org={}; returning empty attendance list", userEmail, userOrgId);
                    records = new java.util.ArrayList<>();
                } else {
                    records = attendanceService.getMemberAttendanceHistory(memberId, attendanceDate, attendanceDate)
                    .stream()
                    .map(dto -> AttendanceDTO.builder()
                        .id(dto.getId())
                        .memberId(dto.getMemberId())
                        .memberName(dto.getMemberName())
                        .organizationId(dto.getOrganizationId())
                        .organizationName(dto.getOrganizationName())
                        .branchId(dto.getBranchId())
                        .branchName(dto.getBranchName())
                        .checkInTime(dto.getCheckInTime())
                        .checkOutTime(dto.getCheckOutTime())
                        .createdAt(dto.getCreatedAt())
                        .attendanceDate(dto.getAttendanceDate())
                        .duration(dto.getDuration())
                        .status(dto.getStatus())
                        .recordedByUserId(dto.getRecordedByUserId())
                        .recordedByUserName(dto.getRecordedByUserName())
                        .supervisorId(dto.getSupervisorId())
                        .supervisorName(dto.getSupervisorName())
                        .build())
                    .collect(Collectors.toList());
                }
            } else if ("ADMIN".equalsIgnoreCase(userRole) || "GYM_MAINTENANCE_MANAGER".equalsIgnoreCase(userRole) || "SUPER_ADMIN".equalsIgnoreCase(userRole)) {
                // Admin and gym maintenance manager see all attendance for their organization
                records = attendanceService.getAttendanceByDate(branchId, attendanceDate)
                    .stream()
                    .map(dto -> AttendanceDTO.builder()
                        .id(dto.getId())
                        .memberId(dto.getMemberId())
                        .memberName(dto.getMemberName())
                        .organizationId(dto.getOrganizationId())
                        .organizationName(dto.getOrganizationName())
                        .branchId(dto.getBranchId())
                        .branchName(dto.getBranchName())
                        .checkInTime(dto.getCheckInTime())
                        .checkOutTime(dto.getCheckOutTime())
                        .createdAt(dto.getCreatedAt())
                        .attendanceDate(dto.getAttendanceDate())
                        .duration(dto.getDuration())
                        .status(dto.getStatus())
                        .recordedByUserId(dto.getRecordedByUserId())
                        .recordedByUserName(dto.getRecordedByUserName())
                        .supervisorId(dto.getSupervisorId())
                        .supervisorName(dto.getSupervisorName())
                        .build())
                    .collect(Collectors.toList());
            } else {
                records = new java.util.ArrayList<>();
            }

            logger.debug("Retrieved {} attendance records for {}", records.size(), attendanceDate);

            return ResponseEntity.ok(ApiResponse.success("Attendance records retrieved", records));
        } catch (Exception ex) {
            logger.error("Error retrieving attendance records", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("ERROR", "Failed to retrieve attendance records: " + ex.getMessage()));
        }
    }

    /**
     * Attendance Statistics Response DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttendanceStatsResponse {
        private long totalDaysAttended;
        private int totalDays;
        private double attendancePercentage;
    }

    /**
     * Check-In Status Response DTO
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CheckInStatusResponse {
        private Long memberId;
        private boolean checkedIn;
        private String message;
    }
}
