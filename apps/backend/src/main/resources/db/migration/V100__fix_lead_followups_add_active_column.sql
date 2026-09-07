-- V100 - Fix lead_followups schema - add missing active column
-- The LeadFollowup entity expects an 'active' column but V20 didn't create it

-- Check if column exists before adding (for idempotency)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'lead_followups' AND column_name = 'active'
    ) THEN
        ALTER TABLE lead_followups ADD COLUMN active BOOLEAN NOT NULL DEFAULT true;
        CREATE INDEX idx_lead_followups_active ON lead_followups(active);
    END IF;
END $$;

