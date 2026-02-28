CREATE TABLE IF NOT EXISTS public.marketing_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_event_type TEXT NOT NULL,
    raw_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    suggested_copy TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'posted')),
    platform TEXT CHECK (platform IN ('linkedin', 'x', 'newsletter')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for database security
ALTER TABLE public.marketing_queue ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view/manage their queue inside the dashboard
CREATE POLICY "Allow authenticated full access to marketing_queue"
ON public.marketing_queue
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow service role to do everything for background queue processing
CREATE POLICY "Allow service role full access to marketing_queue"
ON public.marketing_queue
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
