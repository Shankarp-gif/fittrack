package com.fittrack.backend.repository;

import com.fittrack.backend.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // Find by organization
    Page<Payment> findByOrganizationId(Long organizationId, Pageable pageable);

    Optional<Payment> findByIdAndOrganizationId(Long id, Long organizationId);

    // Find by organization and date range
    @Query("SELECT p FROM Payment p WHERE p.organization.id = :orgId AND p.createdAt >= :startDate AND p.createdAt <= :endDate ORDER BY p.createdAt DESC")
    Page<Payment> findByOrganizationIdAndDateRange(@Param("orgId") Long orgId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);

    // Find by member
    Page<Payment> findByOrganizationIdAndMemberId(Long organizationId, Long memberId, Pageable pageable);

    // Find by status
    Page<Payment> findByOrganizationIdAndPaymentStatus(Long organizationId, String paymentStatus, Pageable pageable);

     // Find pending payments (unpaid)
     @Query("SELECT p FROM Payment p WHERE p.organization.id = :orgId AND p.paymentStatus IN ('PENDING', 'PARTIAL') ORDER BY p.createdAt ASC")
     List<Payment> findPendingPayments(@Param("orgId") Long orgId);

    Optional<Payment> findTopByMemberIdAndPaymentStatusInOrderByCreatedAtDesc(Long memberId, List<String> statuses);

     // Find today's payments
     @Query("SELECT p FROM Payment p WHERE p.organization.id = :orgId AND CAST(p.createdAt AS date) = CURRENT_DATE ORDER BY p.createdAt DESC")
     List<Payment> findTodayPayments(@Param("orgId") Long orgId);

    // Find paid payments for period
    @Query("SELECT p FROM Payment p WHERE p.organization.id = :orgId AND p.paymentStatus = 'PAID' AND p.paidAt >= :startDate AND p.paidAt <= :endDate")
    List<Payment> findPaidPaymentsByDateRange(@Param("orgId") Long orgId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // Calculate total revenue for period
    @Query("SELECT COALESCE(SUM(p.finalAmount), 0) FROM Payment p WHERE p.organization.id = :orgId AND p.paymentStatus = 'PAID' AND p.paidAt >= :startDate AND p.paidAt <= :endDate")
    BigDecimal calculateTotalRevenue(@Param("orgId") Long orgId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // Calculate total pending amount
    @Query("SELECT COALESCE(SUM(p.finalAmount), 0) FROM Payment p WHERE p.organization.id = :orgId AND p.paymentStatus IN ('PENDING', 'PARTIAL')")
    BigDecimal calculatePendingAmount(@Param("orgId") Long orgId);

    // Count payments by status
    Long countByOrganizationIdAndPaymentStatus(Long organizationId, String paymentStatus);

    // Find by receipt number
    Optional<Payment> findByReceiptNumber(String receiptNumber);

    // Find by reference number
    Optional<Payment> findByReferenceNumber(String referenceNumber);

    // Find payments by payment method
    Page<Payment> findByOrganizationIdAndPaymentMethod(Long organizationId, String paymentMethod, Pageable pageable);

    // Find payments collected by specific user
    Page<Payment> findByOrganizationIdAndCollectedById(Long organizationId, Long userId, Pageable pageable);

    // Check if payment exists for membership
    @Query("SELECT COUNT(p) FROM Payment p WHERE p.membership.id = :membershipId AND p.paymentStatus = 'PAID'")
    Long countPaidPaymentsForMembership(@Param("membershipId") Long membershipId);

    // Find all refundable payments (paid but active)
    @Query("SELECT p FROM Payment p WHERE p.organization.id = :orgId AND p.paymentStatus = 'PAID' AND p.active = true ORDER BY p.paidAt DESC")
    List<Payment> findRefundablePayments(@Param("orgId") Long orgId);

    // Get payment summary for dashboard
    @Query("SELECT COUNT(p) FROM Payment p WHERE p.organization.id = :orgId AND CAST(p.createdAt AS date) = CURRENT_DATE AND p.paymentStatus = 'PAID'")
    Long countTodayPaidPayments(@Param("orgId") Long orgId);
}

