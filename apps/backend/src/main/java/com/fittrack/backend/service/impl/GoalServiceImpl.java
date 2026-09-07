package com.fittrack.backend.service.impl;

import com.fittrack.backend.dto.CreateGoalRequest;
import com.fittrack.backend.dto.GoalResponse;
import com.fittrack.backend.dto.UpdateGoalProgressRequest;
import com.fittrack.backend.entity.User;
import com.fittrack.backend.entity.UserGoal;
import com.fittrack.backend.entity.enums.GoalStatus;
import com.fittrack.backend.exception.AppException;
import com.fittrack.backend.repository.UserGoalRepository;
import com.fittrack.backend.repository.UserRepository;
import com.fittrack.backend.service.GoalService;
import jakarta.transaction.Transactional;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class GoalServiceImpl implements GoalService {

    private final UserRepository userRepository;
    private final UserGoalRepository userGoalRepository;

    public GoalServiceImpl(UserRepository userRepository, UserGoalRepository userGoalRepository) {
        this.userRepository = userRepository;
        this.userGoalRepository = userGoalRepository;
    }

    @Override
    public List<GoalResponse> listGoals(String email) {
        User user = findUser(email);
        return userGoalRepository.findByUserIdOrderByDueDateAscIdAsc(user.getId()).stream().map(this::toResponse).toList();
    }

    @Override
    public GoalResponse createGoal(String email, CreateGoalRequest request) {
        User user = findUser(email);
        if (user.getOrganization() == null) {
            throw new AppException(HttpStatus.FORBIDDEN, "User is not assigned to an organization");
        }

        UserGoal goal = new UserGoal();
        goal.setUser(user);
        goal.setOrganization(user.getOrganization());
        goal.setTitle(request.title().trim());
        goal.setTargetValue(request.targetValue());
        goal.setCurrentValue(0);
        goal.setUnit(request.unit().trim());
        goal.setDueDate(request.dueDate());
        goal.setStatus(GoalStatus.ACTIVE);

        return toResponse(userGoalRepository.save(goal));
    }

    @Override
    public GoalResponse updateGoalProgress(String email, Long goalId, UpdateGoalProgressRequest request) {
        User user = findUser(email);
        UserGoal goal = userGoalRepository.findById(goalId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Goal not found"));

        if (!goal.getUser().getId().equals(user.getId())) {
            throw new AppException(HttpStatus.FORBIDDEN, "Goal does not belong to authenticated user");
        }

        int bounded = Math.max(0, Math.min(goal.getTargetValue(), request.currentValue()));
        goal.setCurrentValue(bounded);
        goal.setStatus(bounded >= goal.getTargetValue() ? GoalStatus.COMPLETE : GoalStatus.ACTIVE);

        return toResponse(userGoalRepository.save(goal));
    }

    private GoalResponse toResponse(UserGoal goal) {
        return new GoalResponse(
                goal.getId(),
                goal.getTitle(),
                goal.getTargetValue(),
                goal.getCurrentValue(),
                goal.getUnit(),
                goal.getDueDate().toString(),
                goal.getStatus().name()
        );
    }

    private User findUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));
    }
}

