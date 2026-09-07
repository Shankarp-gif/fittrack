package com.fittrack.backend.entity;

import com.fittrack.backend.entity.enums.LeadStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "leads")
public class Lead extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;

    @Column(name = "full_name", nullable = false, length = 255)
    private String fullName;

    @Column(length = 180)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(length = 64, nullable = false)
    private String source = "OTHER";  // WEBSITE, REFERRAL, WALK_IN, etc

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interested_plan_id")
    private MembershipPlan interestedPlan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interested_branch_id")
    private Branch interestedBranch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_user_id")
    private User assignedUser;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeadStatus status = LeadStatus.NEW;

    @Column(name = "conversion_status", length = 32)
    private String conversionStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "converted_member_id")
    private Member convertedMember;

    @Column(length = 32)
    private String priority = "MEDIUM";  // LOW, MEDIUM, HIGH, URGENT

    @Column(name = "expected_value", precision = 10, scale = 2)
    private BigDecimal expectedValue;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "last_contact_date")
    private LocalDateTime lastContactDate;

    @OneToMany(mappedBy = "lead", fetch = FetchType.LAZY)
    private Set<LeadFollowup> followups = new HashSet<>();

    @Column(nullable = false)
    private boolean active = true;
}

