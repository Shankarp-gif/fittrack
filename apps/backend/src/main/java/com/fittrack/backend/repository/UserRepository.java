package com.fittrack.backend.repository;

import com.fittrack.backend.entity.User;
import com.fittrack.backend.entity.enums.RoleName;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);

    @EntityGraph(attributePaths = {"role", "organization", "branch", "supervisor"})
    Optional<User> findWithRoleByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    @EntityGraph(attributePaths = {"role", "organization", "branch", "supervisor"})
    List<User> findAll();

    @Query("""
        select u from User u
        join fetch u.role r
        left join fetch u.organization o
        left join fetch u.branch b
        left join fetch u.supervisor s
        where o.id = :organizationId and u.active = true
        order by u.createdAt desc
    """)
    List<User> findByOrganizationId(@Param("organizationId") Long organizationId);

    @Query("""
        select u from User u
        join fetch u.role r
        left join fetch u.organization o
        left join fetch u.branch b
        left join fetch u.supervisor s
        where o.id = :organizationId and r.name in :roles and u.active = true
        order by u.createdAt desc
    """)
    List<User> findByOrganizationIdAndRoleNames(
        @Param("organizationId") Long organizationId,
        @Param("roles") Collection<RoleName> roles
    );

    @Query("""
        select u from User u
        join fetch u.role r
        left join fetch u.organization o
        left join fetch u.branch b
        left join fetch u.supervisor s
        where b.id = :branchId and r.name = :role and u.active = true
        order by u.createdAt desc
    """)
    List<User> findByBranchIdAndRoleName(
        @Param("branchId") Long branchId,
        @Param("role") RoleName role
    );

    @Query("""
        select u from User u
        join fetch u.role r
        left join fetch u.organization o
        left join fetch u.branch b
        left join fetch u.supervisor s
        where o.id = :organizationId and r.name = :role and u.active = true
        order by u.createdAt desc
    """)
    List<User> findByOrganizationIdAndRoleName(
        @Param("organizationId") Long organizationId,
        @Param("role") RoleName role
    );

    @Query("""
        select u from User u
        join fetch u.role r
        left join fetch u.organization o
        left join fetch u.branch b
        left join fetch u.supervisor s
        where (:organizationId is null or o.id = :organizationId)
          and (:branchId is null or b.id = :branchId)
          and (:role is null or r.name = :role)
          and u.active = true
        order by u.createdAt desc
    """)
    List<User> findScopedUsers(
        @Param("organizationId") Long organizationId,
        @Param("branchId") Long branchId,
        @Param("role") RoleName role
    );

    @Query("""
        select count(u) from User u
        join u.role r
        left join u.organization o
        left join u.branch b
        where (:organizationId is null or o.id = :organizationId)
          and (:branchId is null or b.id = :branchId)
          and (:role is null or r.name = :role)
          and u.active = true
    """)
    long countScopedUsers(
        @Param("organizationId") Long organizationId,
        @Param("branchId") Long branchId,
        @Param("role") RoleName role
    );
}
