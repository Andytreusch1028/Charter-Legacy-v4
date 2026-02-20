-- ============================================================
-- Legal Inquiry System (Phase 2)
-- ============================================================

-- Thread for a formal inquiry
CREATE TABLE IF NOT EXISTS public.ra_inquiry_threads (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id         UUID REFERENCES auth.users(id) NOT NULL,
    document_id     UUID REFERENCES public.registered_agent_documents(id) ON DELETE SET NULL,
    subject         TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'OPEN' 
                    CHECK (status IN ('OPEN', 'STAFF_REVIEW', 'ANSWERED', 'CLOSED')),
    created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Messages within a thread
CREATE TABLE IF NOT EXISTS public.ra_inquiry_messages (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    thread_id       UUID REFERENCES public.ra_inquiry_threads(id) ON DELETE CASCADE NOT NULL,
    sender_id       UUID REFERENCES auth.users(id) NOT NULL,
    content         TEXT NOT NULL,
    is_staff        BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================
-- Global Fulfillment Audit (Phase 3/4)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.fulfillment_events (
    id                      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id                UUID REFERENCES auth.users(id) NOT NULL,
    module                  TEXT NOT NULL CHECK (module IN ('FORMATION', 'RA', 'LEGACY', 'SHIELD')),
    action_type             TEXT NOT NULL,
    target_id               UUID NOT NULL, -- UUID of the LLC, Will, or Document
    contemporaneous_proof   JSONB DEFAULT '{}'::jsonb,
    created_at              TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================
-- RLS & Security (Chinese Wall)
-- ============================================================

ALTER TABLE public.ra_inquiry_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ra_inquiry_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fulfillment_events ENABLE ROW LEVEL SECURITY;

-- 1. Inquiry Threads: Users see own, Staff see based on role (to be added via custom claims)
DROP POLICY IF EXISTS "Users view own threads" ON public.ra_inquiry_threads;
CREATE POLICY "Users view own threads" ON public.ra_inquiry_threads 
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users create own threads" ON public.ra_inquiry_threads;
CREATE POLICY "Users create own threads" ON public.ra_inquiry_threads 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 2. Inquiry Messages: Users see own, Staff see all (for now, will restrict later)
DROP POLICY IF EXISTS "Users view own messages" ON public.ra_inquiry_messages;
CREATE POLICY "Users view own messages" ON public.ra_inquiry_messages 
    FOR SELECT USING (
        thread_id IN (SELECT id FROM public.ra_inquiry_threads WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users create own messages" ON public.ra_inquiry_messages;
CREATE POLICY "Users create own messages" ON public.ra_inquiry_messages 
    FOR INSERT WITH CHECK (
        thread_id IN (SELECT id FROM public.ra_inquiry_threads WHERE user_id = auth.uid())
        AND sender_id = auth.uid()
        AND is_staff = false
    );

-- 3. Fulfillment Events: Staff only (RLS to be tightened with claims)
DROP POLICY IF EXISTS "Staff view fulfillment events" ON public.fulfillment_events;
CREATE POLICY "Staff view fulfillment events" ON public.fulfillment_events 
    FOR SELECT USING (true); -- Placeholder: will restrict to staff roles

-- ============================================================
-- Triggers
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_thread_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_thread_updated ON public.ra_inquiry_threads;
CREATE TRIGGER on_thread_updated
    BEFORE UPDATE ON public.ra_inquiry_threads
    FOR EACH ROW EXECUTE FUNCTION public.handle_thread_updated_at();
