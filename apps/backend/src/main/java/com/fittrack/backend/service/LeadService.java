package com.fittrack.backend.service;

import com.fittrack.backend.dto.CreateLeadFollowupRequest;
import com.fittrack.backend.dto.CreateLeadRequest;
import com.fittrack.backend.dto.LeadDTO;
import com.fittrack.backend.dto.LeadFollowupDTO;
import com.fittrack.backend.dto.UpdateLeadRequest;
import com.fittrack.backend.dto.ConvertLeadToMemberRequest;
import com.fittrack.backend.dto.MemberDTO;
import com.fittrack.backend.entity.Lead;
import com.fittrack.backend.entity.LeadFollowup;
import com.fittrack.backend.entity.Member;
import com.fittrack.backend.entity.Organization;
import com.fittrack.backend.entity.Branch;
import com.fittrack.backend.entity.User;
import com.fittrack.backend.entity.enums.LeadStatus;
import com.fittrack.backend.entity.enums.FollowupStatus;
import com.fittrack.backend.entity.enums.MemberStatus;
import com.fittrack.backend.exception.ResourceNotFoundException;
import com.fittrack.backend.exception.ValidationException;
import com.fittrack.backend.repository.LeadRepository;
import com.fittrack.backend.repository.LeadFollowupRepository;
import com.fittrack.backend.repository.OrganizationRepository;
import com.fittrack.backend.repository.UserRepository;
import com.fittrack.backend.repository.BranchRepository;
import com.fittrack.backend.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LeadService {

    private final LeadRepository leadRepository;
    private final LeadFollowupRepository leadFollowupRepository;
    private final OrganizationRepository organizationRepository;
    private final BranchRepository branchRepository;
    private final UserRepository userRepository;
    private final MemberRepository memberRepository;
    private final MemberService memberService;
    private final MembershipService membershipService;

    /**
     * Create a new lead
     */
    @Transactional
    public LeadDTO createLead(Long organizationId, CreateLeadRequest request) {
        log.info("Creating lead for organization: {}", organizationId);

        // Verify organization
        Organization org = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        // Verify branch if provided
        Branch branch = null;
        if (request.getInterestedBranchId() != null) {
            branch = branchRepository.findById(request.getInterestedBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found"));
            if (!branch.getOrganization().getId().equals(organizationId)) {
                throw new ValidationException("Branch does not belong to this organization");
            }
        }

        // Check for duplicate phone
        if (leadRepository.findByOrganizationIdAndPhone(organizationId, request.getPhone()).isPresent()) {
            throw new ValidationException("Lead with this phone number already exists");
        }

        Lead lead = new Lead();
        lead.setOrganization(org);
        lead.setBranch(branch);
        lead.setFullName(request.getFullName());
        lead.setEmail(request.getEmail());
        lead.setPhone(request.getPhone());
        lead.setSource(request.getSource());
        lead.setPriority(request.getPriority() != null ? request.getPriority() : "MEDIUM");
        lead.setExpectedValue(request.getExpectedValue());
        lead.setNotes(request.getNotes());
        lead.setStatus(LeadStatus.NEW);

        // Assign user if provided
        if (request.getAssignedUserId() != null) {
            User user = userRepository.findById(request.getAssignedUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            if (!user.getOrganization().getId().equals(organizationId)) {
                throw new ValidationException("User does not belong to this organization");
            }
            lead.setAssignedUser(user);
        }

        Lead saved = leadRepository.save(lead);
        log.info("Lead created with id: {}", saved.getId());

        return mapToDTO(saved);
    }

    /**
     * Get lead by ID
     */
    public LeadDTO getLead(Long organizationId, Long leadId) {
        Lead lead = leadRepository.findById(leadId)
            .orElseThrow(() -> new ResourceNotFoundException("Lead not found"));

        if (!lead.getOrganization().getId().equals(organizationId)) {
            throw new ValidationException("Lead does not belong to this organization");
        }

        return mapToDTO(lead);
    }

    /**
     * Get all leads for organization
     */
    public Page<LeadDTO> getLeads(Long organizationId, Pageable pageable) {
        Page<Lead> leads = leadRepository.findByOrganizationId(organizationId, pageable);
        return leads.map(this::mapToDTO);
    }

    /**
     * Get leads by status
     */
    public Page<LeadDTO> getLeadsByStatus(Long organizationId, String status, Pageable pageable) {
        LeadStatus leadStatus = LeadStatus.valueOf(status);
        Page<Lead> leads = leadRepository.findByOrganizationIdAndStatus(organizationId, leadStatus, pageable);
        return leads.map(this::mapToDTO);
    }

    /**
     * Update lead
     */
    @Transactional
    public LeadDTO updateLead(Long organizationId, Long leadId, UpdateLeadRequest request) {
        Lead lead = leadRepository.findById(leadId)
            .orElseThrow(() -> new ResourceNotFoundException("Lead not found"));

        if (!lead.getOrganization().getId().equals(organizationId)) {
            throw new ValidationException("Lead does not belong to this organization");
        }

        if (request.getFullName() != null) lead.setFullName(request.getFullName());
        if (request.getEmail() != null) lead.setEmail(request.getEmail());
        if (request.getPhone() != null) lead.setPhone(request.getPhone());
        if (request.getSource() != null) lead.setSource(request.getSource());
        if (request.getPriority() != null) lead.setPriority(request.getPriority());
        if (request.getExpectedValue() != null) lead.setExpectedValue(request.getExpectedValue());
        if (request.getNotes() != null) lead.setNotes(request.getNotes());
        if (request.getStatus() != null) {
            lead.setStatus(LeadStatus.valueOf(request.getStatus()));
        }

        if (request.getAssignedUserId() != null) {
            User user = userRepository.findById(request.getAssignedUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            lead.setAssignedUser(user);
        }

        lead.setLastContactDate(LocalDateTime.now());
        Lead saved = leadRepository.save(lead);
        return mapToDTO(saved);
    }

    /**
     * Convert lead to member
     */
    @Transactional
    public MemberDTO convertLeadToMember(Long organizationId, Long leadId, ConvertLeadToMemberRequest request) {
        log.info("Converting lead {} to member", leadId);

        Lead lead = leadRepository.findById(leadId)
            .orElseThrow(() -> new ResourceNotFoundException("Lead not found"));

        if (!lead.getOrganization().getId().equals(organizationId)) {
            throw new ValidationException("Lead does not belong to this organization");
        }

        // Create member from lead
        String memberIdNumber = generateMemberIdNumber(organizationId, request.getMemberIdPrefix());

        Member member = new Member();
        member.setOrganization(lead.getOrganization());
        member.setBranch(branchRepository.findById(request.getBranchId())
            .orElseThrow(() -> new ResourceNotFoundException("Branch not found")));
        member.setMemberIdNumber(memberIdNumber);
        member.setFullName(lead.getFullName());
        member.setEmail(lead.getEmail());
        member.setMobile(lead.getPhone());
        member.setStatus(MemberStatus.ACTIVE);
        member.setActive(true);

        Member savedMember = memberRepository.save(member);

        // Update lead
        lead.setStatus(LeadStatus.CONVERTED);
        lead.setConversionStatus("CONVERTED");
        lead.setConvertedMember(savedMember);
        leadRepository.save(lead);

        log.info("Lead {} converted to member {}", leadId, savedMember.getId());

        return memberService.getMember(savedMember.getId());
    }

    /**
     * Schedule a follow-up for the lead
     */
    @Transactional
    public LeadFollowupDTO scheduleFollowup(Long organizationId, Long leadId, CreateLeadFollowupRequest request) {
        Lead lead = leadRepository.findById(leadId)
            .orElseThrow(() -> new ResourceNotFoundException("Lead not found"));

        if (!lead.getOrganization().getId().equals(organizationId)) {
            throw new ValidationException("Lead does not belong to this organization");
        }

        LeadFollowup followup = new LeadFollowup();
        followup.setLead(lead);
        followup.setFollowupDate(request.getFollowupDate());
        followup.setFollowupType(request.getFollowupType());
        followup.setFollowupStatus(FollowupStatus.SCHEDULED);
        followup.setNotes(request.getNotes());

        if (request.getAssignedUserId() != null) {
            User user = userRepository.findById(request.getAssignedUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            followup.setAssignedUser(user);
        }

        lead.setStatus(LeadStatus.FOLLOW_UP_REQUIRED);
        lead.setLastContactDate(LocalDateTime.now());
        leadRepository.save(lead);

        LeadFollowup saved = leadFollowupRepository.save(followup);
        return mapFollowupToDTO(saved);
    }

    /**
     * Complete a follow-up
     */
    @Transactional
    public LeadFollowupDTO completeFollowup(Long organizationId, Long followupId, String outcome) {
        LeadFollowup followup = leadFollowupRepository.findById(followupId)
            .orElseThrow(() -> new ResourceNotFoundException("Followup not found"));

        if (!followup.getLead().getOrganization().getId().equals(organizationId)) {
            throw new ValidationException("Followup does not belong to this organization");
        }

        followup.setFollowupStatus(FollowupStatus.COMPLETED);
        followup.setCompletedDate(LocalDateTime.now());
        followup.setOutcome(outcome);

        LeadFollowup saved = leadFollowupRepository.save(followup);
        return mapFollowupToDTO(saved);
    }

    /**
     * Get pending follow-ups for today
     */
    public List<LeadFollowupDTO> getTodayFollowups(Long organizationId) {
        List<LeadFollowup> followups = leadFollowupRepository.findTodayFollowups(FollowupStatus.SCHEDULED);
        return followups.stream()
            .filter(f -> f.getLead().getOrganization().getId().equals(organizationId))
            .map(this::mapFollowupToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Search leads
     */
    public Page<LeadDTO> searchLeads(Long organizationId, String searchTerm, Pageable pageable) {
        Page<Lead> leads = leadRepository.searchLeads(organizationId, searchTerm, pageable);
        return leads.map(this::mapToDTO);
    }

    /**
     * Get conversion metrics
     */
    public LeadConversionMetricsDTO getConversionMetrics(Long organizationId) {
        Long totalLeads = leadRepository.count();
        Long convertedLeads = leadRepository.countByOrganizationIdAndStatus(organizationId, LeadStatus.CONVERTED);
        Long lostLeads = leadRepository.countByOrganizationIdAndStatus(organizationId, LeadStatus.LOST);

        return LeadConversionMetricsDTO.builder()
            .totalLeads(totalLeads)
            .convertedLeads(convertedLeads)
            .lostLeads(lostLeads)
            .conversionRate(totalLeads > 0 ? (convertedLeads * 100.0) / totalLeads : 0.0)
            .build();
    }

    // Helper Methods

    private LeadDTO mapToDTO(Lead lead) {
        Long followupCount = 0L;
        if (lead.getFollowups() != null) {
            followupCount = (long) lead.getFollowups().size();
        }

        Long convertedFollowups = 0L;
        if (lead.getFollowups() != null) {
            convertedFollowups = lead.getFollowups().stream()
                .filter(f -> f.getFollowupStatus() == FollowupStatus.COMPLETED)
                .count();
        }

        return LeadDTO.builder()
            .id(lead.getId())
            .organizationId(lead.getOrganization().getId())
            .branchId(lead.getBranch() != null ? lead.getBranch().getId() : null)
            .fullName(lead.getFullName())
            .email(lead.getEmail())
            .phone(lead.getPhone())
            .source(lead.getSource())
            .interestedPlanId(lead.getInterestedPlan() != null ? lead.getInterestedPlan().getId() : null)
            .interestedBranchId(lead.getInterestedBranch() != null ? lead.getInterestedBranch().getId() : null)
            .assignedUserId(lead.getAssignedUser() != null ? lead.getAssignedUser().getId() : null)
            .assignedUserName(lead.getAssignedUser() != null ? lead.getAssignedUser().getFullName() : null)
            .status(lead.getStatus().name())
            .conversionStatus(lead.getConversionStatus())
            .convertedMemberId(lead.getConvertedMember() != null ? lead.getConvertedMember().getId() : null)
            .priority(lead.getPriority())
            .expectedValue(lead.getExpectedValue())
            .notes(lead.getNotes())
            .lastContactDate(lead.getLastContactDate())
            .createdAt(convertInstantToLocalDateTime(lead.getCreatedAt()))
            .updatedAt(convertInstantToLocalDateTime(lead.getUpdatedAt()))
            .followupCount(Math.toIntExact(followupCount))
            .convertedFollowups(Math.toIntExact(convertedFollowups))
            .build();
    }

    private LeadFollowupDTO mapFollowupToDTO(LeadFollowup followup) {
        return LeadFollowupDTO.builder()
            .id(followup.getId())
            .leadId(followup.getLead().getId())
            .assignedUserId(followup.getAssignedUser() != null ? followup.getAssignedUser().getId() : null)
            .assignedUserName(followup.getAssignedUser() != null ? followup.getAssignedUser().getFullName() : null)
            .followupStatus(followup.getFollowupStatus().name())
            .followupType(followup.getFollowupType())
            .followupDate(followup.getFollowupDate())
            .completedDate(followup.getCompletedDate())
            .outcome(followup.getOutcome())
            .notes(followup.getNotes())
            .createdAt(convertInstantToLocalDateTime(followup.getCreatedAt()))
            .updatedAt(convertInstantToLocalDateTime(followup.getUpdatedAt()))
            .build();
    }

    private String generateMemberIdNumber(Long organizationId, String prefix) {
        long count = memberRepository.countByOrganizationId(organizationId);
        return prefix + String.format("%05d", count + 1);
    }

    private LocalDateTime convertInstantToLocalDateTime(java.time.Instant instant) {
        if (instant == null) return null;
        return LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
    }

    // Support DTO
    public static class LeadConversionMetricsDTO {
        private Long totalLeads;
        private Long convertedLeads;
        private Long lostLeads;
        private Double conversionRate;

        public LeadConversionMetricsDTO() {}

        public LeadConversionMetricsDTO(Long totalLeads, Long convertedLeads, Long lostLeads, Double conversionRate) {
            this.totalLeads = totalLeads;
            this.convertedLeads = convertedLeads;
            this.lostLeads = lostLeads;
            this.conversionRate = conversionRate;
        }

        public static Builder builder() {
            return new Builder();
        }

        public Long getTotalLeads() { return totalLeads; }
        public void setTotalLeads(Long totalLeads) { this.totalLeads = totalLeads; }
        public Long getConvertedLeads() { return convertedLeads; }
        public void setConvertedLeads(Long convertedLeads) { this.convertedLeads = convertedLeads; }
        public Long getLostLeads() { return lostLeads; }
        public void setLostLeads(Long lostLeads) { this.lostLeads = lostLeads; }
        public Double getConversionRate() { return conversionRate; }
        public void setConversionRate(Double conversionRate) { this.conversionRate = conversionRate; }

        public static class Builder {
            private Long totalLeads;
            private Long convertedLeads;
            private Long lostLeads;
            private Double conversionRate;

            public Builder totalLeads(Long totalLeads) {
                this.totalLeads = totalLeads;
                return this;
            }

            public Builder convertedLeads(Long convertedLeads) {
                this.convertedLeads = convertedLeads;
                return this;
            }

            public Builder lostLeads(Long lostLeads) {
                this.lostLeads = lostLeads;
                return this;
            }

            public Builder conversionRate(Double conversionRate) {
                this.conversionRate = conversionRate;
                return this;
            }

            public LeadConversionMetricsDTO build() {
                LeadConversionMetricsDTO dto = new LeadConversionMetricsDTO();
                dto.totalLeads = this.totalLeads;
                dto.convertedLeads = this.convertedLeads;
                dto.lostLeads = this.lostLeads;
                dto.conversionRate = this.conversionRate;
                return dto;
            }
        }
    }
}

