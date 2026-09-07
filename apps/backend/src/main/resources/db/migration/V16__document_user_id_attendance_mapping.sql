-- Document User ID Mapping in Member Attendance
-- Date: 2026-09-05
-- This migration documents that user_id column is now being populated during check-in/check-out
-- user_id tracks which staff member (trainer, receptionist, admin) performed the check-in/check-out

-- Note: Existing records with NULL user_id are historical data and will remain as is
-- All new check-in/check-out operations will automatically populate user_id with the authenticated staff member

-- Verification query to see current state:
-- SELECT id, member_id, user_id, check_in_time, check_out_time, status
-- FROM member_attendance
-- WHERE user_id IS NULL;

-- After fix is deployed, new records should have user_id populated:
-- SELECT id, member_id, user_id, check_in_time, check_out_time, status
-- FROM member_attendance
-- WHERE created_at >= NOW() - INTERVAL '1 day'
-- AND user_id IS NOT NULL;

