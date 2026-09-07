package com.fittrack.backend.service;

import com.fittrack.backend.dto.AdminUserResponse;
import com.fittrack.backend.dto.AssignAdminToOrganizationRequest;
import com.fittrack.backend.dto.ChangeRoleRequest;
import com.fittrack.backend.dto.CreateAdminRequest;
import com.fittrack.backend.dto.CreateOrganizationRequest;
import com.fittrack.backend.dto.CreateUserWithDefaultPasswordRequest;
import com.fittrack.backend.dto.OrganizationDTO;
import com.fittrack.backend.dto.UpdateProfileRequest;
import com.fittrack.backend.dto.UserListResponse;
import com.fittrack.backend.dto.UserMeResponse;
import java.util.List;

public interface UserService {
    UserMeResponse me(String email);

    UserMeResponse updateProfile(String email, UpdateProfileRequest request);

    // Role-scoped user management methods
    List<UserListResponse> getAllUsers(String requesterEmail);

    List<AdminUserResponse> getUsersByRole(String role);

    UserMeResponse changeUserRole(String requesterEmail, ChangeRoleRequest request);

    void deleteUser(String requesterEmail, Long userId);

    /**
     * Assign a supervisor to a user (only for SUPER_ADMIN, ADMIN roles)
     * Validates that supervisor has appropriate role
     */
    UserMeResponse assignSupervisor(String requesterEmail, Long userId, Long supervisorId);

    // SuperAdmin-only methods
    UserMeResponse createAdmin(CreateAdminRequest request);

    UserMeResponse assignAdminToOrganization(AssignAdminToOrganizationRequest request);

    OrganizationDTO createOrganization(CreateOrganizationRequest request);

    List<OrganizationDTO> getAllOrganizations();

    OrganizationDTO getOrganizationById(Long organizationId);

    OrganizationDTO updateOrganization(Long organizationId, CreateOrganizationRequest request);

    void deactivateOrganization(Long organizationId);

    List<UserListResponse> getUsersByOrganization(Long organizationId);

    UserMeResponse createUserWithDefaultPassword(String requesterEmail, CreateUserWithDefaultPasswordRequest request);
}
