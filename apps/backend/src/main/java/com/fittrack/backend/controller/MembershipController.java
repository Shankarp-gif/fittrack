package com.fittrack.backend.controller;

import com.fittrack.backend.dto.common.ApiResponse;
import com.fittrack.backend.dto.CreateMembershipRequest;
import com.fittrack.backend.dto.MembershipDTO;
import com.fittrack.backend.dto.MembershipPlanDTO;
import com.fittrack.backend.service.MembershipPlanService;
import com.fittrack.backend.service.MembershipService;
import com.fittrack.backend.util.AuthenticationContextHelper;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/memberships")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','TRAINER','RECEPTIONIST')")
public class MembershipController {

    private final MembershipService membershipService;
    private final MembershipPlanService membershipPlanService;
    private final AuthenticationContextHelper authContextHelper;

    // Membership endpoints
    @PostMapping
    public ResponseEntity<ApiResponse<MembershipDTO>> createMembership(
        @Valid @RequestBody CreateMembershipRequest request,
        Authentication authentication) {
        Long orgId = authContextHelper.getOrganizationId(authentication);
        MembershipDTO membership = membershipService.createMembership(orgId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Membership created successfully", membership));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MembershipDTO>> getMembership(@PathVariable Long id) {
        MembershipDTO membership = membershipService.getMembership(id);
        return ResponseEntity.ok(ApiResponse.success(membership));
    }

    @PostMapping("/{id}/renew")
    public ResponseEntity<ApiResponse<MembershipDTO>> renewMembership(@PathVariable Long id) {
        MembershipDTO membership = membershipService.renewMembership(id);
        return ResponseEntity.ok(ApiResponse.success("Membership renewed successfully", membership));
    }

    @PostMapping("/{id}/freeze")
    public ResponseEntity<ApiResponse<Void>> freezeMembership(
        @PathVariable Long id,
        @RequestBody(required = false) Integer days) {
        membershipService.freezeMembership(id, days != null ? days : 30);
        return ResponseEntity.ok(ApiResponse.success("Membership frozen successfully", null));
    }

    @GetMapping("/expiring-soon")
    public ResponseEntity<ApiResponse<List<MembershipDTO>>> getExpiringMemberships(Authentication authentication) {
        List<MembershipDTO> memberships = membershipService.getExpiringMemberships(7);
        return ResponseEntity.ok(ApiResponse.success(memberships));
    }

    // Membership Plan endpoints
    @PostMapping("/plans")
    public ResponseEntity<ApiResponse<MembershipPlanDTO>> createPlan(
        @Valid @RequestBody MembershipPlanDTO request,
        Authentication authentication) {
        Long orgId = authContextHelper.getOrganizationId(authentication);
        MembershipPlanDTO plan = membershipPlanService.createPlan(orgId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Plan created successfully", plan));
    }

    @GetMapping("/plans")
    public ResponseEntity<ApiResponse<List<MembershipPlanDTO>>> listPlans(Authentication authentication) {
        Long orgId = authContextHelper.getOrganizationId(authentication);
        List<MembershipPlanDTO> plans = membershipPlanService.listActivePlans(orgId);
        return ResponseEntity.ok(ApiResponse.success(plans));
    }

    @GetMapping("/plans/{id}")
    public ResponseEntity<ApiResponse<MembershipPlanDTO>> getPlan(@PathVariable Long id) {
        MembershipPlanDTO plan = membershipPlanService.getPlan(id);
        return ResponseEntity.ok(ApiResponse.success(plan));
    }

    @PutMapping("/plans/{id}")
    public ResponseEntity<ApiResponse<MembershipPlanDTO>> updatePlan(
        @PathVariable Long id,
        @Valid @RequestBody MembershipPlanDTO request) {
        MembershipPlanDTO plan = membershipPlanService.updatePlan(id, request);
        return ResponseEntity.ok(ApiResponse.success("Plan updated successfully", plan));
    }

    @DeleteMapping("/plans/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePlan(@PathVariable Long id) {
        membershipPlanService.deletePlan(id);
        return ResponseEntity.ok(ApiResponse.success("Plan deleted successfully", null));
    }
}



