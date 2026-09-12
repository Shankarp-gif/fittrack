package com.fittrack.backend.mapper;

import com.fittrack.backend.dto.UserMeResponse;
import com.fittrack.backend.entity.User;
import com.fittrack.backend.entity.UserProfile;
import java.math.BigDecimal;

public final class UserMapper {

    private UserMapper() {
    }

    public static UserMeResponse toMeResponse(User user, UserProfile profile) {
        return new UserMeResponse(
                user.getId(),
                user.getEmployeeIdNumber(),
                user.getFullName(),
                user.getEmail(),
                user.getMobile(),
                user.getAddress(),
                user.getRole().getName(),
                user.getOrganization() != null ? user.getOrganization().getId() : null,
                user.getOrganization() != null ? user.getOrganization().getName() : null,
                user.getBranch() != null ? user.getBranch().getId() : null,
                user.getBranch() != null ? user.getBranch().getName() : null,
                user.getSupervisor() != null ? user.getSupervisor().getId() : null,
                user.getSupervisor() != null ? user.getSupervisor().getFullName() : null,
                profile != null ? profile.getDateOfBirth() : null,
                profile != null ? profile.getGender() : null,
                toDouble(profile != null ? profile.getHeightCm() : null),
                toDouble(profile != null ? profile.getWeightKg() : null),
                profile != null ? profile.getFitnessLevel() : null,
                profile != null ? profile.getPrimaryGoal() : null,
                profile != null ? profile.getTrainingPreference() : null,
                profile != null ? profile.getWorkoutFrequency() : null
        );
    }

    private static Double toDouble(BigDecimal value) {
        return value != null ? value.doubleValue() : null;
    }
}

