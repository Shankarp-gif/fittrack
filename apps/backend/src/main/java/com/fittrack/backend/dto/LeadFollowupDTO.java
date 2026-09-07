package com.fittrack.backend.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeadFollowupDTO {
    private Long id;
    private Long leadId;
    private Long assignedUserId;
    private String assignedUserName;
    private String followupStatus;
    private String followupType;
    private LocalDateTime followupDate;
    private LocalDateTime completedDate;
    private String outcome;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

