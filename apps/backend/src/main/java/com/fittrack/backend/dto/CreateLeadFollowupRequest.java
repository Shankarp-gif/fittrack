package com.fittrack.backend.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateLeadFollowupRequest {

    @NotNull(message = "Followup date is required")
    private LocalDateTime followupDate;

    @NotNull(message = "Followup type is required")
    private String followupType;  // PHONE_CALL, VISIT, EMAIL, SMS, MESSAGE, OTHER

    private Long assignedUserId;
    private String outcome;
    private String notes;
}

