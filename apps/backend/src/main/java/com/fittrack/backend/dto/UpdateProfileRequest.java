package com.fittrack.backend.dto;

import com.fittrack.backend.entity.enums.FitnessLevel;
import com.fittrack.backend.entity.enums.Gender;
import com.fittrack.backend.entity.enums.GoalType;
import jakarta.validation.constraints.Past;
import java.time.LocalDate;

public record UpdateProfileRequest(
        String fullName,
        @Past LocalDate dateOfBirth,
        Gender gender,
        Double heightCm,
        Double weightKg,
        FitnessLevel fitnessLevel,
        GoalType primaryGoal,
        String trainingPreference,
        Integer workoutFrequency
) {
}

