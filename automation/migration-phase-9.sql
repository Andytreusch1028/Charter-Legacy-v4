-- Phase 9: Sunbiz Automation Schema Upgrade
-- PBP Reference: @SUNBIZ_AUTOMATION.schema

ALTER TABLE llcs 
ADD COLUMN IF NOT EXISTS principal_address TEXT,
ADD COLUMN IF NOT EXISTS statutory_purpose TEXT,
ADD COLUMN IF NOT EXISTS organizer_name TEXT,
ADD COLUMN IF NOT EXISTS is_professional BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS filing_status TEXT DEFAULT 'PENDING', -- PENDING, CALIB_COMPLETE, EXECUTING, CERTIFIED, PENDING_MANUAL
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS filed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS error_log TEXT;

-- Create alerts table if not exists for engine notifications
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    llc_id UUID REFERENCES llcs(id),
    error TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ledger_entries table for Phase C transparency
CREATE TABLE IF NOT EXISTS ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL,
    transaction_type TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    recipient TEXT,
    status TEXT,
    metadata JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for new tables
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;

-- Basic user policies
CREATE POLICY "Users can view own alerts" ON alerts FOR SELECT USING (auth.uid() IN (SELECT user_id FROM llcs WHERE id = llc_id));
CREATE POLICY "Users can view own ledger" ON ledger_entries FOR SELECT USING (auth.uid() IN (SELECT user_id FROM llcs WHERE id = entity_id));
