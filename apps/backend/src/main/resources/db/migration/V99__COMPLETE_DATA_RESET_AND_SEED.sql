-- V99__COMPLETE_DATA_RESET_AND_SEED.sql
-- COMPREHENSIVE DATA RESET AND RECREATION
-- Clears old data and repopulates with complete test data

-- ============================================
-- PART 1: CLEAR EXISTING DATA
-- ============================================

DELETE FROM lead_followups;
DELETE FROM leads;
DELETE FROM refunds;
DELETE FROM payments;
DELETE FROM member_attendance;
DELETE FROM workout_sessions;
DELETE FROM user_goals;
DELETE FROM user_plans;
DELETE FROM memberships;
DELETE FROM members;
DELETE FROM membership_plans;
DELETE FROM refresh_tokens;
DELETE FROM user_settings;
DELETE FROM user_profiles;
DELETE FROM audit_logs;
DELETE FROM notifications;
DELETE FROM role_permissions;
DELETE FROM permissions;
DELETE FROM users;
DELETE FROM branches;
DELETE FROM organizations;
DELETE FROM roles;
DELETE FROM exercises;

-- ============================================
-- PART 2: CREATE ROLES
-- ============================================

INSERT INTO roles(id, name, created_at, updated_at) VALUES
(1, 'SUPER_ADMIN', NOW(), NOW()),
(2, 'ADMIN', NOW(), NOW()),
(3, 'TRAINER', NOW(), NOW()),
(4, 'RECEPTIONIST', NOW(), NOW()),
(5, 'USER', NOW(), NOW());

-- ============================================
-- PART 3: CREATE ORGANIZATIONS (FIRST!)
-- ============================================

INSERT INTO organizations(id, name, email, phone, address, city, state, country, postal_code, tax_id, logo_url, active, owner_user_id, created_at, updated_at)
VALUES (1, 'Ultra Gym', 'admin@ultragym.com', '+1234567890', '123 Fitness St', 'Mumbai', 'Maharashtra', 'India', '400001', 'TAX123', NULL, TRUE, NULL, NOW(), NOW());

INSERT INTO organizations(id, name, email, phone, address, city, state, country, postal_code, tax_id, logo_url, active, owner_user_id, created_at, updated_at)
VALUES (2, 'TestGym Pro', 'contact@testgym.com', '+1-555-0001', '456 Gym Ave', 'New York', 'NY', 'USA', '10001', 'TAX456', NULL, TRUE, NULL, NOW(), NOW());

INSERT INTO organizations(id, name, email, phone, address, city, state, country, postal_code, tax_id, logo_url, active, owner_user_id, created_at, updated_at)
VALUES (3, 'FitTrack Gym', 'info@fittrack.com', '+1-555-0002', '789 Health Blvd', 'Los Angeles', 'CA', 'USA', '90001', 'TAX789', NULL, TRUE, NULL, NOW(), NOW());

-- ============================================
-- PART 4: CREATE BRANCHES (AFTER ORGANIZATIONS!)
-- ============================================

INSERT INTO branches(id, organization_id, name, address, city, phone, email, latitude, longitude, active, created_at, updated_at)
VALUES (1, 1, 'Main Branch', '123 Fitness St', 'Mumbai', '+1234567890', 'main@ultragym.com', 19.0760, 72.8777, TRUE, NOW(), NOW());

INSERT INTO branches(id, organization_id, name, address, city, phone, email, latitude, longitude, active, created_at, updated_at)
VALUES (2, 1, 'Downtown Branch', '456 Business Park', 'Mumbai', '+1234567891', 'downtown@ultragym.com', 18.9220, 72.8347, TRUE, NOW(), NOW());

INSERT INTO branches(id, organization_id, name, address, city, phone, email, latitude, longitude, active, created_at, updated_at)
VALUES (3, 2, 'Main NYC', '456 Gym Ave', 'New York', '+1-555-0001', 'main@testgym.com', 40.7128, -74.0060, TRUE, NOW(), NOW());

