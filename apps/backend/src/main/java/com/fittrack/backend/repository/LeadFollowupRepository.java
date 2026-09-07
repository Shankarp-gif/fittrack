package com.fittrack.backend.repository;

import com.fittrack.backend.entity.LeadFollowup;
import com.fittrack.backend.entity.enums.FollowupStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LeadFollowupRepository extends JpaRepository<LeadFollowup, Long> {

    // Find followups by lead
    List<LeadFollowup> findByLeadIdOrderByFollowupDateDesc(Long leadId);

    // Find pending followups
    List<LeadFollowup> findByFollowupStatusAndFollowupDateBefore(FollowupStatus status, LocalDateTime date);

    // Find today's followups
    @Query("SELECT lf FROM LeadFollowup lf WHERE lf.followupStatus = :status AND " +
           "CAST(lf.followupDate AS date) = CAST(CURRENT_TIMESTAMP AS date) ORDER BY lf.followupDate ASC")
    List<LeadFollowup> findTodayFollowups(@Param("status") FollowupStatus status);

    // Find followups by assigned user
    Page<LeadFollowup> findByAssignedUserIdAndFollowupStatus(Long userId, FollowupStatus status, Pageable pageable);

    // Count pending followups
    Long countByFollowupStatusAndFollowupDateBefore(FollowupStatus status, LocalDateTime date);

    // Find completed followups for a lead
    List<LeadFollowup> findByLeadIdAndFollowupStatus(Long leadId, FollowupStatus status);
}

