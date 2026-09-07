package com.fittrack.backend.util;

import com.fittrack.backend.entity.enums.RoleName;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Component;

@Component
public class EmployeeIdGenerator {

    @PersistenceContext
    private EntityManager entityManager;

    public String generateEmployeeId(RoleName roleName) {
        String prefix = getPrefix(roleName);
        long sequenceValue = nextSequenceValue(getSequenceName(roleName));
        return String.format("%s%04d", prefix, sequenceValue);
    }

    public boolean requiresEmployeeId(RoleName roleName) {
        return roleName == RoleName.SUPER_ADMIN
            || roleName == RoleName.ADMIN
            || roleName == RoleName.TRAINER
            || roleName == RoleName.GYM_MAINTENANCE_MANAGER;
    }

    public String getPrefix(RoleName roleName) {
        return switch (roleName) {
            case SUPER_ADMIN -> "SUP";
            case ADMIN -> "ADM";
            case TRAINER -> "TRN";
            case GYM_MAINTENANCE_MANAGER -> "GMM";
            case USER -> throw new IllegalArgumentException("Members do not use employee IDs");
        };
    }

    private String getSequenceName(RoleName roleName) {
        return switch (roleName) {
            case SUPER_ADMIN -> "super_admin_employee_id_seq";
            case ADMIN -> "admin_employee_id_seq";
            case TRAINER -> "trainer_employee_id_seq";
            case GYM_MAINTENANCE_MANAGER -> "gym_maintenance_manager_employee_id_seq";
            case USER -> throw new IllegalArgumentException("Members do not use employee ID sequences");
        };
    }

    private long nextSequenceValue(String sequenceName) {
        Number value = (Number) entityManager
            .createNativeQuery("select nextval('" + sequenceName + "')")
            .getSingleResult();
        return value.longValue();
    }
}

