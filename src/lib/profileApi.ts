// @ts-nocheck
import { supabase } from '@/integrations/supabase/client';
import type { LinkItem } from '@/components/data';

export interface ProfilePatch {
  full_name?: string;
  bio?: string | null;
  location?: string | null;
  avatar_url?: string | null;
  selected_template?: string;
  accent_color?: string;
}

export async function updateProfile(userId: string, patch: ProfilePatch) {
  const { error } = await supabase.from('profiles').update(patch).eq('id', userId);
  if (error) throw error;
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const ext = (file.name.split('.').pop() || 'png').toLowerCase();
  const path = `${userId}/avatar-${Date.now()}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type });
  if (upErr) throw upErr;
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadQr(userId: string, file: File): Promise<string> {
  const ext = (file.name.split('.').pop() || 'png').toLowerCase();
  const path = `${userId}/qr-${Date.now()}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from('qr-codes')
    .upload(path, file, { upsert: true, contentType: file.type });
  if (upErr) throw upErr;
  const { data } = supabase.storage.from('qr-codes').getPublicUrl(path);
  return data.publicUrl;
}

export async function saveLinks(userId: string, links: LinkItem[]) {
  // Replace-all strategy
  const { error: delErr } = await supabase.from('links').delete().eq('profile_id', userId);
  if (delErr) throw delErr;
  if (links.length === 0) return;
  const rows = links.map((l, i) => ({
    profile_id: userId,
    title_en: l.titleEN,
    title_tl: l.titleTL ?? l.titleEN,
    url: l.url,
    type: l.type,
    enabled: l.enabled,
    icon_color: l.iconColor || '#ffffff',
    custom_icon: l.customIcon ?? null,
    sort_order: i,
  }));
  const { error: insErr } = await supabase.from('links').insert(rows);
  if (insErr) throw insErr;
}

export interface SocialRow {
  icon_id: string;
  url: string | null;
  active: boolean;
  sort_order: number;
}

export async function saveSocials(
  userId: string,
  activeIds: string[],
  urls: Record<string, string>
) {
  const { error: delErr } = await supabase
    .from('social_icons')
    .delete()
    .eq('profile_id', userId);
  if (delErr) throw delErr;
  if (activeIds.length === 0) return;
  const rows = activeIds.map((id, i) => ({
    profile_id: userId,
    icon_id: id,
    url: urls[id] || null,
    active: true,
    sort_order: i,
  }));
  const { error: insErr } = await supabase.from('social_icons').insert(rows);
  if (insErr) throw insErr;
}

export interface PaymentRow {
  provider: string;
  custom_label?: string | null;
  qr_image_url?: string | null;
  enabled?: boolean;
}

export async function savePayments(userId: string, payments: PaymentRow[]) {
  const { error: delErr } = await supabase
    .from('payment_buttons')
    .delete()
    .eq('profile_id', userId);
  if (delErr) throw delErr;
  if (payments.length === 0) return;
  const rows = payments.map((p) => ({
    profile_id: userId,
    provider: p.provider,
    custom_label: p.custom_label ?? null,
    qr_image_url: p.qr_image_url ?? null,
    enabled: p.enabled ?? true,
  }));
  const { error: insErr } = await supabase.from('payment_buttons').insert(rows);
  if (insErr) throw insErr;
}

export async function loadProfileBundle(userId: string) {
  const [profileRes, linksRes, socialsRes, paysRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    supabase.from('links').select('*').eq('profile_id', userId).order('sort_order'),
    supabase.from('social_icons').select('*').eq('profile_id', userId).order('sort_order'),
    supabase.from('payment_buttons').select('*').eq('profile_id', userId),
  ]);
  return {
    profile: profileRes.data,
    links: linksRes.data ?? [],
    socials: socialsRes.data ?? [],
    payments: paysRes.data ?? [],
  };
}
