-- V21 - Add Payment & Financial Transaction System
-- Enables complete financial tracking for gym operations

CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    branch_id BIGINT REFERENCES branches(id) ON DELETE SET NULL,
    member_id BIGINT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    membership_id BIGINT REFERENCES memberships(id) ON DELETE SET NULL,
    lead_id BIGINT REFERENCES leads(id) ON DELETE SET NULL,
    amount NUMERIC(10,2) NOT NULL,
    discount_percentage NUMERIC(5,2) DEFAULT 0,
    discount_amount NUMERIC(10,2) DEFAULT 0,
    tax_percentage NUMERIC(5,2) DEFAULT 0,
    tax_amount NUMERIC(10,2) DEFAULT 0,
    final_amount NUMERIC(10,2) NOT NULL,
    payment_method VARCHAR(32) NOT NULL DEFAULT 'CASH',
    -- Methods: CASH, CARD, UPI, BANK_TRANSFER, CHEQUE, ONLINE, AUTO_RENEWAL
    payment_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    -- Statuses: PENDING, PAID, PARTIAL, FAILED, REFUNDED, CANCELLED
    transaction_id VARCHAR(255),
    reference_number VARCHAR(255) UNIQUE,
    receipt_number VARCHAR(255) UNIQUE,
    collected_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    payment_reason VARCHAR(255),  -- MEMBERSHIP_NEW, MEMBERSHIP_RENEWAL, PERSONAL_TRAINING, CLASS, OTHER
    notes TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE refunds (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    payment_id BIGINT NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    reason VARCHAR(255) NOT NULL,
    refund_status VARCHAR(32) DEFAULT 'PROCESSED',  -- PROCESSED, PENDING, FAILED
    refund_date TIMESTAMP WITH TIME ZONE,
    processed_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE payment_methods (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    method_name VARCHAR(100) NOT NULL,
    method_type VARCHAR(32),  -- CASH, CARD, UPI, BANK, CHEQUE, ONLINE
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE payment_receipts (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    payment_id BIGINT NOT NULL UNIQUE REFERENCES payments(id) ON DELETE CASCADE,
    receipt_number VARCHAR(255) NOT NULL UNIQUE,
    receipt_html TEXT,
    receipt_pdf_url VARCHAR(512),
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX idx_payments_org_member ON payments(organization_id, member_id);
CREATE INDEX idx_payments_org_date ON payments(organization_id, created_at DESC);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_payments_collected_by ON payments(collected_by);
CREATE INDEX idx_refunds_payment_id ON refunds(payment_id);
CREATE INDEX idx_refunds_org_date ON refunds(organization_id, created_at DESC);
CREATE INDEX idx_payment_methods_org ON payment_methods(organization_id);
CREATE INDEX idx_payment_receipts_org ON payment_receipts(organization_id);

-- Insert default payment methods for all organizations
INSERT INTO payment_methods(organization_id, method_name, method_type, is_active)
SELECT id, 'Cash', 'CASH', TRUE FROM organizations;

INSERT INTO payment_methods(organization_id, method_name, method_type, is_active)
SELECT id, 'Card', 'CARD', TRUE FROM organizations;

INSERT INTO payment_methods(organization_id, method_name, method_type, is_active)
SELECT id, 'Bank Transfer', 'BANK', TRUE FROM organizations;

-- Create a function to generate receipt numbers (useful for triggers)
CREATE SEQUENCE payment_receipt_seq START WITH 1001;

