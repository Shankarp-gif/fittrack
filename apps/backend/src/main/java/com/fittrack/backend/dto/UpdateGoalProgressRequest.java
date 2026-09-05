package com.fittrack.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdateGoalProgressRequest(
        @NotNull @Min(0) @Max(100000) Integer currentValue
) {
}

