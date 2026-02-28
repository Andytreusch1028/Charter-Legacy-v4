-- ============================================================
-- RA Document Audit Table
-- Append-only, tamper-proof evidentiary log
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ra_document_audit (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id         UUID REFERENCES auth.users(id) NOT NULL,
    document_id     UUID REFERENCES public.registered_agent_documents(id) ON DELETE SET NULL,
    action          TEXT NOT NULL,
    actor_type      TEXT NOT NULL DEFAULT 'SYSTEM'
                    CHECK (actor_type IN ('USER', 'SYSTEM', 'CHARTER_ADMIN')),
    actor_email     TEXT,
    ip_address      TEXT,
    user_agent      TEXT,
    outcome         TEXT NOT NULL DEFAULT 'SUCCESS'
                    CHECK (outcome IN ('SUCCESS', 'FAILURE', 'PENDING')),
    metadata        JSONB DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Immutable: no UPDATE or DELETE ever allowed on audit rows
CREATE OR REPLACE RULE no_update_audit
    AS ON UPDATE TO public.ra_document_audit DO INSTEAD NOTHING;

CREATE OR REPLACE RULE no_delete_audit
    AS ON DELETE TO public.ra_document_audit DO INSTEAD NOTHING;

-- Index for fast user lookups and admin queries
CREATE INDEX IF NOT EXISTS idx_ra_audit_user_id    ON public.ra_document_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_ra_audit_document_id ON public.ra_document_audit(document_id);
CREATE INDEX IF NOT EXISTS idx_ra_audit_action      ON public.ra_document_audit(action);
CREATE INDEX IF NOT EXISTS idx_ra_audit_created_at  ON public.ra_document_audit(created_at DESC);

-- RLS
ALTER TABLE public.ra_document_audit ENABLE ROW LEVEL SECURITY;

-- Users can only read their own audit rows
DROP POLICY IF EXISTS "Users can view own audit log" ON public.ra_document_audit;
CREATE POLICY "Users can view own audit log"
    ON public.ra_document_audit FOR SELECT
    USING (auth.uid() = user_id);

-- Only service role can insert (edge functions write all rows)
-- No INSERT policy for authenticated users = blocked by default
-- However, for the Staff Portal, we allow staff roles to insert records
DROP POLICY IF EXISTS "Staff can manage audit logs" ON public.ra_document_audit;
CREATE POLICY "Staff can manage audit logs"
    ON public.ra_document_audit FOR ALL
    USING ((auth.jwt() -> 'app_metadata' ->> 'staff_role') IN ('master_admin', 'ra_agent', 'formation_clerk', 'legacy_clerk'));

-- ============================================================
-- Extend registered_agent_documents with lifecycle columns
-- ============================================================

ALTER TABLE public.registered_agent_documents
    ADD COLUMN IF NOT EXISTS file_path                    TEXT,
    ADD COLUMN IF NOT EXISTS file_size_kb                 INTEGER,
    ADD COLUMN IF NOT EXISTS received_at                  TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS forwarded_at                 TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS availability_email_sent_at   TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS urgent                       BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS status                       TEXT DEFAULT 'Forwarded';

-- Extend type check to include all real document types
ALTER TABLE public.registered_agent_documents
    DROP CONSTRAINT IF EXISTS registered_agent_documents_type_check;

ALTER TABLE public.registered_agent_documents
    ADD CONSTRAINT registered_agent_documents_type_check
    CHECK (type IN (
        'State Requirement', 'Legal Notice', 'Bureaucracy',
        'State FL', 'Sunbiz', 'Compliance', 'Tax', 'Legal'
    ));
