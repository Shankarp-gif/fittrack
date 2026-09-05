package com.fittrack.backend.dto;

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
public class CreateMembershipRequest {
    @NotNull
    private Long memberId;

    @NotNull
    private Long membershipPlanId;

    private BigDecimal customPrice;
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;
}

