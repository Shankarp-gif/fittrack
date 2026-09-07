package com.fittrack.backend.repository;

import com.fittrack.backend.entity.Lead;
import com.fittrack.backend.entity.enums.LeadStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface LeadRepository extends JpaRepository<Lead, Long> {

    // Find by organization and status
    Page<Lead> findByOrganizationIdAndStatus(Long organizationId, LeadStatus status, Pageable pageable);

    // Find by organization
    Page<Lead> findByOrganizationId(Long organizationId, Pageable pageable);

    // Find by assigned user
    Page<Lead> findByOrganizationIdAndAssignedUserId(Long organizationId, Long userId, Pageable pageable);

    // Find by branch
    Page<Lead> findByOrganizationIdAndBranchId(Long organizationId, Long branchId, Pageable pageable);

    // Find converted leads (with member)
    @Query("SELECT l FROM Lead l WHERE l.organization.id = :orgId AND l.convertedMember IS NOT NULL")
    Page<Lead> findConvertedLeads(@Param("orgId") Long orgId, Pageable pageable);

    // Find leads pending follow-up
    @Query("SELECT l FROM Lead l WHERE l.organization.id = :orgId AND l.status = 'FOLLOW_UP_REQUIRED' ORDER BY l.lastContactDate ASC")
    List<Lead> findPendingFollowupLeads(@Param("orgId") Long orgId);

    // Find leads requiring attention (not converted or lost)
    @Query("SELECT l FROM Lead l WHERE l.organization.id = :orgId AND l.status NOT IN ('CONVERTED', 'LOST') ORDER BY l.createdAt DESC")
    List<Lead> findActiveLeads(@Param("orgId") Long orgId);

    // Count by status
    Long countByOrganizationIdAndStatus(Long organizationId, LeadStatus status);

    // Search leads by name or email or phone
    @Query("SELECT l FROM Lead l WHERE l.organization.id = :orgId AND " +
           "(LOWER(l.fullName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(l.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "l.phone LIKE CONCAT('%', :searchTerm, '%'))")
    Page<Lead> searchLeads(@Param("orgId") Long orgId, @Param("searchTerm") String searchTerm, Pageable pageable);

    // Check if lead with phone already exists
    Optional<Lead> findByOrganizationIdAndPhone(Long organizationId, String phone);

    // Check if lead with email already exists
    Optional<Lead> findByOrganizationIdAndEmail(Long organizationId, String email);
}

