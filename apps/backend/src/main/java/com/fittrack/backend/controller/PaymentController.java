package com.fittrack.backend.controller;

import com.fittrack.backend.dto.CreatePaymentRequest;
import com.fittrack.backend.dto.MemberDTO;
import com.fittrack.backend.dto.PaymentDTO;
import com.fittrack.backend.dto.common.ApiResponse;
import com.fittrack.backend.service.MemberService;
import com.fittrack.backend.service.PaymentCollectionSummary;
import com.fittrack.backend.service.PaymentService;
import com.fittrack.backend.util.AuthenticationContextHelper;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
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

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','TRAINER','RECEPTIONIST','USER')")
public class PaymentController {

    private final PaymentService paymentService;
    private final MemberService memberService;
    private final AuthenticationContextHelper authContextHelper;

    /**
     * Create a new payment
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','RECEPTIONIST','USER')")
    public ResponseEntity<ApiResponse<PaymentDTO>> createPayment(
        @Valid @RequestBody CreatePaymentRequest request,
        Authentication authentication) {
        MemberDTO authenticatedMember = isUserRole(authentication) ? resolveAuthenticatedMember(authentication) : null;
        Long orgId = resolveOrganizationId(authentication, authenticatedMember);
        if (isUserRole(authentication)) {
            if (authenticatedMember == null) {
                throw new AccessDeniedException("No member profile linked to this account");
            }
            Long memberId = authenticatedMember.getId();
            if (!memberId.equals(request.getMemberId())) {
                throw new AccessDeniedException("You can only create payment for your own account");
            }
        }
        PaymentDTO payment = paymentService.createPayment(orgId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Payment created successfully", payment));
    }

    /**
     * Get payment by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','TRAINER','RECEPTIONIST')")
    public ResponseEntity<ApiResponse<PaymentDTO>> getPayment(
        @PathVariable Long id,
        Authentication authentication) {
        Long orgId = authContextHelper.getOrganizationId(authentication);
        PaymentDTO payment = paymentService.getPayment(id);
        // Verify payment belongs to user's organization
        if (payment.getOrganizationId() == null || !payment.getOrganizationId().equals(orgId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("FORBIDDEN", "You do not have permission to access this payment"));
        }
        return ResponseEntity.ok(ApiResponse.success(payment));
    }

    /**
     * List all payments for organization with pagination
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','TRAINER','RECEPTIONIST')")
    public ResponseEntity<ApiResponse<Page<PaymentDTO>>> listPayments(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        Authentication authentication) {
        Long orgId = authContextHelper.getOrganizationId(authentication);
        Pageable pageable = PageRequest.of(page, size);
        Page<PaymentDTO> payments = paymentService.listPayments(orgId, pageable);
        return ResponseEntity.ok(ApiResponse.success(payments));
    }

    /**
     * List payments by status
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','TRAINER','RECEPTIONIST')")
    public ResponseEntity<ApiResponse<Page<PaymentDTO>>> listPaymentsByStatus(
        @PathVariable String status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        Authentication authentication) {
        Long orgId = authContextHelper.getOrganizationId(authentication);
        Pageable pageable = PageRequest.of(page, size);
        Page<PaymentDTO> payments = paymentService.listPaymentsByStatus(orgId, status, pageable);
        return ResponseEntity.ok(ApiResponse.success(payments));
    }

    /**
     * List payments for a specific member
     */
    @GetMapping("/member/{memberId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','TRAINER','RECEPTIONIST')")
    public ResponseEntity<ApiResponse<Page<PaymentDTO>>> listMemberPayments(
        @PathVariable Long memberId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        Authentication authentication) {
        Long orgId = authContextHelper.getOrganizationId(authentication);
        Pageable pageable = PageRequest.of(page, size);
        Page<PaymentDTO> payments = paymentService.listMemberPayments(orgId, memberId, pageable);
        return ResponseEntity.ok(ApiResponse.success(payments));
    }

    /**
     * Get pending payments
     */
    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','TRAINER','RECEPTIONIST')")
    public ResponseEntity<ApiResponse<List<PaymentDTO>>> getPendingPayments(
        Authentication authentication) {
        Long orgId = authContextHelper.getOrganizationId(authentication);
        List<PaymentDTO> payments = paymentService.getPendingPayments(orgId);
        return ResponseEntity.ok(ApiResponse.success(payments));
    }

    /**
     * Get today's payments
     */
    @GetMapping("/today")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','TRAINER','RECEPTIONIST')")
    public ResponseEntity<ApiResponse<List<PaymentDTO>>> getTodayPayments(
        Authentication authentication) {
        Long orgId = authContextHelper.getOrganizationId(authentication);
        List<PaymentDTO> payments = paymentService.getTodayPayments(orgId);
        return ResponseEntity.ok(ApiResponse.success(payments));
    }

    /**
     * Mark payment as paid
     */
    @PostMapping("/{id}/mark-paid")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','RECEPTIONIST')")
    public ResponseEntity<ApiResponse<PaymentDTO>> markPaymentAsPaid(@PathVariable Long id) {
        PaymentDTO payment = paymentService.markPaymentAsPaid(id);
        return ResponseEntity.ok(ApiResponse.success("Payment marked as paid", payment));
    }

