package com.fittrack.backend.repository;

import com.fittrack.backend.entity.Member;
import com.fittrack.backend.entity.enums.MemberStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByOrganizationIdAndMemberIdNumber(Long organizationId, String memberIdNumber);

    Page<Member> findByOrganizationIdAndBranchId(Long organizationId, Long branchId, Pageable pageable);

    Page<Member> findByOrganizationIdAndStatus(Long organizationId, MemberStatus status, Pageable pageable);

    @Query("SELECT m FROM Member m WHERE m.organization.id = :orgId AND (m.fullName ILIKE :search OR m.email ILIKE :search OR m.mobile ILIKE :search)")
    Page<Member> searchMembers(@Param("orgId") Long organizationId, @Param("search") String search, Pageable pageable);

    List<Member> findByOrganizationIdAndStatus(Long organizationId, MemberStatus status);

    long countByOrganizationId(Long organizationId);

    long countByOrganizationIdAndStatus(Long organizationId, MemberStatus status);
}

