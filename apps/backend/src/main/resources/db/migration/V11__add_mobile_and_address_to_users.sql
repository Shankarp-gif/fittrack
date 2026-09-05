-- Migration V11: Add mobile and address fields to users table for user registration

ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS address VARCHAR(255);

