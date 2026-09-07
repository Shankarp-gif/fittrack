package com.fittrack.backend.service;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentCollectionSummary {
    private Long totalMembers;
    private Long paidMembers;
    private Long pendingMembers;
    private Long overdueMembers;
    private BigDecimal totalCollected;
    private BigDecimal totalPending;
    private BigDecimal todayCollection;
    private Double collectionPercentage;
    private Long totalPaidPayments;
    private Long totalPendingPayments;
}

