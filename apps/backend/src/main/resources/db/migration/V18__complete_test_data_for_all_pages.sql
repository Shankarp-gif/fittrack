-- =====================================================================
-- V18__complete_test_data_for_all_pages.sql
-- =====================================================================
-- Create comprehensive test data to make all pages functional
-- Includes: Members, Memberships, Attendance, Fees, Plans
-- =====================================================================

-- =====================================================================
-- 1. ENSURE ORGANIZATION AND BRANCH EXIST
-- =====================================================================

-- Create organization if not exists
INSERT INTO organizations (name, email, phone, address, city, state, country, active, created_at, updated_at)
VALUES ('FitTrack Gym', 'info@fittrack.gym', '555-1234', '456 Fitness Ave', 'New York', 'NY', 'USA', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Create branch for organization 1
INSERT INTO branches (organization_id, name, address, city, phone, active, created_at, updated_at)
VALUES (1, 'Main Fitness Center', '456 Fitness Ave', 'New York', '555-1234', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- =====================================================================
-- 2. ASSIGN ORGANIZATION AND BRANCH TO ALL USERS
-- =====================================================================

-- Update SuperAdmin
UPDATE users
SET organization_id = 1,
    branch_id = (SELECT id FROM branches WHERE organization_id = 1 LIMIT 1),
    updated_at = NOW()
WHERE email = 'superadmin@fittrack.app'
  AND organization_id IS NULL;

-- Update Admin
UPDATE users
SET organization_id = 1,
    branch_id = (SELECT id FROM branches WHERE organization_id = 1 LIMIT 1),
    updated_at = NOW()
WHERE email = 'admin@fittrack.app'
  AND organization_id IS NULL;

-- Update Receptionist
UPDATE users
SET organization_id = 1,
    branch_id = (SELECT id FROM branches WHERE organization_id = 1 LIMIT 1),
    updated_at = NOW()
WHERE email = 'receptionist@fittrack.app'
  AND organization_id IS NULL;

-- Update Trainers
UPDATE users
SET organization_id = 1,
    branch_id = (SELECT id FROM branches WHERE organization_id = 1 LIMIT 1),
    updated_at = NOW()
WHERE email LIKE 'trainer%@fittrack.app'
  AND organization_id IS NULL;

-- Update Members (Users with USER role)
UPDATE users
SET organization_id = 1,
    branch_id = (SELECT id FROM branches WHERE organization_id = 1 LIMIT 1),
    updated_at = NOW()
WHERE role_id = (SELECT id FROM roles WHERE name = 'USER')
  AND organization_id IS NULL;

-- =====================================================================
-- 3. CREATE MEMBERSHIP PLANS
-- =====================================================================

-- Monthly Plan
INSERT INTO membership_plans (organization_id, name, description, duration_days, price, joining_fee, discount_percentage, tax_percentage, max_pt_sessions, freeze_allowance, active, created_at, updated_at)
VALUES (1, 'Monthly', 'One Month Access', 30, 50.00, 0.00, 0.00, 0.00, 0, 0, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Quarterly Plan
INSERT INTO membership_plans (organization_id, name, description, duration_days, price, joining_fee, discount_percentage, tax_percentage, max_pt_sessions, freeze_allowance, active, created_at, updated_at)
VALUES (1, 'Quarterly', 'Three Month Access', 90, 130.00, 0.00, 0.00, 0.00, 0, 0, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Annual Plan
INSERT INTO membership_plans (organization_id, name, description, duration_days, price, joining_fee, discount_percentage, tax_percentage, max_pt_sessions, freeze_allowance, active, created_at, updated_at)
VALUES (1, 'Annual', 'One Year Access', 365, 450.00, 0.00, 0.00, 0.00, 0, 0, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- =====================================================================
-- 4. CREATE TEST MEMBERS
-- =====================================================================

-- Member 1: Raj Kumar
INSERT INTO members (organization_id, branch_id, member_id_number, full_name, email, mobile, date_of_birth, gender, address, emergency_contact_name, emergency_contact_phone, status, active, created_at, updated_at)
VALUES (1, 1, 'MEM0001', 'Raj Kumar', 'raj@fittrack.app', '9876543210', '1995-03-15', 'MALE', '123 Main St, New York, NY 10001', 'Priya Kumar', '9876543211', 'ACTIVE', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Member 2: Priya Sharma
INSERT INTO members (organization_id, branch_id, member_id_number, full_name, email, mobile, date_of_birth, gender, address, emergency_contact_name, emergency_contact_phone, status, active, created_at, updated_at)
VALUES (1, 1, 'MEM0002', 'Priya Sharma', 'priya@fittrack.app', '9876543212', '1998-07-22', 'FEMALE', '456 Oak St, New York, NY 10002', 'Raj Sharma', '9876543213', 'ACTIVE', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Member 3: Amit Singh
INSERT INTO members (organization_id, branch_id, member_id_number, full_name, email, mobile, date_of_birth, gender, address, emergency_contact_name, emergency_contact_phone, status, active, created_at, updated_at)
VALUES (1, 1, 'MEM0003', 'Amit Singh', 'amit@fittrack.app', '9876543214', '1992-11-08', 'MALE', '789 Pine St, New York, NY 10003', 'Neha Singh', '9876543215', 'ACTIVE', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Member 4: Neha Verma
INSERT INTO members (organization_id, branch_id, member_id_number, full_name, email, mobile, date_of_birth, gender, address, emergency_contact_name, emergency_contact_phone, status, active, created_at, updated_at)
VALUES (1, 1, 'MEM0004', 'Neha Verma', 'neha@fittrack.app', '9876543216', '1996-05-30', 'FEMALE', '321 Elm St, New York, NY 10004', 'Amit Verma', '9876543217', 'ACTIVE', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Member 5: Rohan Patel
INSERT INTO members (organization_id, branch_id, member_id_number, full_name, email, mobile, date_of_birth, gender, address, emergency_contact_name, emergency_contact_phone, status, active, created_at, updated_at)
VALUES (1, 1, 'MEM0005', 'Rohan Patel', 'rohan@fittrack.app', '9876543218', '1994-09-12', 'MALE', '654 Maple St, New York, NY 10005', 'Sunita Patel', '9876543219', 'EXPIRING_SOON', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- =====================================================================
-- 5. CREATE MEMBERSHIPS FOR MEMBERS
-- =====================================================================

-- Raj Kumar - Annual membership
INSERT INTO memberships (member_id, membership_plan_id, start_date, end_date, status, price, total_amount, active, created_at, updated_at)
SELECT m.id, mp.id, CURRENT_DATE, CURRENT_DATE + INTERVAL '365 days', 'ACTIVE', 450.00::numeric, 450.00::numeric, true, NOW(), NOW()
FROM members m, membership_plans mp
WHERE m.email = 'raj@fittrack.app' AND mp.name = 'Annual'
AND NOT EXISTS (SELECT 1 FROM memberships WHERE member_id = m.id)
ON CONFLICT DO NOTHING;

-- Priya Sharma - Quarterly membership
INSERT INTO memberships (member_id, membership_plan_id, start_date, end_date, status, price, total_amount, active, created_at, updated_at)
SELECT m.id, mp.id, CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days', 'ACTIVE', 130.00::numeric, 130.00::numeric, true, NOW(), NOW()
FROM members m, membership_plans mp
WHERE m.email = 'priya@fittrack.app' AND mp.name = 'Quarterly'
AND NOT EXISTS (SELECT 1 FROM memberships WHERE member_id = m.id)
ON CONFLICT DO NOTHING;

-- Amit Singh - Monthly membership
INSERT INTO memberships (member_id, membership_plan_id, start_date, end_date, status, price, total_amount, active, created_at, updated_at)
SELECT m.id, mp.id, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'ACTIVE', 50.00::numeric, 50.00::numeric, true, NOW(), NOW()
FROM members m, membership_plans mp
WHERE m.email = 'amit@fittrack.app' AND mp.name = 'Monthly'
AND NOT EXISTS (SELECT 1 FROM memberships WHERE member_id = m.id)
ON CONFLICT DO NOTHING;

-- Neha Verma - Annual membership
INSERT INTO memberships (member_id, membership_plan_id, start_date, end_date, status, price, total_amount, active, created_at, updated_at)
SELECT m.id, mp.id, CURRENT_DATE, CURRENT_DATE + INTERVAL '365 days', 'ACTIVE', 450.00::numeric, 450.00::numeric, true, NOW(), NOW()
FROM members m, membership_plans mp
WHERE m.email = 'neha@fittrack.app' AND mp.name = 'Annual'
AND NOT EXISTS (SELECT 1 FROM memberships WHERE member_id = m.id)
ON CONFLICT DO NOTHING;

-- Rohan Patel - Monthly membership (EXPIRING SOON - 5 days left)
INSERT INTO memberships (member_id, membership_plan_id, start_date, end_date, status, price, total_amount, active, created_at, updated_at)
SELECT m.id, mp.id, CURRENT_DATE - INTERVAL '25 days', CURRENT_DATE + INTERVAL '5 days', 'EXPIRING_SOON', 50.00::numeric, 50.00::numeric, true, NOW(), NOW()
FROM members m, membership_plans mp
WHERE m.email = 'rohan@fittrack.app' AND mp.name = 'Monthly'
AND NOT EXISTS (SELECT 1 FROM memberships WHERE member_id = m.id)
ON CONFLICT DO NOTHING;

-- =====================================================================
-- 6. CREATE ATTENDANCE RECORDS
-- =====================================================================

-- Raj Kumar - Multiple check-ins this month
INSERT INTO member_attendance (member_id, branch_id, check_in_time, check_out_time, attendance_date, status, created_at)
SELECT m.id, 1,
        (CURRENT_DATE - INTERVAL '5 days') + INTERVAL '08:00',
        (CURRENT_DATE - INTERVAL '5 days') + INTERVAL '10:00',
        CURRENT_DATE - INTERVAL '5 days',
        'CHECKED_OUT', NOW()
FROM members m
WHERE m.email = 'raj@fittrack.app'
ON CONFLICT DO NOTHING;

INSERT INTO member_attendance (member_id, branch_id, check_in_time, check_out_time, attendance_date, status, created_at)
SELECT m.id, 1,
        (CURRENT_DATE - INTERVAL '3 days') + INTERVAL '08:30',
        (CURRENT_DATE - INTERVAL '3 days') + INTERVAL '10:30',
        CURRENT_DATE - INTERVAL '3 days',
        'CHECKED_OUT', NOW()
FROM members m
WHERE m.email = 'raj@fittrack.app'
ON CONFLICT DO NOTHING;

INSERT INTO member_attendance (member_id, branch_id, check_in_time, check_out_time, attendance_date, status, created_at)
SELECT m.id, 1,
        (CURRENT_DATE - INTERVAL '1 day') + INTERVAL '08:15',
        (CURRENT_DATE - INTERVAL '1 day') + INTERVAL '10:15',
        CURRENT_DATE - INTERVAL '1 day',
        'CHECKED_OUT', NOW()
FROM members m
WHERE m.email = 'raj@fittrack.app'
ON CONFLICT DO NOTHING;

-- Priya Sharma - Attendance records
INSERT INTO member_attendance (member_id, branch_id, check_in_time, check_out_time, attendance_date, status, created_at)
SELECT m.id, 1,
        (CURRENT_DATE - INTERVAL '4 days') + INTERVAL '07:00',
        (CURRENT_DATE - INTERVAL '4 days') + INTERVAL '08:30',
        CURRENT_DATE - INTERVAL '4 days',
        'CHECKED_OUT', NOW()
FROM members m
WHERE m.email = 'priya@fittrack.app'
ON CONFLICT DO NOTHING;

INSERT INTO member_attendance (member_id, branch_id, check_in_time, check_out_time, attendance_date, status, created_at)
SELECT m.id, 1,
        (CURRENT_DATE - INTERVAL '2 days') + INTERVAL '07:15',
        (CURRENT_DATE - INTERVAL '2 days') + INTERVAL '09:00',
        CURRENT_DATE - INTERVAL '2 days',
        'CHECKED_OUT', NOW()
FROM members m
WHERE m.email = 'priya@fittrack.app'
ON CONFLICT DO NOTHING;

-- Amit Singh - Attendance records
INSERT INTO member_attendance (member_id, branch_id, check_in_time, check_out_time, attendance_date, status, created_at)
SELECT m.id, 1,
        (CURRENT_DATE - INTERVAL '6 days') + INTERVAL '09:00',
        (CURRENT_DATE - INTERVAL '6 days') + INTERVAL '11:00',
        CURRENT_DATE - INTERVAL '6 days',
        'CHECKED_OUT', NOW()
FROM members m
WHERE m.email = 'amit@fittrack.app'
ON CONFLICT DO NOTHING;

-- Neha Verma - Attendance records
INSERT INTO member_attendance (member_id, branch_id, check_in_time, check_out_time, attendance_date, status, created_at)
SELECT m.id, 1,
        (CURRENT_DATE - INTERVAL '2 days') + INTERVAL '06:00',
        (CURRENT_DATE - INTERVAL '2 days') + INTERVAL '07:45',
        CURRENT_DATE - INTERVAL '2 days',
        'CHECKED_OUT', NOW()
FROM members m
WHERE m.email = 'neha@fittrack.app'
ON CONFLICT DO NOTHING;

-- Rohan Patel - Attendance records (Currently checked in)
INSERT INTO member_attendance (member_id, branch_id, check_in_time, attendance_date, status, created_at)
SELECT m.id, 1,
        CURRENT_TIMESTAMP,
        CURRENT_DATE,
        'CHECKED_IN', NOW()
FROM members m
WHERE m.email = 'rohan@fittrack.app'
AND NOT EXISTS (SELECT 1 FROM member_attendance WHERE member_id = m.id AND attendance_date = CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- =====================================================================
-- 7. VERIFICATION QUERIES
-- =====================================================================

-- Verify organization and branches
SELECT 'Organizations' as entity, COUNT(*) as count FROM organizations;
SELECT 'Branches' as entity, COUNT(*) as count FROM branches;

-- Verify users have organization assignments
SELECT role_id, COUNT(*) as count FROM users WHERE organization_id IS NOT NULL GROUP BY role_id;

-- Verify members created
SELECT 'Members' as entity, COUNT(*) as count FROM members;

-- Verify memberships created
SELECT 'Memberships' as entity, COUNT(*) as count FROM memberships;

-- Verify attendance records created
SELECT 'Attendance Records' as entity, COUNT(*) as count FROM member_attendance;

-- Show members list
SELECT id, member_id_number, full_name, email, status FROM members WHERE organization_id = 1 ORDER BY id;

-- Show memberships
SELECT m.full_name, mp.name as plan_name, mem.start_date, mem.end_date, mem.status
FROM memberships mem
JOIN members m ON mem.member_id = m.id
JOIN membership_plans mp ON mem.membership_plan_id = mp.id
WHERE m.organization_id = 1
ORDER BY m.full_name;






