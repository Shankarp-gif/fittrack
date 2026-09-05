-- Fix SuperAdmin password hash after V7 to keep migration history immutable
-- Password: Admin@123

UPDATE users
SET password_hash = '$2b$12$ZXp/eH/B.LJz/G6z5foB3.zKCuB/gG4uTPo1Q/pYT1S2Ve7WUon5q',
    active = true,
    role_id = (SELECT id FROM roles WHERE name = 'SUPER_ADMIN'),
    updated_at = NOW()
WHERE LOWER(email) = 'superadmin@fittrack.app';

