package com.fittrack.backend.service.impl;

import com.fittrack.backend.dto.CreateMemberRequest;
import com.fittrack.backend.dto.MemberDTO;
import com.fittrack.backend.entity.Branch;
import com.fittrack.backend.entity.Member;
import com.fittrack.backend.entity.Organization;
import com.fittrack.backend.entity.enums.MemberStatus;
import com.fittrack.backend.exception.ResourceNotFoundException;
import com.fittrack.backend.repository.BranchRepository;
import com.fittrack.backend.repository.MemberRepository;
import com.fittrack.backend.repository.OrganizationRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fittrack.backend.service.MemberService;

@Service
@RequiredArgsConstructor
@Transactional
public class MemberServiceImpl implements MemberService {

    private final MemberRepository memberRepository;
    private final OrganizationRepository organizationRepository;
    private final BranchRepository branchRepository;

    @Override
    public MemberDTO createMember(Long organizationId, Long branchId, CreateMemberRequest request) {
        Organization org = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        Branch branch = branchRepository.findByOrganizationIdAndId(organizationId, branchId)
            .orElseThrow(() -> new ResourceNotFoundException("Branch not found"));

        Member member = new Member();
        member.setOrganization(org);
        member.setBranch(branch);
        member.setMemberIdNumber(generateMemberIdNumber(organizationId));
        member.setFullName(request.getFullName());
        member.setEmail(request.getEmail());
        member.setMobile(request.getMobile());
        member.setDateOfBirth(request.getDateOfBirth());
        member.setGender(request.getGender());
        member.setAddress(request.getAddress());
        member.setEmergencyContactName(request.getEmergencyContactName());
        member.setEmergencyContactPhone(request.getEmergencyContactPhone());
        member.setNotes(request.getNotes());
        member.setStatus(MemberStatus.PENDING_PAYMENT);

        Member saved = memberRepository.save(member);
        return toDTO(saved);
    }

    @Override
    public MemberDTO updateMember(Long memberId, CreateMemberRequest request) {
        Member member = memberRepository.findById(memberId)
            .orElseThrow(() -> new ResourceNotFoundException("Member not found"));

        member.setFullName(request.getFullName());
        member.setEmail(request.getEmail());
        member.setMobile(request.getMobile());
        member.setDateOfBirth(request.getDateOfBirth());
        member.setGender(request.getGender());
        member.setAddress(request.getAddress());
        member.setEmergencyContactName(request.getEmergencyContactName());
        member.setEmergencyContactPhone(request.getEmergencyContactPhone());
        member.setNotes(request.getNotes());

        Member updated = memberRepository.save(member);
        return toDTO(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public MemberDTO getMember(Long memberId) {
        Member member = memberRepository.findById(memberId)
            .orElseThrow(() -> new ResourceNotFoundException("Member not found"));
        return toDTO(member);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MemberDTO> listMembers(Long organizationId, Long branchId, Pageable pageable) {
        return memberRepository.findByOrganizationIdAndBranchId(organizationId, branchId, pageable)
            .map(this::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MemberDTO> searchMembers(Long organizationId, String query, Pageable pageable) {
        return memberRepository.searchMembers(organizationId, "%" + query + "%", pageable)
            .map(this::toDTO);
    }

    @Override
    public void deleteMember(Long memberId) {
        Member member = memberRepository.findById(memberId)
            .orElseThrow(() -> new ResourceNotFoundException("Member not found"));
        member.setActive(false);
        memberRepository.save(member);
    }

    @Override
    @Transactional(readOnly = true)
    public long countActiveMembers(Long organizationId) {
        return memberRepository.countByOrganizationIdAndStatus(organizationId, MemberStatus.ACTIVE);
    }

    @Override
    @Transactional(readOnly = true)
    public long countMembersByStatus(Long organizationId, MemberStatus status) {
        return memberRepository.countByOrganizationIdAndStatus(organizationId, status);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MemberDTO> getMembersByStatus(Long organizationId, MemberStatus status) {
        return memberRepository.findByOrganizationIdAndStatus(organizationId, status).stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    private String generateMemberIdNumber(Long organizationId) {
        long count = memberRepository.countByOrganizationId(organizationId) + 1;
        return String.format("MEM%04d", count);
    }

    private MemberDTO toDTO(Member member) {
        return MemberDTO.builder()
            .id(member.getId())
            .memberIdNumber(member.getMemberIdNumber())
            .fullName(member.getFullName())
            .email(member.getEmail())
            .mobile(member.getMobile())
            .dateOfBirth(member.getDateOfBirth())
            .gender(member.getGender())
            .address(member.getAddress())
            .emergencyContactName(member.getEmergencyContactName())
            .emergencyContactPhone(member.getEmergencyContactPhone())
            .status(member.getStatus())
            .notes(member.getNotes())
            .photoUrl(member.getPhotoUrl())
            .createdAt(member.getCreatedAt())
            .updatedAt(member.getUpdatedAt())
            .build();
    }
}

