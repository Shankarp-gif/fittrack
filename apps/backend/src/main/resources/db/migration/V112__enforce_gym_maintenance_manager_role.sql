-- Enforce canonical operations role naming in DB.
-- Handles mixed states where legacy RECEPTIONIST may still exist.

DO $$
DECLARE
    legacy_role_id BIGINT;
    canonical_role_id BIGINT;
BEGIN
    SELECT id INTO legacy_role_id FROM roles WHERE name = 'RECEPTIONIST' LIMIT 1;
    SELECT id INTO canonical_role_id FROM roles WHERE name = 'GYM_MAINTENANCE_MANAGER' LIMIT 1;

    -- If both roles exist, move users to canonical role then remove legacy role.
    IF legacy_role_id IS NOT NULL AND canonical_role_id IS NOT NULL THEN
        UPDATE users
        SET role_id = canonical_role_id
        WHERE role_id = legacy_role_id;

        DELETE FROM roles
        WHERE id = legacy_role_id;

    -- If only legacy exists, rename it in place.
    ELSIF legacy_role_id IS NOT NULL AND canonical_role_id IS NULL THEN
        UPDATE roles
        SET name = 'GYM_MAINTENANCE_MANAGER', updated_at = NOW()
        WHERE id = legacy_role_id;

    -- If neither exists (edge case), create canonical role.
    ELSIF legacy_role_id IS NULL AND canonical_role_id IS NULL THEN
        INSERT INTO roles(name, created_at, updated_at)
        VALUES ('GYM_MAINTENANCE_MANAGER', NOW(), NOW());
    END IF;
END $$;

-- Keep employee IDs aligned with the GMM prefix.
CREATE SEQUENCE IF NOT EXISTS gym_maintenance_manager_employee_id_seq START WITH 1 INCREMENT BY 1;

UPDATE users
SET employee_id_number = REGEXP_REPLACE(employee_id_number, '^REC', 'GMM')
WHERE employee_id_number LIKE 'REC%';

