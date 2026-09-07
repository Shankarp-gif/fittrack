package com.fittrack.backend.dto;

import com.fittrack.backend.entity.enums.FitnessLevel;
import com.fittrack.backend.entity.enums.Gender;
import com.fittrack.backend.entity.enums.GoalType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record RegisterRequest(
        @NotBlank @Size(max = 120) String fullName,
        @NotBlank @Email @Size(max = 180) String email,
        @NotBlank @Size(min = 8, max = 120) String password,
        @Size(max = 20) String mobile,
        @Size(max = 255) String address,
        @Past LocalDate dateOfBirth,
        Gender gender,
        Double heightCm,
        Double weightKg,
        @NotNull FitnessLevel fitnessLevel,
        @NotNull GoalType goal,
        String trainingPreference,
        Integer workoutFrequency,
        @NotNull Long organizationId
) {
}

