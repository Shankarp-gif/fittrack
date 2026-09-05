package com.fittrack.backend.dto;

public record PlanTemplateResponse(
        String id,
        String name,
        int daysPerWeek,
        String focus,
        int durationWeeks
) {
}

