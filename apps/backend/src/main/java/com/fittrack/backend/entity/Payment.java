package com.fittrack.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "payments")
public class Payment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "membership_id")
    private Membership membership;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lead_id")
    private Lead lead;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "discount_percentage", precision = 5, scale = 2, columnDefinition = "NUMERIC(5,2) DEFAULT 0")
    private BigDecimal discountPercentage = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 10, scale = 2, columnDefinition = "NUMERIC(10,2) DEFAULT 0")
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "tax_percentage", precision = 5, scale = 2, columnDefinition = "NUMERIC(5,2) DEFAULT 0")
    private BigDecimal taxPercentage = BigDecimal.ZERO;

    @Column(name = "tax_amount", precision = 10, scale = 2, columnDefinition = "NUMERIC(10,2) DEFAULT 0")
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "final_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal finalAmount;

    @Column(name = "payment_method", nullable = false, length = 32)
    private String paymentMethod = "CASH";  // CASH, CARD, UPI, BANK_TRANSFER, CHEQUE, ONLINE, AUTO_RENEWAL

    @Column(name = "payment_status", nullable = false, length = 32)
    private String paymentStatus = "PENDING";  // PENDING, PAID, PARTIAL, FAILED, REFUNDED, CANCELLED

    @Column(name = "transaction_id", length = 255)
    private String transactionId;

    @Column(name = "reference_number", length = 255, unique = true)
    private String referenceNumber;

    @Column(name = "receipt_number", length = 255, unique = true)
    private String receiptNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "collected_by")
    private User collectedBy;

    @Column(name = "payment_reason", length = 255)
    private String paymentReason;  // MEMBERSHIP_NEW, MEMBERSHIP_RENEWAL, PERSONAL_TRAINING, CLASS, OTHER

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(nullable = false)
    private boolean active = true;
}

