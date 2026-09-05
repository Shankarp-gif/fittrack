package com.fittrack.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BranchDTO {
    private Long id;
    private Long organizationId;
    private String name;
    private String address;
    private String city;
    private String phone;
    private String email;
    private Double latitude;
    private Double longitude;
    private boolean active;
}

