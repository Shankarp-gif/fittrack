package com.fittrack.backend.security;

import com.fittrack.backend.entity.User;
import java.util.Collection;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * Custom UserDetails that includes tenant information (organization_id, branch_id).
 * This allows controllers to access the user's gym/organization context.
 */
public class CustomUserDetails implements UserDetails {
    private final User user;
    private final Collection<? extends GrantedAuthority> authorities;

    public CustomUserDetails(User user, Collection<? extends GrantedAuthority> authorities) {
        this.user = user;
        this.authorities = authorities;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return user.getPasswordHash();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return user.isActive();
    }

    /**
     * Get the underlying User entity for access to tenant info
     */
    public User getUser() {
        return user;
    }

    /**
     * Get the organization ID for multi-tenant context
     */
    public Long getOrganizationId() {
        return user.getOrganization() != null ? user.getOrganization().getId() : null;
    }

    /**
     * Get the branch ID for multi-tenant context
     */
    public Long getBranchId() {
        return user.getBranch() != null ? user.getBranch().getId() : null;
    }

    /**
     * Get the user ID
     */
    public Long getUserId() {
        return user.getId();
    }
}

