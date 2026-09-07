-- Add supervisor_id column to users table for hierarchy management
ALTER TABLE users
ADD COLUMN supervisor_id BIGINT;

-- Add foreign key constraint for supervisor relationship
ALTER TABLE users
ADD CONSTRAINT fk_users_supervisor_id
FOREIGN KEY (supervisor_id)
REFERENCES users(id)
ON DELETE SET NULL;

-- Add supervisor_id column to member_attendance table to track which supervisor approved check-in/out
ALTER TABLE member_attendance
ADD COLUMN supervisor_id BIGINT;

-- Add foreign key constraint for supervisor in attendance
ALTER TABLE member_attendance
ADD CONSTRAINT fk_member_attendance_supervisor_id
FOREIGN KEY (supervisor_id)
REFERENCES users(id)
ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_users_supervisor_id ON users(supervisor_id);
CREATE INDEX idx_member_attendance_supervisor_id ON member_attendance(supervisor_id);
CREATE INDEX idx_member_attendance_user_supervisor ON member_attendance(user_id, supervisor_id);
CREATE INDEX idx_member_attendance_member_supervisor ON member_attendance(member_id, supervisor_id);

