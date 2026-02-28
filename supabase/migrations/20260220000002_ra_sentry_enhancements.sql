-- ============================================================
-- RA Sentry Enhancements v2
-- Settings, Deduplication, Notification Tracking, Advanced Audit
-- ============================================================

-- 1. RA Settings Table (Key-Value Store for Node Context)
CREATE TABLE IF NOT EXISTS public.ra_settings (
    key         TEXT PRIMARY KEY,
    value       JSONB NOT NULL,
    updated_at  TIMESTAMPTZ DEFAULT now(),
    updated_by  UUID REFERENCES auth.users(id)
);

-- RLS for Settings
ALTER TABLE public.ra_settings ENABLE ROW LEVEL SECURITY;

-- Allow Staff to Manage Settings
DROP POLICY IF EXISTS "Staff manage settings" ON public.ra_settings;
CREATE POLICY "Staff manage settings" ON public.ra_settings
    FOR ALL
    USING ((auth.jwt() -> 'app_metadata' ->> 'staff_role') IN ('master_admin', 'ra_agent'));

-- 2. Enhance Documents Table for Lifecycle & Deduplication
ALTER TABLE public.registered_agent_documents
    ADD COLUMN IF NOT EXISTS content_hash          TEXT,
    ADD COLUMN IF NOT EXISTS archived_at           TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS email_notification_id TEXT,
    ADD COLUMN IF NOT EXISTS email_sent_at         TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS email_opened_at       TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS user_viewed_at        TIMESTAMPTZ;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ra_docs_hash ON public.registered_agent_documents(content_hash);
CREATE INDEX IF NOT EXISTS idx_ra_docs_archived ON public.registered_agent_documents(archived_at);

-- 3. Advanced Audit Search
-- Create a computed column for Full-Text Search on the audit log
ALTER TABLE public.ra_document_audit
    ADD COLUMN IF NOT EXISTS fts tsvector 
    GENERATED ALWAYS AS (
        to_tsvector('english', 
            coalesce(action, '') || ' ' || 
            coalesce(actor_email, '') || ' ' || 
            coalesce(outcome, '') || ' ' ||
            coalesce(metadata::text, '')
        )
    ) STORED;

-- Index the FTS column for fast text searching
CREATE INDEX IF NOT EXISTS idx_ra_audit_fts ON public.ra_document_audit USING GIN (fts);

-- 4. Audit Log View Helper (Optional but useful for frontend)
CREATE OR REPLACE VIEW ra_audit_log_view AS
SELECT 
    a.*,
    u.email as actor_email_resolved
FROM ra_document_audit a
LEFT JOIN auth.users u ON a.user_id = u.id;