INSERT INTO branches(id, organization_id, name, address, city, phone, email, latitude, longitude, active, created_at, updated_at)
VALUES (4, 3, 'LA Branch', '789 Health Blvd', 'Los Angeles', '+1-555-0002', 'main@fittrack.com', 34.0522, -118.2437, TRUE, NOW(), NOW());

-- ============================================
-- PART 5: CREATE SUPER ADMIN USER
-- ============================================

-- Password: admin123 (BCrypt: $2a$10$slYQmyNdGzin7olVN3p5be4DlH.PKZbv5H8KfzzQgXXbVxzy8qZm2)
INSERT INTO users(id, full_name, email, password_hash, active, role_id, organization_id, branch_id, created_at, updated_at) VALUES
(1, 'Super Admin', 'superadmin@fittrack.app', '$2a$10$slYQmyNdGzin7olVN3p5be4DlH.PKZbv5H8KfzzQgXXbVxzy8qZm2', TRUE, 1, NULL, NULL, NOW(), NOW());

-- ============================================
-- PART 6: CREATE ORGANIZATION ADMINS, STAFF
-- ============================================

-- Org 1 (Ultra Gym) Staff
-- Password: admin123 (same for all users)
INSERT INTO users(id, full_name, email, password_hash, active, role_id, organization_id, branch_id, created_at, updated_at) VALUES
(2, 'Rajesh Admin', 'rajesh@ultragym.com', '$2a$10$slYQmyNdGzin7olVN3p5be4DlH.PKZbv5H8KfzzQgXXbVxzy8qZm2', TRUE, 2, 1, 1, NOW(), NOW()),
(3, 'Priya Trainer', 'priya.trainer@ultragym.com', '$2a$10$slYQmyNdGzin7olVN3p5be4DlH.PKZbv5H8KfzzQgXXbVxzy8qZm2', TRUE, 3, 1, 1, NOW(), NOW()),
(4, 'Amit Trainer', 'amit.trainer@ultragym.com', '$2a$10$slYQmyNdGzin7olVN3p5be4DlH.PKZbv5H8KfzzQgXXbVxzy8qZm2', TRUE, 3, 1, 1, NOW(), NOW()),
(5, 'Neha Receptionist', 'neha.receptionist@ultragym.com', '$2a$10$slYQmyNdGzin7olVN3p5be4DlH.PKZbv5H8KfzzQgXXbVxzy8qZm2', TRUE, 4, 1, 1, NOW(), NOW()),
(6, 'Vikram Receptionist', 'vikram.receptionist@ultragym.com', '$2a$10$slYQmyNdGzin7olVN3p5be4DlH.PKZbv5H8KfzzQgXXbVxzy8qZm2', TRUE, 4, 1, 2, NOW(), NOW());

-- Org 2 (TestGym Pro) Staff
INSERT INTO users(id, full_name, email, password_hash, active, role_id, organization_id, branch_id, created_at, updated_at) VALUES
(7, 'John Admin', 'john@testgym.com', '$2a$10$slYQmyNdGzin7olVN3p5be4DlH.PKZbv5H8KfzzQgXXbVxzy8qZm2', TRUE, 2, 2, 3, NOW(), NOW()),
(8, 'Sarah Trainer', 'sarah.trainer@testgym.com', '$2a$10$slYQmyNdGzin7olVN3p5be4DlH.PKZbv5H8KfzzQgXXbVxzy8qZm2', TRUE, 3, 2, 3, NOW(), NOW()),
(9, 'Mike Receptionist', 'mike.receptionist@testgym.com', '$2a$10$slYQmyNdGzin7olVN3p5be4DlH.PKZbv5H8KfzzQgXXbVxzy8qZm2', TRUE, 4, 2, 3, NOW(), NOW());

