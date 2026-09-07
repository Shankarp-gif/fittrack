package com.fittrack.backend.controller;

import com.fittrack.backend.dto.common.ApiResponse;
import com.fittrack.backend.dto.CreateMembershipRequest;
import com.fittrack.backend.dto.MemberDTO;
import com.fittrack.backend.dto.MembershipDTO;
import com.fittrack.backend.dto.MembershipPlanDTO;
import com.fittrack.backend.service.MemberService;
import com.fittrack.backend.service.MembershipPlanService;
import com.fittrack.backend.service.MembershipService;
import com.fittrack.backend.util.AuthenticationContextHelper;
import jakarta.validation.Valid;
import java.util.Collections;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
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
@PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','TRAINER','RECEPTIONIST','USER')")
public class MembershipController {

    private final MembershipService membershipService;
    private final MembershipPlanService membershipPlanService;
    private final MemberService memberService;
    private final AuthenticationContextHelper authContextHelper;

    // Membership endpoints
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','TRAINER','RECEPTIONIST','USER')")
    public ResponseEntity<ApiResponse<MembershipDTO>> createMembership(
        @Valid @RequestBody CreateMembershipRequest request,
        Authentication authentication) {
        MemberDTO authenticatedMember = isUserRole(authentication) ? resolveAuthenticatedMember(authentication) : null;
        Long orgId = resolveOrganizationId(authentication, authenticatedMember);
        if (isUserRole(authentication)) {
            Long memberId = authenticatedMember.getId();
            if (!memberId.equals(request.getMemberId())) {
                throw new AccessDeniedException("You can only create membership for your own account");
            }
        }
        MembershipDTO membership = membershipService.createMembership(orgId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Membership created successfully", membership));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','TRAINER','RECEPTIONIST')")
    public ResponseEntity<ApiResponse<MembershipDTO>> getMembership(@PathVariable Long id) {
        MembershipDTO membership = membershipService.getMembership(id);
        return ResponseEntity.ok(ApiResponse.success(membership));
    }

    @PostMapping("/{id}/renew")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','TRAINER','RECEPTIONIST','USER')")
    public ResponseEntity<ApiResponse<MembershipDTO>> renewMembership(
        @PathVariable Long id,
        Authentication authentication) {
        assertUserCanAccessMembership(id, authentication);
        MembershipDTO membership = membershipService.renewMembership(id);
        return ResponseEntity.ok(ApiResponse.success("Membership renewed successfully", membership));
    }

    @PostMapping("/{id}/freeze")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','TRAINER','RECEPTIONIST','USER')")
    public ResponseEntity<ApiResponse<Void>> freezeMembership(
        @PathVariable Long id,
        @RequestBody(required = false) Integer days,
        Authentication authentication) {
        assertUserCanAccessMembership(id, authentication);
        membershipService.freezeMembership(id, days != null ? days : 30);
        return ResponseEntity.ok(ApiResponse.success("Membership frozen successfully", null));
    }

    @PostMapping("/{id}/unfreeze")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','TRAINER','RECEPTIONIST','USER')")
    public ResponseEntity<ApiResponse<Void>> unfreezeMembership(
        @PathVariable Long id,
        Authentication authentication) {
        assertUserCanAccessMembership(id, authentication);
        membershipService.unfreezeMembership(id);
        return ResponseEntity.ok(ApiResponse.success("Membership unfrozen successfully", null));
    }

    @GetMapping("/expiring-soon")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','TRAINER','RECEPTIONIST')")
    public ResponseEntity<ApiResponse<List<MembershipDTO>>> getExpiringMemberships() {
        List<MembershipDTO> memberships = membershipService.getExpiringMemberships(7);
        return ResponseEntity.ok(ApiResponse.success(memberships));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<MembershipDTO>>> getMyMemberships(Authentication authentication) {
        MemberDTO member = resolveAuthenticatedMember(authentication, false);
        if (member == null) {
            return ResponseEntity.ok(ApiResponse.success(Collections.emptyList()));
        }

        try {
            MembershipDTO membership = membershipService.getMemberCurrentMembership(member.getId());
            return ResponseEntity.ok(ApiResponse.success(List.of(membership)));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResponse.success(Collections.emptyList()));
        }
    }

    @GetMapping("/my/member")
    public ResponseEntity<ApiResponse<MemberDTO>> getMyMemberProfile(Authentication authentication) {
        MemberDTO member = resolveAuthenticatedMember(authentication, false);
        if (member == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("NOT_FOUND", "No member profile linked to this account"));
        }

        return ResponseEntity.ok(ApiResponse.success(member));
    }

