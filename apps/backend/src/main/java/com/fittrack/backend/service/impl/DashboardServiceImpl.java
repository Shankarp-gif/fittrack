package com.fittrack.backend.service.impl;

import com.fittrack.backend.dto.DashboardResponse;
import com.fittrack.backend.entity.User;
import com.fittrack.backend.repository.UserProfileRepository;
import com.fittrack.backend.repository.UserRepository;
import com.fittrack.backend.repository.WorkoutSessionRepository;
import com.fittrack.backend.service.DashboardService;
import java.time.LocalDate;
import org.springframework.stereotype.Service;

@Service
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final UserProfileRepository profileRepository;
    private final WorkoutSessionRepository workoutSessionRepository;

    public DashboardServiceImpl(
            UserRepository userRepository,
            UserProfileRepository profileRepository,
            WorkoutSessionRepository workoutSessionRepository
    ) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.workoutSessionRepository = workoutSessionRepository;
    }

    @Override
    public DashboardResponse getDashboard(String email) {
        User user = userRepository.findByEmailIgnoreCase(email).orElseThrow();
        var profile = profileRepository.findByUserId(user.getId()).orElse(null);

        LocalDate now = LocalDate.now();
        LocalDate weekStart = now.minusDays(6);

        long weeklyWorkouts = workoutSessionRepository.countByUserIdAndWorkoutDateBetween(user.getId(), weekStart, now);
        int weeklyCalories = workoutSessionRepository.totalCalories(user.getId(), weekStart);
        int weeklyDurationMinutes = workoutSessionRepository.totalDurationMinutes(user.getId(), weekStart);

        var activities = workoutSessionRepository.findTop10ByUserIdOrderByWorkoutDateDesc(user.getId()).stream()
                .map(ws -> new DashboardResponse.RecentActivity(
                        ws.getTitle(),
                        ws.getWorkoutDate().toString(),
                        ws.getDurationMinutes(),
                        ws.getCaloriesBurned()
                ))
                .toList();

        DashboardResponse.TodayWorkout today = new DashboardResponse.TodayWorkout(
                "Balanced Strength Split",
                50,
                420,
                "Intermediate"
        );

        return new DashboardResponse(
                new DashboardResponse.UserSummary(
                        user.getFullName(),
                        profile != null && profile.getFitnessLevel() != null ? profile.getFitnessLevel().name() : "BEGINNER",
                        profile != null && profile.getPrimaryGoal() != null ? profile.getPrimaryGoal().name() : "GENERAL_HEALTH"
                ),
                new DashboardResponse.WeeklyStats(weeklyWorkouts, weeklyCalories, weeklyDurationMinutes),
                today,
                activities
        );
    }
}

