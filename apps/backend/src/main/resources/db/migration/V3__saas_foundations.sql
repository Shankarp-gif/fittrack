-- Phase 1: SaaS Foundations
-- Add Organization and Branch support without breaking existing data

-- Create organizations table
CREATE TABLE organizations (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(180),
    phone VARCHAR(20),
    address VARCHAR(512),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    tax_id VARCHAR(50),
    logo_url VARCHAR(512),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    owner_user_id BIGINT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create branches table
CREATE TABLE branches (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(512),
    city VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(180),
    latitude NUMERIC(10,8),
    longitude NUMERIC(11,8),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, name)
);

-- Create permissions table
CREATE TABLE permissions (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create role_permissions mapping table
CREATE TABLE role_permissions (
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Update users table to support multi-org/branch
ALTER TABLE users ADD COLUMN organization_id BIGINT;
ALTER TABLE users ADD COLUMN branch_id BIGINT;
ALTER TABLE users ADD CONSTRAINT fk_users_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE users ADD CONSTRAINT fk_users_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;

-- Create notifications table (schema only for Phase 1)
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSONB,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create audit_logs table for tracking important actions
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id BIGINT,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_branches_organization_id ON branches(organization_id);
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_branch_id ON users(branch_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_audit_logs_organization_user ON audit_logs(organization_id, user_id, created_at);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Seed default organization and branch
INSERT INTO organizations(name, email, phone)
VALUES ('Default Gym', 'admin@gym.local', '+1234567890');

INSERT INTO branches(organization_id, name, city, phone)
VALUES (1, 'Main Branch', 'City Center', '+1234567890');

-- Update existing user to belong to default org and branch
UPDATE users SET organization_id = 1, branch_id = 1 WHERE id = 1;

-- Seed permissions
INSERT INTO permissions(code, description) VALUES
-- Member permissions
('MEMBER_VIEW', 'View member list'),
('MEMBER_CREATE', 'Create new member'),
('MEMBER_EDIT', 'Edit member details'),
('MEMBER_DELETE', 'Delete member'),

-- Membership permissions
('MEMBERSHIP_VIEW', 'View memberships'),
('MEMBERSHIP_CREATE', 'Create membership'),
('MEMBERSHIP_RENEW', 'Renew membership'),
('MEMBERSHIP_CANCEL', 'Cancel membership'),

-- Attendance permissions
('ATTENDANCE_VIEW', 'View attendance'),
('ATTENDANCE_CHECKIN', 'Check-in members'),
('ATTENDANCE_REPORT', 'View attendance reports'),

-- Payment permissions
('PAYMENT_VIEW', 'View payments'),
('PAYMENT_CREATE', 'Record payment'),
('PAYMENT_REFUND', 'Process refund'),
('PAYMENT_REPORT', 'View payment reports'),

-- Trainer permissions
('TRAINER_VIEW', 'View trainers'),
('TRAINER_MANAGE', 'Manage trainers'),
('TRAINER_ASSIGN', 'Assign trainers'),

-- Lead permissions
('LEAD_VIEW', 'View leads'),
('LEAD_CREATE', 'Create lead'),
('LEAD_FOLLOWUP', 'Record follow-up'),
('LEAD_CONVERT', 'Convert lead'),

-- Class permissions
('CLASS_VIEW', 'View classes'),
('CLASS_CREATE', 'Create class'),
('CLASS_SCHEDULE', 'Schedule classes'),
('CLASS_BOOKING', 'Book classes'),

-- Expense permissions
('EXPENSE_VIEW', 'View expenses'),
('EXPENSE_CREATE', 'Create expense'),
('EXPENSE_REPORT', 'View expense reports'),

-- Report permissions
('REPORT_VIEW', 'View reports'),
('REPORT_EXPORT', 'Export reports'),

-- Settings permissions
('SETTINGS_VIEW', 'View settings'),
('SETTINGS_EDIT', 'Edit settings'),

-- Staff permissions
('STAFF_VIEW', 'View staff'),
('STAFF_MANAGE', 'Manage staff'),

-- Admin permissions
('ADMIN_ACCESS', 'Administrator access'),
('AUDIT_LOG_VIEW', 'View audit logs');

-- Assign permissions to existing roles
-- USER role gets basic permissions
INSERT INTO role_permissions(role_id, permission_id)
SELECT 1, id FROM permissions WHERE code IN ('MEMBER_VIEW', 'MEMBERSHIP_VIEW', 'ATTENDANCE_VIEW', 'PAYMENT_VIEW', 'TRAINER_VIEW', 'LEAD_VIEW', 'CLASS_VIEW', 'REPORT_VIEW', 'SETTINGS_VIEW');

-- TRAINER role gets trainer specific permissions
INSERT INTO role_permissions(role_id, permission_id)
SELECT 2, id FROM permissions WHERE code IN ('TRAINER_VIEW', 'MEMBER_VIEW', 'CLASS_VIEW', 'ATTENDANCE_VIEW');

-- ADMIN role gets all permissions
INSERT INTO role_permissions(role_id, permission_id)
SELECT 3, id FROM permissions;

