-- V103 - Add active column to payments table
-- The Payment entity expects an 'active' column but V21 didn't create it

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'payments' AND column_name = 'active'
    ) THEN
        ALTER TABLE payments ADD COLUMN active BOOLEAN NOT NULL DEFAULT true;
        CREATE INDEX idx_payments_active ON payments(active);
    END IF;
END $$;