    /**
     * Update payment
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','RECEPTIONIST')")
    public ResponseEntity<ApiResponse<PaymentDTO>> updatePayment(
        @PathVariable Long id,
        @Valid @RequestBody CreatePaymentRequest request) {
        PaymentDTO payment = paymentService.updatePayment(id, request);
        return ResponseEntity.ok(ApiResponse.success("Payment updated successfully", payment));
    }

    /**
     * Delete payment (soft delete)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deletePayment(@PathVariable Long id) {
        paymentService.deletePayment(id);
        return ResponseEntity.ok(ApiResponse.success("Payment deleted successfully", null));
    }

    /**
     * Get total revenue for date range
     */
    @GetMapping("/revenue")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','TRAINER','RECEPTIONIST')")
    public ResponseEntity<ApiResponse<BigDecimal>> getTotalRevenue(
        @RequestParam LocalDateTime startDate,
        @RequestParam LocalDateTime endDate,
        Authentication authentication) {
        Long orgId = authContextHelper.getOrganizationId(authentication);
        BigDecimal revenue = paymentService.getTotalRevenue(orgId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(revenue));
    }

    /**
     * Get total pending amount
     */
    @GetMapping("/pending-amount")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','TRAINER','RECEPTIONIST')")
    public ResponseEntity<ApiResponse<BigDecimal>> getTotalPendingAmount(
        Authentication authentication) {
        Long orgId = authContextHelper.getOrganizationId(authentication);
        BigDecimal pending = paymentService.getTotalPendingAmount(orgId);
        return ResponseEntity.ok(ApiResponse.success(pending));
    }

    /**
     * Get collection summary (for dashboard)
     */
    @GetMapping("/collection-summary")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','TRAINER','RECEPTIONIST')")
    public ResponseEntity<ApiResponse<PaymentCollectionSummary>> getCollectionSummary(
        Authentication authentication) {
        Long orgId = authContextHelper.getOrganizationId(authentication);
        PaymentCollectionSummary summary = paymentService.getCollectionSummary(orgId);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    /**
     * Search payments
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','TRAINER','RECEPTIONIST')")
    public ResponseEntity<ApiResponse<Page<PaymentDTO>>> searchPayments(
        @RequestParam String query,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        Authentication authentication) {
        Long orgId = authContextHelper.getOrganizationId(authentication);
        Pageable pageable = PageRequest.of(page, size);
        Page<PaymentDTO> payments = paymentService.searchPayments(orgId, query, pageable);
        return ResponseEntity.ok(ApiResponse.success(payments));
    }

    /**
     * Filter payments by date range
     */
    @GetMapping("/filter-by-date")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','TRAINER','RECEPTIONIST')")
    public ResponseEntity<ApiResponse<Page<PaymentDTO>>> filterPaymentsByDateRange(
        @RequestParam LocalDateTime startDate,
        @RequestParam LocalDateTime endDate,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        Authentication authentication) {
        Long orgId = authContextHelper.getOrganizationId(authentication);
        Pageable pageable = PageRequest.of(page, size);
        Page<PaymentDTO> payments = paymentService.filterPaymentsByDateRange(orgId, startDate, endDate, pageable);
        return ResponseEntity.ok(ApiResponse.success(payments));
    }

    /**
     * Get available payment methods
     */
    @GetMapping("/methods")
    public ResponseEntity<ApiResponse<List<String>>> getAvailablePaymentMethods() {
        List<String> methods = paymentService.getAvailablePaymentMethods();
        return ResponseEntity.ok(ApiResponse.success(methods));
    }

    private boolean isUserRole(Authentication authentication) {
        String role = authContextHelper.getUserRole(authentication);
        return "USER".equalsIgnoreCase(role);
    }


    private MemberDTO resolveAuthenticatedMember(Authentication authentication) {
        String email = authContextHelper.getUserEmail(authentication);
        Long orgId = null;

        try {
            orgId = authContextHelper.getOrganizationId(authentication);
        } catch (AuthenticationException ignored) {
            // Fall back to member lookup by email when the user record has no organization.
        }

        MemberDTO member = orgId != null
            ? memberService.findMemberByOrganizationAndEmail(orgId, email).orElse(null)
            : null;

        if (member == null) {
            member = memberService.findMemberByEmail(email).orElse(null);
        }

        if (member == null) {
            throw new AccessDeniedException("No member profile linked to this account");
        }

        return member;
    }

    private Long resolveOrganizationId(Authentication authentication, MemberDTO fallbackMember) {
        try {
            return authContextHelper.getOrganizationId(authentication);
        } catch (AuthenticationException ignored) {
            if (fallbackMember != null && fallbackMember.getOrganizationId() != null) {
                return fallbackMember.getOrganizationId();
            }
            throw new AccessDeniedException("No organization found for the authenticated user");
        }
    }
}

