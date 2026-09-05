package com.fittrack.backend.controller;

import com.fittrack.backend.dto.ReportsDTO;
import com.fittrack.backend.dto.common.ApiResponse;
import com.fittrack.backend.service.ReportService;
import com.fittrack.backend.util.AuthenticationContextHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
public class ReportController {

    private final ReportService reportService;
    private final AuthenticationContextHelper authContextHelper;

    @GetMapping
    public ResponseEntity<ApiResponse<ReportsDTO.ReportsResponseDTO>> getReports(Authentication authentication) {
        Long orgId = authContextHelper.getOrganizationId(authentication);
        ReportsDTO.ReportsResponseDTO reports = reportService.getReports(orgId);
        return ResponseEntity.ok(ApiResponse.success("Reports fetched successfully", reports));
    }

    @GetMapping("/members")
    public ResponseEntity<ApiResponse<ReportsDTO.MemberReportDTO>> getMemberReport(Authentication authentication) {
        Long orgId = authContextHelper.getOrganizationId(authentication);
        ReportsDTO.MemberReportDTO memberReport = reportService.getMemberReport(orgId);
        return ResponseEntity.ok(ApiResponse.success("Member report fetched successfully", memberReport));
    }

    @GetMapping("/financial")
    public ResponseEntity<ApiResponse<ReportsDTO.FinancialReportDTO>> getFinancialReport(Authentication authentication) {
        Long orgId = authContextHelper.getOrganizationId(authentication);
        ReportsDTO.FinancialReportDTO financialReport = reportService.getFinancialReport(orgId);
        return ResponseEntity.ok(ApiResponse.success("Financial report fetched successfully", financialReport));
    }

    @GetMapping("/attendance")
    public ResponseEntity<ApiResponse<ReportsDTO.AttendanceReportDTO>> getAttendanceReport(Authentication authentication) {
        Long orgId = authContextHelper.getOrganizationId(authentication);
        ReportsDTO.AttendanceReportDTO attendanceReport = reportService.getAttendanceReport(orgId);
        return ResponseEntity.ok(ApiResponse.success("Attendance report fetched successfully", attendanceReport));
    }
}

