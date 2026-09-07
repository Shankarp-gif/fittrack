package com.fittrack.backend.service.impl;

import com.fittrack.backend.dto.AttendanceDTO;
import com.fittrack.backend.entity.Branch;
import com.fittrack.backend.entity.Member;
import com.fittrack.backend.entity.MemberAttendance;
import com.fittrack.backend.entity.Organization;
import com.fittrack.backend.entity.User;
import com.fittrack.backend.exception.ResourceNotFoundException;
import com.fittrack.backend.exception.BadRequestException;
import com.fittrack.backend.repository.MemberAttendanceRepository;
import com.fittrack.backend.repository.MemberRepository;
import com.fittrack.backend.repository.BranchRepository;
import com.fittrack.backend.repository.UserRepository;
import com.fittrack.backend.service.AttendanceService;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AttendanceServiceImpl implements AttendanceService {

    private final MemberAttendanceRepository attendanceRepository;
    private final MemberRepository memberRepository;
    private final BranchRepository branchRepository;
    private final UserRepository userRepository;
    private static final Long DEFAULT_BRANCH_ID = 1L;

    @Override
    public AttendanceDTO checkIn(Long memberId, Long userId) {
        // Try to find as Member first (for gym members)
        Member member = memberRepository.findById(memberId).orElse(null);

        if (member == null) {
            // If not a member, try to find as User (for staff)
            com.fittrack.backend.entity.User user = userRepository.findById(memberId).orElse(null);
            if (user == null) {
                throw new ResourceNotFoundException("Member or User not found");
            }

            // Create attendance record for staff user
            return checkInAsStaff(user, userId);
        }

        LocalDate today = LocalDate.now();

        if (attendanceRepository.findTopByMemberIdAndAttendanceDateOrderByCheckInTimeDesc(memberId, today).isPresent()) {
            throw new BadRequestException("Daily attendance already marked. Only one check-in per day is allowed.");
        }

        Branch branch = branchRepository.findById(DEFAULT_BRANCH_ID)
            .orElseThrow(() -> new ResourceNotFoundException("Branch not found"));

        // Get the staff user who is performing the check-in
        User staffUser = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Staff user not found"));

        MemberAttendance attendance = new MemberAttendance();
        attendance.setMember(member);
        attendance.setUser(staffUser);  // Set the staff user who performed check-in
        attendance.setBranch(branch);
        attendance.setOrganization(member.getOrganization());
        attendance.setCheckInTime(LocalDateTime.now());
        attendance.setAttendanceDate(today);
        attendance.setStatus("CHECKED_IN");
        // Set supervisor from the staff user's supervisor
        attendance.setSupervisor(staffUser.getSupervisor());

        MemberAttendance saved = attendanceRepository.save(attendance);
        // Initialize lazy-loaded member to prevent LazyInitializationException
        org.hibernate.Hibernate.initialize(saved.getMember());
        return toDTO(saved);
    }

    @Override
    public AttendanceDTO checkOut(Long memberId, Long userId) {
        // Try to find as Member first (for gym members)
        Member member = memberRepository.findById(memberId).orElse(null);

        if (member == null) {
            // If not a member, try to find as User (for staff)
            User user = userRepository.findById(memberId).orElse(null);
            if (user == null) {
                throw new ResourceNotFoundException("Member or User not found");
            }

            // Create checkout record for staff user
            return checkOutAsStaff(user, userId);
        }

        LocalDate today = LocalDate.now();

        MemberAttendance attendance = attendanceRepository
            .findTopByMemberIdAndAttendanceDateAndStatusOrderByCheckInTimeDesc(memberId, today, "CHECKED_IN")
            .orElse(null);

        if (attendance == null) {
            if (attendanceRepository.findTopByMemberIdAndAttendanceDateOrderByCheckInTimeDesc(memberId, today).isPresent()) {
                throw new BadRequestException("Already checked out today.");
            }
            throw new BadRequestException("No check-in record found for today. Please check in first.");
        }

        // Get the staff user who is performing the check-out
        User staffUser = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Staff user not found"));

        attendance.setCheckOutTime(LocalDateTime.now());
        attendance.setStatus("CHECKED_OUT");
        attendance.setUser(staffUser);  // Set the staff user who performed check-out
        if (attendance.getOrganization() == null) {
            attendance.setOrganization(member.getOrganization());
        }
        // Set supervisor from the staff user's supervisor
        attendance.setSupervisor(staffUser.getSupervisor());

        MemberAttendance saved = attendanceRepository.save(attendance);
        // Initialize lazy-loaded member to prevent LazyInitializationException
        org.hibernate.Hibernate.initialize(saved.getMember());
        return toDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceDTO getTodayAttendance(Long memberId) {
        LocalDate today = LocalDate.now();

        // Try to find as Member first
        MemberAttendance record = attendanceRepository
            .findTopByMemberIdAndAttendanceDateOrderByCheckInTimeDesc(memberId, today)
            .orElse(null);

        if (record != null) {
            // Initialize lazy-loaded member to prevent LazyInitializationException
            org.hibernate.Hibernate.initialize(record.getMember());
            return toDTO(record);
        }

        MemberAttendance userRecord = attendanceRepository
            .findTopByUserIdAndAttendanceDateOrderByCheckInTimeDesc(memberId, today)
            .orElse(null);

        if (userRecord != null) {
            return toDTOForStaff(userRecord);
        }

        return null;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceDTO> getAttendanceByDate(Long branchId, LocalDate date) {
        return attendanceRepository
            .findByBranchIdAndAttendanceDate(branchId, date, org.springframework.data.domain.PageRequest.of(0, Integer.MAX_VALUE))
            .getContent()
            .stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get attendance history for a member within a date range
     */
    @Transactional(readOnly = true)
    public List<AttendanceDTO> getMemberAttendanceHistory(Long memberId, LocalDate startDate, LocalDate endDate) {
        List<MemberAttendance> records = attendanceRepository.findByMemberIdAndAttendanceDateBetween(memberId, startDate, endDate);
        return records.stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get total days attended in a date range
     */
    @Transactional(readOnly = true)
    public long getTotalDaysAttended(Long memberId, LocalDate startDate, LocalDate endDate) {
        return attendanceRepository.countByMemberIdAndAttendanceDateBetweenAndStatusAndCheckOutTimeIsNotNull(
            memberId, startDate, endDate, "CHECKED_OUT");
    }


    /**
     * Check if member is currently checked in
     */
    @Transactional(readOnly = true)
    public boolean isCheckedInToday(Long memberId) {
        LocalDate today = LocalDate.now();
        MemberAttendance latest = attendanceRepository
            .findTopByMemberIdAndAttendanceDateOrderByCheckInTimeDesc(memberId, today)
            .orElse(null);
        if (latest == null) {
            return false;
        }
        return "CHECKED_IN".equals(latest.getStatus());
    }

    private AttendanceDTO checkInAsStaff(User user, Long userId) {
        LocalDate today = LocalDate.now();

        if (attendanceRepository.findTopByUserIdAndAttendanceDateOrderByCheckInTimeDesc(user.getId(), today).isPresent()) {
            throw new BadRequestException("Daily attendance already marked. Only one check-in per day is allowed.");
        }

        Branch branch = branchRepository.findById(DEFAULT_BRANCH_ID)
            .orElseThrow(() -> new ResourceNotFoundException("Branch not found"));

        // Get the staff user who is performing the check-in (the authenticated user)
        User performingUser = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Staff user not found"));

        MemberAttendance attendance = new MemberAttendance();
        attendance.setUser(performingUser);  // Set the staff user who performed check-in
        attendance.setBranch(branch);
        Organization org = user.getOrganization() != null ? user.getOrganization() : performingUser.getOrganization();
        if (org == null) {
            throw new BadRequestException("Organization not found for attendance record");
        }
        attendance.setOrganization(org);
        attendance.setCheckInTime(LocalDateTime.now());
        attendance.setAttendanceDate(today);
        attendance.setStatus("CHECKED_IN");
        // Set supervisor from the performing user's supervisor
        attendance.setSupervisor(performingUser.getSupervisor());

        MemberAttendance saved = attendanceRepository.save(attendance);
        return toDTOForStaff(saved);
    }

    private AttendanceDTO checkOutAsStaff(User user, Long userId) {
        LocalDate today = LocalDate.now();

        MemberAttendance attendance = attendanceRepository
            .findTopByUserIdAndAttendanceDateAndStatusOrderByCheckInTimeDesc(user.getId(), today, "CHECKED_IN")
            .orElse(null);

        if (attendance == null) {
            if (attendanceRepository.findTopByUserIdAndAttendanceDateOrderByCheckInTimeDesc(user.getId(), today).isPresent()) {
                throw new BadRequestException("Already checked out today.");
            }
            throw new BadRequestException("No check-in record found for today. Please check in first.");
        }

        // Get the staff user who is performing the check-out (the authenticated user)
        User performingUser = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Staff user not found"));

        attendance.setCheckOutTime(LocalDateTime.now());
        attendance.setStatus("CHECKED_OUT");
        attendance.setUser(performingUser);  // Set the staff user who performed check-out
        if (attendance.getOrganization() == null) {
            Organization org = user.getOrganization() != null ? user.getOrganization() : performingUser.getOrganization();
            if (org == null) {
                throw new BadRequestException("Organization not found for attendance record");
            }
            attendance.setOrganization(org);
        }
        // Set supervisor from the performing user's supervisor
        attendance.setSupervisor(performingUser.getSupervisor());

        MemberAttendance saved = attendanceRepository.save(attendance);
        return toDTOForStaff(saved);
    }

    private AttendanceDTO toDTO(MemberAttendance attendance) {
        if (attendance == null) {
            return null;
        }

        long duration = 0;
        if (attendance.getCheckOutTime() != null) {
            duration = ChronoUnit.MINUTES.between(
                attendance.getCheckInTime(),
                attendance.getCheckOutTime()
            );
        }

        Member member = attendance.getMember();
        if (member == null) {
            // Staff attendance records do not carry member linkage.
            return toDTOForStaff(attendance);
        }

        return AttendanceDTO.builder()
            .id(attendance.getId())
            .memberId(member.getId())
            .memberName(member.getFullName())
            .organizationId(attendance.getOrganization() != null ? attendance.getOrganization().getId() : null)
            .organizationName(attendance.getOrganization() != null ? attendance.getOrganization().getName() : null)
            .branchId(attendance.getBranch() != null ? attendance.getBranch().getId() : null)
            .branchName(attendance.getBranch() != null ? attendance.getBranch().getName() : null)
            .checkInTime(attendance.getCheckInTime())
            .checkOutTime(attendance.getCheckOutTime())
            .createdAt(attendance.getCreatedAt())
            .attendanceDate(attendance.getAttendanceDate().toString())
            .duration(duration)
            .status(attendance.getStatus())
            .recordedByUserId(attendance.getUser() != null ? attendance.getUser().getId() : null)
            .recordedByUserName(attendance.getUser() != null ? attendance.getUser().getFullName() : null)
            .supervisorId(attendance.getSupervisor() != null ? attendance.getSupervisor().getId() : null)
            .supervisorName(attendance.getSupervisor() != null ? attendance.getSupervisor().getFullName() : null)
            .build();
    }

    private AttendanceDTO toDTOForStaff(MemberAttendance attendance) {
        long duration = 0;
        if (attendance.getCheckOutTime() != null) {
            duration = ChronoUnit.MINUTES.between(
                attendance.getCheckInTime(),
                attendance.getCheckOutTime()
            );
        }

        return AttendanceDTO.builder()
            .id(attendance.getId())
            .memberId(attendance.getUser() != null ? attendance.getUser().getId() : null)
            .memberName(attendance.getUser() != null ? attendance.getUser().getFullName() : "Staff")
            .organizationId(attendance.getOrganization() != null ? attendance.getOrganization().getId() : null)
            .organizationName(attendance.getOrganization() != null ? attendance.getOrganization().getName() : null)
            .branchId(attendance.getBranch() != null ? attendance.getBranch().getId() : null)
            .branchName(attendance.getBranch() != null ? attendance.getBranch().getName() : null)
            .checkInTime(attendance.getCheckInTime())
            .checkOutTime(attendance.getCheckOutTime())
            .createdAt(attendance.getCreatedAt())
            .attendanceDate(attendance.getAttendanceDate().toString())
            .duration(duration)
            .status(attendance.getStatus())
            .recordedByUserId(attendance.getUser() != null ? attendance.getUser().getId() : null)
            .recordedByUserName(attendance.getUser() != null ? attendance.getUser().getFullName() : null)
            .supervisorId(attendance.getSupervisor() != null ? attendance.getSupervisor().getId() : null)
            .supervisorName(attendance.getSupervisor() != null ? attendance.getSupervisor().getFullName() : null)
            .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceDTO> getAttendanceByDateForSupervisor(Long supervisorId, LocalDate date) {
        return attendanceRepository
            .findBySupervisorIdAndAttendanceDate(supervisorId, date, org.springframework.data.domain.PageRequest.of(0, Integer.MAX_VALUE))
            .getContent()
            .stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceDTO> getSupervisedAttendanceHistory(Long supervisorId, LocalDate startDate, LocalDate endDate) {
        List<MemberAttendance> records = attendanceRepository.findBySupervisorIdAndAttendanceDateBetween(supervisorId, startDate, endDate);
        return records.stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
}

