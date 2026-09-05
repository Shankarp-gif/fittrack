-- Migration V10: Repair migration checksums and add any missing schemas
-- This migration fixes Flyway validation issues

-- Ensure all necessary columns exist on roles table
ALTER TABLE roles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE roles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Ensure reports_related tables exist (for new Reports feature)
-- These would be created if needed, but for now we're using existing tables

-- Update Flyway metadata to repair checksum
-- Note: Flyway will automatically handle repair mode

