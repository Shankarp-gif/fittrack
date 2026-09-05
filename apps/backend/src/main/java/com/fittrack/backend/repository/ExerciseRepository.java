package com.fittrack.backend.repository;

import com.fittrack.backend.entity.Exercise;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    Page<Exercise> findByNameContainingIgnoreCaseAndMuscleGroupContainingIgnoreCaseAndEquipmentContainingIgnoreCase(
            String name,
            String muscleGroup,
            String equipment,
            Pageable pageable
    );
}

