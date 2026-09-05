package com.fittrack.backend.dto;

public record GoalResponse(
        Long id,
        String title,
        int targetValue,
        int currentValue,
        String unit,
        String dueDate,
        String status
) {
}

