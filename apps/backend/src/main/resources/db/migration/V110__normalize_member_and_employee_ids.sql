-- Normalize member IDs to a global increasing sequence
-- and assign unique employee IDs to staff roles.

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS employee_id_number VARCHAR(50);

-- Re-number all members globally in creation order.
WITH ordered_members AS (
    SELECT id,
           ROW_NUMBER() OVER (ORDER BY created_at, id) AS seq
    FROM members
)
UPDATE members m
SET member_id_number = 'MEM' || LPAD(ordered_members.seq::text, 6, '0')
FROM ordered_members
WHERE ordered_members.id = m.id;

CREATE UNIQUE INDEX IF NOT EXISTS uk_members_member_id_number_global
    ON members(member_id_number);

-- Backfill employee IDs per role.
WITH ranked_staff AS (
    SELECT u.id,
           r.name AS role_name,
           ROW_NUMBER() OVER (PARTITION BY r.name ORDER BY u.created_at, u.id) AS seq
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE r.name IN ('SUPER_ADMIN', 'ADMIN', 'TRAINER', 'RECEPTIONIST')
)
UPDATE users u
SET employee_id_number = CASE ranked_staff.role_name
    WHEN 'SUPER_ADMIN' THEN 'SUP' || LPAD(ranked_staff.seq::text, 4, '0')
    WHEN 'ADMIN' THEN 'ADM' || LPAD(ranked_staff.seq::text, 4, '0')
    WHEN 'TRAINER' THEN 'TRN' || LPAD(ranked_staff.seq::text, 4, '0')
    WHEN 'RECEPTIONIST' THEN 'REC' || LPAD(ranked_staff.seq::text, 4, '0')
    ELSE NULL
END
FROM ranked_staff
WHERE ranked_staff.id = u.id;

CREATE UNIQUE INDEX IF NOT EXISTS uk_users_employee_id_number
    ON users(employee_id_number);

CREATE SEQUENCE IF NOT EXISTS global_member_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS super_admin_employee_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS admin_employee_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS trainer_employee_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS receptionist_employee_id_seq START WITH 1 INCREMENT BY 1;

SELECT setval(
    'global_member_id_seq',
    COALESCE((SELECT MAX(CAST(SUBSTRING(member_id_number FROM '[0-9]+$') AS BIGINT)) FROM members), 1),
    COALESCE((SELECT COUNT(*) > 0 FROM members), false)
);

SELECT setval(
    'super_admin_employee_id_seq',
    COALESCE((SELECT MAX(CAST(SUBSTRING(employee_id_number FROM '[0-9]+$') AS BIGINT)) FROM users WHERE employee_id_number LIKE 'SUP%'), 1),
    COALESCE((SELECT COUNT(*) > 0 FROM users WHERE employee_id_number LIKE 'SUP%'), false)
);

SELECT setval(
    'admin_employee_id_seq',
    COALESCE((SELECT MAX(CAST(SUBSTRING(employee_id_number FROM '[0-9]+$') AS BIGINT)) FROM users WHERE employee_id_number LIKE 'ADM%'), 1),
    COALESCE((SELECT COUNT(*) > 0 FROM users WHERE employee_id_number LIKE 'ADM%'), false)
);

SELECT setval(
    'trainer_employee_id_seq',
    COALESCE((SELECT MAX(CAST(SUBSTRING(employee_id_number FROM '[0-9]+$') AS BIGINT)) FROM users WHERE employee_id_number LIKE 'TRN%'), 1),
    COALESCE((SELECT COUNT(*) > 0 FROM users WHERE employee_id_number LIKE 'TRN%'), false)
);

SELECT setval(
    'receptionist_employee_id_seq',
    COALESCE((SELECT MAX(CAST(SUBSTRING(employee_id_number FROM '[0-9]+$') AS BIGINT)) FROM users WHERE employee_id_number LIKE 'REC%'), 1),
    COALESCE((SELECT COUNT(*) > 0 FROM users WHERE employee_id_number LIKE 'REC%'), false)
);

