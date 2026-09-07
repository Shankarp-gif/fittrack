-- V20 - Add Lead/CRM Management System
-- Enables gym owners to track prospects and convert them to members

CREATE TABLE leads (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    branch_id BIGINT REFERENCES branches(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(180),
    phone VARCHAR(20),
    source VARCHAR(64) NOT NULL DEFAULT 'OTHER',
    -- Sources: WEBSITE, REFERRAL, WALK_IN, SOCIAL_MEDIA, ADVERTISEMENT, PHONE, EMAIL, OTHER
    interested_plan_id BIGINT REFERENCES membership_plans(id) ON DELETE SET NULL,
    interested_branch_id BIGINT REFERENCES branches(id) ON DELETE SET NULL,
    assigned_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'NEW',
    -- Statuses: NEW, CONTACTED, INTERESTED, TRIAL, TRIAL_COMPLETED, CONVERTED, LOST, FOLLOW_UP_REQUIRED
    conversion_status VARCHAR(32),  -- NULL if not converted, CONVERTED if member created
    converted_member_id BIGINT REFERENCES members(id) ON DELETE SET NULL,
    priority VARCHAR(32) DEFAULT 'MEDIUM',  -- LOW, MEDIUM, HIGH, URGENT
    expected_value NUMERIC(10,2),
    notes TEXT,
    last_contact_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE lead_followups (
    id BIGSERIAL PRIMARY KEY,
    lead_id BIGINT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    assigned_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    followup_status VARCHAR(32) NOT NULL DEFAULT 'SCHEDULED',
    -- Statuses: SCHEDULED, COMPLETED, PENDING, CANCELLED, RESCHEDULED
    followup_type VARCHAR(32),  -- PHONE_CALL, VISIT, EMAIL, SMS, MESSAGE, OTHER
    followup_date TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_date TIMESTAMP WITH TIME ZONE,
    outcome VARCHAR(32),  -- INTERESTED, NOT_INTERESTED, NEED_MORE_INFO, SCHEDULED_TRIAL, etc
    notes TEXT,
    created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE lead_pipeline_stages (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    stage_name VARCHAR(100) NOT NULL,
    stage_order INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX idx_leads_org_branch ON leads(organization_id, branch_id);
CREATE INDEX idx_leads_org_status ON leads(organization_id, status);
CREATE INDEX idx_leads_assigned_user ON leads(assigned_user_id);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_converted_member ON leads(converted_member_id);
CREATE INDEX idx_lead_followups_lead_id ON lead_followups(lead_id);
CREATE INDEX idx_lead_followups_user_id ON lead_followups(assigned_user_id);
CREATE INDEX idx_lead_followups_date ON lead_followups(followup_date);
CREATE INDEX idx_lead_followups_status ON lead_followups(followup_status);
CREATE INDEX idx_lead_pipeline_org ON lead_pipeline_stages(organization_id);

-- Default pipeline stages for new organizations (can be customized)
INSERT INTO lead_pipeline_stages(organization_id, stage_name, stage_order, description)
SELECT id, 'New Leads', 1, 'Recently added prospects'
FROM organizations;

INSERT INTO lead_pipeline_stages(organization_id, stage_name, stage_order, description)
SELECT id, 'Contacted', 2, 'Initial contact made'
FROM organizations;

INSERT INTO lead_pipeline_stages(organization_id, stage_name, stage_order, description)
SELECT id, 'Interested', 3, 'Prospect expressed interest'
FROM organizations;

INSERT INTO lead_pipeline_stages(organization_id, stage_name, stage_order, description)
SELECT id, 'Trial', 4, 'Trial membership offered'
FROM organizations;

INSERT INTO lead_pipeline_stages(organization_id, stage_name, stage_order, description)
SELECT id, 'Converted', 5, 'Became paying member'
FROM organizations;

INSERT INTO lead_pipeline_stages(organization_id, stage_name, stage_order, description)
SELECT id, 'Lost', 6, 'No longer interested'
FROM organizations;

