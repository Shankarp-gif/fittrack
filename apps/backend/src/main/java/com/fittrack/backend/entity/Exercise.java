package com.fittrack.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "exercises")
public class Exercise extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 120)
    private String name;

    @Column(name = "muscle_group", nullable = false, length = 64)
    private String muscleGroup;

    @Column(name = "equipment", nullable = false, length = 64)
    private String equipment;

    @Column(name = "difficulty", nullable = false, length = 32)
    private String difficulty;

    @Column(name = "instructions", nullable = false, length = 2048)
    private String instructions;

    @Column(name = "image_url", length = 512)
    private String imageUrl;

    @Column(name = "recommended_sets")
    private Integer recommendedSets;

    @Column(name = "recommended_reps")
    private Integer recommendedReps;
}

