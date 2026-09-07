package com.fittrack.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConvertLeadToMemberRequest {

    @NotNull(message = "Membership plan is required")
    private Long membershipPlanId;

    @NotNull(message = "Branch is required")
    private Long branchId;

    private String memberIdPrefix = "MEM";
    private String notes;
}

