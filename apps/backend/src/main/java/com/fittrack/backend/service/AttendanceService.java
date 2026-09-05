package com.fittrack.backend.service;

import com.fittrack.backend.dto.AttendanceDTO;
import com.fittrack.backend.dto.CheckInRequest;
import com.fittrack.backend.dto.CheckOutRequest;
import java.time.LocalDate;
import java.util.List;

public interface AttendanceService {
    AttendanceDTO checkIn(Long memberId);

    AttendanceDTO checkOut(Long memberId);

    AttendanceDTO getTodayAttendance(Long memberId);

    List<AttendanceDTO> getAttendanceByDate(Long branchId, LocalDate date);
}

