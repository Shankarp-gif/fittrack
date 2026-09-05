package com.fittrack.backend.dto;

import com.fittrack.backend.entity.enums.UnitSystem;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalTime;

public record UpdateSettingsRequest(
        @NotNull Boolean reminderEnabled,
        @NotNull LocalTime reminderTime,
        @NotNull UnitSystem unitSystem,
        @NotNull @Min(1) @Max(14) Integer weeklyGoal
) {
}

