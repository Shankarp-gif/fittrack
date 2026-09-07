package com.fittrack.backend.repository;

import com.fittrack.backend.entity.Membership;
import com.fittrack.backend.entity.enums.MemberStatus;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MembershipRepository extends JpaRepository<Membership, Long> {
    Optional<Membership> findFirstByMemberIdAndActiveTrueOrderByCreatedAtDesc(Long memberId);

    List<Membership> findAllByMemberIdAndActiveTrueOrderByCreatedAtDesc(Long memberId);

    Page<Membership> findByStatus(MemberStatus status, Pageable pageable);

    @Query("SELECT m FROM Membership m WHERE m.status = 'EXPIRING_SOON' AND m.endDate BETWEEN :start AND :end")
    List<Membership> findExpiringMemberships(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT m FROM Membership m WHERE m.endDate < :today AND m.status = 'ACTIVE'")
    List<Membership> findExpiredMemberships(@Param("today") LocalDate today);

    @Query("SELECT m FROM Membership m WHERE m.endDate = :today")
    List<Membership> findExpiringToday(@Param("today") LocalDate today);

    long countByStatus(MemberStatus status);

    @Query("SELECT COUNT(m) FROM Membership m WHERE m.status = 'ACTIVE' AND m.endDate >= :today")
    long countActiveMemberships(@Param("today") LocalDate today);
}

