package com.fittrack.backend.dto;

public record AppSettingsResponse(
        boolean reminderEnabled,
        String reminderTime,
        String unitSystem,
        int weeklyGoal
) {
}