-- Org 3 (FitTrack Gym) Staff
INSERT INTO users(id, full_name, email, password_hash, active, role_id, organization_id, branch_id, created_at, updated_at) VALUES
(10, 'Alex Admin', 'alex@fittrack.com', '$2a$10$slYQmyNdGzin7olVN3p5be4DlH.PKZbv5H8KfzzQgXXbVxzy8qZm2', TRUE, 2, 3, 4, NOW(), NOW()),
(11, 'Emma Trainer', 'emma.trainer@fittrack.com', '$2a$10$slYQmyNdGzin7olVN3p5be4DlH.PKZbv5H8KfzzQgXXbVxzy8qZm2', TRUE, 3, 3, 4, NOW(), NOW()),
(12, 'David Receptionist', 'david.receptionist@fittrack.com', '$2a$10$slYQmyNdGzin7olVN3p5be4DlH.PKZbv5H8KfzzQgXXbVxzy8qZm2', TRUE, 4, 3, 4, NOW(), NOW());

-- ============================================
-- PART 7: CREATE MEMBERSHIP PLANS
-- ============================================

-- Ultra Gym Plans
INSERT INTO membership_plans(id, organization_id, name, description, duration_days, price, joining_fee, discount_percentage, tax_percentage, max_pt_sessions, freeze_allowance, active, created_at, updated_at) VALUES
(1, 1, 'Basic Monthly', 'Perfect for beginners - includes gym access', 30, 2999.00, 500.00, 0.00, 18.00, 0, 1, TRUE, NOW(), NOW()),
(2, 1, 'Premium Quarterly', 'Popular 3-month plan with 4 trainer sessions', 90, 7999.00, 1000.00, 5.00, 18.00, 4, 2, TRUE, NOW(), NOW()),
(3, 1, 'Elite Annual', 'Best value - full year access with all benefits', 365, 29999.00, 2000.00, 10.00, 18.00, 12, 4, TRUE, NOW(), NOW()),
(4, 1, 'Personal Training 10 Sessions', 'One-on-one training sessions pack', 60, 15000.00, 1500.00, 0.00, 18.00, 10, 0, TRUE, NOW(), NOW()),
(5, 1, 'Group Classes Unlimited', 'Unlimited group classes for one month', 30, 4999.00, 0.00, 0.00, 18.00, 0, 1, TRUE, NOW(), NOW());

-- TestGym Pro Plans
INSERT INTO membership_plans(id, organization_id, name, description, duration_days, price, joining_fee, discount_percentage, tax_percentage, max_pt_sessions, freeze_allowance, active, created_at, updated_at) VALUES
(6, 2, 'Starter Plan', 'Basic membership for fitness beginners', 30, 2499.00, 299.00, 0.00, 18.00, 0, 1, TRUE, NOW(), NOW()),
(7, 2, 'Professional Plan', 'Complete fitness journey for 3 months', 90, 6999.00, 799.00, 3.00, 18.00, 6, 2, TRUE, NOW(), NOW()),
(8, 2, 'Annual Pro', 'Professional annual membership', 365, 24999.00, 1999.00, 8.00, 18.00, 16, 3, TRUE, NOW(), NOW());

-- FitTrack Gym Plans
INSERT INTO membership_plans(id, organization_id, name, description, duration_days, price, joining_fee, discount_percentage, tax_percentage, max_pt_sessions, freeze_allowance, active, created_at, updated_at) VALUES
(9, 3, 'Beginner Monthly', 'Perfect for new members at FitTrack', 30, 3499.00, 500.00, 0.00, 18.00, 2, 1, TRUE, NOW(), NOW()),
(10, 3, 'Advanced Quarterly', 'Advanced members quarterly package', 90, 9999.00, 1299.00, 5.00, 18.00, 8, 2, TRUE, NOW(), NOW()),
(11, 3, 'Elite Yearly', 'Elite members annual program', 365, 32999.00, 2500.00, 12.00, 18.00, 16, 5, TRUE, NOW(), NOW());

-- ============================================
-- PART 8: CREATE MEMBERS WITH MEMBER IDs
-- ============================================

