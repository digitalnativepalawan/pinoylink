
-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  handle text UNIQUE NOT NULL CHECK (handle ~ '^[a-z0-9_]{3,30}$'),
  full_name text NOT NULL,
  email text,
  mobile text,
  bio text,
  location text,
  avatar_url text,
  selected_template text DEFAULT 'watawat',
  accent_color text DEFAULT '#FCD116',
  is_pro boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_public" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- LINKS
CREATE TABLE public.links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title_en text NOT NULL,
  title_tl text,
  url text NOT NULL,
  type text NOT NULL,
  enabled boolean DEFAULT true,
  icon_color text DEFAULT '#ffffff',
  custom_icon text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "links_select_public" ON public.links FOR SELECT USING (true);
CREATE POLICY "links_insert_own" ON public.links FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "links_update_own" ON public.links FOR UPDATE USING (auth.uid() = profile_id);
CREATE POLICY "links_delete_own" ON public.links FOR DELETE USING (auth.uid() = profile_id);

-- SOCIAL ICONS
CREATE TABLE public.social_icons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  icon_id text NOT NULL,
  url text,
  active boolean DEFAULT false,
  sort_order integer DEFAULT 0
);
ALTER TABLE public.social_icons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "social_select_public" ON public.social_icons FOR SELECT USING (true);
CREATE POLICY "social_insert_own" ON public.social_icons FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "social_update_own" ON public.social_icons FOR UPDATE USING (auth.uid() = profile_id);
CREATE POLICY "social_delete_own" ON public.social_icons FOR DELETE USING (auth.uid() = profile_id);

-- PAYMENT BUTTONS
CREATE TABLE public.payment_buttons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider text NOT NULL,
  qr_image_url text,
  custom_label text,
  enabled boolean DEFAULT true
);
ALTER TABLE public.payment_buttons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pay_select_public" ON public.payment_buttons FOR SELECT USING (true);
CREATE POLICY "pay_insert_own" ON public.payment_buttons FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "pay_update_own" ON public.payment_buttons FOR UPDATE USING (auth.uid() = profile_id);
CREATE POLICY "pay_delete_own" ON public.payment_buttons FOR DELETE USING (auth.uid() = profile_id);

-- PAGE VIEWS
CREATE TABLE public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  link_id uuid REFERENCES public.links(id) ON DELETE SET NULL,
  referrer text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "views_insert_public" ON public.page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "views_select_owner" ON public.page_views FOR SELECT USING (auth.uid() = profile_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- handle availability RPC
CREATE OR REPLACE FUNCTION public.check_handle_available(handle text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT NOT EXISTS (SELECT 1 FROM public.profiles WHERE profiles.handle = lower(check_handle_available.handle));
$$;

-- Storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars','avatars',true,5242880, ARRAY['image/jpeg','image/png','image/webp']),
  ('qr-codes','qr-codes',true,5242880, ARRAY['image/jpeg','image/png','image/webp']),
  ('backgrounds','backgrounds',true,10485760, ARRAY['image/jpeg','image/png','image/webp']);

-- Storage policies
CREATE POLICY "public_read_buckets" ON storage.objects FOR SELECT
USING (bucket_id IN ('avatars','qr-codes','backgrounds'));

CREATE POLICY "auth_upload_own_folder" ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id IN ('avatars','qr-codes','backgrounds')
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "auth_update_own_folder" ON storage.objects FOR UPDATE
USING (
  bucket_id IN ('avatars','qr-codes','backgrounds')
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "auth_delete_own_folder" ON storage.objects FOR DELETE
USING (
  bucket_id IN ('avatars','qr-codes','backgrounds')
  AND auth.uid()::text = (storage.foldername(name))[1]
);
