-- Epic 6: The Universal Audit Ledger 
-- Run this script in the Supabase SQL Editor

-- 1. Create the Unified Action Record Table
CREATE TABLE IF NOT EXISTS public.system_events_ledger (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    entity_id UUID NOT NULL REFERENCES public.llcs(id) ON DELETE CASCADE,
    client_id UUID REFERENCES auth.users(id),     -- The customer who owns the entity
    actor_id TEXT,                                -- Staff UUID, Customer UUID, or 'SYSTEM'/'TINYFISH_BOT'
    actor_type TEXT NOT NULL CHECK (actor_type IN ('CUSTOMER', 'STAFF', 'SYSTEM', 'TINYFISH_BOT')),
    
    event_category TEXT NOT NULL CHECK (event_category IN ('FILING_AUTOMATION', 'COMMUNICATION', 'DATA_MUTATION', 'BILLING', 'COMPLIANCE')),
    event_type TEXT NOT NULL,                     -- e.g., 'ANNUAL_REPORT_FILED', 'EMAIL_SENT', 'STATUS_CHANGED'
    
    severity TEXT DEFAULT 'INFO' CHECK (severity IN ('INFO', 'SUCCESS', 'WARNING', 'CRITICAL')),
    
    customer_facing_message TEXT,                 -- Reassuring, Jony-style narrative (e.g., "May 1st: Your Annual Report was automatically filed.")
    internal_payload JSONB,                       -- Raw developer telemetry, errors, request bodies (Steve-style flight recorder)
    system_snapshot JSONB,                        -- Complete row state of the LLC at the exact time of the event (for debugging)
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Performance Indexes (For the Steve Flight Recorder)
CREATE INDEX IF NOT EXISTS idx_ledger_entity ON public.system_events_ledger(entity_id);
CREATE INDEX IF NOT EXISTS idx_ledger_client ON public.system_events_ledger(client_id);
CREATE INDEX IF NOT EXISTS idx_ledger_time ON public.system_events_ledger(created_at DESC);

-- 3. Cryptographic Immutability (The Architect)
-- Prevent modifications and deletions to preserve chain-of-custody. Append-only.
REVOKE UPDATE, DELETE ON public.system_events_ledger FROM authenticated, anon, public;

-- 4. Enable RLS
ALTER TABLE public.system_events_ledger ENABLE ROW LEVEL SECURITY;

-- 5. Policy: Customers view sanitized timeline (The Jony Ive Shield)
-- Customers can only view their own events, and ONLY if the severity is INFO or SUCCESS.
-- Internal payload errors (WARNING/CRITICAL) are hidden from the public client.
CREATE POLICY "Customers view sanitized timeline"
ON public.system_events_ledger
FOR SELECT
USING (auth.uid() = client_id AND severity IN ('INFO', 'SUCCESS'));

-- Note: Staff Admin fetching (The Flight Recorder) should use the Supabase Service Role key
-- via edge functions or trusted internal APIs, which securely bypasses these RLS rules.
