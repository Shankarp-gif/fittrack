package com.fittrack.backend.dto;

public record ExerciseResponse(
        Long id,
        String name,
        String muscleGroup,
        String equipment,
        String difficulty,
        String instructions,
        String imageUrl,
        Integer recommendedSets,
        Integer recommendedReps
) {
}