-- Ultra Gym Members
INSERT INTO members(id, organization_id, branch_id, member_id_number, full_name, email, mobile, date_of_birth, gender, address, emergency_contact_name, emergency_contact_phone, status, notes, photo_url, active, created_at, updated_at) VALUES
(1, 1, 1, 'UG-MEM-001', 'Rajesh Kumar', 'rajesh.kumar@email.com', '9876543210', '1990-05-15', 'Male', '123 Main St, Mumbai', 'Priya Kumar', '9876543215', 'ACTIVE', 'Regular member', NULL, TRUE, NOW(), NOW()),
(2, 1, 1, 'UG-MEM-002', 'Priya Sharma', 'priya.sharma@email.com', '9876543211', '1992-08-20', 'Female', '456 Park Ave, Mumbai', 'Sharma Family', '9876543216', 'ACTIVE', 'Dedicated to fitness', NULL, TRUE, NOW(), NOW()),
(3, 1, 1, 'UG-MEM-003', 'Amit Patel', 'amit.patel@email.com', '9876543212', '1988-03-10', 'Male', '789 Oak Rd, Mumbai', 'Ramesh Patel', '9876543217', 'ACTIVE', 'Strength training focus', NULL, TRUE, NOW(), NOW()),
(4, 1, 1, 'UG-MEM-004', 'Neha Verma', 'neha.verma@email.com', '9876543213', '1995-12-25', 'Female', '321 Elm St, Mumbai', 'Vikram Verma', '9876543218', 'EXPIRING_SOON', 'Membership expires in 5 days', NULL, TRUE, NOW(), NOW()),
(5, 1, 2, 'UG-MEM-005', 'Karan Singh', 'karan.singh@email.com', '9876543214', '1991-07-18', 'Male', '654 Pine Ln, Mumbai', 'Suresh Singh', '9876543219', 'ACTIVE', 'Marathon runner', NULL, TRUE, NOW(), NOW()),
(6, 1, 2, 'UG-MEM-006', 'Anjali Desai', 'anjali.desai@email.com', '9876543220', '1993-02-14', 'Female', '987 Cedar Ln, Mumbai', 'Ravi Desai', '9876543221', 'ACTIVE', 'Yoga enthusiast', NULL, TRUE, NOW(), NOW()),
(7, 1, 1, 'UG-MEM-007', 'Vikram Nair', 'vikram.nair@email.com', '9876543222', '1989-09-30', 'Male', '147 Maple Ave, Mumbai', 'Naveen Nair', '9876543223', 'EXPIRED', 'Membership expired', NULL, TRUE, NOW(), NOW());

-- TestGym Pro Members
INSERT INTO members(id, organization_id, branch_id, member_id_number, full_name, email, mobile, date_of_birth, gender, address, emergency_contact_name, emergency_contact_phone, status, notes, photo_url, active, created_at, updated_at) VALUES
(8, 2, 3, 'TG-MEM-001', 'John Smith', 'john.smith@email.com', '5551234567', '1985-06-30', 'Male', '100 Main St, New York', 'Mary Smith', '5551234570', 'ACTIVE', 'Consistent workout routine', NULL, TRUE, NOW(), NOW()),
(9, 2, 3, 'TG-MEM-002', 'Sarah Johnson', 'sarah.johnson@email.com', '5551234568', '1990-11-14', 'Female', '200 Oak Ave, New York', 'Michael Johnson', '5551234571', 'ACTIVE', 'Crossfit member', NULL, TRUE, NOW(), NOW()),
(10, 2, 3, 'TG-MEM-003', 'Mike Wilson', 'mike.wilson@email.com', '5551234569', '1987-02-28', 'Male', '300 Elm Rd, New York', 'Robert Wilson', '5551234572', 'ACTIVE', 'Bodybuilding focus', NULL, TRUE, NOW(), NOW()),
(11, 2, 3, 'TG-MEM-004', 'Emily Brown', 'emily.brown@email.com', '5551234570', '1994-04-18', 'Female', '400 Birch St, New York', 'David Brown', '5551234573', 'PENDING_PAYMENT', 'Awaiting first payment', NULL, TRUE, NOW(), NOW());

