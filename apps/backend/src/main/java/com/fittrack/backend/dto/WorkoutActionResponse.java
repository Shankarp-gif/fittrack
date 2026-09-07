package com.fittrack.backend.dto;

public record WorkoutActionResponse(
        Long id,
        String title,
        String status,
        String workoutDate,
        Integer durationMinutes,
        Integer caloriesBurned
) {
}

