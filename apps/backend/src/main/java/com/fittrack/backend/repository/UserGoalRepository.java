package com.fittrack.backend.repository;

import com.fittrack.backend.entity.UserGoal;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserGoalRepository extends JpaRepository<UserGoal, Long> {
    List<UserGoal> findByUserIdOrderByDueDateAscIdAsc(Long userId);
}

