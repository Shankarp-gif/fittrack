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
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','TRAINER','RECEPTIONIST','USER')")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final MemberService memberService;
    private final AuthenticationContextHelper authContextHelper;

    @PostMapping("/check-in")
    public ResponseEntity<ApiResponse<AttendanceDTO>> checkIn(
        @Valid @RequestBody CheckInRequest request,
        Authentication authentication) {
        Long userOrgId = authContextHelper.getOrganizationId(authentication);

        // Verify member belongs to user's organization
        MemberDTO member = memberService.getMember(request.getMemberId());
        if (member.getOrganizationId() == null || !member.getOrganizationId().equals(userOrgId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("FORBIDDEN", "You do not have permission to check in this member"));
        }

        AttendanceDTO attendance = attendanceService.checkIn(request.getMemberId());
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Check-in successful", attendance));
    }

    @PostMapping("/check-out")
    public ResponseEntity<ApiResponse<AttendanceDTO>> checkOut(
        @Valid @RequestBody CheckOutRequest request,
        Authentication authentication) {
        Long userOrgId = authContextHelper.getOrganizationId(authentication);

        // Verify member belongs to user's organization
        MemberDTO member = memberService.getMember(request.getMemberId());
        if (member.getOrganizationId() == null || !member.getOrganizationId().equals(userOrgId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("FORBIDDEN", "You do not have permission to check out this member"));
        }

        AttendanceDTO attendance = attendanceService.checkOut(request.getMemberId());
        return ResponseEntity.ok(ApiResponse.success("Check-out successful", attendance));
    }

    @GetMapping("/today/{memberId}")
    public ResponseEntity<ApiResponse<AttendanceDTO>> getTodayAttendance(
        @PathVariable Long memberId,
        Authentication authentication) {
        Long userOrgId = authContextHelper.getOrganizationId(authentication);

         // Verify member belongs to user's organization
         MemberDTO member = memberService.getMember(memberId);
         if (member.getOrganizationId() == null || !member.getOrganizationId().equals(userOrgId)) {
             return ResponseEntity.status(HttpStatus.FORBIDDEN)
                 .body(ApiResponse.error("FORBIDDEN", "You do not have permission to view this member's attendance"));
         }

        AttendanceDTO attendance = attendanceService.getTodayAttendance(memberId);
        return ResponseEntity.ok(ApiResponse.success(attendance));
    }
}

