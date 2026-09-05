package com.fittrack.backend.entity;

import com.fittrack.backend.entity.enums.FitnessLevel;
import com.fittrack.backend.entity.enums.Gender;
import com.fittrack.backend.entity.enums.GoalType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "user_profiles")
public class UserProfile extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(length = 32)
    private Gender gender;

    @Column(name = "height_cm")
    private BigDecimal heightCm;

    @Column(name = "weight_kg")
    private BigDecimal weightKg;

    @Enumerated(EnumType.STRING)
    @Column(name = "fitness_level", length = 32)
    private FitnessLevel fitnessLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "primary_goal", length = 48)
    private GoalType primaryGoal;

    @Column(name = "training_preference", length = 24)
    private String trainingPreference;

    @Column(name = "workout_frequency")
    private Integer workoutFrequency;
}

