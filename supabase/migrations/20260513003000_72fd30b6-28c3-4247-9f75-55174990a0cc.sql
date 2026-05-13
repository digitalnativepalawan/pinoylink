
-- Make handle check use invoker rights (profiles are publicly readable anyway)
CREATE OR REPLACE FUNCTION public.check_handle_available(handle text)
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT NOT EXISTS (SELECT 1 FROM public.profiles WHERE profiles.handle = lower(check_handle_available.handle));
$$;

REVOKE EXECUTE ON FUNCTION public.check_handle_available(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_handle_available(text) TO authenticated;

-- Tighten page_views insert: require a valid profile_id (still public, but not "always true")
DROP POLICY IF EXISTS "views_insert_public" ON public.page_views;
CREATE POLICY "views_insert_public" ON public.page_views FOR INSERT
WITH CHECK (
  profile_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = profile_id)
);
