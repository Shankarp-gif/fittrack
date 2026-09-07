-- Replace legacy RECEPTIONIST role with GYM_MAINTENANCE_MANAGER.
-- Keep existing users mapped to the renamed role.

UPDATE roles
SET name = 'GYM_MAINTENANCE_MANAGER'
WHERE name = 'RECEPTIONIST';

-- Create manager employee-id sequence for new role naming.
CREATE SEQUENCE IF NOT EXISTS gym_maintenance_manager_employee_id_seq START WITH 1 INCREMENT BY 1;

-- Re-prefix existing receptionist employee IDs to match the new role name.
UPDATE users
SET employee_id_number = REGEXP_REPLACE(employee_id_number, '^REC', 'GMM')
WHERE employee_id_number LIKE 'REC%';

-- Align sequence to latest GMM code.
SELECT setval(
    'gym_maintenance_manager_employee_id_seq',
    COALESCE((SELECT MAX(CAST(SUBSTRING(employee_id_number FROM '[0-9]+$') AS BIGINT)) FROM users WHERE employee_id_number LIKE 'GMM%'), 1),
    COALESCE((SELECT COUNT(*) > 0 FROM users WHERE employee_id_number LIKE 'GMM%'), false)
);