    @GetMapping("/member/{memberId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','TRAINER','RECEPTIONIST')")
    public ResponseEntity<ApiResponse<MembershipDTO>> getMemberCurrentMembership(
        @PathVariable Long memberId,
        Authentication authentication) {
        Long orgId = authContextHelper.getOrganizationId(authentication);
        MemberDTO member = memberService.getMember(memberId);

        if (member.getOrganizationId() == null || !member.getOrganizationId().equals(orgId)) {
            throw new AccessDeniedException("You can only access memberships for members in your organization");
        }

        try {
            MembershipDTO membership = membershipService.getMemberCurrentMembership(memberId);
            return ResponseEntity.ok(ApiResponse.success(membership));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResponse.success(null));
        }
    }

    private boolean isUserRole(Authentication authentication) {
        String role = authContextHelper.getUserRole(authentication);
        return "USER".equalsIgnoreCase(role);
    }

    private void assertUserCanAccessMembership(Long membershipId, Authentication authentication) {
        if (!isUserRole(authentication)) {
            return;
        }

        Long memberId = resolveAuthenticatedMember(authentication).getId();
        MembershipDTO membership = membershipService.getMembership(membershipId);
        if (!memberId.equals(membership.getMemberId())) {
            throw new AccessDeniedException("You can only access your own membership");
        }
    }

    private Long resolveAuthenticatedMemberId(Authentication authentication) {
        return resolveAuthenticatedMember(authentication).getId();
    }

    private MemberDTO resolveAuthenticatedMember(Authentication authentication) {
        return resolveAuthenticatedMember(authentication, true);
    }

    private MemberDTO resolveAuthenticatedMember(Authentication authentication, boolean throwWhenMissing) {
        String email = authContextHelper.getUserEmail(authentication);
        Long orgId = null;

        try {
            orgId = authContextHelper.getOrganizationId(authentication);
        } catch (AuthenticationException ignored) {
            // Fall back to member lookup by email when the user record has no organization.
        }

        MemberDTO member = orgId != null
            ? memberService.findMemberByOrganizationAndEmail(orgId, email).orElse(null)
            : null;

        if (member == null) {
            member = memberService.findMemberByEmail(email).orElse(null);
        }

        if (member == null && throwWhenMissing) {
            throw new AccessDeniedException("No member profile linked to this account");
        }

        return member;
    }

    private Long resolveOrganizationId(Authentication authentication, MemberDTO fallbackMember) {
        try {
            return authContextHelper.getOrganizationId(authentication);
        } catch (AuthenticationException ignored) {
            if (fallbackMember != null && fallbackMember.getOrganizationId() != null) {
                return fallbackMember.getOrganizationId();
            }
            throw new AccessDeniedException("No organization found for the authenticated user");
        }
    }


    // Membership Plan endpoints
    @PostMapping("/plans")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','TRAINER','RECEPTIONIST')")
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
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','TRAINER','RECEPTIONIST')")
    public ResponseEntity<ApiResponse<MembershipPlanDTO>> updatePlan(
        @PathVariable Long id,
        @Valid @RequestBody MembershipPlanDTO request) {
        MembershipPlanDTO plan = membershipPlanService.updatePlan(id, request);
        return ResponseEntity.ok(ApiResponse.success("Plan updated successfully", plan));
    }

    @DeleteMapping("/plans/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','TRAINER','RECEPTIONIST')")
    public ResponseEntity<ApiResponse<Void>> deletePlan(@PathVariable Long id) {
        membershipPlanService.deletePlan(id);
        return ResponseEntity.ok(ApiResponse.success("Plan deleted successfully", null));
    }
}



