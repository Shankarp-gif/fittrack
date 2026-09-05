package com.fittrack.backend.service.impl;

import com.fittrack.backend.dto.PlanTemplateResponse;
import com.fittrack.backend.dto.PlansResponse;
import com.fittrack.backend.entity.User;
import com.fittrack.backend.entity.UserPlan;
import com.fittrack.backend.exception.AppException;
import com.fittrack.backend.repository.UserPlanRepository;
import com.fittrack.backend.repository.UserRepository;
import com.fittrack.backend.service.PlanService;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class PlanServiceImpl implements PlanService {

    private static final List<PlanTemplateResponse> TEMPLATES = List.of(
            new PlanTemplateResponse("strength-4", "Strength Builder", 4, "Progressive overload", 8),
            new PlanTemplateResponse("fatloss-5", "Lean Cut", 5, "Conditioning and calorie burn", 6),
            new PlanTemplateResponse("balanced-3", "Balanced Fitness", 3, "Mobility and core strength", 10)
    );

    private static final Set<String> TEMPLATE_IDS = TEMPLATES.stream().map(PlanTemplateResponse::id).collect(java.util.stream.Collectors.toSet());

    private final UserRepository userRepository;
    private final UserPlanRepository userPlanRepository;

    public PlanServiceImpl(UserRepository userRepository, UserPlanRepository userPlanRepository) {
        this.userRepository = userRepository;
        this.userPlanRepository = userPlanRepository;
    }

    @Override
    public PlansResponse getPlans(String email) {
        User user = findUser(email);
        String activePlanId = userPlanRepository.findByUserId(user.getId()).map(UserPlan::getTemplateKey).orElse(null);
        return new PlansResponse(activePlanId, TEMPLATES);
    }

    @Override
    public PlansResponse activatePlan(String email, String planId) {
        if (!TEMPLATE_IDS.contains(planId)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Unknown plan template");
        }

        User user = findUser(email);
        UserPlan userPlan = userPlanRepository.findByUserId(user.getId()).orElseGet(() -> {
            UserPlan plan = new UserPlan();
            plan.setUser(user);
            return plan;
        });

        userPlan.setTemplateKey(planId);
        userPlanRepository.save(userPlan);

        return new PlansResponse(planId, TEMPLATES);
    }

    private User findUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));
    }
}

