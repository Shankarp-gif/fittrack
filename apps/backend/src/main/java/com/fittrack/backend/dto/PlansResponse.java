package com.fittrack.backend.dto;

import java.util.List;

public record PlansResponse(
        String activePlanId,
        List<PlanTemplateResponse> templates
) {
}

