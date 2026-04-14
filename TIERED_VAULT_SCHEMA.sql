-- Tiered Data Vault Schema & Row Level Security (RLS)
-- This enforces the 10-Day Root Veto Buffer at the database layer.

CREATE TABLE vault_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    llc_id UUID REFERENCES llcs(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    tier INTEGER NOT NULL CHECK (tier IN (1, 2, 3)),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE vault_documents ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- POLICY 1: Founder Full Authority
-- The authenticated founder of the LLC always has unrestricted access to their vault.
-- -----------------------------------------------------------------------------
CREATE POLICY "founder_full_access"
ON vault_documents FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM llcs 
        WHERE llcs.id = vault_documents.llc_id 
        AND llcs.user_id = auth.uid()
    )
);

-- -----------------------------------------------------------------------------
-- POLICY 2: Successor Tier 1 Read Access (Instant)
-- Tier 1 documents (Basic Instructions, Contact Lists) are instantly accessible 
-- the moment a valid succession event is triggered, even during the buffer period.
-- -----------------------------------------------------------------------------
CREATE POLICY "successor_tier1_access"
ON vault_documents FOR SELECT
USING (
    tier = 1 AND
    EXISTS (
        SELECT 1 FROM succession_events
        WHERE succession_events.llc_id = vault_documents.llc_id
        AND succession_events.status IN ('PENDING_BUFFER', 'RELEASED')
    )
);

-- -----------------------------------------------------------------------------
-- POLICY 3: Successor Tier 2 & 3 Read Access (Timer Lockout)
-- Tier 2 and 3 documents (Keys, Deeds, Operating Agreements, Equity Maps) are 
-- STRICTLY LOCKED via database firewall until the Veto Buffer has officially expired.
-- It will block access if status is VETOED, or if current time is before buffer_end_date.
-- -----------------------------------------------------------------------------
CREATE POLICY "successor_tier2_3_access"
ON vault_documents FOR SELECT
USING (
    tier IN (2, 3) AND
    EXISTS (
        SELECT 1 FROM succession_events
        WHERE succession_events.llc_id = vault_documents.llc_id
        AND (
            succession_events.status = 'RELEASED' 
            OR (
                succession_events.status = 'PENDING_BUFFER' 
                AND succession_events.buffer_end_date <= NOW()
            )
        )
    )
);
