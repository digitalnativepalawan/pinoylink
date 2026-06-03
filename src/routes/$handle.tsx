// @ts-nocheck
import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TEMPLATES, SOCIAL_ICONS } from '@/components/data';
import SocialBrandIcon from '@/components/pinoy/SocialBrandIcon';
import DynamicLucideIcon from '@/components/pinoy/DynamicLucideIcon';
import {
  ChevronRight, MapPin, Copy, Check, Share2, Wallet,
  Play, Pause, Volume2, VolumeX, X, ChevronLeft,
  Image as ImageIcon, Film, Grid3X3, ExternalLink,
  Heart, MessageCircle, Repeat2, Instagram
} from 'lucide-react';

// ─────────────────────────────────────────────
// Route definition
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// Helpers: extract media embeds from links
// ─────────────────────────────────────────────
function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|v=|\/embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}
function getTikTokId(url: string): string | null {
  const m = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
  return m ? m[1] : null;
}
function getSpotifyEmbed(url: string): string | null {
  const m = url.match(/spotify\.com\/(track|album|playlist|episode)\/([A-Za-z0-9]+)/);
  return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}` : null;
}
function getInstagramShortcode(url: string): string | null {
  const m = url.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/);
  return m ? m[1] : null;
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

/** Fullscreen lightbox for gallery images */
function Lightbox({ images, startIndex, onClose }: { images: string[]; startIndex: number; onClose: () => void }) {
  const [idx, setIdx] = useState(startIndex);
  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/95 backdrop-blur-md"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition z-10"
      >
        <X className="w-5 h-5" />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      <img
        src={images[idx]}
        className="max-w-[90vw] max-h-[85vh] rounded-2xl object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); setIdx(i); }}
            className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`}
          />
        ))}
      </div>
    </div>
  );
}

