package com.fittrack.backend.util;

import com.fittrack.backend.security.CustomUserDetails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger logger = LoggerFactory.getLogger(AuthenticationContextHelper.class);

    /**
     * Extract the current user's organization ID from authentication
     */
    public Long getOrganizationId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            logger.warn("Attempted to get organization ID from unauthenticated request");
            throw new AuthenticationException("User not authenticated") {};
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof CustomUserDetails) {
            Long orgId = ((CustomUserDetails) principal).getOrganizationId();
            if (orgId == null) {
                String userEmail = ((CustomUserDetails) principal).getUsername();
                logger.error("User {} has no organization assigned. Organization ID is null.", userEmail);
                throw new AuthenticationException("User has no organization assigned") {};
            }
            return orgId;
        }

        logger.error("Invalid authentication principal type: {}", principal != null ? principal.getClass().getName() : "null");
        throw new AuthenticationException("Invalid authentication principal") {};
    }

    /**
     * Extract the current user's branch ID from authentication
     */
    public Long getBranchId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            logger.warn("Attempted to get branch ID from unauthenticated request");
            throw new AuthenticationException("User not authenticated") {};
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof CustomUserDetails) {
            Long branchId = ((CustomUserDetails) principal).getBranchId();
            // Branch ID can be null in some cases, so we allow it
            if (branchId == null) {
                logger.debug("User {} has no branch assigned (branch ID is null)", ((CustomUserDetails) principal).getUsername());
            }
            return branchId;
        }

        logger.error("Invalid authentication principal type: {}", principal != null ? principal.getClass().getName() : "null");
        throw new AuthenticationException("Invalid authentication principal") {};
    }

    /**
     * Extract the current user's ID from authentication
     */
    public Long getUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            logger.warn("Attempted to get user ID from unauthenticated request");
            throw new AuthenticationException("User not authenticated") {};
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof CustomUserDetails) {
            return ((CustomUserDetails) principal).getUserId();
        }

        logger.error("Invalid authentication principal type: {}", principal != null ? principal.getClass().getName() : "null");
        throw new AuthenticationException("Invalid authentication principal") {};
    }

    /**
     * Extract the current user's email from authentication
     */
    public String getUserEmail(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            logger.warn("Attempted to get user email from unauthenticated request");
            throw new AuthenticationException("User not authenticated") {};
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof CustomUserDetails) {
            return ((CustomUserDetails) principal).getUsername();
        }

        logger.error("Invalid authentication principal type: {}", principal != null ? principal.getClass().getName() : "null");
        throw new AuthenticationException("Invalid authentication principal") {};
    }

    /**
     * Get the CustomUserDetails from authentication
     */
    public CustomUserDetails getCustomUserDetails(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            logger.warn("Attempted to get CustomUserDetails from unauthenticated request");
            throw new AuthenticationException("User not authenticated") {};
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof CustomUserDetails) {
            return (CustomUserDetails) principal;
        }

        logger.error("Invalid authentication principal type: {}", principal != null ? principal.getClass().getName() : "null");
        throw new AuthenticationException("Invalid authentication principal") {};
    }

    /**
     * Extract the current user's role name from authentication
     */
    public String getUserRole(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            logger.warn("Attempted to get role from unauthenticated request");
            throw new AuthenticationException("User not authenticated") {};
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof CustomUserDetails) {
            return ((CustomUserDetails) principal).getRoleName();
        }

        logger.error("Invalid authentication principal type: {}", principal != null ? principal.getClass().getName() : "null");
        throw new AuthenticationException("Invalid authentication principal") {};
    }

    /**
     * Extract the current user's supervisor ID from authentication
     */
    public Long getSupervisorId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            logger.warn("Attempted to get supervisor ID from unauthenticated request");
            throw new AuthenticationException("User not authenticated") {};
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof CustomUserDetails) {
            return ((CustomUserDetails) principal).getSupervisorId();
        }

        logger.error("Invalid authentication principal type: {}", principal != null ? principal.getClass().getName() : "null");
        throw new AuthenticationException("Invalid authentication principal") {};
    }
}
