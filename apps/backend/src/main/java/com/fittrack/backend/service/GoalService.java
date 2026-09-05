package com.fittrack.backend.service;

import com.fittrack.backend.dto.CreateGoalRequest;
import com.fittrack.backend.dto.GoalResponse;
import com.fittrack.backend.dto.UpdateGoalProgressRequest;
import java.util.List;

public interface GoalService {
    List<GoalResponse> listGoals(String email);

    GoalResponse createGoal(String email, CreateGoalRequest request);

    GoalResponse updateGoalProgress(String email, Long goalId, UpdateGoalProgressRequest request);
}

