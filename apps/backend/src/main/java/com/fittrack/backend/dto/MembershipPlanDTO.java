package com.fittrack.backend.dto;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MembershipPlanDTO {
    private Long id;
    private String name;
    private String description;
    private Integer durationDays;
    private BigDecimal price;
    private BigDecimal joiningFee;
    private BigDecimal discountPercentage;
    private BigDecimal taxPercentage;
    private Integer maxPtSessions;
    private Integer freezeAllowance;
    private boolean active;
}

