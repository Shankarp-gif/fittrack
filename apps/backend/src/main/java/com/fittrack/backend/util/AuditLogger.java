package com.fittrack.backend.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class AuditLogger {

    public void logMemberCreated(Long memberId, String memberName) {
        log.info("AUDIT: Member created - ID: {}, Name: {}", memberId, memberName);
    }

    public void logMemberUpdated(Long memberId, String fieldName, Object oldValue, Object newValue) {
        log.info("AUDIT: Member updated - ID: {}, Field: {}, Old: {}, New: {}",
            memberId, fieldName, oldValue, newValue);
    }

    public void logMembershipCreated(Long membershipId, Long memberId, Long planId) {
        log.info("AUDIT: Membership created - ID: {}, Member: {}, Plan: {}",
            membershipId, memberId, planId);
    }

    public void logMembershipRenewed(Long membershipId, Long previousMembershipId) {
        log.info("AUDIT: Membership renewed - New ID: {}, Previous ID: {}",
            membershipId, previousMembershipId);
    }

    public void logAttendanceCheckIn(Long memberId, Long branchId) {
        log.info("AUDIT: Member check-in - Member ID: {}, Branch ID: {}", memberId, branchId);
    }

    public void logAttendanceCheckOut(Long memberId, Long branchId) {
        log.info("AUDIT: Member check-out - Member ID: {}, Branch ID: {}", memberId, branchId);
    }

    public void logAuthenticationFailure(String email, String reason) {
        log.warn("SECURITY: Authentication failed - Email: {}, Reason: {}", email, reason);
    }

    public void logAuthenticationSuccess(String email) {
        log.info("SECURITY: Authentication success - Email: {}", email);
    }

    public void logUnauthorizedAccess(String userId, String endpoint) {
        log.warn("SECURITY: Unauthorized access attempt - User: {}, Endpoint: {}", userId, endpoint);
    }

    public void logDataModification(String entity, Long entityId, String action, String details) {
        log.info("AUDIT: Data modification - Entity: {}, ID: {}, Action: {}, Details: {}",
            entity, entityId, action, details);
    }

    public void logError(String message, Exception exception) {
        log.error("ERROR: {}", message, exception);
    }

    public void logWarning(String message) {
        log.warn("WARNING: {}", message);
    }

    public void logInfo(String message) {
        log.info("INFO: {}", message);
    }

    public void logDebug(String message) {
        log.debug("DEBUG: {}", message);
    }
}

