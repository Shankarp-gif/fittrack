-- Assign Organization to SuperAdmin User
-- Date: 2026-09-05
-- This migration ensures the SuperAdmin user has an organization assigned

-- Step 1: Create a default organization if none exists
INSERT INTO organizations (name, email, phone, address, city, state, country, active, created_at, updated_at)
SELECT 'Default Organization', 'admin@fittrack.app', '555-0000', '123 Default St', 'New York', 'NY', 'USA', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE id = 1)
ON CONFLICT DO NOTHING;

-- Step 2: Create a default branch if none exists for organization 1
INSERT INTO branches (organization_id, name, address, city, phone, active, created_at, updated_at)
SELECT 1, 'Main Branch', '123 Default St', 'New York', '555-0000', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM branches WHERE organization_id = 1)
ON CONFLICT DO NOTHING;

-- Step 3: Assign the organization to the SuperAdmin user
UPDATE users
SET organization_id = 1,
    branch_id = (SELECT id FROM branches WHERE organization_id = 1 LIMIT 1),
    updated_at = NOW()
WHERE email = 'superadmin@fittrack.app'
  AND organization_id IS NULL;

-- Step 4: Ensure all admin users have organization_id (for those without one)
UPDATE users
SET organization_id = 1,
    branch_id = (SELECT id FROM branches WHERE organization_id = 1 LIMIT 1),
    updated_at = NOW()
WHERE role_id IN (SELECT id FROM roles WHERE name IN ('SUPER_ADMIN', 'ADMIN'))
  AND organization_id IS NULL;

-- Verification: Show updated users
SELECT id, email, full_name, organization_id, branch_id, role_id
FROM users
WHERE email IN ('superadmin@fittrack.app', 'admin@fittrack.com')
ORDER BY id;

