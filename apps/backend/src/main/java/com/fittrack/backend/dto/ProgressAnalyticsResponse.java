package com.fittrack.backend.dto;

import java.util.List;

public record ProgressAnalyticsResponse(
        List<String> labels,
        List<Dataset> datasets,
        Summary summary
) {
    public record Dataset(String key, String label, List<Double> values) {
    }

    public record Summary(long totalWorkouts, int attendance, int progress, int totalCalories, int totalDurationMinutes) {
    }
}

