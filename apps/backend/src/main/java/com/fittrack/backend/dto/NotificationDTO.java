package com.fittrack.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long id;
    private String type;
    private String title;
    private String message;
    private Object data;
    private boolean read;
    private java.time.LocalDateTime readAt;
    private java.time.LocalDateTime createdAt;
}

