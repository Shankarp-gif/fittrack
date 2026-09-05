package com.fittrack.backend.repository;

import com.fittrack.backend.entity.Role;
import com.fittrack.backend.entity.enums.RoleName;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleName name);
}

