package com.fittrack.backend.repository;

import com.fittrack.backend.entity.WorkoutSession;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, Long> {
    List<WorkoutSession> findTop10ByUserIdOrderByWorkoutDateDesc(Long userId);

    @Query("select coalesce(sum(ws.durationMinutes), 0) from WorkoutSession ws where ws.user.id = :userId and ws.workoutDate >= :fromDate")
    Integer totalDurationMinutes(@Param("userId") Long userId, @Param("fromDate") LocalDate fromDate);

    @Query("select coalesce(sum(ws.caloriesBurned), 0) from WorkoutSession ws where ws.user.id = :userId and ws.workoutDate >= :fromDate")
    Integer totalCalories(@Param("userId") Long userId, @Param("fromDate") LocalDate fromDate);

    long countByUserIdAndWorkoutDateBetween(Long userId, LocalDate fromDate, LocalDate toDate);
}
