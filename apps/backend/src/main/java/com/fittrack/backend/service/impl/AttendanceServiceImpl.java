package com.fittrack.backend.service.impl;

import com.fittrack.backend.dto.AttendanceDTO;
import com.fittrack.backend.entity.Branch;
import com.fittrack.backend.entity.Member;
import com.fittrack.backend.entity.MemberAttendance;
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
    public AttendanceDTO checkIn(Long memberId) {
        // Try to find as Member first (for gym members)
        Member member = memberRepository.findById(memberId).orElse(null);

        if (member == null) {
            // If not a member, try to find as User (for staff)
            com.fittrack.backend.entity.User user = userRepository.findById(memberId).orElse(null);
            if (user == null) {
                throw new ResourceNotFoundException("Member or User not found");
            }

            // Create attendance record for staff user
            return checkInAsStaff(user);
        }

        LocalDate today = LocalDate.now();

        // Check if already checked in today
        List<MemberAttendance> todayRecords = attendanceRepository
            .findByMemberIdAndAttendanceDate(memberId, today);

        if (!todayRecords.isEmpty()) {
            MemberAttendance existing = todayRecords.get(0);
            if ("CHECKED_IN".equals(existing.getStatus())) {
                throw new BadRequestException("Already checked in today. Please check out first.");
            }
        }

        Branch branch = branchRepository.findById(DEFAULT_BRANCH_ID)
            .orElseThrow(() -> new ResourceNotFoundException("Branch not found"));

        MemberAttendance attendance = new MemberAttendance();
        attendance.setMember(member);
        attendance.setBranch(branch);
        attendance.setCheckInTime(LocalDateTime.now());
        attendance.setAttendanceDate(today);
        attendance.setStatus("CHECKED_IN");

        MemberAttendance saved = attendanceRepository.save(attendance);
        // Initialize lazy-loaded member to prevent LazyInitializationException
        org.hibernate.Hibernate.initialize(saved.getMember());
        return toDTO(saved);
    }

    @Override
    public AttendanceDTO checkOut(Long memberId) {
        // Try to find as Member first (for gym members)
        Member member = memberRepository.findById(memberId).orElse(null);

        if (member == null) {
            // If not a member, try to find as User (for staff)
            User user = userRepository.findById(memberId).orElse(null);
            if (user == null) {
                throw new ResourceNotFoundException("Member or User not found");
            }

            // Create checkout record for staff user
            return checkOutAsStaff(user);
        }

        LocalDate today = LocalDate.now();

        // Find today's check-in record
        List<MemberAttendance> todayRecords = attendanceRepository
            .findByMemberIdAndAttendanceDate(memberId, today);

        if (todayRecords.isEmpty()) {
            throw new BadRequestException("No check-in record found for today. Please check in first.");
        }

        MemberAttendance attendance = todayRecords.get(0);

        if ("CHECKED_OUT".equals(attendance.getStatus())) {
            throw new BadRequestException("Already checked out today.");
        }

        attendance.setCheckOutTime(LocalDateTime.now());
        attendance.setStatus("CHECKED_OUT");

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
        List<MemberAttendance> todayRecords = attendanceRepository
            .findByMemberIdAndAttendanceDate(memberId, today);

        if (!todayRecords.isEmpty()) {
            MemberAttendance record = todayRecords.get(0);
            // Initialize lazy-loaded member to prevent LazyInitializationException
            org.hibernate.Hibernate.initialize(record.getMember());
            return toDTO(record);
        }

        // Try to find as User (for staff)
        List<MemberAttendance> userRecords = attendanceRepository
            .findByUserIdAndAttendanceDate(memberId, today);

        if (!userRecords.isEmpty()) {
            return toDTOForStaff(userRecords.get(0));
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

    private AttendanceDTO checkInAsStaff(User user) {
        LocalDate today = LocalDate.now();

        // Check if already checked in today
        List<MemberAttendance> todayRecords = attendanceRepository
            .findByUserIdAndAttendanceDate(user.getId(), today);

        if (!todayRecords.isEmpty()) {
            MemberAttendance existing = todayRecords.get(0);
            if ("CHECKED_IN".equals(existing.getStatus())) {
                throw new BadRequestException("Already checked in today. Please check out first.");
            }
        }

        Branch branch = branchRepository.findById(DEFAULT_BRANCH_ID)
            .orElseThrow(() -> new ResourceNotFoundException("Branch not found"));

        MemberAttendance attendance = new MemberAttendance();
        attendance.setUser(user);
        attendance.setBranch(branch);
        attendance.setCheckInTime(LocalDateTime.now());
        attendance.setAttendanceDate(today);
        attendance.setStatus("CHECKED_IN");

        MemberAttendance saved = attendanceRepository.save(attendance);
        return toDTOForStaff(saved);
    }

    private AttendanceDTO checkOutAsStaff(User user) {
        LocalDate today = LocalDate.now();

        // Find today's check-in record
        List<MemberAttendance> todayRecords = attendanceRepository
            .findByUserIdAndAttendanceDate(user.getId(), today);

        if (todayRecords.isEmpty()) {
            throw new BadRequestException("No check-in record found for today. Please check in first.");
        }

        MemberAttendance attendance = todayRecords.get(0);

        if ("CHECKED_OUT".equals(attendance.getStatus())) {
            throw new BadRequestException("Already checked out today.");
        }

        attendance.setCheckOutTime(LocalDateTime.now());
        attendance.setStatus("CHECKED_OUT");

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
            throw new BadRequestException("Member information not available for attendance record");
        }

        return AttendanceDTO.builder()
            .id(attendance.getId())
            .memberId(member.getId())
            .memberName(member.getFullName())
            .checkInTime(attendance.getCheckInTime())
            .checkOutTime(attendance.getCheckOutTime())
            .attendanceDate(attendance.getAttendanceDate().toString())
            .duration(duration)
            .status(attendance.getStatus())
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
            .checkInTime(attendance.getCheckInTime())
            .checkOutTime(attendance.getCheckOutTime())
            .attendanceDate(attendance.getAttendanceDate().toString())
            .duration(duration)
            .status(attendance.getStatus())
            .build();
    }
}

