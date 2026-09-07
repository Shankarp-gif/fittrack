-- V19 - Add Organization Isolation Improvements
-- Fixes: Add missing org_id columns for complete tenant isolation

-- Add organization_id to member_attendance
ALTER TABLE member_attendance
ADD COLUMN organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE;

-- Add organization_id to user_goals
ALTER TABLE user_goals
ADD COLUMN organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE;

-- Add organization_id to user_plans
ALTER TABLE user_plans
ADD COLUMN organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE;

-- Add organization_id to workout_sessions
ALTER TABLE workout_sessions
ADD COLUMN organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE;

-- Populate org_id for existing records from related entities
UPDATE member_attendance
SET organization_id = m.organization_id
FROM members m
WHERE member_attendance.member_id = m.id
  AND member_attendance.organization_id IS NULL;

UPDATE user_goals
SET organization_id = u.organization_id
FROM users u
WHERE user_goals.user_id = u.id
  AND user_goals.organization_id IS NULL
  AND u.organization_id IS NOT NULL;

-- Delete orphaned user_goals records (where user_id doesn't exist or user has no organization)
DELETE FROM user_goals
WHERE organization_id IS NULL;

UPDATE user_plans
SET organization_id = u.organization_id
FROM users u
WHERE user_plans.user_id = u.id
  AND user_plans.organization_id IS NULL
  AND u.organization_id IS NOT NULL;

-- Delete orphaned user_plans records
DELETE FROM user_plans
WHERE organization_id IS NULL;

UPDATE workout_sessions
SET organization_id = u.organization_id
FROM users u
WHERE workout_sessions.user_id = u.id
  AND workout_sessions.organization_id IS NULL
  AND u.organization_id IS NOT NULL;

-- Delete orphaned workout_sessions records
DELETE FROM workout_sessions
WHERE organization_id IS NULL;

-- Add NOT NULL constraints after population and cleanup
ALTER TABLE member_attendance
ADD CONSTRAINT member_attendance_org_not_null CHECK (organization_id IS NOT NULL) NOT VALID;

ALTER TABLE user_goals
ADD CONSTRAINT user_goals_org_not_null CHECK (organization_id IS NOT NULL) NOT VALID;

ALTER TABLE user_plans
ADD CONSTRAINT user_plans_org_not_null CHECK (organization_id IS NOT NULL) NOT VALID;

ALTER TABLE workout_sessions
ADD CONSTRAINT workout_sessions_org_not_null CHECK (organization_id IS NOT NULL) NOT VALID;

-- Create indexes for org-based queries
CREATE INDEX IF NOT EXISTS idx_member_attendance_org ON member_attendance(organization_id);
CREATE INDEX IF NOT EXISTS idx_member_attendance_org_member ON member_attendance(organization_id, member_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_org ON user_goals(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_org_user ON user_goals(organization_id, user_id);
CREATE INDEX IF NOT EXISTS idx_user_plans_org ON user_plans(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_plans_org_user ON user_plans(organization_id, user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_org ON workout_sessions(organization_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_org_user ON workout_sessions(organization_id, user_id);

-- Add indexes to audit_logs for better query performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
