package com.fittrack.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record StartWorkoutRequest(
        @NotBlank(message = "Workout title is required")
        String title
) {
}

