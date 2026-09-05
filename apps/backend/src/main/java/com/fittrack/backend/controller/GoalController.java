package com.fittrack.backend.controller;

import com.fittrack.backend.dto.CreateGoalRequest;
import com.fittrack.backend.dto.GoalResponse;
import com.fittrack.backend.dto.UpdateGoalProgressRequest;
import com.fittrack.backend.service.GoalService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    @GetMapping
    public List<GoalResponse> list(Authentication authentication) {
        return goalService.listGoals(authentication.getName());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public GoalResponse create(Authentication authentication, @Valid @RequestBody CreateGoalRequest request) {
        return goalService.createGoal(authentication.getName(), request);
    }

    @PutMapping("/{goalId}/progress")
    public GoalResponse updateProgress(
            Authentication authentication,
            @PathVariable Long goalId,
            @Valid @RequestBody UpdateGoalProgressRequest request
    ) {
        return goalService.updateGoalProgress(authentication.getName(), goalId, request);
    }
}

