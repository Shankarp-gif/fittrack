-- Repair organization hierarchy so every non-super-admin user belongs to an organization/branch
-- and seeded users get a safe default reporting structure.

-- 1) Ensure every organization has at least one branch.
INSERT INTO branches (organization_id, name, address, city, phone, email, active, created_at, updated_at)
SELECT o.id,
       'Main Branch',
       o.address,
       o.city,
       o.phone,
       o.email,
       TRUE,
       NOW(),
       NOW()
FROM organizations o
WHERE NOT EXISTS (
    SELECT 1
    FROM branches b
    WHERE b.organization_id = o.id
);

-- 2) Backfill user organizations from their assigned branch when possible.
UPDATE users u
SET organization_id = b.organization_id,
    updated_at = NOW()
FROM branches b
WHERE u.branch_id = b.id
  AND u.organization_id IS NULL;

-- 3) Assign any remaining non-super-admin users to the first organization.
UPDATE users u
SET organization_id = fallback.organization_id,
    updated_at = NOW()
FROM (
    SELECT o.id AS organization_id
    FROM organizations o
    ORDER BY o.id
    LIMIT 1
) fallback
WHERE u.organization_id IS NULL
  AND u.role_id <> (SELECT id FROM roles WHERE name = 'SUPER_ADMIN');

-- 4) Ensure organization users always have a branch in that organization.
UPDATE users u
SET branch_id = fallback.branch_id,
    updated_at = NOW()
FROM (
    SELECT b1.organization_id, MIN(b1.id) AS branch_id
    FROM branches b1
    GROUP BY b1.organization_id
) fallback
WHERE u.organization_id = fallback.organization_id
  AND (u.branch_id IS NULL OR NOT EXISTS (
      SELECT 1
      FROM branches bx
      WHERE bx.id = u.branch_id
        AND bx.organization_id = u.organization_id
  ));

-- 5) Set organization owner to the first active admin when missing.
UPDATE organizations o
SET owner_user_id = owner_pick.user_id,
    updated_at = NOW()
FROM (
    SELECT DISTINCT ON (u.organization_id)
           u.organization_id,
           u.id AS user_id
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE r.name = 'ADMIN'
      AND u.active = TRUE
      AND u.organization_id IS NOT NULL
    ORDER BY u.organization_id, u.created_at, u.id
) owner_pick
WHERE o.id = owner_pick.organization_id
  AND o.owner_user_id IS NULL;

-- 6) Remove invalid cross-organization supervisors unless the supervisor is SUPER_ADMIN.
UPDATE users u
SET supervisor_id = NULL,
    updated_at = NOW()
FROM users s
JOIN roles sr ON sr.id = s.role_id
WHERE u.supervisor_id = s.id
  AND sr.name <> 'SUPER_ADMIN'
  AND (
      u.organization_id IS NULL
      OR s.organization_id IS NULL
      OR u.organization_id <> s.organization_id
  );

-- 7) Default admins to the platform super admin when available.
UPDATE users u
SET supervisor_id = superadmin.id,
    updated_at = NOW()
FROM (
    SELECT id
    FROM users
    WHERE role_id = (SELECT id FROM roles WHERE name = 'SUPER_ADMIN')
    ORDER BY created_at, id
    LIMIT 1
) superadmin
WHERE u.supervisor_id IS NULL
  AND u.role_id = (SELECT id FROM roles WHERE name = 'ADMIN')
  AND u.id <> superadmin.id;

-- 8) Default trainers and gym maintenance managers to their organization admin.
UPDATE users u
SET supervisor_id = (
        SELECT admin.id
        FROM users admin
        JOIN roles admin_role ON admin_role.id = admin.role_id
        WHERE admin_role.name = 'ADMIN'
          AND admin.active = TRUE
          AND admin.organization_id = u.organization_id
        ORDER BY admin.created_at, admin.id
        LIMIT 1
    ),
    updated_at = NOW()
WHERE u.supervisor_id IS NULL
  AND u.organization_id IS NOT NULL
  AND u.role_id IN (
      SELECT id
      FROM roles
      WHERE name IN ('TRAINER', 'GYM_MAINTENANCE_MANAGER')
  )
  AND EXISTS (
      SELECT 1
      FROM users admin
      JOIN roles admin_role ON admin_role.id = admin.role_id
      WHERE admin_role.name = 'ADMIN'
        AND admin.active = TRUE
        AND admin.organization_id = u.organization_id
  );

-- 9) Default member users to a trainer in their organization, otherwise the org admin.
UPDATE users u
SET supervisor_id = COALESCE(
        (
            SELECT trainer.id
            FROM users trainer
            JOIN roles trainer_role ON trainer_role.id = trainer.role_id
            WHERE trainer_role.name = 'TRAINER'
              AND trainer.active = TRUE
              AND trainer.organization_id = u.organization_id
            ORDER BY trainer.created_at, trainer.id
            LIMIT 1
        ),
        (
            SELECT admin.id
            FROM users admin
            JOIN roles admin_role ON admin_role.id = admin.role_id
            WHERE admin_role.name = 'ADMIN'
              AND admin.active = TRUE
              AND admin.organization_id = u.organization_id
            ORDER BY admin.created_at, admin.id
            LIMIT 1
        )
    ),
    updated_at = NOW()
WHERE u.supervisor_id IS NULL
  AND u.organization_id IS NOT NULL
  AND u.role_id = (SELECT id FROM roles WHERE name = 'USER')
  AND COALESCE(
      (
          SELECT trainer.id
          FROM users trainer
          JOIN roles trainer_role ON trainer_role.id = trainer.role_id
          WHERE trainer_role.name = 'TRAINER'
            AND trainer.active = TRUE
            AND trainer.organization_id = u.organization_id
          ORDER BY trainer.created_at, trainer.id
          LIMIT 1
      ),
      (
          SELECT admin.id
          FROM users admin
          JOIN roles admin_role ON admin_role.id = admin.role_id
          WHERE admin_role.name = 'ADMIN'
            AND admin.active = TRUE
            AND admin.organization_id = u.organization_id
          ORDER BY admin.created_at, admin.id
          LIMIT 1
      )
  ) IS NOT NULL;

