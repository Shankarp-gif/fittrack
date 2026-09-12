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

    Optional<Member> findFirstByOrganizationIdAndEmailIgnoreCaseAndActiveTrue(Long organizationId, String email);

    Optional<Member> findFirstByEmailIgnoreCaseAndActiveTrue(String email);

    Page<Member> findByOrganizationIdAndBranchId(Long organizationId, Long branchId, Pageable pageable);

    Page<Member> findByOrganizationIdAndStatus(Long organizationId, MemberStatus status, Pageable pageable);

    @Query("SELECT m FROM Member m WHERE m.organization.id = :orgId AND (m.fullName ILIKE :search OR m.email ILIKE :search OR m.mobile ILIKE :search)")
    Page<Member> searchMembers(@Param("orgId") Long organizationId, @Param("search") String search, Pageable pageable);

    @Query("""
        SELECT m FROM Member m
        WHERE (:organizationId IS NULL OR m.organization.id = :organizationId)
          AND (:branchId IS NULL OR m.branch.id = :branchId)
          AND (LOWER(m.fullName) LIKE LOWER(:search)
               OR LOWER(COALESCE(m.email, '')) LIKE LOWER(:search)
               OR LOWER(COALESCE(m.mobile, '')) LIKE LOWER(:search))
    """)
    Page<Member> searchMembersScoped(
        @Param("organizationId") Long organizationId,
        @Param("branchId") Long branchId,
        @Param("search") String search,
        Pageable pageable
    );

    @Query("""
        SELECT m FROM Member m
        WHERE (:organizationId IS NULL OR m.organization.id = :organizationId)
          AND (:branchId IS NULL OR m.branch.id = :branchId)
    """)
    Page<Member> findScopedMembers(
        @Param("organizationId") Long organizationId,
        @Param("branchId") Long branchId,
        Pageable pageable
    );

    @Query("""
        SELECT COUNT(m) FROM Member m
        WHERE (:organizationId IS NULL OR m.organization.id = :organizationId)
          AND (:branchId IS NULL OR m.branch.id = :branchId)
    """)
    long countScopedMembers(@Param("organizationId") Long organizationId, @Param("branchId") Long branchId);

    @Query("""
        SELECT COUNT(m) FROM Member m
        WHERE (:organizationId IS NULL OR m.organization.id = :organizationId)
          AND (:branchId IS NULL OR m.branch.id = :branchId)
          AND m.active = :active
    """)
    long countScopedMembersByActive(
        @Param("organizationId") Long organizationId,
        @Param("branchId") Long branchId,
        @Param("active") boolean active
    );

    List<Member> findByOrganizationIdAndStatus(Long organizationId, MemberStatus status);

    long countByOrganizationId(Long organizationId);

    long countByOrganizationIdAndStatus(Long organizationId, MemberStatus status);
}

