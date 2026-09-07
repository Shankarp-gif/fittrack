package com.fittrack.backend.repository;

import com.fittrack.backend.entity.Refund;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RefundRepository extends JpaRepository<Refund, Long> {

    // Find refunds by organization
    Page<Refund> findByOrganizationId(Long organizationId, Pageable pageable);

    // Find refunds for a payment
    List<Refund> findByPaymentId(Long paymentId);

    // Find refunds by status
    Page<Refund> findByOrganizationIdAndRefundStatus(Long organizationId, String refundStatus, Pageable pageable);

    // Calculate total refunded amount for period
    @Query("SELECT COALESCE(SUM(r.amount), 0) FROM Refund r WHERE r.organization.id = :orgId AND r.refundStatus = 'PROCESSED' AND r.refundDate >= :startDate AND r.refundDate <= :endDate")
    BigDecimal calculateTotalRefunded(@Param("orgId") Long orgId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // Count refunds by status
    Long countByOrganizationIdAndRefundStatus(Long organizationId, String refundStatus);
}

