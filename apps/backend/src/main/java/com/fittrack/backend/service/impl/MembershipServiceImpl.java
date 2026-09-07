package com.fittrack.backend.service.impl;

import com.fittrack.backend.dto.CreateMembershipRequest;
import com.fittrack.backend.dto.MembershipDTO;
import com.fittrack.backend.entity.Member;
import com.fittrack.backend.entity.Membership;
import com.fittrack.backend.entity.MembershipPlan;
import com.fittrack.backend.entity.enums.MemberStatus;
import com.fittrack.backend.exception.BusinessLogicException;
import com.fittrack.backend.exception.ResourceNotFoundException;
import com.fittrack.backend.repository.MemberRepository;
import com.fittrack.backend.repository.MembershipPlanRepository;
import com.fittrack.backend.repository.MembershipRepository;
import com.fittrack.backend.service.MembershipService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class MembershipServiceImpl implements MembershipService {

    private final MembershipRepository membershipRepository;
    private final MemberRepository memberRepository;
    private final MembershipPlanRepository membershipPlanRepository;

    @Override
    public MembershipDTO createMembership(Long organizationId, CreateMembershipRequest request) {
        Member member = memberRepository.findById(request.getMemberId())
            .orElseThrow(() -> new ResourceNotFoundException("Member not found"));

        MembershipPlan plan = membershipPlanRepository.findById(request.getMembershipPlanId())
            .orElseThrow(() -> new ResourceNotFoundException("Plan not found"));

        // If member already has active memberships, close them so the latest plan becomes the single current membership.
        membershipRepository.findAllByMemberIdAndActiveTrueOrderByCreatedAtDesc(member.getId()).forEach(existing -> {
            if (existing.getStatus() == MemberStatus.ACTIVE
                || existing.getStatus() == MemberStatus.EXPIRING_SOON
                || existing.getStatus() == MemberStatus.FROZEN
                || existing.getStatus() == MemberStatus.PENDING_PAYMENT) {
                existing.setStatus(MemberStatus.CANCELLED);
            }
            existing.setActive(false);
            membershipRepository.save(existing);
        });

        LocalDate startDate = LocalDate.now();
        LocalDate endDate = startDate.plusDays(plan.getDurationDays());

        Membership membership = new Membership();
        membership.setMember(member);
        membership.setMembershipPlan(plan);
        membership.setStartDate(startDate);
        membership.setEndDate(endDate);
        membership.setStatus(determineCurrentStatus(endDate));

        BigDecimal price = request.getCustomPrice() != null ? request.getCustomPrice() : plan.getPrice();
        BigDecimal discountAmount = request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO;
        BigDecimal taxAmount = request.getTaxAmount() != null ? request.getTaxAmount() :
            price.multiply(plan.getTaxPercentage() != null ? plan.getTaxPercentage() : BigDecimal.ZERO)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        membership.setPrice(price);
        membership.setDiscountAmount(discountAmount);
        membership.setTaxAmount(taxAmount);
        membership.setTotalAmount(price.add(taxAmount).subtract(discountAmount));

        Membership saved = membershipRepository.save(membership);

        // Update member status
        member.setStatus(saved.getStatus());
        memberRepository.save(member);

        return toDTO(saved);
    }

    @Override
    public MembershipDTO renewMembership(Long membershipId) {
        Membership oldMembership = membershipRepository.findById(membershipId)
            .orElseThrow(() -> new ResourceNotFoundException("Membership not found"));

        MembershipPlan plan = oldMembership.getMembershipPlan();
        Member member = oldMembership.getMember();

        LocalDate startDate = LocalDate.now();
        LocalDate endDate = startDate.plusDays(plan.getDurationDays());

        Membership newMembership = new Membership();
        newMembership.setMember(member);
        newMembership.setMembershipPlan(plan);
        newMembership.setStartDate(startDate);
        newMembership.setEndDate(endDate);
        newMembership.setStatus(determineCurrentStatus(endDate));
        newMembership.setRenewedFrom(oldMembership);

        BigDecimal price = plan.getPrice();
        BigDecimal discountAmount = BigDecimal.ZERO;
        BigDecimal taxAmount = price.multiply(plan.getTaxPercentage() != null ? plan.getTaxPercentage() : BigDecimal.ZERO)
            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        newMembership.setPrice(price);
        newMembership.setDiscountAmount(discountAmount);
        newMembership.setTaxAmount(taxAmount);
        newMembership.setTotalAmount(price.add(taxAmount).subtract(discountAmount));

        Membership saved = membershipRepository.save(newMembership);

        // Deactivate old membership
        oldMembership.setActive(false);
        membershipRepository.save(oldMembership);

        member.setStatus(saved.getStatus());
        memberRepository.save(member);

        return toDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public MembershipDTO getMembership(Long membershipId) {
        Membership membership = membershipRepository.findById(membershipId)
            .orElseThrow(() -> new ResourceNotFoundException("Membership not found"));
        return toDTO(membership);
    }

    @Override
    @Transactional(readOnly = true)
    public MembershipDTO getMemberCurrentMembership(Long memberId) {
        Membership membership = membershipRepository.findFirstByMemberIdAndActiveTrueOrderByCreatedAtDesc(memberId)
            .orElseThrow(() -> new ResourceNotFoundException("No active membership found for member"));
        return toDTO(membership);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MembershipDTO> listMemberships(Long organizationId, Pageable pageable) {
        return membershipRepository.findAll(pageable)
            .map(this::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MembershipDTO> listMembershipsByStatus(Long organizationId, MemberStatus status, Pageable pageable) {
        return membershipRepository.findByStatus(status, pageable)
            .map(this::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MembershipDTO> getExpiringMemberships(int daysFromNow) {
        LocalDate today = LocalDate.now();
        LocalDate futureDate = today.plusDays(daysFromNow);
        return membershipRepository.findExpiringMemberships(today, futureDate).stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MembershipDTO> getExpiredMemberships() {
        return membershipRepository.findExpiredMemberships(LocalDate.now()).stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long countActiveMemberships(Long organizationId) {
        return membershipRepository.countActiveMemberships(LocalDate.now());
    }

    @Override
    public void freezeMembership(Long membershipId, int days) {
        Membership membership = membershipRepository.findById(membershipId)
            .orElseThrow(() -> new ResourceNotFoundException("Membership not found"));

        MembershipPlan plan = membership.getMembershipPlan();
        if (plan.getFreezeAllowance() != null &&
            membership.getFreezeCount() != null &&
            membership.getFreezeCount() >= plan.getFreezeAllowance()) {
            throw new BusinessLogicException("FREEZE_LIMIT_EXCEEDED", "Freeze allowance limit exceeded");
        }

        if (membership.getStatus() == MemberStatus.FROZEN) {
            throw new BusinessLogicException("MEMBERSHIP_ALREADY_FROZEN", "Membership is already frozen");
        }

        membership.setFrozenUntil(LocalDate.now().plusDays(days));
        membership.setStatus(MemberStatus.FROZEN);
        membership.setFreezeCount((membership.getFreezeCount() != null ? membership.getFreezeCount() : 0) + 1);
        membership.getMember().setStatus(MemberStatus.FROZEN);

        membershipRepository.save(membership);
    }

    @Override
    public void unfreezeMembership(Long membershipId) {
        Membership membership = membershipRepository.findById(membershipId)
            .orElseThrow(() -> new ResourceNotFoundException("Membership not found"));

        if (membership.getStatus() != MemberStatus.FROZEN) {
            throw new BusinessLogicException("MEMBERSHIP_NOT_FROZEN", "Only frozen memberships can be unfrozen");
        }

        MemberStatus updatedStatus = determineCurrentStatus(membership.getEndDate());
        membership.setFrozenUntil(null);
        membership.setStatus(updatedStatus);
        membership.getMember().setStatus(updatedStatus);

        membershipRepository.save(membership);
    }

    @Override
    @Transactional
    public void updateMembershipStatus() {
        membershipRepository.findAll().forEach(membership -> {
            if (!membership.isActive()) {
                return;
            }

            if (membership.getStatus() == MemberStatus.FROZEN) {
                if (membership.getFrozenUntil() != null && !membership.getFrozenUntil().isAfter(LocalDate.now())) {
                    MemberStatus updatedStatus = determineCurrentStatus(membership.getEndDate());
                    membership.setFrozenUntil(null);
                    membership.setStatus(updatedStatus);
                    membership.getMember().setStatus(updatedStatus);
                    membershipRepository.save(membership);
                }
                return;
            }

            MemberStatus updatedStatus = determineCurrentStatus(membership.getEndDate());
            if (membership.getStatus() != updatedStatus) {
                membership.setStatus(updatedStatus);
                membership.getMember().setStatus(updatedStatus);
                membershipRepository.save(membership);
            }
        });
    }

    private MemberStatus determineCurrentStatus(LocalDate endDate) {
        LocalDate today = LocalDate.now();

        if (endDate == null || endDate.isBefore(today)) {
            return MemberStatus.EXPIRED;
        }

        if (!endDate.isAfter(today.plusDays(7))) {
            return MemberStatus.EXPIRING_SOON;
        }

        return MemberStatus.ACTIVE;
    }

    private MembershipDTO toDTO(Membership membership) {
        return MembershipDTO.builder()
            .id(membership.getId())
            .memberId(membership.getMember().getId())
            .membershipPlanId(membership.getMembershipPlan().getId())
            .memberName(membership.getMember().getFullName())
            .planName(membership.getMembershipPlan().getName())
            .startDate(membership.getStartDate())
            .endDate(membership.getEndDate())
            .status(membership.getStatus())
            .price(membership.getPrice())
            .discountAmount(membership.getDiscountAmount())
            .taxAmount(membership.getTaxAmount())
            .totalAmount(membership.getTotalAmount())
            .frozenUntil(membership.getFrozenUntil())
            .freezeCount(membership.getFreezeCount())
            .active(membership.isActive())
            .build();
    }
}

