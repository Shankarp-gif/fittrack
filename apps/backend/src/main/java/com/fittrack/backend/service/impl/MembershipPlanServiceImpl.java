package com.fittrack.backend.service.impl;

import com.fittrack.backend.dto.MembershipPlanDTO;
import com.fittrack.backend.entity.MembershipPlan;
import com.fittrack.backend.entity.Organization;
import com.fittrack.backend.exception.ResourceNotFoundException;
import com.fittrack.backend.repository.MembershipPlanRepository;
import com.fittrack.backend.repository.OrganizationRepository;
import com.fittrack.backend.service.MembershipPlanService;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class MembershipPlanServiceImpl implements MembershipPlanService {

    private final MembershipPlanRepository membershipPlanRepository;
    private final OrganizationRepository organizationRepository;

    @Override
    public MembershipPlanDTO createPlan(Long organizationId, MembershipPlanDTO request) {
        Organization org = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        MembershipPlan plan = new MembershipPlan();
        plan.setOrganization(org);
        plan.setName(request.getName());
        plan.setDescription(request.getDescription());
        plan.setDurationDays(request.getDurationDays());
        plan.setPrice(request.getPrice());
        plan.setJoiningFee(request.getJoiningFee());
        plan.setDiscountPercentage(request.getDiscountPercentage());
        plan.setTaxPercentage(request.getTaxPercentage());
        plan.setMaxPtSessions(request.getMaxPtSessions());
        plan.setFreezeAllowance(request.getFreezeAllowance());
        plan.setActive(true);

        MembershipPlan saved = membershipPlanRepository.save(plan);
        return toDTO(saved);
    }

    @Override
    public MembershipPlanDTO updatePlan(Long planId, MembershipPlanDTO request) {
        MembershipPlan plan = membershipPlanRepository.findById(planId)
            .orElseThrow(() -> new ResourceNotFoundException("Plan not found"));

        plan.setName(request.getName());
        plan.setDescription(request.getDescription());
        plan.setDurationDays(request.getDurationDays());
        plan.setPrice(request.getPrice());
        plan.setJoiningFee(request.getJoiningFee());
        plan.setDiscountPercentage(request.getDiscountPercentage());
        plan.setTaxPercentage(request.getTaxPercentage());
        plan.setMaxPtSessions(request.getMaxPtSessions());
        plan.setFreezeAllowance(request.getFreezeAllowance());

        MembershipPlan updated = membershipPlanRepository.save(plan);
        return toDTO(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public MembershipPlanDTO getPlan(Long planId) {
        MembershipPlan plan = membershipPlanRepository.findById(planId)
            .orElseThrow(() -> new ResourceNotFoundException("Plan not found"));
        return toDTO(plan);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MembershipPlanDTO> listPlans(Long organizationId) {
        return membershipPlanRepository.findByOrganizationId(organizationId).stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MembershipPlanDTO> listActivePlans(Long organizationId) {
        return membershipPlanRepository.findByOrganizationIdAndActiveTrue(organizationId).stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    @Override
    public void deletePlan(Long planId) {
        MembershipPlan plan = membershipPlanRepository.findById(planId)
            .orElseThrow(() -> new ResourceNotFoundException("Plan not found"));
        plan.setActive(false);
        membershipPlanRepository.save(plan);
    }

    private MembershipPlanDTO toDTO(MembershipPlan plan) {
        return MembershipPlanDTO.builder()
            .id(plan.getId())
            .name(plan.getName())
            .description(plan.getDescription())
            .durationDays(plan.getDurationDays())
            .price(plan.getPrice())
            .joiningFee(plan.getJoiningFee())
            .discountPercentage(plan.getDiscountPercentage())
            .taxPercentage(plan.getTaxPercentage())
            .maxPtSessions(plan.getMaxPtSessions())
            .freezeAllowance(plan.getFreezeAllowance())
            .active(plan.isActive())
            .build();
    }
}

