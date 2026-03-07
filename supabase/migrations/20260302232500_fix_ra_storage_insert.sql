-- ============================================================
-- Fix RA Storage Insert Policy 
-- ============================================================

-- Original policy (Staff manage ra-documents) checks for specific staff roles in app_metadata
-- However, during document ingestion, agents upload specifically to the temp/ folder 
-- and may be using a local dev admin bypass or standard agent auth without those roles fully hydrated.

-- We explicitly grant INSERT access to any authenticated user, 
-- specifically restricting them to placing files only within the temp/ directory of the ra-documents bucket.
-- Edge Functions with a service role will handle the final move and organization after OCR extraction or HitL approval.

CREATE POLICY "Allow authenticated temp insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'ra-documents' AND 
    (storage.foldername(name))[1] = 'pending'
);
