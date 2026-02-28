-- Transparency Ledger: Shared Audit Table for RA Documents
-- This table is the "Bridge" between the Staff Portal and the User Console.

CREATE TABLE IF NOT EXISTS public.ra_service_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES auth.users(id),
    document_name TEXT NOT NULL,
    document_hash TEXT,
    category TEXT,
    status TEXT NOT NULL DEFAULT 'RECEIVED', -- RECEIVED, OCR_PROCESSED, LINKED, FORWARDED, ARCHIVED
    staff_notes TEXT,
    staff_id TEXT, -- ID of the staff operator
    node_id TEXT,  -- ID of the physical hardware node
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ra_service_log ENABLE ROW LEVEL SECURITY;

-- Policy: Clients can see their own logs
DROP POLICY IF EXISTS "Clients can view their own document logs" ON public.ra_service_log;
CREATE POLICY "Clients can view their own document logs" 
ON public.ra_service_log
FOR SELECT 
USING (auth.uid() = client_id);

-- Policy: Staff can manage all logs
DROP POLICY IF EXISTS "Staff can manage all document logs" ON public.ra_service_log;
CREATE POLICY "Staff can manage all document logs" 
ON public.ra_service_log
FOR ALL
USING (
    (auth.jwt() -> 'app_metadata' ->> 'staff_role' IN ('master_admin', 'ra_agent'))
);

-- Realtime triggers
-- ALTER PUBLICATION supabase_realtime ADD TABLE ra_service_log;
