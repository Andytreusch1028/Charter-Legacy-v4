-- ============================================================
-- STAFF RECOVERY PROTOCOL (Audit-able Password Resets)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.staff_recovery_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_email TEXT NOT NULL,
    requested_node TEXT NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'PENDING', -- PENDING, APPROVED, DENIED, COMPLETED
    verifier_id TEXT, -- The ID of the Operator who approved the reset
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.staff_recovery_requests ENABLE ROW LEVEL SECURITY;

-- 1. Staff can INSERT a recovery request (Publicly but throttled in real app)
DROP POLICY IF EXISTS "Staff can request recovery" ON public.staff_recovery_requests;
CREATE POLICY "Staff can request recovery" ON public.staff_recovery_requests
    FOR INSERT WITH CHECK (true);

-- 2. Only Superusers can view/manage recovery requests
DROP POLICY IF EXISTS "Superusers can manage recovery" ON public.staff_recovery_requests;
CREATE POLICY "Superusers can manage recovery" ON public.staff_recovery_requests
    FOR ALL USING (
        (auth.jwt() -> 'app_metadata' ->> 'staff_role') IN ('master_admin', 'Superuser')
    );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_staff_recovery_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS tr_staff_recovery_timestamp ON public.staff_recovery_requests;
CREATE TRIGGER tr_staff_recovery_timestamp
    BEFORE UPDATE ON public.staff_recovery_requests
    FOR EACH ROW
    EXECUTE PROCEDURE update_staff_recovery_timestamp();
