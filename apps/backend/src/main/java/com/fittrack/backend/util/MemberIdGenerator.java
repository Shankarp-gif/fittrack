package com.fittrack.backend.util;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Component;

/**
 * Utility component to generate unique member IDs
 */
@Component
public class MemberIdGenerator {

    private static final String MEMBER_SEQUENCE = "global_member_id_seq";

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * Generate a globally increasing member ID.
     * Format: MEM000001
     *
     * @return Generated member ID
     */
    public String generateMemberId() {
        long sequenceValue = nextSequenceValue(MEMBER_SEQUENCE);
        return String.format("MEM%06d", sequenceValue);
    }

    /**
     * Backward-compatible alias; member IDs are now global and sequential.
     */
    public String generateMemberIdWithPrefix(String orgPrefix) {
        return generateMemberId();
    }

    private long nextSequenceValue(String sequenceName) {
        Number value = (Number) entityManager
            .createNativeQuery("select nextval('" + sequenceName + "')")
            .getSingleResult();
        return value.longValue();
    }
}

