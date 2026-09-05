package com.fittrack.backend.repository;

import com.fittrack.backend.entity.UserPlan;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserPlanRepository extends JpaRepository<UserPlan, Long> {
    Optional<UserPlan> findByUserId(Long userId);
}

