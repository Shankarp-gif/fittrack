package com.fittrack.backend.dto;

import com.fittrack.backend.entity.enums.MemberStatus;
import java.time.LocalDate;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberDTO {
    private Long id;
    private String memberIdNumber;
    private String fullName;
    private String email;
    private String mobile;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private MemberStatus status;
    private String notes;
    private String photoUrl;
    private Instant createdAt;
    private Instant updatedAt;
}

