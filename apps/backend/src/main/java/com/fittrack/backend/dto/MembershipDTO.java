package com.fittrack.backend.dto;

import com.fittrack.backend.entity.enums.MemberStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MembershipDTO {
    private Long id;
    private Long memberId;
    private Long membershipPlanId;
    private String memberName;
    private String planName;
    private LocalDate startDate;
    private LocalDate endDate;
    private MemberStatus status;
    private BigDecimal price;
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private LocalDate frozenUntil;
    private Integer freezeCount;
    private boolean active;
}

