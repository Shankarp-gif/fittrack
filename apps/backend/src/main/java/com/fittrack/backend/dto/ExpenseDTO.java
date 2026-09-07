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
public class ExpenseDTO {
    private Long id;
    private Long organizationId;
    private Long branchId;
    private Long expenseCategoryId;
    private String categoryName;
    private String description;
    private BigDecimal amount;
    private LocalDateTime expenseDate;
    private String paymentMethod;
    private String referenceNumber;
    private Long recordedById;
    private String recordedByName;
    private String notes;
    private String receiptUrl;
    private Boolean isRecurring;
    private String recurrencePattern;
    private Instant createdAt;
    private Instant updatedAt;
}

