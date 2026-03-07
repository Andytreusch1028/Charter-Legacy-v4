CREATE POLICY "Allow authenticated pending insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'ra-documents' AND 
    (storage.foldername(name))[1] = 'pending'
);
