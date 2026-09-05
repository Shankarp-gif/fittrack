-- Fix the roles table audit columns issue
-- This migration properly handles the schema inconsistency

-- Drop the problematic columns if they exist
ALTER TABLE roles DROP COLUMN IF EXISTS created_at;
ALTER TABLE roles DROP COLUMN IF EXISTS updated_at;

-- Add the audit columns as NULLABLE with a default timestamp
ALTER TABLE roles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE roles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Update any NULL values (shouldn't be any if we're adding with default)
UPDATE roles SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;
UPDATE roles SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL;

-- Now make them NOT NULL
ALTER TABLE roles ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE roles ALTER COLUMN updated_at SET NOT NULL;

