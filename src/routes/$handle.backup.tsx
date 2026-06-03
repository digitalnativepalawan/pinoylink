// @ts-nocheck
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TEMPLATES, SOCIAL_ICONS } from '@/components/data';
import SocialBrandIcon from '@/components/pinoy/SocialBrandIcon';
import DynamicLucideIcon from '@/components/pinoy/DynamicLucideIcon';
import { ChevronRight, MapPin, Copy, Check, Share2, Wallet } from 'lucide-react';

export const Route = createFileRoute('/$handle/backup')({
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
  const [copied, setCopied] = useState(false);
  const [payOpen, setPayOpen] = useState<string | null>(null);

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

  // ── Resolve colours: profile-level accent overrides tpl default
  const accent = profile.accent_color || tpl.accentColor;
  const textColor = tpl.textColor;
  const mutedColor = tpl.mutedColor;
  const linkTextColor = tpl.linkTextColor;

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

  const copyLink = () => {
    navigator.clipboard?.writeText(`https://link.merqato.digital/${profile.handle}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareProfile = () => {
    if (navigator.share) {
      navigator.share({
        title: profile.full_name,
        url: `https://link.merqato.digital/${profile.handle}`,
      });
    }
  };

  // ── Compute button border radius from btnStyle
  const btnRadius = (() => {
    switch (tpl.btnStyle) {
      case 'pill': return '999px';
      case 'glass': return '14px';
      default: return '12px';
    }
  })();

  // ── Compute button inline styles
  const linkBtnStyle: React.CSSProperties = {
    background: tpl.btnBgColor,
    borderRadius: btnRadius,
    color: linkTextColor,
    fontFamily: `${tpl.fontDisplay}, sans-serif`,
    ...(tpl.btnStyle === 'glass' ? { backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' } : {}),
  };

  // ── Avatar ring glow using accent (inline override for tpl.avatarRing)
  const avatarStyle: React.CSSProperties = {
    border: `2.5px solid ${accent}`,
    boxShadow: `0 0 0 4px ${accent}22, 0 0 18px ${accent}44`,
  };

  return (
    <div
      className={`min-h-screen ${tpl.bgClass}`}
      style={{ fontFamily: `${tpl.fontDisplay}, sans-serif`, color: textColor }}
    >
      <div className="max-w-[480px] mx-auto px-5 pb-16 pt-12 flex flex-col items-center">

        {/* ── Avatar ──────────────────────────────────────────── */}
        <div className="relative mb-1">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="w-24 h-24 rounded-full object-cover"
              style={avatarStyle}
            />
          ) : (
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold"
              style={{ ...avatarStyle, background: `${accent}20`, color: accent }}
            >
              {profile.full_name?.charAt(0) ?? '?'}
            </div>
          )}
          {/* Pulse ring */}
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{ border: `1.5px solid ${accent}`, opacity: 0.25, animationDuration: '2.8s' }}
          />
        </div>

        {/* ── Name + handle ────────────────────────────────────── */}
        <h1
          className="mt-4 text-[22px] font-extrabold text-center leading-tight tracking-tight"
          style={{ color: textColor }}
        >
          {profile.full_name}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: mutedColor }}>
          @{profile.handle}
        </p>

        {/* ── Location ─────────────────────────────────────────── */}
        {profile.location && (
          <div className="flex items-center gap-1 mt-1.5 text-xs" style={{ color: mutedColor }}>
            <MapPin className="w-3 h-3" style={{ color: accent }} />
            <span>{profile.location}</span>
          </div>
        )}

        {/* ── Bio ──────────────────────────────────────────────── */}
        {profile.bio && (
          <p
            className="text-sm text-center mt-3 max-w-xs leading-relaxed"
            style={{ color: mutedColor }}
          >
            {profile.bio}
          </p>
        )}

        {/* ── Social icons ─────────────────────────────────────── */}
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
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                  style={{
                    background: tpl.isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)',
                    border: `1px solid ${tpl.isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)'}`,
                  }}
                  title={meta?.name}
                >
                  <SocialBrandIcon id={s.icon_id} className="w-5 h-5" color={meta?.color || accent} />
                </a>
              );
            })}
          </div>
        )}

        {/* ── Links ────────────────────────────────────────────── */}
        <div className="w-full mt-8 space-y-3">
          {links.map((link, i) => (
            <a
              key={link.id}
              href={link.url}
              onClick={(e) => handleLinkClick(e, link)}
              className={`flex items-center gap-3 w-full px-5 py-4 transition-all hover:opacity-90 hover:-translate-y-0.5 active:scale-[0.98] ${tpl.btnBorder}`}
              style={{
                ...linkBtnStyle,
                animationDelay: `${i * 0.06}s`,
              }}
            >
              {/* Icon */}
              {link.custom_icon && (
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${link.icon_color || accent}22` }}
                >
                  <DynamicLucideIcon
                    name={link.custom_icon}
                    className="w-4 h-4"
                    style={{ color: link.icon_color || accent }}
                  />
                </span>
              )}

              {/* Title */}
              <span className="flex-1 text-sm font-semibold" style={{ color: linkTextColor }}>
                {link.title_en}
              </span>

              {/* Arrow */}
              <ChevronRight
                className="w-4 h-4 flex-shrink-0"
                style={{ color: `${linkTextColor}66` }}
              />
            </a>
          ))}
        </div>

        {/* ── Payment buttons ───────────────────────────────────── */}
        {payments.length > 0 && (
          <div className="w-full mt-4 space-y-3">
            {payments.map((p) => (
              <div
                key={p.id}
                className={`rounded-2xl overflow-hidden ${tpl.btnBorder}`}
                style={{ background: tpl.btnBgColor }}
              >
                <button
                  type="button"
                  onClick={() => setPayOpen(payOpen === p.id ? null : p.id)}
                  className="w-full flex items-center gap-3 px-5 py-4 transition-opacity hover:opacity-90"
                >
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${accent}22` }}
                  >
                    <Wallet className="w-4 h-4" style={{ color: accent }} />
                  </span>
                  <span className="flex-1 text-sm font-semibold text-left" style={{ color: linkTextColor }}>
                    {p.custom_label || `Send via ${p.provider}`}
                  </span>
                  <ChevronRight
                    className="w-4 h-4 flex-shrink-0 transition-transform"
                    style={{
                      color: `${linkTextColor}66`,
                      transform: payOpen === p.id ? 'rotate(90deg)' : 'rotate(0deg)',
                    }}
                  />
                </button>

                {payOpen === p.id && (
                  <div className="px-5 pb-5 flex flex-col items-center gap-3">
                    {p.qr_image_url ? (
                      <img
                        src={p.qr_image_url}
                        alt={p.provider}
                        className="w-44 h-44 rounded-xl bg-white p-2 object-contain"
                      />
                    ) : (
                      <div
                        className="w-44 h-44 rounded-xl flex items-center justify-center text-xs text-center"
                        style={{ background: 'rgba(255,255,255,0.06)', color: mutedColor }}
                      >
                        QR not uploaded yet
                      </div>
                    )}
                    <p className="text-xs text-center" style={{ color: mutedColor }}>
                      After sending, message your reference number 📩
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Share row ─────────────────────────────────────────── */}
        <div className="w-full mt-6 flex gap-3">
          <button
            type="button"
            onClick={copyLink}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold transition-opacity hover:opacity-80"
            style={{
              background: tpl.isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.08)',
              border: `1px solid ${tpl.isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`,
              color: textColor,
            }}
          >
            {copied ? <Check className="w-3.5 h-3.5" style={{ color: accent }} /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy link'}
          </button>
          <button
            type="button"
            onClick={shareProfile}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold transition-opacity hover:opacity-80"
            style={{
              background: tpl.isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.08)',
              border: `1px solid ${tpl.isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`,
              color: textColor,
            }}
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>
        </div>

        {/* ── Footer ────────────────────────────────────────────── */}
        <div className="mt-10 text-xs" style={{ color: mutedColor }}>
          Powered by{' '}
          <span className="font-semibold" style={{ color: accent }}>
            link.merqato.digital
          </span>
        </div>
      </div>
    </div>
  );
}
