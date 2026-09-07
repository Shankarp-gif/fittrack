-- V22 - Add Expense & Financial Tracking System
-- Enables gym owners to track operational expenses and calculate net profit

CREATE TABLE expense_categories (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    category_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE expenses (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    branch_id BIGINT REFERENCES branches(id) ON DELETE SET NULL,
    expense_category_id BIGINT NOT NULL REFERENCES expense_categories(id) ON DELETE RESTRICT,
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    expense_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    payment_method VARCHAR(32) DEFAULT 'CASH',  -- CASH, CARD, BANK_TRANSFER, CHEQUE, ONLINE
    reference_number VARCHAR(255),
    recorded_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    receipt_url VARCHAR(512),
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern VARCHAR(32),  -- MONTHLY, QUARTERLY, YEARLY, etc
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE expense_approvals (
    id BIGSERIAL PRIMARY KEY,
    expense_id BIGINT NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    approval_status VARCHAR(32) DEFAULT 'PENDING',  -- PENDING, APPROVED, REJECTED
    approved_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    approval_date TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX idx_expense_categories_org ON expense_categories(organization_id);
CREATE INDEX idx_expenses_org_date ON expenses(organization_id, expense_date DESC);
CREATE INDEX idx_expenses_category ON expenses(expense_category_id);
CREATE INDEX idx_expenses_recorded_by ON expenses(recorded_by);
CREATE INDEX idx_expense_approvals_status ON expense_approvals(approval_status);
CREATE INDEX idx_expense_approvals_expense ON expense_approvals(expense_id);

-- Insert default expense categories for all organizations
INSERT INTO expense_categories(organization_id, category_name, description, is_active)
SELECT id, 'Rent', 'Gym premises rent', TRUE FROM organizations;

INSERT INTO expense_categories(organization_id, category_name, description, is_active)
SELECT id, 'Electricity', 'Electricity and utilities', TRUE FROM organizations;

INSERT INTO expense_categories(organization_id, category_name, description, is_active)
SELECT id, 'Maintenance', 'Equipment and facility maintenance', TRUE FROM organizations;

INSERT INTO expense_categories(organization_id, category_name, description, is_active)
SELECT id, 'Salaries', 'Staff salaries and wages', TRUE FROM organizations;

INSERT INTO expense_categories(organization_id, category_name, description, is_active)
SELECT id, 'Equipment', 'Equipment purchase and upgrades', TRUE FROM organizations;

INSERT INTO expense_categories(organization_id, category_name, description, is_active)
SELECT id, 'Marketing', 'Marketing and advertising', TRUE FROM organizations;

INSERT INTO expense_categories(organization_id, category_name, description, is_active)
SELECT id, 'Insurance', 'Insurance premiums', TRUE FROM organizations;

INSERT INTO expense_categories(organization_id, category_name, description, is_active)
SELECT id, 'Other', 'Miscellaneous expenses', TRUE FROM organizations;

