package com.fittrack.backend.service;

import com.fittrack.backend.dto.AssignAdminToOrganizationRequest;
import com.fittrack.backend.dto.ChangeRoleRequest;
import com.fittrack.backend.dto.CreateAdminRequest;
import com.fittrack.backend.dto.CreateOrganizationRequest;
import com.fittrack.backend.dto.OrganizationDTO;
import com.fittrack.backend.dto.UpdateProfileRequest;
import com.fittrack.backend.dto.UserListResponse;
import com.fittrack.backend.dto.UserMeResponse;
import java.util.List;

public interface UserService {
    UserMeResponse me(String email);

    UserMeResponse updateProfile(String email, UpdateProfileRequest request);

    // Admin-only methods
    List<UserListResponse> getAllUsers();

    UserMeResponse changeUserRole(ChangeRoleRequest request);

    void deleteUser(Long userId);

    // SuperAdmin-only methods
    UserMeResponse createAdmin(CreateAdminRequest request);

    UserMeResponse assignAdminToOrganization(AssignAdminToOrganizationRequest request);

    OrganizationDTO createOrganization(CreateOrganizationRequest request);

    List<OrganizationDTO> getAllOrganizations();

    OrganizationDTO getOrganizationById(Long organizationId);

    OrganizationDTO updateOrganization(Long organizationId, CreateOrganizationRequest request);

    void deactivateOrganization(Long organizationId);
}

