package com.fittrack.backend.dto;

import com.fittrack.backend.entity.enums.FitnessLevel;
import com.fittrack.backend.entity.enums.Gender;
import com.fittrack.backend.entity.enums.GoalType;
import com.fittrack.backend.entity.enums.RoleName;
import java.time.LocalDate;

public record UserMeResponse(
        Long id,
        String employeeIdNumber,
        String fullName,
        String email,
        String mobile,
        String address,
        RoleName role,
        LocalDate dateOfBirth,
        Gender gender,
        Double heightCm,
        Double weightKg,
        FitnessLevel fitnessLevel,
        GoalType primaryGoal,
        String trainingPreference,
        Integer workoutFrequency
) {
}

