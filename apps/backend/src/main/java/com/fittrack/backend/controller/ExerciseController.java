package com.fittrack.backend.controller;

import com.fittrack.backend.dto.ExerciseResponse;
import com.fittrack.backend.dto.PagedResponse;
import com.fittrack.backend.service.ExerciseService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/exercises")
public class ExerciseController {

    private final ExerciseService exerciseService;

    public ExerciseController(ExerciseService exerciseService) {
        this.exerciseService = exerciseService;
    }

    @GetMapping
    public PagedResponse<ExerciseResponse> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String muscleGroup,
            @RequestParam(required = false) String equipment,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        return exerciseService.list(q, muscleGroup, equipment, page, size);
    }
}

