package com.fittrack.backend.service.impl;

import com.fittrack.backend.dto.DashboardResponse;
import com.fittrack.backend.dto.ProgressAnalyticsResponse;
import com.fittrack.backend.dto.StartWorkoutRequest;
import com.fittrack.backend.dto.WorkoutActionResponse;
import com.fittrack.backend.entity.User;
import com.fittrack.backend.entity.WorkoutSession;
import com.fittrack.backend.exception.AppException;
import com.fittrack.backend.exception.ResourceNotFoundException;
import com.fittrack.backend.repository.UserGoalRepository;
import com.fittrack.backend.repository.UserProfileRepository;
import com.fittrack.backend.repository.UserRepository;
import com.fittrack.backend.repository.WorkoutSessionRepository;
import com.fittrack.backend.service.NotificationService;
import com.fittrack.backend.service.DashboardService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final UserProfileRepository profileRepository;
    private final WorkoutSessionRepository workoutSessionRepository;
    private final UserGoalRepository userGoalRepository;
    private final NotificationService notificationService;

    public DashboardServiceImpl(
            UserRepository userRepository,
            UserProfileRepository profileRepository,
            WorkoutSessionRepository workoutSessionRepository,
            UserGoalRepository userGoalRepository,
            NotificationService notificationService
    ) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.workoutSessionRepository = workoutSessionRepository;
        this.userGoalRepository = userGoalRepository;
        this.notificationService = notificationService;
    }

    @Override
    public DashboardResponse getDashboard(String email) {
        User user = findUser(email);

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

        DashboardResponse.TodayWorkout today = workoutSessionRepository
                .findTopByUserIdOrderByWorkoutDateDesc(user.getId())
                .map(ws -> new DashboardResponse.TodayWorkout(
                        ws.getTitle(),
                        ws.getDurationMinutes(),
                        ws.getCaloriesBurned(),
                        inferDifficulty(ws.getDurationMinutes())
                ))
                .orElse(new DashboardResponse.TodayWorkout("No workout logged yet", 0, 0, "BEGINNER"));

        return new DashboardResponse(
                new DashboardResponse.UserSummary(
                        user.getFullName() != null ? user.getFullName() : user.getEmail(),
                        profile != null && profile.getFitnessLevel() != null ? profile.getFitnessLevel().name() : "BEGINNER",
                        profile != null && profile.getPrimaryGoal() != null ? profile.getPrimaryGoal().name() : "GENERAL_HEALTH"
                ),
                new DashboardResponse.WeeklyStats(weeklyWorkouts, weeklyCalories, weeklyDurationMinutes),
                today,
                activities
        );
    }

    @Override
    public ProgressAnalyticsResponse getProgressAnalytics(String email) {
        User user = findUser(email);
        LocalDate now = LocalDate.now();
        LocalDate weekStart = now.minusDays(6);
        LocalDate monthStart = now.minusDays(29);

        List<WorkoutSession> sessions = workoutSessionRepository.findTop12ByUserIdOrderByWorkoutDateAscIdAsc(user.getId());
        List<String> labels = sessions.stream().map(ws -> ws.getWorkoutDate().toString()).toList();

        List<ProgressAnalyticsResponse.Dataset> datasets = sessions.isEmpty()
                ? List.of()
                : List.of(
                        new ProgressAnalyticsResponse.Dataset(
                                "duration",
                                "Duration (min)",
                                sessions.stream().map(ws -> ws.getDurationMinutes().doubleValue()).toList()
                        ),
                        new ProgressAnalyticsResponse.Dataset(
                                "calories",
                                "Calories Burned",
                                sessions.stream().map(ws -> ws.getCaloriesBurned().doubleValue()).toList()
                        ),
                        new ProgressAnalyticsResponse.Dataset(
                                "volume",
                                "Volume (kg)",
                                sessions.stream().map(ws -> ws.getTotalVolumeKg().doubleValue()).toList()
                        )
                );

        long totalWorkouts = workoutSessionRepository.countByUserIdAndWorkoutDateBetween(user.getId(), monthStart, now);
        int monthlyCalories = workoutSessionRepository.totalCalories(user.getId(), monthStart);
        int monthlyDuration = workoutSessionRepository.totalDurationMinutes(user.getId(), monthStart);
        long activeWeekDays = workoutSessionRepository.countByUserIdAndWorkoutDateBetween(user.getId(), weekStart, now);
        int attendance = (int) Math.min(100, Math.round((activeWeekDays / 7.0) * 100));

        var goals = userGoalRepository.findByUserIdOrderByDueDateAscIdAsc(user.getId());
        long completedGoals = goals.stream().filter(goal -> goal.getCurrentValue() >= goal.getTargetValue()).count();
        int progress = goals.isEmpty() ? 0 : (int) Math.round((completedGoals * 100.0) / goals.size());

        return new ProgressAnalyticsResponse(
                labels,
                datasets,
                new ProgressAnalyticsResponse.Summary(totalWorkouts, attendance, progress, monthlyCalories, monthlyDuration)
        );
    }

    @Override
    @Transactional
    public WorkoutActionResponse startWorkout(String email, StartWorkoutRequest request) {
        User user = findUser(email);
        if (user.getOrganization() == null) {
            throw new AppException(HttpStatus.FORBIDDEN, "User is not assigned to an organization");
        }

        WorkoutSession baseline = workoutSessionRepository.findTopByUserIdOrderByWorkoutDateDesc(user.getId()).orElse(null);

        WorkoutSession session = new WorkoutSession();
        session.setUser(user);
        session.setOrganization(user.getOrganization());
        session.setTitle(request.title().trim());
        session.setWorkoutDate(LocalDate.now());
        session.setDurationMinutes(baseline != null ? baseline.getDurationMinutes() : 45);
        session.setCaloriesBurned(baseline != null ? baseline.getCaloriesBurned() : 300);
        session.setTotalVolumeKg(baseline != null ? baseline.getTotalVolumeKg() : BigDecimal.ZERO);

        WorkoutSession saved = workoutSessionRepository.save(session);
        notificationService.createNotification(
                user,
                "WORKOUT_ASSIGNMENT",
                "Workout started",
                "You started workout: " + saved.getTitle(),
                null
        );

        return new WorkoutActionResponse(
                saved.getId(),
                saved.getTitle(),
                "STARTED",
                saved.getWorkoutDate().toString(),
                saved.getDurationMinutes(),
                saved.getCaloriesBurned()
        );
    }

    @Override
    @Transactional
    public WorkoutActionResponse completeWorkout(String email, Long workoutId) {
        User user = findUser(email);
        WorkoutSession session = workoutSessionRepository.findByIdAndUserId(workoutId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Workout not found"));

        notificationService.createNotification(
                user,
                "WORKOUT_COMPLETION",
                "Workout completed",
                "Workout completed: " + session.getTitle(),
                null
        );

        return new WorkoutActionResponse(
                session.getId(),
                session.getTitle(),
                "COMPLETED",
                session.getWorkoutDate().toString(),
                session.getDurationMinutes(),
                session.getCaloriesBurned()
        );
    }

    private User findUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    private String inferDifficulty(int durationMinutes) {
        if (durationMinutes >= 60) {
            return "ADVANCED";
        }
        if (durationMinutes >= 40) {
            return "INTERMEDIATE";
        }
        return "BEGINNER";
    }
}

