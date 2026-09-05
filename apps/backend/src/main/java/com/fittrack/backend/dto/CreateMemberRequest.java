package com.fittrack.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateMemberRequest {
    @NotBlank
    private String fullName;

    @Email
    private String email;

    @NotBlank
    private String mobile;

    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String notes;
}

