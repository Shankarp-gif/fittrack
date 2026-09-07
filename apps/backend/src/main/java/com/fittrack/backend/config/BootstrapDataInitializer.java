package com.fittrack.backend.config;

import com.fittrack.backend.entity.Role;
import com.fittrack.backend.entity.enums.RoleName;
import com.fittrack.backend.repository.RoleRepository;
import jakarta.transaction.Transactional;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Bootstrap configuration for application startup.
 * Creates essential roles on application startup.
 *
 * NOTE: No hardcoded users, credentials, or test data.
 * All user data should be:
 * - Created through API endpoints
 * - Loaded from database migrations
 * - Managed through administration console
 */
@Configuration
public class BootstrapDataInitializer {

    @Bean
    @Transactional
    CommandLineRunner seedEssentialData(RoleRepository roleRepository) {
        return args -> {
            // Create all essential roles only
            // No hardcoded users or credentials
            ensureRole(roleRepository, RoleName.USER);
            ensureRole(roleRepository, RoleName.TRAINER);
            ensureRole(roleRepository, RoleName.GYM_MAINTENANCE_MANAGER);
            ensureRole(roleRepository, RoleName.ADMIN);
            ensureRole(roleRepository, RoleName.SUPER_ADMIN);
        };
    }

    /**
     * Ensures a role exists in the database. Creates it if it doesn't exist.
     *
     * @param roleRepository The role repository
     * @param roleName The role name to ensure exists
     */
    private void ensureRole(RoleRepository roleRepository, RoleName roleName) {
        if (roleRepository.findByName(roleName).isEmpty()) {
            Role role = new Role();
            role.setName(roleName);
            roleRepository.save(role);
        }
    }
}

