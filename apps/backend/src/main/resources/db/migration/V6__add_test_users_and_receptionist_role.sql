-- Add RECEPTIONIST role if not exists
INSERT INTO roles(name) VALUES ('RECEPTIONIST') ON CONFLICT (name) DO NOTHING;

-- Get role IDs
-- USER = 1, TRAINER = 2, RECEPTIONIST = 3, ADMIN = 4

-- Insert 1 Admin User
-- Password: admin123 (bcrypt hash)
INSERT INTO users(full_name, email, password_hash, role_id, active)
VALUES ('John Owner', 'admin@fittrack.app', '$2b$12$39QJGOglj6ogN3bAf0QRMOynsAb1g1KT2lBlyFY8MAoP7ZgwJ2I9.',
        (SELECT id FROM roles WHERE name = 'ADMIN'), true)
ON CONFLICT (email) DO NOTHING;

-- Insert 1 Receptionist User
INSERT INTO users(full_name, email, password_hash, role_id, active)
VALUES ('Sarah Receptionist', 'receptionist@fittrack.app', '$2b$12$39QJGOglj6ogN3bAf0QRMOynsAb1g1KT2lBlyFY8MAoP7ZgwJ2I9.',
        (SELECT id FROM roles WHERE name = 'RECEPTIONIST'), true)
ON CONFLICT (email) DO NOTHING;

-- Insert 3 Trainer Users
INSERT INTO users(full_name, email, password_hash, role_id, active)
VALUES
    ('Mike Trainer', 'trainer1@fittrack.app', '$2b$12$39QJGOglj6ogN3bAf0QRMOynsAb1g1KT2lBlyFY8MAoP7ZgwJ2I9.',
     (SELECT id FROM roles WHERE name = 'TRAINER'), true),
    ('Lisa Coach', 'trainer2@fittrack.app', '$2b$12$39QJGOglj6ogN3bAf0QRMOynsAb1g1KT2lBlyFY8MAoP7ZgwJ2I9.',
     (SELECT id FROM roles WHERE name = 'TRAINER'), true),
    ('David Fitness', 'trainer3@fittrack.app', '$2b$12$39QJGOglj6ogN3bAf0QRMOynsAb1g1KT2lBlyFY8MAoP7ZgwJ2I9.',
     (SELECT id FROM roles WHERE name = 'TRAINER'), true)
ON CONFLICT (email) DO NOTHING;

-- Insert 5 User/Member Users
INSERT INTO users(full_name, email, password_hash, role_id, active)
VALUES
    ('Raj Kumar', 'raj@fittrack.app', '$2b$12$39QJGOglj6ogN3bAf0QRMOynsAb1g1KT2lBlyFY8MAoP7ZgwJ2I9.',
     (SELECT id FROM roles WHERE name = 'USER'), true),
    ('Priya Sharma', 'priya@fittrack.app', '$2b$12$39QJGOglj6ogN3bAf0QRMOynsAb1g1KT2lBlyFY8MAoP7ZgwJ2I9.',
     (SELECT id FROM roles WHERE name = 'USER'), true),
    ('Amit Singh', 'amit@fittrack.app', '$2b$12$39QJGOglj6ogN3bAf0QRMOynsAb1g1KT2lBlyFY8MAoP7ZgwJ2I9.',
     (SELECT id FROM roles WHERE name = 'USER'), true),
    ('Neha Verma', 'neha@fittrack.app', '$2b$12$39QJGOglj6ogN3bAf0QRMOynsAb1g1KT2lBlyFY8MAoP7ZgwJ2I9.',
     (SELECT id FROM roles WHERE name = 'USER'), true),
    ('Rohan Patel', 'rohan@fittrack.app', '$2b$12$39QJGOglj6ogN3bAf0QRMOynsAb1g1KT2lBlyFY8MAoP7ZgwJ2I9.',
     (SELECT id FROM roles WHERE name = 'USER'), true)
ON CONFLICT (email) DO NOTHING;

