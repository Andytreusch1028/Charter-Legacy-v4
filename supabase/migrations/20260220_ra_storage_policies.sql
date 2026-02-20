-- ============================================================
-- RA Storage Security (ra-documents bucket)
-- ============================================================

-- 1. Ensure Bucket Exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('ra-documents', 'ra-documents', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS
-- (Assuming storage.objects already has RLS enabled, but re-insuring)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Staff Policy: Full Control
-- Staff need to upload, view, and delete documents they process.
DROP POLICY IF EXISTS "Staff manage ra-documents" ON storage.objects;
CREATE POLICY "Staff manage ra-documents"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'ra-documents' AND (
        (auth.jwt() -> 'app_metadata' ->> 'staff_role') IN ('master_admin', 'ra_agent', 'formation_clerk', 'legacy_clerk')
    )
)
WITH CHECK (
    bucket_id = 'ra-documents' AND (
        (auth.jwt() -> 'app_metadata' ->> 'staff_role') IN ('master_admin', 'ra_agent', 'formation_clerk', 'legacy_clerk')
    )
);

-- 4. User Policy: View Own Documents
-- Users can only read documents where the first folder is their UUID.
DROP POLICY IF EXISTS "Users view own ra-documents" ON storage.objects;
CREATE POLICY "Users view own ra-documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'ra-documents' AND (
        (storage.foldername(name))[1] = auth.uid()::text
    )
);
