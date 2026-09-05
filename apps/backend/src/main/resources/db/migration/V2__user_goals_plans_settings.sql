CREATE TABLE user_goals (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    title VARCHAR(160) NOT NULL,
    target_value INT NOT NULL,
    current_value INT NOT NULL DEFAULT 0,
    unit VARCHAR(40) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(16) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE user_plans (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id),
    template_key VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE user_settings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id),
    reminder_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    reminder_time TIME NOT NULL DEFAULT TIME '07:30',
    unit_system VARCHAR(16) NOT NULL DEFAULT 'METRIC',
    weekly_goal INT NOT NULL DEFAULT 4,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_goals_user_due_date ON user_goals(user_id, due_date);

INSERT INTO user_settings(user_id, reminder_enabled, reminder_time, unit_system, weekly_goal)
SELECT id, TRUE, TIME '07:30', 'METRIC', 4 FROM users;

