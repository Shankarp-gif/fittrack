package com.fittrack.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateLeadRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Phone is required")
    private String phone;

    @NotNull(message = "Source is required")
    private String source;  // WEBSITE, REFERRAL, WALK_IN, etc

    private Long interestedPlanId;
    private Long interestedBranchId;
    private Long assignedUserId;
    private String priority = "MEDIUM";  // LOW, MEDIUM, HIGH, URGENT
    private BigDecimal expectedValue;
    private String notes;
}

