package com.fittrack.backend.controller;

import com.fittrack.backend.dto.common.ApiResponse;
import com.fittrack.backend.dto.CreateMemberRequest;
import com.fittrack.backend.dto.MemberDTO;
import com.fittrack.backend.dto.MemberStatsDTO;
import com.fittrack.backend.dto.MembershipDTO;
import com.fittrack.backend.dto.common.PaginatedResponse;
import com.fittrack.backend.entity.Payment;
import com.fittrack.backend.repository.PaymentRepository;
import com.fittrack.backend.service.AttendanceService;
import com.fittrack.backend.service.MemberService;
import com.fittrack.backend.service.MembershipService;
import com.fittrack.backend.util.AuthenticationContextHelper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','TRAINER','RECEPTIONIST')")
public class MemberController {

    private static final Logger logger = LoggerFactory.getLogger(MemberController.class);

    private final MemberService memberService;
    private final MembershipService membershipService;
    private final AttendanceService attendanceService;
    private final PaymentRepository paymentRepository;
    private final AuthenticationContextHelper authContextHelper;

    @PostMapping
    public ResponseEntity<ApiResponse<MemberDTO>> createMember(
        @Valid @RequestBody CreateMemberRequest request,
        Authentication authentication) {
        Long orgId = authContextHelper.getOrganizationId(authentication);
        Long branchId = authContextHelper.getBranchId(authentication);
        MemberDTO member = memberService.createMember(orgId, branchId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Member created successfully", member));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MemberDTO>> getMember(
        @PathVariable Long id,
        Authentication authentication) {
        Long orgId = authContextHelper.getOrganizationId(authentication);
        // Verify that the member belongs to the user's organization
         MemberDTO member = memberService.getMember(id);
         if (member.getOrganizationId() == null || !member.getOrganizationId().equals(orgId)) {
             return ResponseEntity.status(HttpStatus.FORBIDDEN)
                 .body(ApiResponse.error("FORBIDDEN", "You do not have permission to access this member"));
         }
         return ResponseEntity.ok(ApiResponse.success(member));
    }

    @GetMapping("/{id}/stats")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','TRAINER','RECEPTIONIST','USER')")
    public ResponseEntity<ApiResponse<MemberStatsDTO>> getMemberStats(
        @PathVariable Long id,
        Authentication authentication) {
        try {
            String userEmail = authContextHelper.getUserEmail(authentication);
            Long userOrgId = null;

            try {
                userOrgId = authContextHelper.getOrganizationId(authentication);
            } catch (AuthenticationException ignored) {
                MemberDTO linkedMember = memberService.findMemberByEmail(userEmail).orElse(null);
                if (linkedMember != null) {
                    userOrgId = linkedMember.getOrganizationId();
                    if ("USER".equalsIgnoreCase(authContextHelper.getUserRole(authentication)) && !linkedMember.getId().equals(id)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(ApiResponse.error("FORBIDDEN", "You do not have permission to view this member's stats"));
                    }
                }
            }

            logger.info("Get member stats request: member={}, user={}, org={}", id, userEmail, userOrgId);

            if (userOrgId == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("FORBIDDEN", "No organization linked to this account"));
            }

            // Verify member belongs to organization
            MemberDTO member = memberService.getMember(id);
            if (member.getOrganizationId() == null || !member.getOrganizationId().equals(userOrgId)) {
                logger.warn("Unauthorized stats view attempt: user={} (org={}) trying to view member={} (org={})",
                    userEmail, userOrgId, id, member.getOrganizationId());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("FORBIDDEN", "You do not have permission to view this member's stats"));
            }

            MemberStatsDTO stats = buildMemberStats(id);
            logger.debug("Member stats retrieved: member={}, user={}", id, userEmail);

            return ResponseEntity.ok(ApiResponse.success("Member stats retrieved", stats));
        } catch (Exception ex) {
            logger.error("Error retrieving member stats for member {}", id, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("ERROR", "Failed to retrieve member stats"));
        }
    }

    private MemberStatsDTO buildMemberStats(Long memberId) {
        MemberStatsDTO stats = new MemberStatsDTO();
        MembershipDTO currentMembership = null;

        // Get current membership
        try {
            currentMembership = membershipService.getMemberCurrentMembership(memberId);
            if (currentMembership != null) {
                long daysRemaining = ChronoUnit.DAYS.between(LocalDate.now(), currentMembership.getEndDate());
                stats.setCurrentMembership(MemberStatsDTO.CurrentMembership.builder()
                    .planName(currentMembership.getPlanName())
                    .daysRemaining((int) Math.max(0, daysRemaining))
                    .endDate(currentMembership.getEndDate())
                    .build());
            } else {
                stats.setCurrentMembership(MemberStatsDTO.CurrentMembership.builder()
                    .planName("No Active Membership")
                    .daysRemaining(0)
                    .endDate(null)
                    .build());
            }
        } catch (Exception ex) {
            logger.warn("Failed to get membership for member {}: {}", memberId, ex.getMessage());
            stats.setCurrentMembership(MemberStatsDTO.CurrentMembership.builder()
                .planName("No Active Membership")
                .daysRemaining(0)
                .endDate(null)
                .build());
        }

        // Get this month's attendance stats
        try {
            LocalDate now = LocalDate.now();
            LocalDate monthStart = now.withDayOfMonth(1);
            long totalDaysAttended = attendanceService.getTotalDaysAttended(memberId, monthStart, now);
            long totalDays = ChronoUnit.DAYS.between(monthStart, now) + 1;
            double attendancePercentage = totalDays > 0 ? (totalDaysAttended * 100.0) / totalDays : 0.0;

            stats.setThisMonthAttendance(MemberStatsDTO.AttendanceStats.builder()
                .days((int) totalDaysAttended)
                .percentage(attendancePercentage)
                .build());
        } catch (Exception ex) {
            logger.warn("Failed to get attendance stats for member {}: {}", memberId, ex.getMessage());
            stats.setThisMonthAttendance(MemberStatsDTO.AttendanceStats.builder()
                .days(0)
                .percentage(0.0)
                .build());
        }

        // Set placeholder stats for workouts and PT sessions
        stats.setThisMonthStats(MemberStatsDTO.MonthlyStats.builder()
            .workoutsCompleted(0)
            .personalTrainingSessions(0)
            .totalMinutes(0)
            .caloriesBurned(0)
            .build());

        BigDecimal nextAmount = currentMembership != null && currentMembership.getTotalAmount() != null
            ? currentMembership.getTotalAmount()
            : BigDecimal.ZERO;
        LocalDate dueDate = currentMembership != null ? currentMembership.getEndDate() : null;
        String paymentStatus = dueDate != null && dueDate.isBefore(LocalDate.now()) ? "OVERDUE" : "PENDING";

        Payment latestPendingPayment = paymentRepository
            .findTopByMemberIdAndPaymentStatusInOrderByCreatedAtDesc(memberId, Arrays.asList("PENDING", "PARTIAL"))
            .orElse(null);
        if (latestPendingPayment != null) {
            if (latestPendingPayment.getFinalAmount() != null) {
                nextAmount = latestPendingPayment.getFinalAmount();
            }
            if (latestPendingPayment.getPaymentStatus() != null && !latestPendingPayment.getPaymentStatus().isBlank()) {
                paymentStatus = latestPendingPayment.getPaymentStatus();
            }
        }

        stats.setNextFeePayment(MemberStatsDTO.NextFeePayment.builder()
            .amount(nextAmount)
            .dueDate(dueDate)
            .status(paymentStatus)
            .build());

        return stats;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponse<MemberDTO>>> listMembers(
        Authentication authentication,
        Pageable pageable) {
        Long orgId = authContextHelper.getOrganizationId(authentication);
        Long branchId = authContextHelper.getBranchId(authentication);
        Page<MemberDTO> page = memberService.listMembers(orgId, branchId, pageable);
        PaginatedResponse<MemberDTO> response = PaginatedResponse.<MemberDTO>builder()
            .content(page.getContent())
            .page(page.getNumber())
            .pageSize(page.getSize())
            .totalElements(page.getTotalElements())
            .totalPages(page.getTotalPages())
            .hasNext(page.hasNext())
            .hasPrevious(page.hasPrevious())
            .build();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PaginatedResponse<MemberDTO>>> searchMembers(
        @RequestParam String query,
        Authentication authentication,
        Pageable pageable) {
        Long orgId = authContextHelper.getOrganizationId(authentication);
        Page<MemberDTO> page = memberService.searchMembers(orgId, query, pageable);
        PaginatedResponse<MemberDTO> response = PaginatedResponse.<MemberDTO>builder()
            .content(page.getContent())
            .page(page.getNumber())
            .pageSize(page.getSize())
            .totalElements(page.getTotalElements())
            .totalPages(page.getTotalPages())
            .hasNext(page.hasNext())
            .hasPrevious(page.hasPrevious())
            .build();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/by-email")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','TRAINER','RECEPTIONIST','USER')")
    public ResponseEntity<ApiResponse<MemberDTO>> getMemberByEmail(
        @RequestParam String email,
        Authentication authentication) {
        try {
            String userEmail = authContextHelper.getUserEmail(authentication);
            Long userOrgId = authContextHelper.getOrganizationId(authentication);

            logger.info("Get member by email request: email={}, user={}, org={}", email, userEmail, userOrgId);

            // Search for member by email
            Page<MemberDTO> results = memberService.searchMembers(userOrgId, email, PageRequest.of(0, 10));

            if (results.getContent().isEmpty()) {
                logger.warn("No member found with email: {} for org: {}", email, userOrgId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("NOT_FOUND", "Member not found"));
            }

            MemberDTO member = results.getContent().get(0);

            // Verify member belongs to user's organization
            if (member.getOrganizationId() == null || !member.getOrganizationId().equals(userOrgId)) {
                logger.warn("Unauthorized member access attempt: user={} (org={}) trying to access member={} (org={})",
                    userEmail, userOrgId, email, member.getOrganizationId());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("FORBIDDEN", "You do not have permission to access this member"));
            }

            logger.debug("Member found by email: {}, memberId={}", email, member.getId());
            return ResponseEntity.ok(ApiResponse.success(member));
        } catch (Exception ex) {
            logger.error("Error getting member by email: {}", email, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("ERROR", "Failed to get member"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MemberDTO>> updateMember(
        @PathVariable Long id,
        @Valid @RequestBody CreateMemberRequest request,
        Authentication authentication) {
        Long orgId = authContextHelper.getOrganizationId(authentication);
         // Verify member belongs to user's organization
         MemberDTO existingMember = memberService.getMember(id);
         if (existingMember.getOrganizationId() == null || !existingMember.getOrganizationId().equals(orgId)) {
             return ResponseEntity.status(HttpStatus.FORBIDDEN)
                 .body(ApiResponse.error("FORBIDDEN", "You do not have permission to update this member"));
         }
        MemberDTO member = memberService.updateMember(id, request);
        return ResponseEntity.ok(ApiResponse.success("Member updated successfully", member));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMember(
        @PathVariable Long id,
        Authentication authentication) {
        Long orgId = authContextHelper.getOrganizationId(authentication);
         // Verify member belongs to user's organization
         MemberDTO member = memberService.getMember(id);
         if (member.getOrganizationId() == null || !member.getOrganizationId().equals(orgId)) {
             return ResponseEntity.status(HttpStatus.FORBIDDEN)
                 .body(ApiResponse.error("FORBIDDEN", "You do not have permission to delete this member"));
         }
        memberService.deleteMember(id);
        return ResponseEntity.ok(ApiResponse.success("Member deleted successfully", null));
    }
}
