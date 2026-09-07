package com.fittrack.backend.service.impl;

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
import com.fittrack.backend.entity.Organization;
import com.fittrack.backend.entity.Role;
import com.fittrack.backend.entity.User;
import com.fittrack.backend.entity.UserProfile;
import com.fittrack.backend.entity.enums.RoleName;
import com.fittrack.backend.exception.AppException;
import com.fittrack.backend.mapper.OrganizationMapper;
import com.fittrack.backend.mapper.UserMapper;
import com.fittrack.backend.repository.OrganizationRepository;
import com.fittrack.backend.repository.RoleRepository;
import com.fittrack.backend.repository.UserProfileRepository;
import com.fittrack.backend.repository.UserRepository;
import com.fittrack.backend.service.UserService;
import com.fittrack.backend.util.EmployeeIdGenerator;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserProfileRepository profileRepository;
    private final RoleRepository roleRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmployeeIdGenerator employeeIdGenerator;

    public UserServiceImpl(
            UserRepository userRepository,
            UserProfileRepository profileRepository,
            RoleRepository roleRepository,
            OrganizationRepository organizationRepository,
            PasswordEncoder passwordEncoder,
            EmployeeIdGenerator employeeIdGenerator
    ) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.roleRepository = roleRepository;
        this.organizationRepository = organizationRepository;
        this.passwordEncoder = passwordEncoder;
        this.employeeIdGenerator = employeeIdGenerator;
    }

    @Override
    public UserMeResponse me(String email) {
        User user = findUser(email);
        UserProfile profile = profileRepository.findByUserId(user.getId()).orElse(null);
        return UserMapper.toMeResponse(user, profile);
    }

    @Override
    public UserMeResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = findUser(email);
        UserProfile profile = profileRepository.findByUserId(user.getId()).orElseGet(() -> {
            UserProfile p = new UserProfile();
            p.setUser(user);
            return p;
        });

        if (request.fullName() != null && !request.fullName().isBlank()) {
            user.setFullName(request.fullName().trim());
        }
        if (request.dateOfBirth() != null) {
            profile.setDateOfBirth(request.dateOfBirth());
        }
        if (request.gender() != null) {
            profile.setGender(request.gender());
        }
        if (request.heightCm() != null) {
            profile.setHeightCm(BigDecimal.valueOf(request.heightCm()));
        }
        if (request.weightKg() != null) {
            profile.setWeightKg(BigDecimal.valueOf(request.weightKg()));
        }
        if (request.fitnessLevel() != null) {
            profile.setFitnessLevel(request.fitnessLevel());
        }
        if (request.primaryGoal() != null) {
            profile.setPrimaryGoal(request.primaryGoal());
        }
        if (request.trainingPreference() != null) {
            profile.setTrainingPreference(request.trainingPreference());
        }
        if (request.workoutFrequency() != null) {
            profile.setWorkoutFrequency(request.workoutFrequency());
        }

        userRepository.save(user);
        profileRepository.save(profile);

        return UserMapper.toMeResponse(user, profile);
    }

    @Override
    public List<UserListResponse> getAllUsers(String requesterEmail) {
        User requester = findUser(requesterEmail);
        RoleName role = requester.getRole().getName();

        List<User> scopedUsers;
        if (role == RoleName.SUPER_ADMIN) {
            // SuperAdmin: Get all users EXCEPT other SuperAdmins
            scopedUsers = userRepository.findAll();
            scopedUsers = scopedUsers.stream()
                .filter(u -> u.getRole().getName() != RoleName.SUPER_ADMIN)
                .collect(Collectors.toList());
        } else if (role == RoleName.ADMIN) {
            if (requester.getOrganization() == null) {
                return List.of();
            }
            // Admin: Get users in their organization EXCEPT SuperAdmins and other Admins
            scopedUsers = userRepository.findByOrganizationId(requester.getOrganization().getId());
            scopedUsers = scopedUsers.stream()
                .filter(u -> u.getRole().getName() != RoleName.SUPER_ADMIN && u.getRole().getName() != RoleName.ADMIN)
                .collect(Collectors.toList());
        } else if (role == RoleName.GYM_MAINTENANCE_MANAGER) {
            if (requester.getOrganization() == null) {
                return List.of();
            }
            scopedUsers = userRepository.findByOrganizationIdAndRoleNames(
                requester.getOrganization().getId(),
                Set.of(RoleName.TRAINER, RoleName.USER)
            );
        } else if (role == RoleName.TRAINER) {
            if (requester.getBranch() != null) {
                scopedUsers = userRepository.findByBranchIdAndRoleName(requester.getBranch().getId(), RoleName.USER);
            } else if (requester.getOrganization() != null) {
                scopedUsers = userRepository.findByOrganizationIdAndRoleName(requester.getOrganization().getId(), RoleName.USER);
            } else {
                scopedUsers = List.of();
            }
        } else {
            throw new AppException(HttpStatus.FORBIDDEN, "Not allowed to view users");
        }

        return scopedUsers
            .stream()
            .map(this::toUserListResponse)
            .collect(Collectors.toList());
    }

    @Override
    public List<AdminUserResponse> getUsersByRole(String roleName) {
        try {
            RoleName role = RoleName.valueOf(roleName);
            List<User> users = userRepository.findAll()
                .stream()
                .filter(u -> u.getRole().getName() == role && u.isActive())
                .collect(Collectors.toList());

            return users
                .stream()
                .map(this::toAdminUserResponse)
                .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Invalid role: " + roleName);
        }
    }

    @Override
    public UserMeResponse changeUserRole(String requesterEmail, ChangeRoleRequest request) {
        User requester = findUser(requesterEmail);
        User target = userRepository.findById(request.userId())
            .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));

        validateRoleChangePermission(requester, target, request.newRole());

        Role role = roleRepository.findByName(request.newRole())
            .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Role not found"));

        target.setRole(role);
        syncEmployeeIdNumber(target, request.newRole());
        userRepository.save(target);

        UserProfile profile = profileRepository.findByUserId(target.getId()).orElse(null);
        return UserMapper.toMeResponse(target, profile);
    }

    @Override
    public void deleteUser(String requesterEmail, Long userId) {
        User requester = findUser(requesterEmail);
        User target = userRepository.findById(userId)
            .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));

        validateDeletePermission(requester, target);

        target.setActive(false);
        userRepository.save(target);
    }

    // SuperAdmin-only methods
    @Override
    public UserMeResponse createAdmin(CreateAdminRequest request) {
        // Check if user already exists
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new AppException(HttpStatus.CONFLICT, "User with this email already exists");
        }

        // Get Admin role
        Role adminRole = roleRepository.findByName(RoleName.ADMIN)
            .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Admin role not found"));

        // Get Organization if provided
        Organization organization = null;
        if (request.organizationId() != null) {
            organization = organizationRepository.findById(request.organizationId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Organization not found"));
        }

        // Create new admin user
        User admin = new User();
        admin.setFullName(request.fullName());
        admin.setEmail(request.email());
        admin.setPasswordHash(passwordEncoder.encode(request.password()));
        admin.setRole(adminRole);
        syncEmployeeIdNumber(admin, RoleName.ADMIN);
        admin.setOrganization(organization);
        admin = userRepository.save(admin);

        UserProfile profile = profileRepository.findByUserId(admin.getId()).orElse(null);
        return UserMapper.toMeResponse(admin, profile);
    }

    @Override
    public UserMeResponse assignAdminToOrganization(AssignAdminToOrganizationRequest request) {
        User user = userRepository.findById(request.userId())
            .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));

        // Check if user is already an admin
        if (user.getRole().getName() != RoleName.ADMIN) {
            throw new AppException(HttpStatus.BAD_REQUEST, "User is not an admin");
        }

        Organization organization = organizationRepository.findById(request.organizationId())
            .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Organization not found"));

        user.setOrganization(organization);
        userRepository.save(user);

        UserProfile profile = profileRepository.findByUserId(user.getId()).orElse(null);
        return UserMapper.toMeResponse(user, profile);
    }

    @Override
    public OrganizationDTO createOrganization(CreateOrganizationRequest request) {
        // Check if organization already exists
        if (organizationRepository.findByName(request.name()).isPresent()) {
            throw new AppException(HttpStatus.CONFLICT, "Organization with this name already exists");
        }

        Organization organization = new Organization();
        organization.setName(request.name());
        organization.setEmail(request.email());
        organization.setPhone(request.phone());
        organization.setAddress(request.address());
        organization.setCity(request.city());
        organization.setState(request.state());
        organization.setCountry(request.country());
        organization.setPostalCode(request.postalCode());
        organization.setTaxId(request.taxId());
        organization.setActive(true);

        organization = organizationRepository.save(organization);
        return OrganizationMapper.toDTO(organization);
    }

    @Override
    public List<OrganizationDTO> getAllOrganizations() {
        return organizationRepository.findAll()
            .stream()
            .map(OrganizationMapper::toDTO)
            .collect(Collectors.toList());
    }

    @Override
    public OrganizationDTO getOrganizationById(Long organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Organization not found"));
        return OrganizationMapper.toDTO(organization);
    }

    @Override
    public OrganizationDTO updateOrganization(Long organizationId, CreateOrganizationRequest request) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Organization not found"));

        organization.setName(request.name());
        organization.setEmail(request.email());
        organization.setPhone(request.phone());
        organization.setAddress(request.address());
        organization.setCity(request.city());
        organization.setState(request.state());
        organization.setCountry(request.country());
        organization.setPostalCode(request.postalCode());
        organization.setTaxId(request.taxId());

        organization = organizationRepository.save(organization);
        return OrganizationMapper.toDTO(organization);
    }

    @Override
    public void deactivateOrganization(Long organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Organization not found"));

        organization.setActive(false);
        organizationRepository.save(organization);
    }

    @Override
    public List<UserListResponse> getUsersByOrganization(Long organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Organization not found"));

        List<User> users = userRepository.findByOrganizationId(organizationId);
        return users.stream()
            .map(this::toUserListResponse)
            .collect(Collectors.toList());
    }

    private UserListResponse toUserListResponse(User user) {
        return new UserListResponse(
            user.getId(),
            user.getEmployeeIdNumber(),
            user.getFullName(),
            user.getEmail(),
            user.getRole().getName(),
            user.isActive(),
            user.getCreatedAt(),
            user.getOrganization() != null ? user.getOrganization().getId() : null,
            user.getOrganization() != null ? user.getOrganization().getName() : null
        );
    }

    private AdminUserResponse toAdminUserResponse(User user) {
        return new AdminUserResponse(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getRole().getName(),
            user.getOrganization() != null ? user.getOrganization().getId() : null,
            user.getOrganization() != null ? user.getOrganization().getName() : null,
            user.isActive(),
            user.getCreatedAt()
        );
    }

    private void validateRoleChangePermission(User requester, User target, RoleName newRole) {
        if (requester.getId().equals(target.getId())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "You cannot change your own role");
        }

        RoleName requesterRole = requester.getRole().getName();
        RoleName targetRole = target.getRole().getName();

        if (requesterRole == RoleName.SUPER_ADMIN) {
            return;
        }

        if (requesterRole == RoleName.ADMIN) {
            if (requester.getOrganization() == null || target.getOrganization() == null
                || !requester.getOrganization().getId().equals(target.getOrganization().getId())) {
                throw new AppException(HttpStatus.FORBIDDEN, "You can manage only users in your organization");
            }
            if (targetRole == RoleName.SUPER_ADMIN || newRole == RoleName.SUPER_ADMIN) {
                throw new AppException(HttpStatus.FORBIDDEN, "Admin cannot assign or modify super admin role");
            }
            return;
        }

        throw new AppException(HttpStatus.FORBIDDEN, "You are not allowed to change roles");
    }

    private void validateDeletePermission(User requester, User target) {
        if (requester.getId().equals(target.getId())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "You cannot deactivate yourself");
        }

        RoleName requesterRole = requester.getRole().getName();
        RoleName targetRole = target.getRole().getName();

        if (requesterRole == RoleName.SUPER_ADMIN) {
            return;
        }

        if (requesterRole == RoleName.ADMIN) {
            if (requester.getOrganization() == null || target.getOrganization() == null
                || !requester.getOrganization().getId().equals(target.getOrganization().getId())) {
                throw new AppException(HttpStatus.FORBIDDEN, "You can manage only users in your organization");
            }
            if (targetRole == RoleName.SUPER_ADMIN) {
                throw new AppException(HttpStatus.FORBIDDEN, "Admin cannot deactivate super admin");
            }
            return;
        }

        if (requesterRole == RoleName.GYM_MAINTENANCE_MANAGER) {
            if (requester.getOrganization() == null || target.getOrganization() == null
                || !requester.getOrganization().getId().equals(target.getOrganization().getId())) {
                throw new AppException(HttpStatus.FORBIDDEN, "You can manage only your organization team members");
            }
            if (targetRole != RoleName.USER) {
                throw new AppException(HttpStatus.FORBIDDEN, "Gym maintenance manager can deactivate members only");
            }
            return;
        }

        if (requesterRole == RoleName.TRAINER) {
            if (targetRole != RoleName.USER) {
                throw new AppException(HttpStatus.FORBIDDEN, "Trainer can deactivate assigned members only");
            }
            if (requester.getBranch() != null && (target.getBranch() == null
                || !requester.getBranch().getId().equals(target.getBranch().getId()))) {
                throw new AppException(HttpStatus.FORBIDDEN, "You can manage only members in your branch");
            }
            if (requester.getBranch() == null && requester.getOrganization() != null
                && (target.getOrganization() == null
                || !requester.getOrganization().getId().equals(target.getOrganization().getId()))) {
                throw new AppException(HttpStatus.FORBIDDEN, "You can manage only members in your organization");
            }
            return;
        }

        throw new AppException(HttpStatus.FORBIDDEN, "You are not allowed to deactivate users");
    }

    private User findUser(String email) {
        return userRepository.findWithRoleByEmailIgnoreCase(email)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));
    }

    @Override
    public UserMeResponse assignSupervisor(String requesterEmail, Long userId, Long supervisorId) {
        User requester = findUser(requesterEmail);
        User target = userRepository.findById(userId)
            .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));
        User supervisor = userRepository.findById(supervisorId)
            .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Supervisor not found"));

        // Validate permission
        validateSupervisorAssignmentPermission(requester, target, supervisor);

        // Assign supervisor
        target.setSupervisor(supervisor);
        userRepository.save(target);

        UserProfile profile = profileRepository.findByUserId(target.getId()).orElse(null);
        return UserMapper.toMeResponse(target, profile);
    }

    private void validateSupervisorAssignmentPermission(User requester, User target, User supervisor) {
        // Only SUPER_ADMIN and ADMIN can assign supervisors
        RoleName requesterRole = requester.getRole().getName();

        if (requesterRole != RoleName.SUPER_ADMIN && requesterRole != RoleName.ADMIN) {
            throw new AppException(HttpStatus.FORBIDDEN, "Only admins can assign supervisors");
        }

        // Supervisor must have one of the allowed roles
        RoleName supervisorRole = supervisor.getRole().getName();
        Set<RoleName> allowedSupervisorRoles = Set.of(
            RoleName.SUPER_ADMIN,
            RoleName.ADMIN,
            RoleName.GYM_MAINTENANCE_MANAGER
        );

        if (!allowedSupervisorRoles.contains(supervisorRole)) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                "Supervisor must have SUPER_ADMIN, ADMIN, or GYM_MAINTENANCE_MANAGER role");
        }

        // Admin can only assign supervisors within their organization
        if (requesterRole == RoleName.ADMIN) {
            if (requester.getOrganization() == null || target.getOrganization() == null
                || !requester.getOrganization().getId().equals(target.getOrganization().getId())) {
                throw new AppException(HttpStatus.FORBIDDEN, "You can only manage users in your organization");
            }
            if (supervisor.getOrganization() == null
                || !requester.getOrganization().getId().equals(supervisor.getOrganization().getId())) {
                throw new AppException(HttpStatus.FORBIDDEN, "Supervisor must be from your organization");
            }
        }
    }

    @Override
    public UserMeResponse createUserWithDefaultPassword(String requesterEmail, CreateUserWithDefaultPasswordRequest request) {
        User requester = findUser(requesterEmail);
        
        // Validate permissions
        if (requester.getRole().getName() != RoleName.SUPER_ADMIN && requester.getRole().getName() != RoleName.ADMIN) {
            throw new AppException(HttpStatus.FORBIDDEN, "Only SUPER_ADMIN and ADMIN can create users");
        }

        // Check if user already exists
        if (userRepository.findWithRoleByEmailIgnoreCase(request.email()).isPresent()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Email already registered");
        }

        // Get the role
        Role role = roleRepository.findByName(request.role())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Role not found"));

        // Get organization
        Organization organization = null;
        if (request.organizationId() != null) {
            organization = organizationRepository.findById(request.organizationId())
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Organization not found"));
            
            // ADMIN can only create users in their organization
            if (requester.getRole().getName() == RoleName.ADMIN) {
                if (requester.getOrganization() == null || 
                    !requester.getOrganization().getId().equals(organization.getId())) {
                    throw new AppException(HttpStatus.FORBIDDEN, "You can only create users in your organization");
                }
            }
        }

        // Get default password based on role
        String defaultPassword = getDefaultPassword(request.role());

        // Create user
        User user = new User();
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(defaultPassword));
        user.setRole(role);
        syncEmployeeIdNumber(user, request.role());
        user.setActive(true);
        user.setOrganization(organization);

        user = userRepository.save(user);

        // Create user profile
        UserProfile profile = new UserProfile();
        profile.setUser(user);
        profileRepository.save(profile);

        UserProfile savedProfile = profileRepository.findByUserId(user.getId()).orElse(null);
        return UserMapper.toMeResponse(user, savedProfile);
    }

    private String getDefaultPassword(RoleName role) {
        return switch (role) {
            case ADMIN -> "admin123";
            case TRAINER -> "trainer123";
            case GYM_MAINTENANCE_MANAGER -> "gmm123";
            case USER -> "member123";
            case SUPER_ADMIN -> "superadmin123";
        };
    }

    private void syncEmployeeIdNumber(User user, RoleName roleName) {
        if (!employeeIdGenerator.requiresEmployeeId(roleName)) {
            user.setEmployeeIdNumber(null);
            return;
        }

        String expectedPrefix = employeeIdGenerator.getPrefix(roleName);
        if (user.getEmployeeIdNumber() == null || !user.getEmployeeIdNumber().startsWith(expectedPrefix)) {
            user.setEmployeeIdNumber(employeeIdGenerator.generateEmployeeId(roleName));
        }
    }
}
