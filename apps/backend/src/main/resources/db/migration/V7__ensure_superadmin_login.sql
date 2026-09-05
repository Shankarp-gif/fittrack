-- Ensure SuperAdmin login always exists with valid credentials
-- Email: superadmin@fittrack.app
-- Password: Admin@123

INSERT INTO users (full_name, email, password_hash, role_id, active)
VALUES (
    'Super Administrator',
    'superadmin@fittrack.app',
    '$2b$12$SlAQmyNUht0.4S4lE4/H.OKNwhI9LH8Nfz5YhzYxKYdOKf/f3jUtu',
    (SELECT id FROM roles WHERE name = 'SUPER_ADMIN'),
    true
)
ON CONFLICT (email) DO UPDATE
SET full_name = EXCLUDED.full_name,
    password_hash = EXCLUDED.password_hash,
    role_id = EXCLUDED.role_id,
    active = true,
    updated_at = NOW();

-- Create a basic profile if missing
INSERT INTO user_profiles (user_id, fitness_level, primary_goal, training_preference, workout_frequency, height_cm, weight_kg)
SELECT u.id, 'ADVANCED', 'GENERAL_HEALTH', 'GYM', 4, 178.0, 76.0
FROM users u
WHERE u.email = 'superadmin@fittrack.app'
  AND NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_id = u.id)
ON CONFLICT DO NOTHING;

