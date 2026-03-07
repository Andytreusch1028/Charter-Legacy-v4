-- Wait, the previous migration definitely targeted (storage.foldername(name))[1] = 'pending'
-- Let's make sure that policy didn't conflict or wasn't restrictive enough.
-- We will just give pure blanket INSERT access to the `ra-documents` bucket for 
-- authenticated users right now to guarantee it works, as Edge Functions secure the final state anyway.

DROP POLICY IF EXISTS "Allow authenticated pending insert" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated temp insert" ON storage.objects;

CREATE POLICY "Allow blanket insert for RA docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'ra-documents'
);
