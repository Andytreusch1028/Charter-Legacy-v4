-- Ultimate fallback test: Grant ALL operations to authenticated users for the ra-documents bucket
-- The Supabase JS client .upload() method sometimes requires SELECT or UPDATE permissions 
-- underneath the hood if it tries to check for file existence or do a resumable upload.

DROP POLICY IF EXISTS "Allow blanket insert for RA docs" ON storage.objects;

CREATE POLICY "Allow blanket ALL for RA docs testing"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'ra-documents'
)
WITH CHECK (
    bucket_id = 'ra-documents'
);
