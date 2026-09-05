package com.fittrack.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CreateOrganizationRequest(
        @NotBlank(message = "Organization name is required")
        String name,

        @Email(message = "Email should be valid")
        String email,

        String phone,
        String address,
        String city,
        String state,
        String country,
        String postalCode,
        String taxId
) {
}

