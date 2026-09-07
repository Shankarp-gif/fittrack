package com.fittrack.backend.controller;

import com.fittrack.backend.dto.DashboardResponse;
import com.fittrack.backend.dto.ProgressAnalyticsResponse;
import com.fittrack.backend.dto.StartWorkoutRequest;
import com.fittrack.backend.dto.WorkoutActionResponse;
import jakarta.validation.Valid;
import com.fittrack.backend.service.DashboardService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','TRAINER','GYM_MAINTENANCE_MANAGER','USER')")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public DashboardResponse dashboard(Authentication authentication) {
        return dashboardService.getDashboard(authentication.getName());
    }

    @GetMapping("/progress-analytics")
    public ProgressAnalyticsResponse progressAnalytics(Authentication authentication) {
        return dashboardService.getProgressAnalytics(authentication.getName());
    }

    @PostMapping("/workouts/start")
    public WorkoutActionResponse startWorkout(
            Authentication authentication,
            @Valid @RequestBody StartWorkoutRequest request
    ) {
        return dashboardService.startWorkout(authentication.getName(), request);
    }

    @PostMapping("/workouts/{workoutId}/complete")
    public WorkoutActionResponse completeWorkout(
            Authentication authentication,
            @PathVariable Long workoutId
    ) {
        return dashboardService.completeWorkout(authentication.getName(), workoutId);
    }
}

