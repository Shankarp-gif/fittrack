package com.fittrack.backend.repository;

import com.fittrack.backend.entity.MembershipPlan;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MembershipPlanRepository extends JpaRepository<MembershipPlan, Long> {
    List<MembershipPlan> findByOrganizationIdAndActiveTrue(Long organizationId);

    List<MembershipPlan> findByOrganizationId(Long organizationId);
}

