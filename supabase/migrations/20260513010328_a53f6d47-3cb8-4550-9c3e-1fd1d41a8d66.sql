
-- 1) updated_at trigger on profiles
DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2) check_handle_available with reserved words
CREATE OR REPLACE FUNCTION public.check_handle_available(handle text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    lower(handle) NOT IN (
      'admin','api','app','help','login','logout','register','settings',
      'support','terms','privacy','pinoy','bayan','root','mabuhay','www'
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE profiles.handle = lower(check_handle_available.handle)
    );
$$;

REVOKE EXECUTE ON FUNCTION public.check_handle_available(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_handle_available(text) TO authenticated;

-- 3) Storage bucket limits
UPDATE storage.buckets SET file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp']
  WHERE id = 'avatars';
UPDATE storage.buckets SET file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp']
  WHERE id = 'qr-codes';
UPDATE storage.buckets SET file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp']
  WHERE id = 'backgrounds';

-- 4) Per-user folder policies (drop any prior auth-only policies, recreate scoped)
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects'
      AND policyname LIKE 'pinoy_%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

-- Public read (idempotent)
DROP POLICY IF EXISTS pinoy_public_read ON storage.objects;
CREATE POLICY pinoy_public_read ON storage.objects
FOR SELECT TO public
USING (bucket_id IN ('avatars','qr-codes','backgrounds'));

CREATE POLICY pinoy_user_insert ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id IN ('avatars','qr-codes','backgrounds')
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY pinoy_user_update ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id IN ('avatars','qr-codes','backgrounds')
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY pinoy_user_delete ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id IN ('avatars','qr-codes','backgrounds')
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Drop older broad auth-only policies if they exist (best-effort common names)
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
