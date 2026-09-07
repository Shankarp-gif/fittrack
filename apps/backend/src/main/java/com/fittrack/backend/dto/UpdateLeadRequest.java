package com.fittrack.backend.dto;

import jakarta.validation.constraints.Email;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateLeadRequest {

    private String fullName;
    private String email;
    private String phone;
    private String source;
    private Long interestedPlanId;
    private Long interestedBranchId;
    private Long assignedUserId;
    private String status;
    private String priority;
    private BigDecimal expectedValue;
    private String notes;
}

