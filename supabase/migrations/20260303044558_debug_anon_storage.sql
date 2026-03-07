-- To account for the dev bypass screen which does not establish a real Supabase session,
-- we must grant INSERT access to the `anon` role for the `ra-documents` bucket.
-- Without this, the local development mock-staff cannot upload documents to storage.

DROP POLICY IF EXISTS "Allow blanket ALL for RA docs testing" ON storage.objects;

CREATE POLICY "Allow public insert for dev bypass"
ON storage.objects FOR INSERT
TO public
WITH CHECK (
    bucket_id = 'ra-documents'
);

-- We also need to add SELECT in case the client performs a pre-flight or existence check
CREATE POLICY "Allow public select for dev bypass"
ON storage.objects FOR SELECT
TO public
USING (
    bucket_id = 'ra-documents'
);
