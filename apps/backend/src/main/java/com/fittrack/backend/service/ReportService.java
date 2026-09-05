package com.fittrack.backend.service;

import com.fittrack.backend.dto.ReportsDTO;

public interface ReportService {
    ReportsDTO.ReportsResponseDTO getReports(Long organizationId);

    ReportsDTO.MemberReportDTO getMemberReport(Long organizationId);

    ReportsDTO.FinancialReportDTO getFinancialReport(Long organizationId);

    ReportsDTO.AttendanceReportDTO getAttendanceReport(Long organizationId);
}