-- Create user profiles for the new users
-- Admin profile
INSERT INTO user_profiles(user_id, fitness_level, primary_goal, training_preference, workout_frequency, height_cm, weight_kg)
SELECT u.id, 'ADVANCED', 'GENERAL_HEALTH', 'GYM', 3, 180.0, 80.0
FROM users u
WHERE u.email = 'admin@fittrack.app'
AND NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_id = u.id)
ON CONFLICT DO NOTHING;

-- Receptionist profile
INSERT INTO user_profiles(user_id, fitness_level, primary_goal, training_preference, workout_frequency, height_cm, weight_kg)
SELECT u.id, 'INTERMEDIATE', 'IMPROVE_FITNESS', 'GYM', 4, 165.0, 60.0
FROM users u
WHERE u.email = 'receptionist@fittrack.app'
AND NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_id = u.id)
ON CONFLICT DO NOTHING;

-- Trainer profiles
INSERT INTO user_profiles(user_id, fitness_level, primary_goal, training_preference, workout_frequency, height_cm, weight_kg)
SELECT u.id, 'ADVANCED', 'BUILD_MUSCLE', 'GYM', 6, 185.0, 90.0
FROM users u
WHERE u.email = 'trainer1@fittrack.app'
AND NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_id = u.id)
ON CONFLICT DO NOTHING;

INSERT INTO user_profiles(user_id, fitness_level, primary_goal, training_preference, workout_frequency, height_cm, weight_kg)
SELECT u.id, 'ADVANCED', 'LOSE_FAT', 'GYM', 5, 168.0, 65.0
FROM users u
WHERE u.email = 'trainer2@fittrack.app'
AND NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_id = u.id)
ON CONFLICT DO NOTHING;

INSERT INTO user_profiles(user_id, fitness_level, primary_goal, training_preference, workout_frequency, height_cm, weight_kg)
SELECT u.id, 'ADVANCED', 'IMPROVE_STRENGTH', 'GYM', 6, 182.0, 88.0
FROM users u
WHERE u.email = 'trainer3@fittrack.app'
AND NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_id = u.id)
ON CONFLICT DO NOTHING;

-- Member profiles
INSERT INTO user_profiles(user_id, fitness_level, primary_goal, training_preference, workout_frequency, height_cm, weight_kg)
SELECT u.id, 'BEGINNER', 'BUILD_MUSCLE', 'GYM', 3, 175.0, 75.0
FROM users u
WHERE u.email = 'raj@fittrack.app'
AND NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_id = u.id)
ON CONFLICT DO NOTHING;

INSERT INTO user_profiles(user_id, fitness_level, primary_goal, training_preference, workout_frequency, height_cm, weight_kg)
SELECT u.id, 'INTERMEDIATE', 'LOSE_FAT', 'GYM', 4, 162.0, 62.0
FROM users u
WHERE u.email = 'priya@fittrack.app'
AND NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_id = u.id)
ON CONFLICT DO NOTHING;

INSERT INTO user_profiles(user_id, fitness_level, primary_goal, training_preference, workout_frequency, height_cm, weight_kg)
SELECT u.id, 'INTERMEDIATE', 'IMPROVE_STRENGTH', 'GYM', 5, 178.0, 78.0
FROM users u
WHERE u.email = 'amit@fittrack.app'
AND NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_id = u.id)
ON CONFLICT DO NOTHING;

INSERT INTO user_profiles(user_id, fitness_level, primary_goal, training_preference, workout_frequency, height_cm, weight_kg)
SELECT u.id, 'BEGINNER', 'IMPROVE_FITNESS', 'GYM', 3, 160.0, 58.0
FROM users u
WHERE u.email = 'neha@fittrack.app'
AND NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_id = u.id)
ON CONFLICT DO NOTHING;

INSERT INTO user_profiles(user_id, fitness_level, primary_goal, training_preference, workout_frequency, height_cm, weight_kg)
SELECT u.id, 'INTERMEDIATE', 'BUILD_MUSCLE', 'GYM', 4, 180.0, 82.0
FROM users u
WHERE u.email = 'rohan@fittrack.app'
AND NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_id = u.id)
ON CONFLICT DO NOTHING;

