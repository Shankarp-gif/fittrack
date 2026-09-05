package com.fittrack.backend.repository;

import com.fittrack.backend.entity.Branch;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BranchRepository extends JpaRepository<Branch, Long> {
    List<Branch> findByOrganizationId(Long organizationId);
    Optional<Branch> findByOrganizationIdAndId(Long organizationId, Long branchId);
    Optional<Branch> findByOrganizationIdAndName(Long organizationId, String name);
}

