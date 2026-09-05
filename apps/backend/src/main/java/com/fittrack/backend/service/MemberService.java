package com.fittrack.backend.service;

import com.fittrack.backend.dto.CreateMemberRequest;
import com.fittrack.backend.dto.MemberDTO;
import com.fittrack.backend.entity.Member;
import com.fittrack.backend.entity.enums.MemberStatus;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MemberService {
    MemberDTO createMember(Long organizationId, Long branchId, CreateMemberRequest request);

    MemberDTO updateMember(Long memberId, CreateMemberRequest request);

    MemberDTO getMember(Long memberId);

    Page<MemberDTO> listMembers(Long organizationId, Long branchId, Pageable pageable);

    Page<MemberDTO> searchMembers(Long organizationId, String query, Pageable pageable);

    void deleteMember(Long memberId);

    long countActiveMembers(Long organizationId);

    long countMembersByStatus(Long organizationId, MemberStatus status);

    List<MemberDTO> getMembersByStatus(Long organizationId, MemberStatus status);
}

