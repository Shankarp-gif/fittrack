-- Migration V12: Add user_id column to member_attendance for staff attendance tracking

ALTER TABLE member_attendance ADD COLUMN user_id BIGINT;

-- Add foreign key constraint for user_id
ALTER TABLE member_attendance
ADD CONSTRAINT fk_member_attendance_user
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Make member_id nullable since attendance can be for either member or user (staff)
ALTER TABLE member_attendance ALTER COLUMN member_id DROP NOT NULL;

-- Create index for faster lookups by user_id and date
CREATE INDEX idx_member_attendance_user_date ON member_attendance(user_id, attendance_date);

