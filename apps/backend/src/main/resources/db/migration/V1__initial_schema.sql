CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(32) NOT NULL UNIQUE
);

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    role_id BIGINT NOT NULL REFERENCES roles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE user_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id),
    date_of_birth DATE,
    gender VARCHAR(32),
    height_cm NUMERIC(6,2),
    weight_kg NUMERIC(6,2),
    fitness_level VARCHAR(32),
    primary_goal VARCHAR(48),
    training_preference VARCHAR(24),
    workout_frequency INT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    token VARCHAR(512) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE exercises (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    muscle_group VARCHAR(64) NOT NULL,
    equipment VARCHAR(64) NOT NULL,
    difficulty VARCHAR(32) NOT NULL,
    instructions VARCHAR(2048) NOT NULL,
    image_url VARCHAR(512),
    recommended_sets INT,
    recommended_reps INT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE workout_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    title VARCHAR(120) NOT NULL,
    workout_date DATE NOT NULL,
    duration_minutes INT NOT NULL,
    calories_burned INT NOT NULL,
    total_volume_kg NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_exercises_name ON exercises(name);
CREATE INDEX idx_exercises_muscle_group ON exercises(muscle_group);
CREATE INDEX idx_workout_sessions_user_date ON workout_sessions(user_id, workout_date);

INSERT INTO roles(name) VALUES ('USER'), ('TRAINER'), ('ADMIN');

-- Password hash for: admin
INSERT INTO users(full_name, email, password_hash, role_id)
VALUES ('Demo User', 'demo@fittrack.app', '$2b$12$39QJGOglj6ogN3bAf0QRMOynsAb1g1KT2lBlyFY8MAoP7ZgwJ2I9.', 1);

INSERT INTO user_profiles(user_id, fitness_level, primary_goal, training_preference, workout_frequency, height_cm, weight_kg)
VALUES (1, 'INTERMEDIATE', 'IMPROVE_STRENGTH', 'GYM', 5, 178.0, 74.5);

INSERT INTO exercises(name, muscle_group, equipment, difficulty, instructions, image_url, recommended_sets, recommended_reps) VALUES
('Barbell Bench Press', 'Chest', 'Barbell', 'Intermediate', 'Lower the bar to the mid chest with control, then press up.', 'https://images.unsplash.com/photo-1571019613914-85f342c1d4b6?auto=format&fit=crop&w=1200&q=80', 4, 8),
('Romanian Deadlift', 'Legs', 'Barbell', 'Intermediate', 'Hinge at hips and keep back neutral while lowering bar.', 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=1200&q=80', 4, 10),
('Lat Pulldown', 'Back', 'Cable', 'Beginner', 'Pull bar to upper chest while keeping torso stable.', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80', 3, 12);

INSERT INTO workout_sessions(user_id, title, workout_date, duration_minutes, calories_burned, total_volume_kg) VALUES
(1, 'Upper Body Strength', CURRENT_DATE - INTERVAL '1 day', 52, 410, 4250),
(1, 'Lower Body Focus', CURRENT_DATE - INTERVAL '3 day', 60, 480, 5100),
(1, 'Push Hypertrophy', CURRENT_DATE - INTERVAL '5 day', 48, 360, 3720);
