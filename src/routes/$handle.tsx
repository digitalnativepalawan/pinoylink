// @ts-nocheck
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TEMPLATES, SOCIAL_ICONS } from '@/components/data';
import SocialBrandIcon from '@/components/pinoy/SocialBrandIcon';
import DynamicLucideIcon from '@/components/pinoy/DynamicLucideIcon';

export const Route = createFileRoute('/$handle')({
  loader: async ({ params }) => {
    const handle = params.handle.toLowerCase();
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('handle', handle)
      .maybeSingle();

    if (!profile) return { notFound: true, handle };

    const [linksRes, socialsRes, paysRes] = await Promise.all([
      supabase.from('links').select('*').eq('profile_id', profile.id).eq('enabled', true).order('sort_order', { ascending: true }),
      supabase.from('social_icons').select('*').eq('profile_id', profile.id).eq('active', true).order('sort_order', { ascending: true }),
      supabase.from('payment_buttons').select('*').eq('profile_id', profile.id).eq('enabled', true),
    ]);

    return {
      notFound: false,
      handle,
      profile,
      links: linksRes.data ?? [],
      socials: socialsRes.data ?? [],
      payments: paysRes.data ?? [],
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData || loaderData.notFound) {
      return { meta: [{ title: `link.merqato.digital/${loaderData?.handle ?? ''}` }] };
    }
    const { profile, handle } = loaderData;
    const title = `${profile.full_name} — link.merqato.digital/${handle}`;
    const desc = profile.bio || `${profile.full_name} on link.merqato.digital`;
    const meta = [
      { title },
      { name: 'description', content: desc },
      { property: 'og:title', content: title },
      { property: 'og:description', content: desc },
    ];
    if (profile.avatar_url) {
      meta.push({ property: 'og:image', content: profile.avatar_url });
      meta.push({ name: 'twitter:image', content: profile.avatar_url });
    }
    return { meta };
  },
  component: PublicProfilePage,
});

function NotFoundView({ handle }: { handle: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#0a0a0f] text-white">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="text-6xl">🌴</div>
        <h1 className="text-2xl font-semibold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
          This link doesn't exist yet
        </h1>
        <p className="text-white/60 text-sm">
          link.merqato.digital/<span className="text-white">{handle}</span> is available.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 rounded-full bg-[#FCD116] text-black font-semibold hover:opacity-90 transition"
        >
          Claim link.merqato.digital/{handle}
        </Link>
      </div>
    </div>
  );
}

function PublicProfilePage() {
  const data = Route.useLoaderData();

  useEffect(() => {
    if (data.notFound) return;
    supabase.from('page_views').insert({
      profile_id: data.profile.id,
      referrer: typeof document !== 'undefined' ? document.referrer || null : null,
    }).then(() => {});
  }, [data]);

  if (data.notFound) return <NotFoundView handle={data.handle} />;

  const { profile, links, socials, payments } = data;
  const tpl = TEMPLATES.find((t) => t.id === profile.selected_template) ?? TEMPLATES[0];
  const accent = profile.accent_color || '#FCD116';

  const handleLinkClick = async (e: React.MouseEvent, link: any) => {
    e.preventDefault();
    try {
      await supabase.from('page_views').insert({
        profile_id: profile.id,
        link_id: link.id,
        referrer: typeof document !== 'undefined' ? document.referrer || null : null,
      });
    } catch {}
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  const btnClass = (() => {
    switch (tpl.btnStyle) {
      case 'glass': return 'backdrop-blur-md';
      case 'pill': return 'rounded-full';
      case 'outline': return '';
      default: return '';
    }
  })();

  return (
    <div
      className={`min-h-screen ${tpl.bgClass} text-white`}
      style={{ fontFamily: `${tpl.fontDisplay}, sans-serif` }}
    >
      <div className="max-w-[480px] mx-auto px-5 py-10 flex flex-col items-center">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.full_name}
            className={`w-24 h-24 rounded-full object-cover ${tpl.avatarRing}`}
          />
        ) : (
          <div className={`w-24 h-24 rounded-full bg-white/10 flex items-center justify-center text-3xl ${tpl.avatarRing}`}>
            {profile.full_name?.charAt(0)}
          </div>
        )}

        <h1 className="mt-4 text-xl font-bold text-center">{profile.full_name}</h1>
        <p className="text-sm text-white/70">@{profile.handle}</p>
        {profile.location && (
          <p className="text-xs text-white/50 mt-1">📍 {profile.location}</p>
        )}
        {profile.bio && (
          <p className="text-sm text-white/80 text-center mt-3 max-w-xs">{profile.bio}</p>
        )}

        {socials.length > 0 && (
          <div className="flex flex-wrap gap-3 justify-center mt-5">
            {socials.map((s) => {
              const meta = SOCIAL_ICONS.find((i) => i.id === s.icon_id);
              return (
                <a
                  key={s.id}
                  href={s.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
                >
                  <SocialBrandIcon id={s.icon_id} className="w-5 h-5" color={meta?.color || '#fff'} />
                </a>
              );
            })}
          </div>
        )}

        <div className="w-full mt-8 space-y-3">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              onClick={(e) => handleLinkClick(e, link)}
              className={`flex items-center gap-3 w-full px-5 py-4 rounded-xl ${tpl.btnBorder} ${btnClass} hover:opacity-90 transition`}
              style={{
                background: tpl.btnStyle === 'outline' ? 'transparent' : tpl.btnBgColor,
              }}
            >
              {link.custom_icon && (
                <DynamicLucideIcon name={link.custom_icon} className="w-5 h-5" />
              )}
              <span className="flex-1 text-sm font-medium">{link.title_en}</span>
            </a>
          ))}
        </div>

        {payments.length > 0 && (
          <div className="w-full mt-6 space-y-3">
            {payments.map((p) => (
              <div
                key={p.id}
                className={`p-4 rounded-xl ${tpl.btnBorder}`}
                style={{ background: tpl.btnBgColor, borderColor: accent }}
              >
                <div className="text-sm font-medium mb-2">
                  {p.custom_label || `Send via ${p.provider}`}
                </div>
                {p.qr_image_url && (
                  <img src={p.qr_image_url} alt={p.provider} className="w-40 h-40 mx-auto rounded-lg bg-white p-2" />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 text-xs text-white/40">
          Powered by <span className="text-white/70">link.merqato.digital</span>
        </div>
      </div>
    </div>
  );
}
