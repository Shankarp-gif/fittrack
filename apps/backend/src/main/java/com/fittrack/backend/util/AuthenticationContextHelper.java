package com.fittrack.backend.util;

import com.fittrack.backend.security.CustomUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Component;

/**
 * Utility class to extract authenticated user's tenant information.
 * Provides convenient methods for controllers to get org_id and branch_id
 * from the current authentication context.
 */
@Component
public class AuthenticationContextHelper {

    /**
     * Extract the current user's organization ID from authentication
     */
    public Long getOrganizationId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AuthenticationException("User not authenticated") {};
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof CustomUserDetails) {
            Long orgId = ((CustomUserDetails) principal).getOrganizationId();
            if (orgId == null) {
                throw new AuthenticationException("User has no organization assigned") {};
            }
            return orgId;
        }

        throw new AuthenticationException("Invalid authentication principal") {};
    }

    /**
     * Extract the current user's branch ID from authentication
     */
    public Long getBranchId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AuthenticationException("User not authenticated") {};
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof CustomUserDetails) {
            Long branchId = ((CustomUserDetails) principal).getBranchId();
            // Branch ID can be null in some cases, so we allow it
            return branchId;
        }

        throw new AuthenticationException("Invalid authentication principal") {};
    }

    /**
     * Extract the current user's ID from authentication
     */
    public Long getUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AuthenticationException("User not authenticated") {};
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof CustomUserDetails) {
            return ((CustomUserDetails) principal).getUserId();
        }

        throw new AuthenticationException("Invalid authentication principal") {};
    }

    /**
     * Extract the current user's email from authentication
     */
    public String getUserEmail(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AuthenticationException("User not authenticated") {};
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof CustomUserDetails) {
            return ((CustomUserDetails) principal).getUsername();
        }

        throw new AuthenticationException("Invalid authentication principal") {};
    }

    /**
     * Get the CustomUserDetails from authentication
     */
    public CustomUserDetails getCustomUserDetails(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AuthenticationException("User not authenticated") {};
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof CustomUserDetails) {
            return (CustomUserDetails) principal;
        }

        throw new AuthenticationException("Invalid authentication principal") {};
    }
}