-- FitTrack Gym Members
INSERT INTO members(id, organization_id, branch_id, member_id_number, full_name, email, mobile, date_of_birth, gender, address, emergency_contact_name, emergency_contact_phone, status, notes, photo_url, active, created_at, updated_at) VALUES
(12, 3, 4, 'FT-MEM-001', 'Alex Rodriguez', 'alex.rodriguez@email.com', '5559876543', '1993-09-12', 'Male', '500 Broadway, Los Angeles', 'Carlos Rodriguez', '5559876548', 'ACTIVE', 'Personal training client', NULL, TRUE, NOW(), NOW()),
(13, 3, 4, 'FT-MEM-002', 'Emma Wilson', 'emma.wilson@email.com', '5559876544', '1996-04-05', 'Female', '600 Park Ave, Los Angeles', 'James Wilson', '5559876549', 'ACTIVE', 'Weight loss program', NULL, TRUE, NOW(), NOW()),
(14, 3, 4, 'FT-MEM-003', 'David Lee', 'david.lee@email.com', '5559876545', '1989-10-22', 'Male', '700 Madison Ave, Los Angeles', 'Peter Lee', '5559876550', 'ACTIVE', 'Strength training', NULL, TRUE, NOW(), NOW()),
(15, 3, 4, 'FT-MEM-004', 'Jessica Martinez', 'jessica.martinez@email.com', '5559876546', '1991-01-08', 'Female', '800 Atlantic Ave, Los Angeles', 'Antonio Martinez', '5559876551', 'ACTIVE', 'Yoga and pilates', NULL, TRUE, NOW(), NOW()),
(16, 3, 4, 'FT-MEM-005', 'Christopher Davis', 'christopher.davis@email.com', '5559876547', '1988-07-19', 'Male', '900 Pacific Ave, Los Angeles', 'Walter Davis', '5559876552', 'EXPIRING_SOON', 'Renew membership soon', NULL, TRUE, NOW(), NOW());

-- ============================================
-- PART 9: CREATE MEMBERSHIPS
-- ============================================

-- Ultra Gym Memberships
INSERT INTO memberships(member_id, membership_plan_id, start_date, end_date, status, price, discount_amount, tax_amount, total_amount, frozen_until, freeze_count, renewed_from_id, active, created_at, updated_at) VALUES
(1, 1, CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '20 days', 'ACTIVE', 2999.00, 0.00, 539.82, 3538.82, NULL, 0, NULL, TRUE, NOW(), NOW()),
(2, 2, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '85 days', 'ACTIVE', 7999.00, 399.95, 1439.82, 9038.87, NULL, 0, NULL, TRUE, NOW(), NOW()),
(3, 1, CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '15 days', 'ACTIVE', 2999.00, 0.00, 539.82, 3538.82, NULL, 0, NULL, TRUE, NOW(), NOW()),
(4, 3, CURRENT_DATE - INTERVAL '100 days', CURRENT_DATE + INTERVAL '265 days', 'ACTIVE', 29999.00, 2999.90, 5399.82, 33399.72, NULL, 0, NULL, TRUE, NOW(), NOW()),
(5, 2, CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE + INTERVAL '70 days', 'ACTIVE', 7999.00, 399.95, 1439.82, 9038.87, NULL, 0, NULL, TRUE, NOW(), NOW()),
(6, 5, CURRENT_DATE - INTERVAL '8 days', CURRENT_DATE + INTERVAL '22 days', 'ACTIVE', 4999.00, 0.00, 899.82, 5898.82, NULL, 0, NULL, TRUE, NOW(), NOW()),
(7, 1, CURRENT_DATE - INTERVAL '45 days', CURRENT_DATE - INTERVAL '15 days', 'EXPIRED', 2999.00, 0.00, 539.82, 3538.82, NULL, 0, NULL, TRUE, NOW(), NOW());

