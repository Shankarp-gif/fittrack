package com.fittrack.backend.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record CreateGoalRequest(
        @NotBlank @Size(max = 160) String title,
        @NotNull @Min(1) @Max(100000) Integer targetValue,
        @NotBlank @Size(max = 40) String unit,
        @NotNull @FutureOrPresent LocalDate dueDate
) {
}

