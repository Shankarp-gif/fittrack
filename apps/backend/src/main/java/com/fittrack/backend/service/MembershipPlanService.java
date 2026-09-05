package com.fittrack.backend.service;

import com.fittrack.backend.dto.MembershipPlanDTO;
import java.util.List;

public interface MembershipPlanService {
    MembershipPlanDTO createPlan(Long organizationId, MembershipPlanDTO request);

    MembershipPlanDTO updatePlan(Long planId, MembershipPlanDTO request);

    MembershipPlanDTO getPlan(Long planId);

    List<MembershipPlanDTO> listPlans(Long organizationId);

    List<MembershipPlanDTO> listActivePlans(Long organizationId);

    void deletePlan(Long planId);
}