/** Inline YouTube embed player */
function YouTubeCard({ videoId, accent }: { videoId: string; accent: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="w-full rounded-2xl overflow-hidden relative group" style={{ aspectRatio: '16/9' }}>
      {!playing ? (
        <>
          <img
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`; }}
          />
          <div className="absolute inset-0 bg-black/30" />
          <button
            onClick={() => setPlaying(true)}
            className="absolute inset-0 flex items-center justify-center group-hover:scale-105 transition-transform"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl"
              style={{ background: accent }}
            >
              <Play className="w-7 h-7 fill-current ml-1" style={{ color: accent === '#FCD116' ? '#000' : '#fff' }} />
            </div>
          </button>
        </>
      ) : (
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      )}
    </div>
  );
}

/** Spotify embed */
function SpotifyCard({ embedUrl }: { embedUrl: string }) {
  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ height: 152 }}>
      <iframe
        src={embedUrl}
        width="100%"
        height="152"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        style={{ border: 'none' }}
      />
    </div>
  );
}

/** TikTok embed */
function TikTokCard({ videoId }: { videoId: string }) {
  return (
    <div className="w-full flex justify-center">
      <blockquote
        className="tiktok-embed"
        cite={`https://www.tiktok.com/video/${videoId}`}
        data-video-id={videoId}
        style={{ maxWidth: '100%', minWidth: 320 }}
      >
        <section />
      </blockquote>
    </div>
  );
}

/** Photo gallery grid — 3-column masonry-ish */
function PhotoGallery({ images, accent }: { images: string[]; accent: string }) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  if (!images.length) return null;

  return (
    <>
      <div className="w-full grid grid-cols-3 gap-1 rounded-2xl overflow-hidden">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => setLightboxIdx(i)}
            className={`relative overflow-hidden bg-white/5 group ${
              i === 0 && images.length >= 3 ? 'col-span-2 row-span-2' : ''
            }`}
            style={{ aspectRatio: i === 0 && images.length >= 3 ? '1.05/1' : '1/1' }}
          >
            <img
              src={src}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
          </button>
        ))}
      </div>
      {lightboxIdx !== null && (
        <Lightbox
          images={images}
          startIndex={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </>
  );
}

/** Video reel strip — horizontal scroll of short video thumbnails */
function VideoReelStrip({ links, accent }: { links: any[]; accent: string }) {
  const ytLinks = links.filter(l => getYouTubeId(l.url));
  if (!ytLinks.length) return null;

  return (
    <div className="w-full">
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none" style={{ scrollSnapType: 'x mandatory' }}>
        {ytLinks.map((link) => {
          const vid = getYouTubeId(link.url)!;
          return (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 relative rounded-xl overflow-hidden group"
              style={{ width: 120, height: 200, scrollSnapAlign: 'start' }}
            >
              <img
                src={`https://img.youtube.com/vi/${vid}/mqdefault.jpg`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center opacity-80 group-hover:opacity-100 transition"
                style={{ background: accent }}
              >
                <Play className="w-4 h-4 fill-current ml-0.5" style={{ color: accent === '#FCD116' ? '#000' : '#fff' }} />
              </div>
              <p className="absolute bottom-2 left-2 right-2 text-white text-[10px] font-semibold leading-tight line-clamp-2">
                {link.title_en}
              </p>
            </a>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Determine how to render each link
// ─────────────────────────────────────────────
type LinkRenderType = 'youtube' | 'spotify' | 'tiktok' | 'instagram' | 'image' | 'button';

function getLinkRenderType(link: any): LinkRenderType {
  if (getYouTubeId(link.url)) return 'youtube';
  if (getSpotifyEmbed(link.url)) return 'spotify';
  if (getTikTokId(link.url)) return 'tiktok';
  if (getInstagramShortcode(link.url)) return 'instagram';
  if (link.type === 'image' || link.url?.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i)) return 'image';
  return 'button';
}

// ─────────────────────────────────────────────
// 404 view
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// Main profile page
// ─────────────────────────────────────────────
function PublicProfilePage() {
  const data = Route.useLoaderData();
  const [copied, setCopied] = useState(false);
  const [payOpen, setPayOpen] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'links' | 'media' | 'about'>('links');

  useEffect(() => {
    if (data.notFound) return;
    supabase.from('page_views').insert({
      profile_id: data.profile.id,
      referrer: typeof document !== 'undefined' ? document.referrer || null : null,
    }).then(() => {});

    // Load TikTok embed script if needed
    if (data.links?.some((l: any) => getTikTokId(l.url))) {
      const s = document.createElement('script');
      s.src = 'https://www.tiktok.com/embed.js';
      s.async = true;
      document.body.appendChild(s);
    }
  }, [data]);

  if (data.notFound) return <NotFoundView handle={data.handle} />;

  const { profile, links, socials, payments } = data;
  const tpl = TEMPLATES.find((t) => t.id === profile.selected_template) ?? TEMPLATES[0];

  // Use saved design overrides, fall back to template defaults
  const accent         = profile.accent_color      || tpl.accentColor    || '#FCD116';
  const colorBg        = profile.color_background  || tpl.bgClass        ? undefined : '#0a0a0a';
  const colorBtns      = profile.color_buttons     || accent;
  const colorBtnText   = profile.color_button_text || (tpl.isLight ? '#000000' : '#ffffff');
  const textColor      = profile.color_page_text   || tpl.textColor      || '#ffffff';
  const titleText      = profile.color_title_text  || tpl.textColor      || '#ffffff';
  const mutedColor     = tpl.mutedColor             || 'rgba(255,255,255,0.6)';
  const isLight        = tpl.isLight                || false;
  const font           = profile.page_font          || tpl.fontDisplay    || 'Bricolage Grotesque';
  const layout         = profile.profile_layout     || 'classic';
  const wallpaper      = profile.wallpaper_style    || 'fill';
  const bgImageUrl     = profile.bg_image_url       || null;

  // Button shape from saved setting
  const savedShape = (profile.button_shape || tpl.btnStyle || 'filled') as string;
  const btnRadius =
    savedShape === 'pill'    ? '999px' :
    savedShape === 'glass'   ? '14px'  :
    savedShape === 'outline' ? '12px'  : '12px';

  // Background style for hero
  const heroBgStyle: React.CSSProperties = (() => {
    if (wallpaper === 'image' && bgImageUrl) {
      return { backgroundImage: `url(${bgImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    }
    if (wallpaper === 'gradient') {
      return { background: `linear-gradient(135deg, ${profile.color_background || '#0a0a0a'} 0%, ${colorBtns} 100%)` };
    }
    if (wallpaper === 'blur') {
      return { background: `radial-gradient(circle at 30% 30%, ${colorBtns}aa, transparent 60%), radial-gradient(circle at 70% 70%, ${profile.color_background || '#0a0a0a'}, ${profile.color_background || '#0a0a0a'})` };
    }
    if (wallpaper === 'pattern') {
      return {
        backgroundColor: profile.color_background || '#0a0a0a',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      };
    }
    return {}; // 'fill' — uses tpl.bgClass
  })();

  const linkBtnStyle: React.CSSProperties = {
    background:     savedShape === 'outline' ? 'transparent'                 : `${colorBtns}22`,
    border:         savedShape === 'outline' ? `2px solid ${colorBtns}`      : `1px solid ${colorBtns}44`,
    borderRadius:   btnRadius,
    color:          colorBtnText,
    fontFamily:     `${font}, sans-serif`,
    ...(savedShape === 'glass' ? { backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', background: `${colorBtns}15` } : {}),
  };

  const avatarStyle: React.CSSProperties = {
    border: `3px solid ${accent}`,
    boxShadow: `0 0 0 5px ${accent}22, 0 0 28px ${accent}55`,
  };

  const copyLink = () => {
    navigator.clipboard?.writeText(`https://link.merqato.digital/${profile.handle}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const shareProfile = () => {
    if (navigator.share) {
      navigator.share({ title: profile.full_name, url: `https://link.merqato.digital/${profile.handle}` });
    } else {
      copyLink();
    }
  };

  // Split links by render type
  const buttonLinks  = links.filter((l: any) => getLinkRenderType(l) === 'button');
  const youtubeLinks = links.filter((l: any) => getLinkRenderType(l) === 'youtube');
  const spotifyLinks = links.filter((l: any) => getLinkRenderType(l) === 'spotify');
  const tiktokLinks  = links.filter((l: any) => getLinkRenderType(l) === 'tiktok');
  const hasMedia = youtubeLinks.length > 0 || spotifyLinks.length > 0 || tiktokLinks.length > 0;

  const borderCls = isLight ? 'border-black/10' : 'border-white/10';

  return (
    <div
      className={`min-h-screen ${wallpaper === 'fill' || !heroBgStyle.background && !heroBgStyle.backgroundImage ? tpl.bgClass : ''} relative overflow-x-hidden`}
      style={{
        fontFamily: `${font}, sans-serif`,
        color: textColor,
        ...(heroBgStyle.backgroundImage || heroBgStyle.background ? heroBgStyle : {}),
        ...(profile.color_background && wallpaper === 'fill' ? { backgroundColor: profile.color_background } : {}),
      }}
    >
      {/* ── Hero header with frosted overlay ── */}
      <div className="relative w-full" style={{ minHeight: 280 }}>
        {/* Background blurred avatar for cinematic effect */}
        {profile.avatar_url && (
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: `url(${profile.avatar_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center top',
              filter: 'blur(32px) saturate(1.8)',
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center px-5 pt-12 pb-6">
          {/* Avatar with pulse ring */}
          <div className="relative mb-3">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="w-[88px] h-[88px] rounded-full object-cover"
                style={avatarStyle}
              />
            ) : (
              <div
                className="w-[88px] h-[88px] rounded-full flex items-center justify-center text-3xl font-bold"
                style={{ ...avatarStyle, background: `${accent}20`, color: accent }}
              >
                {profile.full_name?.charAt(0) ?? '?'}
              </div>
            )}
            {/* Live pulse ring */}
            <div
              className="absolute inset-0 rounded-full animate-ping pointer-events-none"
              style={{ border: `2px solid ${accent}`, opacity: 0.2, animationDuration: '3s' }}
            />
          </div>

          <h1 className="text-[22px] font-extrabold text-center leading-tight tracking-tight text-white drop-shadow-md">
            {profile.full_name}
          </h1>
          <p className="text-sm mt-0.5 text-white/60">@{profile.handle}</p>

          {profile.location && (
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-white/50">
              <MapPin className="w-3 h-3" style={{ color: accent }} />
              <span>{profile.location}</span>
            </div>
          )}

          {profile.bio && (
            <p className="text-sm text-center mt-3 max-w-xs leading-relaxed text-white/75">
              {profile.bio}
            </p>
          )}

          {/* Social icons row */}
          {socials.length > 0 && (
            <div className="flex flex-wrap gap-2.5 justify-center mt-4">
              {socials.map((s: any) => {
                const meta = SOCIAL_ICONS.find((i) => i.id === s.icon_id);
                return (
                  <a
                    key={s.id}
                    href={s.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    style={{
                      background: 'rgba(255,255,255,0.12)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(8px)',
                    }}
                    title={meta?.name}
                  >
                    <SocialBrandIcon id={s.icon_id} className="w-5 h-5" color={meta?.color || accent} />
                  </a>
                );
              })}
            </div>
          )}

          {/* Share / copy row */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.18)',
                backdropFilter: 'blur(8px)',
                color: 'white',
              }}
            >
              {copied ? <Check className="w-3.5 h-3.5" style={{ color: accent }} /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy link'}
            </button>
            <button
              onClick={shareProfile}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all hover:scale-105 active:scale-95"
              style={{
                background: accent,
                color: accent === '#FCD116' ? '#000' : '#fff',
              }}
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* ── Tab navigation (only show if has media) ── */}
      {hasMedia && (
        <div
          className="sticky top-0 z-20 flex gap-0 border-b"
          style={{
            borderColor: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {[
            { id: 'links', label: 'Links', icon: <ExternalLink className="w-3.5 h-3.5" /> },
            { id: 'media', label: 'Media', icon: <Film className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3.5 text-xs font-semibold transition-all relative"
              style={{ color: activeTab === tab.id ? accent : 'rgba(255,255,255,0.5)' }}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && (
                <span
                  className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full"
                  style={{ background: accent }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Main content ── */}
      <div className="max-w-[480px] mx-auto px-4 pb-20 pt-5">

        {/* ────── LINKS TAB ────── */}
        {(!hasMedia || activeTab === 'links') && (
          <div className="space-y-3">

            {/* Button links */}
            {buttonLinks.map((link: any, i: number) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={async (e) => {
                  try {
                    await supabase.from('page_views').insert({ profile_id: profile.id, link_id: link.id, referrer: document.referrer || null });
                  } catch {}
                }}
                className={`flex items-center gap-3 w-full px-5 py-4 transition-all hover:opacity-90 hover:-translate-y-0.5 active:scale-[0.98] ${tpl.btnBorder}`}
                style={{
                  ...linkBtnStyle,
                  animationDelay: `${i * 0.06}s`,
                }}
              >
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
                <span className="flex-1 text-sm font-semibold" style={{ color: colorBtnText }}>
                  {link.title_en}
                </span>
                <ChevronRight className="w-4 h-4 flex-shrink-0 opacity-40" />
              </a>
            ))}

            {/* First YouTube link gets featured embed in links tab */}
            {youtubeLinks.length > 0 && !hasMedia && (
              <div className="space-y-3">
                {youtubeLinks.map((link: any) => {
                  const vid = getYouTubeId(link.url)!;
                  return (
                    <div key={link.id} className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: accent, opacity: 0.7 }}>
                        {link.title_en}
                      </p>
                      <YouTubeCard videoId={vid} accent={accent} />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Spotify inline in links tab */}
            {spotifyLinks.map((link: any) => {
              const embed = getSpotifyEmbed(link.url)!;
              return (
                <div key={link.id} className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: accent, opacity: 0.7 }}>
                    🎵 {link.title_en}
                  </p>
                  <SpotifyCard embedUrl={embed} />
                </div>
              );
            })}

            {/* Payment buttons */}
            {payments.length > 0 && (
              <div className="space-y-3 pt-1">
                {payments.map((p: any) => (
                  <div
                    key={p.id}
                    className={`rounded-2xl overflow-hidden ${tpl.btnBorder}`}
                    style={{ background: tpl.btnBgColor || 'rgba(255,255,255,0.08)' }}
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
                      <span className="flex-1 text-sm font-semibold text-left" style={{ color: colorBtnText }}>
                        {p.custom_label || `Send via ${p.provider}`}
                      </span>
                      <ChevronRight
                        className="w-4 h-4 flex-shrink-0 transition-transform opacity-40"
                        style={{ transform: payOpen === p.id ? 'rotate(90deg)' : 'rotate(0deg)' }}
                      />
                    </button>
                    {payOpen === p.id && (
                      <div className="px-5 pb-5 flex flex-col items-center gap-3">
                        {p.qr_image_url ? (
                          <img src={p.qr_image_url} alt={p.provider} className="w-44 h-44 rounded-xl bg-white p-2 object-contain" />
                        ) : (
                          <div className="w-44 h-44 rounded-xl flex items-center justify-center text-xs text-center" style={{ background: 'rgba(255,255,255,0.06)', color: mutedColor }}>
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
          </div>
        )}

        {/* ────── MEDIA TAB ────── */}
        {hasMedia && activeTab === 'media' && (
          <div className="space-y-6">

            {/* YouTube featured + reel strip */}
            {youtubeLinks.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-red-600 rounded flex items-center justify-center flex-shrink-0">
                    <Play className="w-3 h-3 fill-white text-white ml-0.5" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Videos
                  </p>
                </div>

                {/* Featured first video */}
                <YouTubeCard videoId={getYouTubeId(youtubeLinks[0].url)!} accent={accent} />

                {/* Reel strip for remaining */}
                {youtubeLinks.length > 1 && (
                  <VideoReelStrip links={youtubeLinks.slice(1)} accent={accent} />
                )}
              </div>
            )}

            {/* TikTok embeds */}
            {tiktokLinks.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 bg-black">
                    <span className="text-white text-[10px] font-bold">TT</span>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    TikTok
                  </p>
                </div>
                {tiktokLinks.map((link: any) => {
                  const vid = getTikTokId(link.url)!;
                  return (
                    <div key={link.id} className="rounded-2xl overflow-hidden">
                      <TikTokCard videoId={vid} />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Spotify */}
            {spotifyLinks.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-black text-[9px] font-bold">♪</span>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Music
                  </p>
                </div>
                {spotifyLinks.map((link: any) => (
                  <SpotifyCard key={link.id} embedUrl={getSpotifyEmbed(link.url)!} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Sticky footer branding ── */}
      <div
        className="fixed bottom-0 left-0 right-0 py-2.5 text-center text-[11px] z-30"
        style={{
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          color: 'rgba(255,255,255,0.4)',
        }}
      >
        Powered by{' '}
        <a
          href="https://link.merqato.digital"
          className="font-semibold"
          style={{ color: accent }}
        >
          link.merqato.digital
        </a>
        {' '}🇵🇭
      </div>
    </div>
  );
}
