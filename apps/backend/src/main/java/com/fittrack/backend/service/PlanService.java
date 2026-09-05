package com.fittrack.backend.service;

import com.fittrack.backend.dto.PlansResponse;

public interface PlanService {
    PlansResponse getPlans(String email);

    PlansResponse activatePlan(String email, String planId);
}

