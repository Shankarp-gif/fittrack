-- V107__add_member_records_for_test_users.sql
-- Create member records for test users with USER role
-- These users need member records to be able to check in/out

-- Member 1: David Member (david.member@fittrack.app)
INSERT INTO members (organization_id, branch_id, member_id_number, full_name, email, mobile, date_of_birth, gender, address, emergency_contact_name, emergency_contact_phone, status, active, created_at, updated_at)
VALUES (1, 1, 'MEM0006', 'David Member', 'david.member@fittrack.app', '9876543214', '1993-06-18', 'MALE', '987 David Lane, Mumbai', 'Sarah Member', '9876543220', 'ACTIVE', true, NOW(), NOW())
ON CONFLICT (organization_id, member_id_number) DO NOTHING;

-- Member 2: Emma Member (emma.member@fittrack.app)
INSERT INTO members (organization_id, branch_id, member_id_number, full_name, email, mobile, date_of_birth, gender, address, emergency_contact_name, emergency_contact_phone, status, active, created_at, updated_at)
VALUES (1, 1, 'MEM0007', 'Emma Member', 'emma.member@fittrack.app', '9876543215', '1997-10-25', 'FEMALE', '555 Emma Street, Mumbai', 'John Member', '9876543221', 'ACTIVE', true, NOW(), NOW())
ON CONFLICT (organization_id, member_id_number) DO NOTHING;

-- Member 3: Frank Member (frank.member@fittrack.app)
INSERT INTO members (organization_id, branch_id, member_id_number, full_name, email, mobile, date_of_birth, gender, address, emergency_contact_name, emergency_contact_phone, status, active, created_at, updated_at)
VALUES (1, 1, 'MEM0008', 'Frank Member', 'frank.member@fittrack.app', '9876543216', '1991-02-14', 'MALE', '666 Frank Avenue, Mumbai', 'Emma Member', '9876543222', 'ACTIVE', true, NOW(), NOW())
ON CONFLICT (organization_id, member_id_number) DO NOTHING;

-- Create memberships for the new members (Monthly plan for all)
-- David Member - Monthly membership
INSERT INTO memberships (member_id, membership_plan_id, start_date, end_date, status, price, total_amount, active, created_at, updated_at)
SELECT m.id, mp.id, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'ACTIVE', 50.00::numeric, 50.00::numeric, true, NOW(), NOW()
FROM members m, membership_plans mp
WHERE m.email = 'david.member@fittrack.app' AND mp.name = 'Monthly'
AND NOT EXISTS (SELECT 1 FROM memberships WHERE member_id = m.id)
ON CONFLICT DO NOTHING;

-- Emma Member - Monthly membership
INSERT INTO memberships (member_id, membership_plan_id, start_date, end_date, status, price, total_amount, active, created_at, updated_at)
SELECT m.id, mp.id, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'ACTIVE', 50.00::numeric, 50.00::numeric, true, NOW(), NOW()
FROM members m, membership_plans mp
WHERE m.email = 'emma.member@fittrack.app' AND mp.name = 'Monthly'
AND NOT EXISTS (SELECT 1 FROM memberships WHERE member_id = m.id)
ON CONFLICT DO NOTHING;

-- Frank Member - Monthly membership
INSERT INTO memberships (member_id, membership_plan_id, start_date, end_date, status, price, total_amount, active, created_at, updated_at)
SELECT m.id, mp.id, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'ACTIVE', 50.00::numeric, 50.00::numeric, true, NOW(), NOW()
FROM members m, membership_plans mp
WHERE m.email = 'frank.member@fittrack.app' AND mp.name = 'Monthly'
AND NOT EXISTS (SELECT 1 FROM memberships WHERE member_id = m.id)
ON CONFLICT DO NOTHING;

-- Verification: Show all members
SELECT 'Members after fix' as info, COUNT(*) as total_members FROM members WHERE organization_id = 1;
SELECT id, member_id_number, full_name, email, status FROM members WHERE organization_id = 1 ORDER BY id;

