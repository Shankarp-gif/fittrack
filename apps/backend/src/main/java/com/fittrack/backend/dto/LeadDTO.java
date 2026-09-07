package com.fittrack.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeadDTO {
    private Long id;
    private Long organizationId;
    private Long branchId;
    private String fullName;
    private String email;
    private String phone;
    private String source;
    private Long interestedPlanId;
    private Long interestedBranchId;
    private Long assignedUserId;
    private String assignedUserName;
    private String status;
    private String conversionStatus;
    private Long convertedMemberId;
    private String priority;
    private BigDecimal expectedValue;
    private String notes;
    private LocalDateTime lastContactDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer followupCount;
    private Integer convertedFollowups;
}

