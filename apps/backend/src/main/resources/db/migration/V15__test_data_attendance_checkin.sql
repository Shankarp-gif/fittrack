-- ============================================
-- COMPLETE TEST DATA FOR ATTENDANCE CHECK-IN
-- ============================================
-- This script creates all required data for testing
-- Includes: Organizations, Branches, Users (with organizations), Members, Memberships
-- Date: 2026-09-05
-- PostgreSQL Version - Simplified for test data
-- ============================================

-- 1. CREATE ORGANIZATION
INSERT INTO organizations (name, email, phone, address, city, state, country, active, created_at, updated_at)
VALUES ('TestGym Pro', 'testgym@example.com', '555-9999', '123 Test St', 'Test City', 'TC', 'USA', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 2. CREATE BRANCHES using CTE to get org_id
WITH org AS (SELECT id FROM organizations WHERE name = 'TestGym Pro' LIMIT 1)
INSERT INTO branches (organization_id, name, address, city, phone, active, created_at, updated_at)
SELECT org.id, name, address, city, phone, active, created_at, updated_at
FROM org, (VALUES
  ('Main Branch', '123 Test St', 'Test City', '555-9991', true, NOW(), NOW()),
  ('Downtown Branch', '456 Test Ave', 'Test City', '555-9992', true, NOW(), NOW())
) AS v(name, address, city, phone, active, created_at, updated_at)
ON CONFLICT DO NOTHING;

-- 3. CREATE ROLES (if they don't exist)
INSERT INTO roles (name, created_at, updated_at)
VALUES
  ('SUPER_ADMIN', NOW(), NOW()),
  ('ADMIN', NOW(), NOW()),
  ('TRAINER', NOW(), NOW()),
  ('RECEPTIONIST', NOW(), NOW()),
  ('USER', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 4. CREATE USERS (Staff with organization)
WITH org AS (SELECT id FROM organizations WHERE name = 'TestGym Pro' LIMIT 1),
     branch AS (SELECT id FROM branches WHERE organization_id = (SELECT id FROM org) LIMIT 1),
     role_admin AS (SELECT id FROM roles WHERE name = 'ADMIN' LIMIT 1),
     role_trainer AS (SELECT id FROM roles WHERE name = 'TRAINER' LIMIT 1),
     role_user AS (SELECT id FROM roles WHERE name = 'USER' LIMIT 1)
INSERT INTO users (email, password_hash, full_name, mobile, address, active, organization_id, branch_id, role_id, created_at, updated_at)
VALUES
  ('admin@testgym.com', '$2a$10$PpB2AxqVG3.yN6cJhFr/KedfXeqEuHqYblq1uVKlJ9iVx.s/CaLhy', 'Admin TestGym', '555-0001', '123 Admin St', true, (SELECT id FROM org), (SELECT id FROM branch), (SELECT id FROM role_admin), NOW(), NOW()),
  ('trainer@testgym.com', '$2a$10$PpB2AxqVG3.yN6cJhFr/KedfXeqEuHqYblq1uVKlJ9iVx.s/CaLhy', 'Trainer TestGym', '555-0002', '456 Trainer Ave', true, (SELECT id FROM org), (SELECT id FROM branch), (SELECT id FROM role_trainer), NOW(), NOW()),
  ('member@testgym.com', '$2a$10$PpB2AxqVG3.yN6cJhFr/KedfXeqEuHqYblq1uVKlJ9iVx.s/CaLhy', 'Member TestGym', '555-0003', '789 Member Rd', true, (SELECT id FROM org), (SELECT id FROM branch), (SELECT id FROM role_user), NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 5. CREATE MEMBERSHIP PLANS
WITH org AS (SELECT id FROM organizations WHERE name = 'TestGym Pro' LIMIT 1)
INSERT INTO membership_plans (organization_id, name, description, duration_days, price, joining_fee, discount_percentage, tax_percentage, max_pt_sessions, freeze_allowance, active, created_at, updated_at)
SELECT org.id, name, description, duration_days, price, joining_fee, discount_percentage, tax_percentage, max_pt_sessions, freeze_allowance, active, created_at, updated_at
FROM org, (VALUES
  ('Basic Plan', 'Basic monthly membership', 30, 50.00::numeric, 0.00::numeric, 0.00::numeric, 5.00::numeric, 0, 0, true, NOW(), NOW()),
  ('Premium Plan', 'Premium membership with PT', 30, 100.00::numeric, 10.00::numeric, 10.00::numeric, 5.00::numeric, 8, 2, true, NOW(), NOW()),
  ('Annual Plan', 'Annual membership', 365, 500.00::numeric, 50.00::numeric, 15.00::numeric, 5.00::numeric, 20, 4, true, NOW(), NOW())
) AS v(name, description, duration_days, price, joining_fee, discount_percentage, tax_percentage, max_pt_sessions, freeze_allowance, active, created_at, updated_at)
ON CONFLICT DO NOTHING;

-- 6. CREATE MEMBERS
WITH org AS (SELECT id FROM organizations WHERE name = 'TestGym Pro' LIMIT 1),
     branch AS (SELECT id FROM branches WHERE organization_id = (SELECT id FROM org) LIMIT 1)
INSERT INTO members (organization_id, branch_id, member_id_number, full_name, email, mobile, date_of_birth, gender, address, emergency_contact_name, emergency_contact_phone, active, created_at, updated_at)
SELECT org.id, branch.id, member_id_number, full_name, email, mobile, date_of_birth, gender, address, emergency_contact_name, emergency_contact_phone, active, created_at, updated_at
FROM org, branch, (VALUES
   ('MEM101', 'John Doe', 'john@example.com', '555-1001', '1990-01-15'::date, 'M', '100 Main St', 'Jane Doe', '555-1000', true, NOW(), NOW()),
   ('MEM102', 'Jane Smith', 'jane@example.com', '555-1002', '1992-05-20'::date, 'F', '200 Oak Ave', 'John Smith', '555-1003', true, NOW(), NOW()),
   ('MEM103', 'Mike Johnson', 'mike@example.com', '555-1004', '1988-03-10'::date, 'M', '300 Pine Rd', 'Sarah Johnson', '555-1005', true, NOW(), NOW()),
   ('MEM104', 'Sarah Lee', 'sarah@example.com', '555-1006', '1995-07-25'::date, 'F', '400 Elm St', 'Tom Lee', '555-1007', true, NOW(), NOW()),
   ('MEM105', 'Tom Wilson', 'tom@example.com', '555-1008', '1991-11-30'::date, 'M', '500 Maple Ln', 'Lisa Wilson', '555-1009', true, NOW(), NOW())
) AS v(member_id_number, full_name, email, mobile, date_of_birth, gender, address, emergency_contact_name, emergency_contact_phone, active, created_at, updated_at)
ON CONFLICT DO NOTHING;

-- 7. CREATE MEMBERSHIPS (Active memberships for all members)
WITH org AS (SELECT id FROM organizations WHERE name = 'TestGym Pro' LIMIT 1),
     plan AS (SELECT id FROM membership_plans WHERE organization_id = (SELECT id FROM org) AND name = 'Basic Plan' LIMIT 1),
     members_list AS (
       SELECT id FROM members WHERE email IN ('john@example.com', 'jane@example.com', 'mike@example.com', 'sarah@example.com', 'tom@example.com')
     )
INSERT INTO memberships (member_id, membership_plan_id, start_date, end_date, status, price, total_amount, active, created_at, updated_at)
SELECT m.id, plan.id, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'ACTIVE', 50.00::numeric, 50.00::numeric, true, NOW(), NOW()
FROM org, plan, members_list m
ON CONFLICT DO NOTHING;

-- 8. CREATE ATTENDANCE RECORDS (Historical data)
WITH org AS (SELECT id FROM organizations WHERE name = 'TestGym Pro' LIMIT 1),
     branch AS (SELECT id FROM branches WHERE organization_id = (SELECT id FROM org) LIMIT 1),
     member_1 AS (SELECT id FROM members WHERE email = 'john@example.com' LIMIT 1),
     member_2 AS (SELECT id FROM members WHERE email = 'jane@example.com' LIMIT 1),
     member_3 AS (SELECT id FROM members WHERE email = 'mike@example.com' LIMIT 1)
INSERT INTO member_attendance (member_id, branch_id, check_in_time, check_out_time, attendance_date, status, created_at)
SELECT member_id, branch.id, check_in_time, check_out_time, attendance_date, status, created_at
FROM branch, (VALUES
  ((SELECT id FROM member_1), NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '1 hour 30 minutes', CURRENT_DATE - INTERVAL '5 days', 'CHECKED_OUT', NOW() - INTERVAL '5 days'),
  ((SELECT id FROM member_1), NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '1 hour 45 minutes', CURRENT_DATE - INTERVAL '3 days', 'CHECKED_OUT', NOW() - INTERVAL '3 days'),
  ((SELECT id FROM member_2), NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days' + INTERVAL '2 hours', CURRENT_DATE - INTERVAL '4 days', 'CHECKED_OUT', NOW() - INTERVAL '4 days'),
  ((SELECT id FROM member_2), NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '1 hour 30 minutes', CURRENT_DATE - INTERVAL '2 days', 'CHECKED_OUT', NOW() - INTERVAL '2 days'),
  ((SELECT id FROM member_3), NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days' + INTERVAL '2 hours 10 minutes', CURRENT_DATE - INTERVAL '4 days', 'CHECKED_OUT', NOW() - INTERVAL '4 days')
) AS v(member_id, check_in_time, check_out_time, attendance_date, status, created_at)
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION AND SUMMARY
-- ============================================
-- Verify data has been successfully created
SELECT '✅ Test Data Setup Complete' AS STATUS, NOW() AS timestamp;


