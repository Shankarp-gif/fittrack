package com.fittrack.backend.service;

import com.fittrack.backend.dto.CreateMembershipRequest;
import com.fittrack.backend.dto.MembershipDTO;
import com.fittrack.backend.entity.enums.MemberStatus;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MembershipService {
    MembershipDTO createMembership(Long organizationId, CreateMembershipRequest request);

    MembershipDTO renewMembership(Long membershipId);

    MembershipDTO getMembership(Long membershipId);

    MembershipDTO getMemberCurrentMembership(Long memberId);

    Page<MembershipDTO> listMemberships(Long organizationId, Pageable pageable);

    Page<MembershipDTO> listMembershipsByStatus(Long organizationId, MemberStatus status, Pageable pageable);

    List<MembershipDTO> getExpiringMemberships(int daysFromNow);

    List<MembershipDTO> getExpiredMemberships();

    long countActiveMemberships(Long organizationId);

    void freezeMembership(Long membershipId, int days);

    void updateMembershipStatus();
}

