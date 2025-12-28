-- =============================================
-- ADD MISSING TIMESTAMP COLUMNS
-- Run this BEFORE the seed_data.sql
-- =============================================

-- Add assigned_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tickets' AND column_name = 'assigned_at') THEN
        ALTER TABLE tickets ADD COLUMN assigned_at TIMESTAMPTZ;
    END IF;
END $$;

-- Add closed_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tickets' AND column_name = 'closed_at') THEN
        ALTER TABLE tickets ADD COLUMN closed_at TIMESTAMPTZ;
    END IF;
END $$;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tickets' 
AND column_name IN ('assigned_at', 'closed_at');
