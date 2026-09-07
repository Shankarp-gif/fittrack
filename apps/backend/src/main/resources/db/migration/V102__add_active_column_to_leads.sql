-- V102 - Add active column to leads table
-- The Lead entity expects an 'active' column but V20 didn't create it

-- Check if column exists before adding (for idempotency)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'leads' AND column_name = 'active'
    ) THEN
        ALTER TABLE leads ADD COLUMN active BOOLEAN NOT NULL DEFAULT true;
        CREATE INDEX idx_leads_active ON leads(active);
    END IF;
END $$;

