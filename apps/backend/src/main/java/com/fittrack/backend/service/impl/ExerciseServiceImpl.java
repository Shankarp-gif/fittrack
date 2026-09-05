package com.fittrack.backend.service.impl;

import com.fittrack.backend.dto.ExerciseResponse;
import com.fittrack.backend.dto.PagedResponse;
import com.fittrack.backend.entity.Exercise;
import com.fittrack.backend.repository.ExerciseRepository;
import com.fittrack.backend.service.ExerciseService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class ExerciseServiceImpl implements ExerciseService {

    private final ExerciseRepository exerciseRepository;

    public ExerciseServiceImpl(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    @Override
    public PagedResponse<ExerciseResponse> list(String q, String muscleGroup, String equipment, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<Exercise> pageResult = exerciseRepository
                .findByNameContainingIgnoreCaseAndMuscleGroupContainingIgnoreCaseAndEquipmentContainingIgnoreCase(
                        q == null ? "" : q,
                        muscleGroup == null ? "" : muscleGroup,
                        equipment == null ? "" : equipment,
                        pageable
                );

        return new PagedResponse<>(
                pageResult.getContent().stream().map(this::toDto).toList(),
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalElements(),
                pageResult.getTotalPages(),
                pageResult.isLast()
        );
    }

    private ExerciseResponse toDto(Exercise e) {
        return new ExerciseResponse(
                e.getId(),
                e.getName(),
                e.getMuscleGroup(),
                e.getEquipment(),
                e.getDifficulty(),
                e.getInstructions(),
                e.getImageUrl(),
                e.getRecommendedSets(),
                e.getRecommendedReps()
        );
    }
}

