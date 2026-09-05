package com.fittrack.backend.dto;

import java.util.List;

public record DashboardResponse(
        UserSummary userSummary,
        WeeklyStats weeklyStats,
        TodayWorkout todayWorkout,
        List<RecentActivity> recentActivities
) {
    public record UserSummary(String fullName, String fitnessLevel, String primaryGoal) {
    }

    public record WeeklyStats(long weeklyWorkouts, int weeklyCalories, int weeklyDurationMinutes) {
    }

    public record TodayWorkout(String title, int estimatedDurationMinutes, int estimatedCalories, String difficulty) {
    }

    public record RecentActivity(String title, String date, int durationMinutes, int caloriesBurned) {
    }
}

