-- V106__add_test_users.sql
-- Add test users for different roles to the system

-- Ensure RECEPTIONIST role exists
INSERT INTO roles(name) VALUES ('RECEPTIONIST') ON CONFLICT (name) DO NOTHING;

-- Add test users with BCrypt hashed passwords
-- Password: admin123
-- Password hash: $2b$12$39QJGOglj6ogN3bAf0QRMOynsAb1g1KT2lBlyFY8MAoP7ZgwJ2I9.

INSERT INTO users (email, password_hash, full_name, mobile, address, role_id, organization_id, branch_id, active, created_at, updated_at)
SELECT
    'john.manager@fittrack.app',
    '$2b$12$39QJGOglj6ogN3bAf0QRMOynsAb1g1KT2lBlyFY8MAoP7ZgwJ2I9.',
    'John Manager',
    '+919876543210',
    '456 Manager Lane, Mumbai',
    (SELECT id FROM roles WHERE name = 'ADMIN' LIMIT 1),
    1,
    1,
    TRUE,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'john.manager@fittrack.app');

INSERT INTO users (email, password_hash, full_name, mobile, address, role_id, organization_id, branch_id, active, created_at, updated_at)
SELECT
    'sarah.staff@fittrack.app',
    '$2b$12$39QJGOglj6ogN3bAf0QRMOynsAb1g1KT2lBlyFY8MAoP7ZgwJ2I9.',
    'Sarah Staff',
    '+919876543211',
    '789 Staff Road, Mumbai',
    (SELECT id FROM roles WHERE name = 'RECEPTIONIST' LIMIT 1),
    1,
    1,
    TRUE,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'sarah.staff@fittrack.app');

INSERT INTO users (email, password_hash, full_name, mobile, address, role_id, organization_id, branch_id, active, created_at, updated_at)
SELECT
    'mike.trainer@fittrack.app',
    '$2b$12$39QJGOglj6ogN3bAf0QRMOynsAb1g1KT2lBlyFY8MAoP7ZgwJ2I9.',
    'Mike Trainer',
    '+919876543212',
    '321 Trainer Ave, Mumbai',
    (SELECT id FROM roles WHERE name = 'TRAINER' LIMIT 1),
    1,
    1,
    TRUE,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'mike.trainer@fittrack.app');

INSERT INTO users (email, password_hash, full_name, mobile, address, role_id, organization_id, branch_id, active, created_at, updated_at)
SELECT
    'alice.trainer@fittrack.app',
    '$2b$12$39QJGOglj6ogN3bAf0QRMOynsAb1g1KT2lBlyFY8MAoP7ZgwJ2I9.',
    'Alice Trainer',
    '+919876543213',
    '654 Alice Road, Mumbai',
    (SELECT id FROM roles WHERE name = 'TRAINER' LIMIT 1),
    1,
    1,
    TRUE,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'alice.trainer@fittrack.app');

INSERT INTO users (email, password_hash, full_name, mobile, address, role_id, organization_id, branch_id, active, created_at, updated_at)
SELECT
    'david.member@fittrack.app',
    '$2b$12$39QJGOglj6ogN3bAf0QRMOynsAb1g1KT2lBlyFY8MAoP7ZgwJ2I9.',
    'David Member',
    '+919876543214',
    '987 David Lane, Mumbai',
    (SELECT id FROM roles WHERE name = 'USER' LIMIT 1),
    1,
    1,
    TRUE,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'david.member@fittrack.app');

INSERT INTO users (email, password_hash, full_name, mobile, address, role_id, organization_id, branch_id, active, created_at, updated_at)
SELECT
    'emma.member@fittrack.app',
    '$2b$12$39QJGOglj6ogN3bAf0QRMOynsAb1g1KT2lBlyFY8MAoP7ZgwJ2I9.',
    'Emma Member',
    '+919876543215',
    '555 Emma Street, Mumbai',
    (SELECT id FROM roles WHERE name = 'USER' LIMIT 1),
    1,
    1,
    TRUE,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'emma.member@fittrack.app');

INSERT INTO users (email, password_hash, full_name, mobile, address, role_id, organization_id, branch_id, active, created_at, updated_at)
SELECT
    'frank.member@fittrack.app',
    '$2b$12$39QJGOglj6ogN3bAf0QRMOynsAb1g1KT2lBlyFY8MAoP7ZgwJ2I9.',
    'Frank Member',
    '+919876543216',
    '666 Frank Avenue, Mumbai',
    (SELECT id FROM roles WHERE name = 'USER' LIMIT 1),
    1,
    1,
    TRUE,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'frank.member@fittrack.app');


