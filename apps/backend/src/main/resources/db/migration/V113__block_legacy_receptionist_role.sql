-- Prevent reintroduction of legacy RECEPTIONIST role name.
-- This migration is intentionally idempotent and safe for mixed data states.

DO $$
DECLARE
    legacy_role_id BIGINT;
    canonical_role_id BIGINT;
BEGIN
    SELECT id INTO legacy_role_id FROM roles WHERE name = 'RECEPTIONIST' LIMIT 1;
    SELECT id INTO canonical_role_id FROM roles WHERE name = 'GYM_MAINTENANCE_MANAGER' LIMIT 1;

    -- If both exist, re-map users to canonical role and remove legacy role.
    IF legacy_role_id IS NOT NULL AND canonical_role_id IS NOT NULL THEN
        UPDATE users
        SET role_id = canonical_role_id
        WHERE role_id = legacy_role_id;

        DELETE FROM roles
        WHERE id = legacy_role_id;

    -- If only legacy exists, rename in place.
    ELSIF legacy_role_id IS NOT NULL THEN
        UPDATE roles
        SET name = 'GYM_MAINTENANCE_MANAGER', updated_at = NOW()
        WHERE id = legacy_role_id;
    END IF;
END $$;

-- Guardrail: block future inserts/updates with legacy role name.
ALTER TABLE roles DROP CONSTRAINT IF EXISTS chk_roles_no_legacy_receptionist;
ALTER TABLE roles
ADD CONSTRAINT chk_roles_no_legacy_receptionist
CHECK (name <> 'RECEPTIONIST');

