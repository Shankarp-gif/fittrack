package com.fittrack.backend.service;

import com.fittrack.backend.dto.ExerciseResponse;
import com.fittrack.backend.dto.PagedResponse;

public interface ExerciseService {
    PagedResponse<ExerciseResponse> list(String q, String muscleGroup, String equipment, int page, int size);
}

