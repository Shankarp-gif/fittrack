package com.fittrack.backend.repository;

import com.fittrack.backend.entity.Branch;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BranchRepository extends JpaRepository<Branch, Long> {
    List<Branch> findByOrganizationId(Long organizationId);
    Optional<Branch> findByOrganizationIdAndId(Long organizationId, Long branchId);
    Optional<Branch> findByOrganizationIdAndName(Long organizationId, String name);

    @Query("""
        select b from Branch b
        left join fetch b.organization o
        where (:organizationId is null or o.id = :organizationId)
        order by b.createdAt desc
    """)
    List<Branch> findScopedBranches(@Param("organizationId") Long organizationId);

    @Query("""
        select count(b) from Branch b
        where (:organizationId is null or b.organization.id = :organizationId)
    """)
    long countScopedBranches(@Param("organizationId") Long organizationId);
}

