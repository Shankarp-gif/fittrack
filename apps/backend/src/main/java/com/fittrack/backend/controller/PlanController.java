package com.fittrack.backend.controller;

import com.fittrack.backend.dto.ActivatePlanRequest;
import com.fittrack.backend.dto.PlansResponse;
import com.fittrack.backend.service.PlanService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/plans")
@PreAuthorize("isAuthenticated()")
public class PlanController {

    private final PlanService planService;

    public PlanController(PlanService planService) {
        this.planService = planService;
    }

    @GetMapping
    public PlansResponse get(Authentication authentication) {
        return planService.getPlans(authentication.getName());
    }

    @PostMapping("/activate")
    public PlansResponse activate(Authentication authentication, @Valid @RequestBody ActivatePlanRequest request) {
        return planService.activatePlan(authentication.getName(), request.planId());
    }
}

