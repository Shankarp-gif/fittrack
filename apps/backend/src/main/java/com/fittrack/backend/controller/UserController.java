package com.fittrack.backend.controller;

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
import com.fittrack.backend.service.UserService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public UserMeResponse me(Authentication authentication) {
        return userService.me(authentication.getName());
    }

    @PutMapping("/me")
    public UserMeResponse updateMe(Authentication authentication, @Valid @RequestBody UpdateProfileRequest request) {
        return userService.updateProfile(authentication.getName(), request);
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','GYM_MAINTENANCE_MANAGER')")
    public List<UserListResponse> getAllUsers(Authentication authentication) {
        return userService.getAllUsers(authentication.getName());
    }

    @PostMapping("/change-role")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','GYM_MAINTENANCE_MANAGER')")
    public UserMeResponse changeUserRole(Authentication authentication, @Valid @RequestBody ChangeRoleRequest request) {
        return userService.changeUserRole(authentication.getName(), request);
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','GYM_MAINTENANCE_MANAGER')")
    public void deleteUser(Authentication authentication, @PathVariable Long userId) {
        userService.deleteUser(authentication.getName(), userId);
    }

    /**
     * Assign a supervisor to a user (only for SUPER_ADMIN, ADMIN, GYM_MAINTENANCE_MANAGER roles)
     * @param userId The user to assign a supervisor to
     * @param supervisorId The supervisor user ID
     */
    @PutMapping("/{userId}/supervisor/{supervisorId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    public UserMeResponse assignSupervisor(
        Authentication authentication,
        @PathVariable Long userId,
        @PathVariable Long supervisorId) {
        return userService.assignSupervisor(authentication.getName(), userId, supervisorId);
    }

    // SuperAdmin-only endpoints
    @GetMapping("/by-role/{role}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public List<AdminUserResponse> getUsersByRole(@PathVariable String role) {
        return userService.getUsersByRole(role);
    }

    @PostMapping("/admin/create")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public UserMeResponse createAdmin(@Valid @RequestBody CreateAdminRequest request) {
        return userService.createAdmin(request);
    }

    @PostMapping("/admin/assign-organization")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public UserMeResponse assignAdminToOrganization(@Valid @RequestBody AssignAdminToOrganizationRequest request) {
        return userService.assignAdminToOrganization(request);
    }

    @PostMapping("/organization/create")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public OrganizationDTO createOrganization(@Valid @RequestBody CreateOrganizationRequest request) {
        return userService.createOrganization(request);
    }

    @GetMapping("/organization/all")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public List<OrganizationDTO> getAllOrganizations() {
        return userService.getAllOrganizations();
    }

    // Alias endpoint for /api/organizations
    @GetMapping("/organizations")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public List<OrganizationDTO> getOrganizationsAlias() {
        return userService.getAllOrganizations();
    }

    @GetMapping("/organization/{organizationId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public OrganizationDTO getOrganization(@PathVariable Long organizationId) {
        return userService.getOrganizationById(organizationId);
    }

    @PutMapping("/organization/{organizationId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public OrganizationDTO updateOrganization(
            @PathVariable Long organizationId,
            @Valid @RequestBody CreateOrganizationRequest request
    ) {
        return userService.updateOrganization(organizationId, request);
    }

    @DeleteMapping("/organization/{organizationId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public void deactivateOrganization(@PathVariable Long organizationId) {
        userService.deactivateOrganization(organizationId);
    }

    @GetMapping("/organization/{organizationId}/users")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public List<UserListResponse> getUsersByOrganization(@PathVariable Long organizationId) {
        return userService.getUsersByOrganization(organizationId);
    }

    @PostMapping("/create-with-default-password")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    public UserMeResponse createUserWithDefaultPassword(
            Authentication authentication,
            @Valid @RequestBody CreateUserWithDefaultPasswordRequest request) {
        return userService.createUserWithDefaultPassword(authentication.getName(), request);
    }
}