-- TestGym Pro Memberships
INSERT INTO memberships(member_id, membership_plan_id, start_date, end_date, status, price, discount_amount, tax_amount, total_amount, frozen_until, freeze_count, renewed_from_id, active, created_at, updated_at) VALUES
(8, 6, CURRENT_DATE - INTERVAL '12 days', CURRENT_DATE + INTERVAL '18 days', 'ACTIVE', 2499.00, 0.00, 449.82, 2948.82, NULL, 0, NULL, TRUE, NOW(), NOW()),
(9, 7, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '60 days', 'ACTIVE', 6999.00, 209.97, 1259.82, 8048.85, NULL, 0, NULL, TRUE, NOW(), NOW()),
(10, 6, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '25 days', 'ACTIVE', 2499.00, 0.00, 449.82, 2948.82, NULL, 0, NULL, TRUE, NOW(), NOW()),
(11, 6, CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '28 days', 'PENDING_PAYMENT', 2499.00, 0.00, 449.82, 2948.82, NULL, 0, NULL, TRUE, NOW(), NOW());

-- FitTrack Gym Memberships
INSERT INTO memberships(member_id, membership_plan_id, start_date, end_date, status, price, discount_amount, tax_amount, total_amount, frozen_until, freeze_count, renewed_from_id, active, created_at, updated_at) VALUES
(12, 10, CURRENT_DATE - INTERVAL '25 days', CURRENT_DATE + INTERVAL '65 days', 'ACTIVE', 9999.00, 499.95, 1799.82, 11299.87, NULL, 0, NULL, TRUE, NOW(), NOW()),
(13, 9, CURRENT_DATE - INTERVAL '8 days', CURRENT_DATE + INTERVAL '22 days', 'ACTIVE', 3499.00, 0.00, 629.82, 4128.82, NULL, 0, NULL, TRUE, NOW(), NOW()),
(14, 10, CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE + INTERVAL '70 days', 'ACTIVE', 9999.00, 499.95, 1799.82, 11299.87, NULL, 0, NULL, TRUE, NOW(), NOW()),
(15, 9, CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '15 days', 'ACTIVE', 3499.00, 0.00, 629.82, 4128.82, NULL, 0, NULL, TRUE, NOW(), NOW()),
(16, 11, CURRENT_DATE - INTERVAL '100 days', CURRENT_DATE + INTERVAL '265 days', 'ACTIVE', 32999.00, 3959.88, 5939.82, 35979.70, NULL, 0, NULL, TRUE, NOW(), NOW());

-- ============================================
-- PART 10: CREATE ATTENDANCE RECORDS
-- ============================================

