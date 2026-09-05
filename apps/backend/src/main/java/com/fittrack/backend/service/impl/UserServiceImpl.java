package com.fittrack.backend.service.impl;

import com.fittrack.backend.dto.AssignAdminToOrganizationRequest;
import com.fittrack.backend.dto.ChangeRoleRequest;
import com.fittrack.backend.dto.CreateAdminRequest;
import com.fittrack.backend.dto.CreateOrganizationRequest;
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
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.util.List;
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

    public UserServiceImpl(
            UserRepository userRepository,
            UserProfileRepository profileRepository,
            RoleRepository roleRepository,
            OrganizationRepository organizationRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.roleRepository = roleRepository;
        this.organizationRepository = organizationRepository;
        this.passwordEncoder = passwordEncoder;
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
    public List<UserListResponse> getAllUsers() {
        return userRepository.findAll()
            .stream()
            .map(user -> new UserListResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().getName(),
                user.isActive(),
                user.getCreatedAt()
            ))
            .collect(Collectors.toList());
    }

    @Override
    public UserMeResponse changeUserRole(ChangeRoleRequest request) {
        User user = userRepository.findById(request.userId())
            .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));

        Role role = roleRepository.findByName(request.newRole())
            .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Role not found"));

        user.setRole(role);
        userRepository.save(user);

        UserProfile profile = profileRepository.findByUserId(user.getId()).orElse(null);
        return UserMapper.toMeResponse(user, profile);
    }

    @Override
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));

        // Soft delete - set inactive
        user.setActive(false);
        userRepository.save(user);
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

    private User findUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));
    }
}

