package com.fittrack.backend.util;

import java.util.UUID;
import org.springframework.stereotype.Component;

/**
 * Utility component to generate unique member IDs
 */
@Component
public class MemberIdGenerator {

    /**
     * Generate a unique member ID using timestamp and random UUID
     * Format: MEM-{timestamp}-{randomUUID}
     *
     * @return Generated member ID
     */
    public String generateMemberId() {
        long timestamp = System.currentTimeMillis();
        String randomSuffix = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return "MEM-" + timestamp + "-" + randomSuffix;
    }

    /**
     * Generate a member ID with organization prefix
     * Format: {orgPrefix}-{timestamp}-{randomUUID}
     *
     * @param orgPrefix Organization prefix (e.g., "GYM" for gym name abbreviation)
     * @return Generated member ID with organization prefix
     */
    public String generateMemberIdWithPrefix(String orgPrefix) {
        long timestamp = System.currentTimeMillis();
        String randomSuffix = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String prefix = (orgPrefix != null && !orgPrefix.isEmpty()) ? orgPrefix.toUpperCase() : "MEM";
        return prefix + "-" + timestamp + "-" + randomSuffix;
    }
}

