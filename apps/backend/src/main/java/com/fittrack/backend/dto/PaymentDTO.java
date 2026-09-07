package com.fittrack.backend.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDTO {
    private Long id;
    private Long organizationId;
    private Long branchId;
    private Long memberId;
    private String memberName;
    private Long membershipId;
    private Long leadId;
    private BigDecimal amount;
    private BigDecimal discountPercentage;
    private BigDecimal discountAmount;
    private BigDecimal taxPercentage;
    private BigDecimal taxAmount;
    private BigDecimal finalAmount;
    private String paymentMethod;
    private String paymentStatus;
    private String transactionId;
    private String referenceNumber;
    private String receiptNumber;
    private Long collectedById;
    private String collectedByName;
    private String paymentReason;
    private String notes;
    private LocalDateTime paidAt;
    private Instant createdAt;
    private Instant updatedAt;
}

