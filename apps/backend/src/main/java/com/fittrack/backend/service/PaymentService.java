package com.fittrack.backend.service;

import com.fittrack.backend.dto.PaymentDTO;
import com.fittrack.backend.dto.CreatePaymentRequest;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PaymentService {

    // Create a new payment
    PaymentDTO createPayment(Long organizationId, CreatePaymentRequest request);

    // Get payment by ID
    PaymentDTO getPayment(Long paymentId);

    // List all payments for organization with pagination
    Page<PaymentDTO> listPayments(Long organizationId, Pageable pageable);

    // List payments by status
    Page<PaymentDTO> listPaymentsByStatus(Long organizationId, String status, Pageable pageable);

    // List payments for specific member
    Page<PaymentDTO> listMemberPayments(Long organizationId, Long memberId, Pageable pageable);

    // Get pending payments
    List<PaymentDTO> getPendingPayments(Long organizationId);

    // Get today's payments
    List<PaymentDTO> getTodayPayments(Long organizationId);

    // Mark payment as paid
    PaymentDTO markPaymentAsPaid(Long paymentId);

    // Update payment
    PaymentDTO updatePayment(Long paymentId, CreatePaymentRequest request);

    // Get total revenue for date range
    BigDecimal getTotalRevenue(Long organizationId, LocalDateTime startDate, LocalDateTime endDate);

    // Get total pending amount
    BigDecimal getTotalPendingAmount(Long organizationId);

    // Get collection summary for dashboard
    PaymentCollectionSummary getCollectionSummary(Long organizationId);

    // Search payments
    Page<PaymentDTO> searchPayments(Long organizationId, String searchTerm, Pageable pageable);

    // Filter payments by date range
    Page<PaymentDTO> filterPaymentsByDateRange(Long organizationId, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    // Get payment methods
    List<String> getAvailablePaymentMethods();

    // Soft delete payment
    void deletePayment(Long paymentId);
}

