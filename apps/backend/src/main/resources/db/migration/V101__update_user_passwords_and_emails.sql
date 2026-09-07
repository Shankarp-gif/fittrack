-- V101 - Update user passwords to match new seed credentials
-- Since V99 (DATA RESET) already ran, we need to update existing user records with new password hashes

-- Password: admin123
-- BCrypt Hash: $2a$10$slYQmyNdGzin7olVN3p5be4DlH.PKZbv5H8KfzzQgXXbVxzy8qZm2

-- Update all existing users with the standardized password
UPDATE users SET password_hash = '$2a$10$slYQmyNdGzin7olVN3p5be4DlH.PKZbv5H8KfzzQgXXbVxzy8qZm2' WHERE active = true;

-- Update SuperAdmin email to match expected login
UPDATE users SET email = 'superadmin@fittrack.app' WHERE id = 1 AND full_name = 'Super Admin';

