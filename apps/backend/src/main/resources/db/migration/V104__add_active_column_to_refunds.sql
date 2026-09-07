-- V104 - Add active column to refunds table
-- The Refund entity expects an 'active' column but V21 didn't create it

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'refunds' AND column_name = 'active'
    ) THEN
        ALTER TABLE refunds ADD COLUMN active BOOLEAN NOT NULL DEFAULT true;
        CREATE INDEX idx_refunds_active ON refunds(active);
    END IF;
END $$;

