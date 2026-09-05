package com.fittrack.backend.entity;

import com.fittrack.backend.entity.enums.UnitSystem;
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
import java.time.LocalTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "user_settings")
public class UserSetting extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "reminder_enabled", nullable = false)
    private boolean reminderEnabled = true;

    @Column(name = "reminder_time", nullable = false)
    private LocalTime reminderTime = LocalTime.of(7, 30);

    @Enumerated(EnumType.STRING)
    @Column(name = "unit_system", nullable = false, length = 16)
    private UnitSystem unitSystem = UnitSystem.METRIC;

    @Column(name = "weekly_goal", nullable = false)
    private int weeklyGoal = 4;
}

