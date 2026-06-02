
-- Allow authenticated users to upload and manage their own avatar/qr files
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authenticated users can update own avatars"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authenticated users can delete own avatars"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authenticated users can upload qr-codes"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'qr-codes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authenticated users can update own qr-codes"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'qr-codes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authenticated users can delete own qr-codes"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'qr-codes' AND auth.uid()::text = (storage.foldername(name))[1]);
