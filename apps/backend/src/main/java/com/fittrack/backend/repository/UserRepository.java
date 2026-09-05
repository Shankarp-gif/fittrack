package com.fittrack.backend.repository;

import com.fittrack.backend.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);

    @EntityGraph(attributePaths = "role")
    Optional<User> findWithRoleByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);
}

