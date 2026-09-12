package com.fittrack.backend.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fittrack.backend.dto.CreateUserWithDefaultPasswordRequest;
import com.fittrack.backend.dto.UserMeResponse;
import com.fittrack.backend.entity.Branch;
import com.fittrack.backend.entity.Organization;
import com.fittrack.backend.entity.Role;
import com.fittrack.backend.entity.User;
import com.fittrack.backend.entity.UserProfile;
import com.fittrack.backend.entity.enums.RoleName;
import com.fittrack.backend.exception.AppException;
import com.fittrack.backend.repository.BranchRepository;
import com.fittrack.backend.repository.OrganizationRepository;
import com.fittrack.backend.repository.RoleRepository;
import com.fittrack.backend.repository.UserProfileRepository;
import com.fittrack.backend.repository.UserRepository;
import com.fittrack.backend.util.EmployeeIdGenerator;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private UserProfileRepository profileRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private BranchRepository branchRepository;
    @Mock
    private OrganizationRepository organizationRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private EmployeeIdGenerator employeeIdGenerator;

    private UserServiceImpl userService;

    @BeforeEach
    void setUp() {
        userService = new UserServiceImpl(
            userRepository,
            profileRepository,
            roleRepository,
            branchRepository,
            organizationRepository,
            passwordEncoder,
            employeeIdGenerator
        );
    }

    @Test
    void createUserWithDefaultPassword_usesRequesterOrganizationForAdminRequests() {
        Organization organization = new Organization();
        organization.setId(7L);
        organization.setName("Org Seven");

        Branch branch = new Branch();
        branch.setId(11L);
        branch.setName("Main Branch");
        branch.setOrganization(organization);

        Role adminRole = new Role();
        adminRole.setName(RoleName.ADMIN);

        Role trainerRole = new Role();
        trainerRole.setName(RoleName.TRAINER);

        User requester = new User();
        requester.setId(1L);
        requester.setEmail("admin@fittrack.app");
        requester.setRole(adminRole);
        requester.setOrganization(organization);
        requester.setBranch(branch);
        requester.setActive(true);

        when(userRepository.findWithRoleByEmailIgnoreCase("admin@fittrack.app")).thenReturn(Optional.of(requester));
        when(userRepository.findWithRoleByEmailIgnoreCase("new.trainer@fittrack.app")).thenReturn(Optional.empty());
        when(roleRepository.findByName(RoleName.TRAINER)).thenReturn(Optional.of(trainerRole));
        when(branchRepository.findByOrganizationId(7L)).thenReturn(List.of(branch));
        when(passwordEncoder.encode("trainer123")).thenReturn("encoded-password");
        when(employeeIdGenerator.requiresEmployeeId(RoleName.TRAINER)).thenReturn(true);
        when(employeeIdGenerator.getPrefix(RoleName.TRAINER)).thenReturn("TRN");
        when(employeeIdGenerator.generateEmployeeId(RoleName.TRAINER)).thenReturn("TRN-0001");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(99L);
            return user;
        });
        when(profileRepository.save(any(UserProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(profileRepository.findByUserId(99L)).thenAnswer(invocation -> {
            UserProfile profile = new UserProfile();
            profile.setUser(new User());
            return Optional.of(profile);
        });

        UserMeResponse response = userService.createUserWithDefaultPassword(
            "admin@fittrack.app",
            new CreateUserWithDefaultPasswordRequest("New Trainer", "new.trainer@fittrack.app", RoleName.TRAINER, null)
        );

        assertEquals(7L, response.organizationId());
        assertEquals("Org Seven", response.organizationName());
        assertEquals(11L, response.branchId());
        assertEquals("Main Branch", response.branchName());
        assertEquals(RoleName.TRAINER, response.role());
    }

    @Test
    void assignSupervisor_allowsRemovingSupervisorUsingZeroId() {
        Organization organization = new Organization();
        organization.setId(5L);

        Role adminRole = new Role();
        adminRole.setName(RoleName.ADMIN);

        Role trainerRole = new Role();
        trainerRole.setName(RoleName.TRAINER);

        User requester = new User();
        requester.setId(1L);
        requester.setEmail("admin@fittrack.app");
        requester.setRole(adminRole);
        requester.setOrganization(organization);
        requester.setActive(true);

        User oldSupervisor = new User();
        oldSupervisor.setId(88L);
        oldSupervisor.setRole(adminRole);
        oldSupervisor.setOrganization(organization);
        oldSupervisor.setActive(true);

        User target = new User();
        target.setId(10L);
        target.setRole(trainerRole);
        target.setOrganization(organization);
        target.setSupervisor(oldSupervisor);
        target.setActive(true);

        when(userRepository.findWithRoleByEmailIgnoreCase("admin@fittrack.app")).thenReturn(Optional.of(requester));
        when(userRepository.findById(10L)).thenReturn(Optional.of(target));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(profileRepository.findByUserId(10L)).thenReturn(Optional.empty());

        UserMeResponse response = userService.assignSupervisor("admin@fittrack.app", 10L, 0L);

        assertNull(target.getSupervisor());
        assertNull(response.supervisorId());
        verify(userRepository, never()).findById(0L);
    }

    @Test
    void assignSupervisor_rejectsInvalidRoleHierarchy() {
        Organization organization = new Organization();
        organization.setId(3L);

        Role superAdminRole = new Role();
        superAdminRole.setName(RoleName.SUPER_ADMIN);

        Role adminRole = new Role();
        adminRole.setName(RoleName.ADMIN);

        Role trainerRole = new Role();
        trainerRole.setName(RoleName.TRAINER);

        User requester = new User();
        requester.setId(1L);
        requester.setEmail("superadmin@fittrack.app");
        requester.setRole(superAdminRole);
        requester.setActive(true);

        User target = new User();
        target.setId(2L);
        target.setRole(adminRole);
        target.setOrganization(organization);
        target.setActive(true);

        User supervisor = new User();
        supervisor.setId(3L);
        supervisor.setRole(trainerRole);
        supervisor.setOrganization(organization);
        supervisor.setActive(true);

        when(userRepository.findWithRoleByEmailIgnoreCase("superadmin@fittrack.app")).thenReturn(Optional.of(requester));
        when(userRepository.findById(2L)).thenReturn(Optional.of(target));
        when(userRepository.findById(3L)).thenReturn(Optional.of(supervisor));

        AppException exception = assertThrows(
            AppException.class,
            () -> userService.assignSupervisor("superadmin@fittrack.app", 2L, 3L)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertEquals("Invalid hierarchy: TRAINER cannot supervise ADMIN", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }
}

