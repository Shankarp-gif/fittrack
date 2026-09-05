package com.fittrack.backend.mapper;

import com.fittrack.backend.dto.OrganizationDTO;
import com.fittrack.backend.entity.Organization;

public final class OrganizationMapper {

    private OrganizationMapper() {
    }

    public static OrganizationDTO toDTO(Organization organization) {
        return OrganizationDTO.builder()
                .id(organization.getId())
                .name(organization.getName())
                .email(organization.getEmail())
                .phone(organization.getPhone())
                .address(organization.getAddress())
                .city(organization.getCity())
                .state(organization.getState())
                .country(organization.getCountry())
                .postalCode(organization.getPostalCode())
                .taxId(organization.getTaxId())
                .logoUrl(organization.getLogoUrl())
                .active(organization.isActive())
                .build();
    }

    public static Organization toEntity(OrganizationDTO dto) {
        Organization organization = new Organization();
        organization.setId(dto.getId());
        organization.setName(dto.getName());
        organization.setEmail(dto.getEmail());
        organization.setPhone(dto.getPhone());
        organization.setAddress(dto.getAddress());
        organization.setCity(dto.getCity());
        organization.setState(dto.getState());
        organization.setCountry(dto.getCountry());
        organization.setPostalCode(dto.getPostalCode());
        organization.setTaxId(dto.getTaxId());
        organization.setLogoUrl(dto.getLogoUrl());
        organization.setActive(dto.isActive());
        return organization;
    }
}

