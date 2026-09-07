package com.fittrack.backend.service;

import com.fittrack.backend.dto.DashboardResponse;
import com.fittrack.backend.dto.ProgressAnalyticsResponse;
import com.fittrack.backend.dto.StartWorkoutRequest;
import com.fittrack.backend.dto.WorkoutActionResponse;

public interface DashboardService {
    DashboardResponse getDashboard(String email);
    ProgressAnalyticsResponse getProgressAnalytics(String email);
    WorkoutActionResponse startWorkout(String email, StartWorkoutRequest request);
    WorkoutActionResponse completeWorkout(String email, Long workoutId);
}