-- Ultra Gym Attendance
INSERT INTO member_attendance(member_id, branch_id, check_in_time, check_out_time, attendance_date, status, created_at, user_id, supervisor_id, organization_id) VALUES
(1, 1, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '2 hours', CURRENT_DATE, 'CHECKED_OUT', NOW(), 2, NULL, 1),
(2, 1, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '1 hour', CURRENT_DATE, 'CHECKED_OUT', NOW(), 2, NULL, 1),
(3, 1, NOW() - INTERVAL '2 hours', NULL, CURRENT_DATE, 'CHECKED_IN', NOW(), 2, NULL, 1),
(4, 1, NOW() - INTERVAL '1 day' - INTERVAL '5 hours', NOW() - INTERVAL '1 day' - INTERVAL '3 hours', CURRENT_DATE - INTERVAL '1 day', 'CHECKED_OUT', NOW() - INTERVAL '1 day', 2, NULL, 1),
(5, 2, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour', CURRENT_DATE, 'CHECKED_OUT', NOW(), 5, NULL, 1),
(6, 2, NOW() - INTERVAL '3 hours', NULL, CURRENT_DATE, 'CHECKED_IN', NOW(), 5, NULL, 1),
(1, 1, NOW() - INTERVAL '2 days' - INTERVAL '4 hours', NOW() - INTERVAL '2 days' - INTERVAL '2 hours', CURRENT_DATE - INTERVAL '2 days', 'CHECKED_OUT', NOW() - INTERVAL '2 days', 2, NULL, 1);

-- TestGym Pro Attendance
INSERT INTO member_attendance(member_id, branch_id, check_in_time, check_out_time, attendance_date, status, created_at, user_id, supervisor_id, organization_id) VALUES
(8, 3, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '30 minutes', CURRENT_DATE, 'CHECKED_OUT', NOW(), 7, NULL, 2),
(9, 3, NOW() - INTERVAL '1 hour', NULL, CURRENT_DATE, 'CHECKED_IN', NOW(), 7, NULL, 2),
(10, 3, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '1 hour', CURRENT_DATE, 'CHECKED_OUT', NOW(), 7, NULL, 2);

-- FitTrack Gym Attendance
INSERT INTO member_attendance(member_id, branch_id, check_in_time, check_out_time, attendance_date, status, created_at, user_id, supervisor_id, organization_id) VALUES
(12, 4, NOW() - INTERVAL '1 hour', NULL, CURRENT_DATE, 'CHECKED_IN', NOW(), 10, NULL, 3),
(13, 4, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour', CURRENT_DATE, 'CHECKED_OUT', NOW(), 10, NULL, 3),
(14, 4, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '2 hours', CURRENT_DATE, 'CHECKED_OUT', NOW(), 10, NULL, 3);

-- ============================================
-- PART 11: CREATE SAMPLE LEADS
-- ============================================

INSERT INTO leads(organization_id, branch_id, full_name, email, phone, source, interested_plan_id, interested_branch_id, assigned_user_id, status, conversion_status, converted_member_id, priority, expected_value, notes, last_contact_date, created_at, updated_at) VALUES
(1, 1, 'Rohan Kumar', 'rohan.potential@email.com', '9876543301', 'WEBSITE', 1, 1, 2, 'NEW', NULL, NULL, 'HIGH', 3538.82, 'Interested in basic membership', NOW() - INTERVAL '3 days', NOW(), NOW()),
(1, 1, 'Sneha Sharma', 'sneha.interested@email.com', '9876543302', 'REFERRAL', 2, 1, 4, 'CONTACTED', NULL, NULL, 'MEDIUM', 9038.87, 'Referred by Rajesh Kumar', NOW() - INTERVAL '1 day', NOW(), NOW()),
(1, 1, 'Harsh Patel', 'harsh.fitness@email.com', '9876543303', 'WALK_IN', 3, 1, 2, 'INTERESTED', NULL, NULL, 'HIGH', 33399.72, 'Trial scheduled', NOW(), NOW(), NOW()),
(2, 3, 'Linda Chen', 'linda.chen@email.com', '5551234580', 'WEBSITE', 6, 3, 7, 'NEW', NULL, NULL, 'MEDIUM', 2948.82, 'Looking for fitness program', NOW() - INTERVAL '5 days', NOW(), NOW()),
(3, 4, 'Mark Thompson', 'mark.fitness@email.com', '5559876560', 'REFERRAL', 9, 4, 10, 'INTERESTED', NULL, NULL, 'HIGH', 4128.82, 'Interested in weight loss', NOW(), NOW(), NOW());

-- ============================================
-- PART 12: CREATE USER PROFILES
-- ============================================

INSERT INTO user_profiles(user_id, date_of_birth, gender, height_cm, weight_kg, fitness_level, primary_goal, training_preference, workout_frequency, created_at, updated_at) VALUES
(2, '1985-07-20', 'Male', 178.0, 75.0, 'INTERMEDIATE', 'IMPROVE_STRENGTH', 'GYM', 5, NOW(), NOW()),
(3, '1990-03-15', 'Female', 162.0, 58.0, 'BEGINNER', 'WEIGHT_LOSS', 'GYM', 3, NOW(), NOW()),
(4, '1988-11-25', 'Male', 180.0, 80.0, 'ADVANCED', 'BUILD_MUSCLE', 'GYM', 6, NOW(), NOW()),
(5, '1992-05-10', 'Female', 165.0, 62.0, 'INTERMEDIATE', 'IMPROVE_STRENGTH', 'GYM', 4, NOW(), NOW());

-- ============================================
-- PART 13: CREATE EXERCISES
-- ============================================

INSERT INTO exercises(name, muscle_group, equipment, difficulty, instructions, image_url, recommended_sets, recommended_reps, created_at, updated_at) VALUES
('Barbell Bench Press', 'Chest', 'Barbell', 'Intermediate', 'Lower the bar to the mid chest with control, then press up.', 'https://images.unsplash.com/photo-1571019613914-85f342c1d4b6?w=500', 4, 8, NOW(), NOW()),
('Romanian Deadlift', 'Legs', 'Barbell', 'Intermediate', 'Hinge at hips and keep back neutral while lowering bar.', 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=500', 4, 10, NOW(), NOW()),
('Lat Pulldown', 'Back', 'Cable', 'Beginner', 'Pull bar to upper chest while keeping torso stable.', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500', 3, 12, NOW(), NOW()),
('Dumbbell Curls', 'Biceps', 'Dumbbell', 'Beginner', 'Curl dumbbells up while keeping elbows stationary.', 'https://images.unsplash.com/photo-1574289603b671733cb5627fb4be74a18268e0', 3, 12, NOW(), NOW()),
('Leg Press', 'Legs', 'Machine', 'Beginner', 'Push the platform away from you with your legs.', 'https://images.unsplash.com/photo-1532619675605-1ede6c2e5611?w=500', 4, 15, NOW(), NOW()),
('Shoulder Press', 'Shoulders', 'Dumbbell', 'Intermediate', 'Press dumbbells overhead from shoulder height.', 'https://images.unsplash.com/photo-1574289603b671733cb5627fb4be74a18268', 3, 10, NOW(), NOW()),
('Squats', 'Legs', 'Barbell', 'Intermediate', 'Lower your body by bending at the knees and hips.', 'https://images.unsplash.com/photo-1599058917212-d217368e6651?w=500', 4, 12, NOW(), NOW()),
('Tricep Dips', 'Triceps', 'Bodyweight', 'Intermediate', 'Lower and raise your body using triceps on parallel bars.', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500', 3, 12, NOW(), NOW());

-- ============================================
-- PART 14: SUMMARY
-- ============================================

-- Reset all sequences to ensure consistency
SELECT setval('roles_id_seq', (SELECT COALESCE(MAX(id), 0) FROM roles) + 1);
SELECT setval('organizations_id_seq', (SELECT COALESCE(MAX(id), 0) FROM organizations) + 1);
SELECT setval('branches_id_seq', (SELECT COALESCE(MAX(id), 0) FROM branches) + 1);
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 0) FROM users) + 1);
SELECT setval('membership_plans_id_seq', (SELECT COALESCE(MAX(id), 0) FROM membership_plans) + 1);
SELECT setval('members_id_seq', (SELECT COALESCE(MAX(id), 0) FROM members) + 1);
SELECT setval('memberships_id_seq', (SELECT COALESCE(MAX(id), 0) FROM memberships) + 1);
SELECT setval('member_attendance_id_seq', (SELECT COALESCE(MAX(id), 0) FROM member_attendance) + 1);
SELECT setval('leads_id_seq', (SELECT COALESCE(MAX(id), 0) FROM leads) + 1);
SELECT setval('exercises_id_seq', (SELECT COALESCE(MAX(id), 0) FROM exercises) + 1);
SELECT setval('user_profiles_id_seq', (SELECT COALESCE(MAX(id), 0) FROM user_profiles) + 1);

-- Summary output
SELECT 'DATA RESET AND RECREATION COMPLETE' as Status;
SELECT COUNT(*) as Organizations FROM organizations;
SELECT COUNT(*) as Branches FROM branches;
SELECT COUNT(*) as Users FROM users;
SELECT COUNT(*) as MembershipPlans FROM membership_plans;
SELECT COUNT(*) as Members FROM members;
SELECT COUNT(*) as Memberships FROM memberships;
SELECT COUNT(*) as Attendance FROM member_attendance;
SELECT COUNT(*) as Leads FROM leads;
SELECT COUNT(*) as Exercises FROM exercises;

