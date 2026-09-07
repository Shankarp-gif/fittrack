-- Enforce one attendance row per person per day.
-- Keep best row when duplicates exist: prefer checked-out rows, then latest timestamps.

WITH ranked_member_rows AS (
    SELECT
        id,
        ROW_NUMBER() OVER (
            PARTITION BY member_id, attendance_date
            ORDER BY
                CASE WHEN status = 'CHECKED_OUT' THEN 0 ELSE 1 END,
                check_out_time DESC NULLS LAST,
                check_in_time DESC NULLS LAST,
                id DESC
        ) AS rn
    FROM member_attendance
    WHERE member_id IS NOT NULL
),
ranked_staff_rows AS (
    SELECT
        id,
        ROW_NUMBER() OVER (
            PARTITION BY user_id, attendance_date
            ORDER BY
                CASE WHEN status = 'CHECKED_OUT' THEN 0 ELSE 1 END,
                check_out_time DESC NULLS LAST,
                check_in_time DESC NULLS LAST,
                id DESC
        ) AS rn
    FROM member_attendance
    WHERE member_id IS NULL AND user_id IS NOT NULL
)
DELETE FROM member_attendance
WHERE id IN (
    SELECT id FROM ranked_member_rows WHERE rn > 1
    UNION ALL
    SELECT id FROM ranked_staff_rows WHERE rn > 1
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_member_attendance_member_date
ON member_attendance (member_id, attendance_date)
WHERE member_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_member_attendance_staff_date
ON member_attendance (user_id, attendance_date)
WHERE member_id IS NULL AND user_id IS NOT NULL;

