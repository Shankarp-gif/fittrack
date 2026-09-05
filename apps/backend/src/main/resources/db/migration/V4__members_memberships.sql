-- Phase 3: Members & Memberships
-- Core business entities for gym management
-- Note: Using VARCHAR for status fields for H2/PostgreSQL compatibility

-- Create membership_plans table
CREATE TABLE membership_plans (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    description TEXT,
    duration_days INT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    joining_fee NUMERIC(10,2) DEFAULT 0,
    discount_percentage NUMERIC(5,2) DEFAULT 0,
    tax_percentage NUMERIC(5,2) DEFAULT 0,
    max_pt_sessions INT,
    freeze_allowance INT DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create members table
CREATE TABLE members (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    branch_id BIGINT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    member_id_number VARCHAR(50) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(180),
    mobile VARCHAR(20) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(32),
    address VARCHAR(512),
    emergency_contact_name VARCHAR(120),
    emergency_contact_phone VARCHAR(20),
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING_PAYMENT',
    notes TEXT,
    photo_url VARCHAR(512),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, member_id_number)
);

-- Create memberships table
CREATE TABLE memberships (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    membership_plan_id BIGINT NOT NULL REFERENCES membership_plans(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    price NUMERIC(10,2) NOT NULL,
    discount_amount NUMERIC(10,2) DEFAULT 0,
    tax_amount NUMERIC(10,2) DEFAULT 0,
    total_amount NUMERIC(10,2) NOT NULL,
    frozen_until DATE,
    freeze_count INT DEFAULT 0,
    renewed_from_id BIGINT REFERENCES memberships(id),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create member_attendance table
CREATE TABLE member_attendance (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    branch_id BIGINT NOT NULL REFERENCES branches(id),
    check_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
    check_out_time TIMESTAMP WITH TIME ZONE,
    attendance_date DATE NOT NULL,
    status VARCHAR(32) DEFAULT 'CHECKED_IN',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_membership_plans_organization ON membership_plans(organization_id);
CREATE INDEX idx_members_organization_branch ON members(organization_id, branch_id);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_mobile ON members(mobile);
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_memberships_member ON memberships(member_id);
CREATE INDEX idx_memberships_plan ON memberships(membership_plan_id);
CREATE INDEX idx_memberships_status ON memberships(status);
CREATE INDEX idx_memberships_dates ON memberships(start_date, end_date);
CREATE INDEX idx_attendance_member_date ON member_attendance(member_id, attendance_date);
CREATE INDEX idx_attendance_branch_date ON member_attendance(branch_id, attendance_date);

-- Seed demo data
INSERT INTO membership_plans(organization_id, name, description, duration_days, price, joining_fee, discount_percentage, tax_percentage, max_pt_sessions, freeze_allowance)
VALUES
(1, 'Monthly Plan', 'Access to gym for 30 days', 30, 2500.00, 500.00, 0, 18, 0, 0),
(1, 'Quarterly Plan', 'Access to gym for 90 days', 90, 6500.00, 0, 10, 18, 2, 1),
(1, 'Annual Plan', 'Access to gym for 365 days', 365, 20000.00, 1000.00, 15, 18, 10, 2),
(1, 'Premium PT Plan', 'Personal training with 24 sessions', 90, 15000.00, 2000.00, 0, 18, 24, 1);

-- Insert some demo members
INSERT INTO members(organization_id, branch_id, member_id_number, full_name, email, mobile, gender, status)
VALUES
(1, 1, 'MEM001', 'Raj Kumar', 'raj@example.com', '9876543210', 'Male', 'ACTIVE'),
(1, 1, 'MEM002', 'Priya Sharma', 'priya@example.com', '9876543211', 'Female', 'ACTIVE'),
(1, 1, 'MEM003', 'Amit Singh', 'amit@example.com', '9876543212', 'Male', 'EXPIRING_SOON'),
(1, 1, 'MEM004', 'Neha Verma', 'neha@example.com', '9876543213', 'Female', 'ACTIVE'),
(1, 1, 'MEM005', 'Vikram Patel', 'vikram@example.com', '9876543214', 'Male', 'EXPIRED');

-- Insert demo memberships
INSERT INTO memberships(member_id, membership_plan_id, start_date, end_date, status, price, discount_amount, tax_amount, total_amount)
VALUES
(1, 1, CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '20 days', 'ACTIVE', 2500, 0, 450, 2950),
(2, 1, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '25 days', 'ACTIVE', 2500, 0, 450, 2950),
(3, 1, CURRENT_DATE - INTERVAL '25 days', CURRENT_DATE + INTERVAL '5 days', 'EXPIRING_SOON', 2500, 0, 450, 2950),
(4, 3, CURRENT_DATE - INTERVAL '100 days', CURRENT_DATE + INTERVAL '265 days', 'ACTIVE', 20000, 3000, 3060, 20060),
(5, 1, CURRENT_DATE - INTERVAL '35 days', CURRENT_DATE - INTERVAL '5 days', 'EXPIRED', 2500, 0, 450, 2950);

-- Insert demo attendance
INSERT INTO member_attendance(member_id, branch_id, check_in_time, check_out_time, attendance_date, status)
VALUES
(1, 1, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '2 hours', CURRENT_DATE, 'CHECKED_OUT'),
(2, 1, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '1 hour', CURRENT_DATE, 'CHECKED_OUT'),
(4, 1, NOW() - INTERVAL '2 hours', NULL, CURRENT_DATE, 'CHECKED_IN'),
(1, 1, NOW() - INTERVAL '1 day' - INTERVAL '5 hours', NOW() - INTERVAL '1 day' - INTERVAL '3 hours', CURRENT_DATE - INTERVAL '1 day', 'CHECKED_OUT'),
(2, 1, NOW() - INTERVAL '1 day' - INTERVAL '4 hours', NOW() - INTERVAL '1 day' - INTERVAL '2 hours', CURRENT_DATE - INTERVAL '1 day', 'CHECKED_OUT');

