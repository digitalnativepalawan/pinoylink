// @ts-nocheck
import { useState, useRef, useEffect } from 'react';
import { useAuthReady } from '@/hooks/useAuthReady';
import {
  updateProfile,
  uploadAvatar,
  uploadBgImage,
  uploadBgVideo,
  saveLinks,
  saveSocials,
  savePayments,
  loadProfileBundle,
} from '@/lib/profileApi';
import { 
  TEMPLATES, 
  SOCIAL_ICONS, 
  ACCENT_COLORS, 
  AVAILABLE_LINK_TYPES, 
  INITIAL_LINKS, 
  TRANSLATIONS,
  LinkItem
} from '../data';
import RisingSunSVG from './RisingSunSVG';
import DynamicLucideIcon, { AVAILABLE_LUCIDE_ICONS } from './DynamicLucideIcon';
import SocialBrandIcon from './SocialBrandIcon';
import { 
  Pencil, 
  Palette, 
  Eye, 
  BarChart2, 
  Settings, 
  Lock, 
  Plus, 
  Trash2, 
  GripVertical, 
  Share2, 
  Camera, 
  Check, 
  X, 
  DollarSign, 
  Upload, 
  Globe, 
  MapPin, 
  ExternalLink,
  Scissors,
  QrCode,
  Layers,
  TrendingUp,
  Type,
  Image as ImageIcon,
  Film,
  ChevronRight,
  Zap,
  Download,
  ImagePlus
} from 'lucide-react';
import html2canvas from 'html2canvas';

interface BuilderProps {
  lang: 'en' | 'tl';
  setLang: (lang: 'en' | 'tl') => void;
  fullName: string;
  setFullName: (name: string) => void;
  handle: string;
  selectedTemplate: string;
  setSelectedTemplate: (id: string) => void;
  onSignOut: () => void;
  isPro: boolean;
  setIsPro: (v: boolean) => void;
}

export default function Builder({
  lang,
  setLang,
  fullName,
  setFullName,
  handle,
  selectedTemplate,
  setSelectedTemplate,
  onSignOut,
  isPro,
  setIsPro
}: BuilderProps) {
  const t = TRANSLATIONS[lang];

  // Tab State: 'edit' | 'design' | 'preview' | 'analytics' | 'settings'
  const [activeTab, setActiveTab] = useState<'edit' | 'design' | 'preview' | 'analytics' | 'settings'>('edit');

  // Bio state with live character counter
  const [customBio, setCustomBio] = useState('');
  const bio = customBio || t.bioPlaceholder;
  const [location, setLocation] = useState(t.locationPlaceholder);

  // Avatar initials (auto-derived fallback when no photo is uploaded)
  const avatarInitials = (
    fullName ? fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'MS'
  );
  const customAvatarUploaded = false;

  // Uploaded profile photo (data URL) + hidden file input ref
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const avatarFileInputRef = useRef<HTMLInputElement | null>(null);

  // Background image from device — full-bleed wallpaper
  const [bgImageDataUrl, setBgImageDataUrl] = useState<string | null>(null);
  const [bgImageUploading, setBgImageUploading] = useState(false);
  const bgFileInputRef = useRef<HTMLInputElement | null>(null);

  // Background video (PRO) — uploaded file URL OR YouTube URL
  const [bgVideoUrl, setBgVideoUrl] = useState<string | null>(null);
  const [bgVideoUploading, setBgVideoUploading] = useState(false);
  const [youtubeInput, setYoutubeInput] = useState('');
  const bgVideoFileInputRef = useRef<HTMLInputElement | null>(null);

  // Ref for hero download
  const profileCardRef = useRef<HTMLDivElement | null>(null);

  const handleBgFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Show local data URL preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setBgImageDataUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
    setWallpaperStyle('image');
    // Upload to Supabase and replace data URL with public URL
    if (userId) {
      setBgImageUploading(true);
      try {
        const publicUrl = await uploadBgImage(userId, file);
        setBgImageDataUrl(publicUrl); // replaces data URL — auto-save will persist this
        triggerToast('Background saved ✓');
      } catch {
        triggerToast('Upload failed — using local preview');
      } finally {
        setBgImageUploading(false);
      }
    }
  };

  const handleBgVideoFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      triggerToast('Please select a video file');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      triggerToast('Video too large — max 25MB');
      return;
    }
    setWallpaperStyle('video');
    if (!userId) {
      triggerToast('Sign in required to upload video');
      return;
    }
    setBgVideoUploading(true);
    try {
      const publicUrl = await uploadBgVideo(userId, file);
      setBgVideoUrl(publicUrl);
      triggerToast('Background video saved ✓');
    } catch (err: any) {
      triggerToast(`Upload failed: ${err.message || 'unknown'}`);
    } finally {
      setBgVideoUploading(false);
    }
  };

  // Extract YouTube ID from any common URL form
  const getYoutubeId = (url: string): string | null => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/,
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return m[1];
    }
    if (/^[A-Za-z0-9_-]{11}$/.test(url.trim())) return url.trim();
    return null;
  };

  const applyYoutubeUrl = () => {
    const id = getYoutubeId(youtubeInput);
    if (!id) {
      triggerToast('Invalid YouTube URL');
      return;
    }
    const clean = `https://www.youtube.com/watch?v=${id}`;
    setBgVideoUrl(clean);
    setWallpaperStyle('video');
    triggerToast('YouTube background set ✓');
  };

  const handleAvatarFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      triggerToast("Please select a valid image file");
      return;
    }
    // Limit ~5MB
    if (file.size > 5 * 1024 * 1024) {
      triggerToast("Image too large — max 5MB");
      return;
    }

    // Local preview right away
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === 'string') setAvatarImage(result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';

    // Upload to Supabase storage and persist URL
    if (userId) {
      try {
        setSaveState('saving');
        const url = await uploadAvatar(userId, file);
        setAvatarImage(url);
        await updateProfile(userId, { avatar_url: url });
        setSaveState('saved');
        triggerToast("Profile photo uploaded!");
      } catch (err: any) {
        setSaveState('error');
        triggerToast(`Upload failed: ${err.message || 'unknown'}`);
      }
    } else {
      triggerToast("Profile photo uploaded!");
    }
  };

  const removeAvatarImage = () => {
    setAvatarImage(null);
    triggerToast("Profile photo removed");
  };

  // Hero Background custom override state (legacy — kept for renderLiveHeroBg fallback)
  const [bgOverrideType] = useState<'template' | 'solid' | 'uploaded' | 'preset'>('template');

  // Social Icons active state (holds array of active platform IDs)
  const [activeSocials, setActiveSocials] = useState<string[]>(
    SOCIAL_ICONS.filter(s => s.initialActive).map(s => s.id)
  );

  // Social URLs: Record<platformId, url string>
  const [socialUrls, setSocialUrls] = useState<Record<string, string>>({});
  // Which social row is currently expanded to show the URL input
  const [expandedSocial, setExpandedSocial] = useState<string | null>(null);
  // Temp edit value while the input is open
  const [socialUrlDraft, setSocialUrlDraft] = useState('');

  // Links List State
  const [links, setLinks] = useState<LinkItem[]>(INITIAL_LINKS);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkType, setNewLinkType] = useState(AVAILABLE_LINK_TYPES[0]);
  const [newLinkCustomIcon, setNewLinkCustomIcon] = useState('LinkIcon');
  const [showAddForm, setShowAddForm] = useState(false);

  // Payment Button State
  const [paymentEnabled, setPaymentEnabled] = useState(true);
  const [gcashNumber, setGcashNumber] = useState('0917-123-4567');
  const [mayaNumber, setMayaNumber] = useState('0918-987-6543');
  const [customPayLabel, setCustomPayLabel] = useState(t.sendPayment);
  const [qrUploaded, setQrUploaded] = useState(false);

  // Design Tab overrides
  const [selectedAccentHex, setSelectedAccentHex] = useState('#FCD116');
  // Available button styles: 'filled' | 'outline' | 'glass' | 'pill'
  const [buttonStyleOverride, setButtonStyleOverride] = useState<'filled' | 'outline' | 'glass' | 'pill'>('filled');
  const [tplFilter, setTplFilter] = useState<'all' | 'dark' | 'light' | 'vibrant'>('all');

  // Editorial color palette (5 controllable surfaces)
  const [colorBackground, setColorBackground] = useState('#0a0a0a');
  const [colorButtons, setColorButtons] = useState('#FCD116');
  const [colorButtonText, setColorButtonText] = useState('#000000');
  const [colorPageText, setColorPageText] = useState('#FFFFFF');
  const [colorTitleText, setColorTitleText] = useState('#FFFFFF');
  const [activeColorRow, setActiveColorRow] = useState<string | null>(null);

  // Layout — Classic (centered avatar) vs Hero (full-bleed banner)
  const [profileLayout, setProfileLayout] = useState<'classic' | 'hero'>('classic');

  // Wallpaper style — 6-tile editorial selector
  const [wallpaperStyle, setWallpaperStyle] = useState<'fill' | 'gradient' | 'blur' | 'pattern' | 'image' | 'video'>('fill');

  // Page font — full Bricolage / DM Sans / Syne / Lato / Inter / Manrope grid
  const [pageFont, setPageFont] = useState<string>('Bricolage Grotesque');
  const [showFontPicker, setShowFontPicker] = useState(false);

  // Quick tools modal panels (Edit tab)
  const [activeTool, setActiveTool] = useState<null | 'shorten' | 'qr' | 'channels' | 'stats'>(null);
  const [shortenInput, setShortenInput] = useState('');
  const [shortenedSlug, setShortenedSlug] = useState('');

  // Interactive Live Preview Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Notification / toast state
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // ─── Supabase persistence ─────────────────────────────────────────
  const { userId, isReady } = useAuthReady();
  const [hydrated, setHydrated] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Hydrate from DB on first ready
  useEffect(() => {
    if (!isReady || !userId || hydrated) return;
    let cancelled = false;
    (async () => {
      try {
        const bundle = await loadProfileBundle(userId);
        if (cancelled) return;
        const p = bundle.profile;
        if (p) {
          if (p.bio) setCustomBio(p.bio);
          if (p.location) setLocation(p.location);
          if (p.avatar_url) setAvatarImage(p.avatar_url);
          if (p.selected_template) setSelectedTemplate(p.selected_template);
          if (p.accent_color) setSelectedAccentHex(p.accent_color);
          if (p.full_name && !fullName) setFullName(p.full_name);
          // Design tab fields
          if (p.bg_image_url) setBgImageDataUrl(p.bg_image_url);
          if (p.bg_video_url) setBgVideoUrl(p.bg_video_url);
          if (p.wallpaper_style) setWallpaperStyle(p.wallpaper_style as any);
          if (p.profile_layout) setProfileLayout(p.profile_layout as any);
          if (p.button_shape) setButtonStyleOverride(p.button_shape as any);
          if (p.page_font) setPageFont(p.page_font);
          if (p.color_background) setColorBackground(p.color_background);
          if (p.color_buttons) setColorButtons(p.color_buttons);
          if (p.color_button_text) setColorButtonText(p.color_button_text);
          if (p.color_page_text) setColorPageText(p.color_page_text);
          if (p.color_title_text) setColorTitleText(p.color_title_text);
        }
        if (bundle.links.length > 0) {
          setLinks(
            bundle.links.map((r) => ({
              id: r.id,
              titleEN: r.title_en,
              titleTL: r.title_tl ?? r.title_en,
              url: r.url,
              type: r.type,
              enabled: r.enabled,
              iconColor: r.icon_color || '#ffffff',
              customIcon: r.custom_icon || undefined,
            }))
          );
        }
        if (bundle.socials.length > 0) {
          setActiveSocials(bundle.socials.map((s) => s.icon_id));
          const urlMap: Record<string, string> = {};
          bundle.socials.forEach((s) => {
            if (s.url) urlMap[s.icon_id] = s.url;
          });
          setSocialUrls(urlMap);
        }
        const gcash = bundle.payments.find((p) => p.provider === 'gcash');
        const maya = bundle.payments.find((p) => p.provider === 'maya');
        if (gcash?.custom_label) setCustomPayLabel(gcash.custom_label);
        if (gcash) setPaymentEnabled(gcash.enabled ?? true);
        if (gcash?.qr_image_url) setQrUploaded(true);
      } catch (err) {
        console.error('[Builder] hydrate failed', err);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isReady, userId, hydrated]);

  // Debounced auto-save: profile fields + all design tab settings
  useEffect(() => {
    if (!hydrated || !userId) return;
    setSaveState('saving');
    const h = setTimeout(async () => {
      try {
        await updateProfile(userId, {
          full_name: fullName || 'Anonymous',
          bio: customBio || null,
          location: location || null,
          selected_template: selectedTemplate,
          accent_color: selectedAccentHex,
          // Design tab
          bg_image_url: bgImageDataUrl || null,
          bg_video_url: bgVideoUrl || null,
          wallpaper_style: wallpaperStyle,
          profile_layout: profileLayout,
          button_shape: buttonStyleOverride,
          page_font: pageFont,
          color_background: colorBackground,
          color_buttons: colorButtons,
          color_button_text: colorButtonText,
          color_page_text: colorPageText,
          color_title_text: colorTitleText,
        });
        setSaveState('saved');
      } catch (e) {
        console.error('[Builder] profile save failed', e);
        setSaveState('error');
      }
    }, 600);
    return () => clearTimeout(h);
  }, [
    hydrated, userId,
    fullName, customBio, location, selectedTemplate, selectedAccentHex,
    bgImageDataUrl, bgVideoUrl, wallpaperStyle, profileLayout, buttonStyleOverride, pageFont,
    colorBackground, colorButtons, colorButtonText, colorPageText, colorTitleText,
  ]);

  // Debounced auto-save: links
  useEffect(() => {
    if (!hydrated || !userId) return;
    setSaveState('saving');
    const h = setTimeout(async () => {
      try {
        await saveLinks(userId, links);
        setSaveState('saved');
      } catch (e) {
        console.error('[Builder] links save failed', e);
        setSaveState('error');
      }
    }, 500);
    return () => clearTimeout(h);
  }, [hydrated, userId, links]);

  // Debounced auto-save: socials
  useEffect(() => {
    if (!hydrated || !userId) return;
    setSaveState('saving');
    const h = setTimeout(async () => {
      try {
        await saveSocials(userId, activeSocials, socialUrls);
        setSaveState('saved');
      } catch (e) {
        console.error('[Builder] socials save failed', e);
        setSaveState('error');
      }
    }, 500);
    return () => clearTimeout(h);
  }, [hydrated, userId, activeSocials, socialUrls]);

  // Debounced auto-save: payments
  useEffect(() => {
    if (!hydrated || !userId) return;
    setSaveState('saving');
    const h = setTimeout(async () => {
      try {
        const rows: any[] = [];
        if (paymentEnabled && gcashNumber) {
          rows.push({ provider: 'gcash', custom_label: customPayLabel, enabled: true });
        }
        if (paymentEnabled && mayaNumber) {
          rows.push({ provider: 'maya', custom_label: customPayLabel, enabled: true });
        }
        await savePayments(userId, rows);
        setSaveState('saved');
      } catch (e) {
        console.error('[Builder] payments save failed', e);
        setSaveState('error');
      }
    }, 600);
    return () => clearTimeout(h);
  }, [hydrated, userId, paymentEnabled, gcashNumber, mayaNumber, customPayLabel]);


  // Resolve current active template settings
  const currentTpl = TEMPLATES.find(t => t.id === selectedTemplate) || TEMPLATES[0];

  // Resolve active button styling inline helper
  const getButtonStyles = (styleType: 'filled' | 'outline' | 'glass' | 'pill', colorHex: string) => {
    switch (styleType) {
      case 'filled':
        return {
          backgroundColor: colorHex === '#ffffff' ? '#ffffff' : colorHex,
          color: colorHex === '#ffffff' || colorHex === '#FCD116' ? '#000000' : '#ffffff',
          border: 'none',
          borderRadius: '8px'
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: '#ffffff',
          border: `2px solid ${colorHex}`,
          borderRadius: '8px'
        };
      case 'glass':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          color: '#ffffff',
          border: `1px solid ${colorHex}`,
          borderRadius: '12px'
        };
      case 'pill':
        return {
          backgroundColor: colorHex,
          color: colorHex === '#ffffff' || colorHex === '#FCD116' ? '#000000' : '#ffffff',
          border: 'none',
          borderRadius: '999px'
        };
    }
  };

  // Toggle single social icon status
  const toggleSocialIcon = (id: string) => {
    if (activeSocials.includes(id)) {
      setActiveSocials(activeSocials.filter(i => i !== id));
    } else {
      setActiveSocials([...activeSocials, id]);
    }
  };

  // Toggle link status
  const toggleLinkEnabled = (linkId: string) => {
    setLinks(links.map(l => l.id === linkId ? { ...l, enabled: !l.enabled } : l));
  };

  // Delete link
  const deleteLink = (linkId: string) => {
    setLinks(links.filter(l => l.id !== linkId));
    triggerToast("Link removed successfully");
  };

  // Add new link handler
  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;

    // Apply strict check on 2 links for free tier
    if (links.length >= 2 && !isPro) {
      triggerToast("⭐ Free Tier Maxed! See PRO wall below to unlock unlimited links.");
      return;
    }

    const newItem: LinkItem = {
      id: `link-${Date.now()}`,
      titleEN: newLinkTitle,
      titleTL: newLinkTitle,
      url: newLinkUrl.startsWith('http') ? newLinkUrl : `https://${newLinkUrl}`,
      type: newLinkType,
      enabled: true,
      iconColor: selectedAccentHex,
      customIcon: newLinkCustomIcon
    };

    setLinks([...links, newItem]);
    setNewLinkTitle('');
    setNewLinkUrl('');
    setShowAddForm(false);
    triggerToast("New link added!");
  };

  // Compute live hero background using new wallpaper system + editorial palette
  const renderLiveHeroBg = () => {
    if (customAvatarUploaded) {
      return (
        <div className="absolute inset-0 z-0 bg-[#1c1c1c] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-40 bg-gradient-to-t from-black via-transparent to-black z-10" />
        </div>
      );
    }

    switch (wallpaperStyle) {
      case 'fill':
        return <div className="absolute inset-0 z-0" style={{ backgroundColor: colorBackground }} />;
      case 'gradient':
        return <div className="absolute inset-0 z-0" style={{ background: `linear-gradient(135deg, ${colorBackground} 0%, ${colorButtons} 100%)` }} />;
      case 'blur':
        return (
          <>
            <div className="absolute inset-0 z-0" style={{ background: `radial-gradient(circle at 30% 30%, ${colorButtons}aa, transparent 60%), radial-gradient(circle at 70% 70%, ${colorBackground}, ${colorBackground})` }} />
            <div className="absolute inset-0 z-0 backdrop-blur-2xl" />
          </>
        );
      case 'pattern':
        return (
          <div className="absolute inset-0 z-0" style={{
            backgroundColor: colorBackground,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }} />
        );
      case 'image':
        return bgImageDataUrl ? (
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `url(${bgImageDataUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-black/30" />
          </div>
        ) : (
          // No image yet — prompt the user
          <div
            className="absolute inset-0 z-0 flex flex-col items-center justify-center gap-2 cursor-pointer"
            style={{ background: colorBackground }}
            onClick={() => bgFileInputRef.current?.click()}
          >
            <ImagePlus className="w-8 h-8 text-white/30" />
            <span className="text-[11px] text-white/40">Tap to upload background</span>
          </div>
        );
      case 'video': {
        if (bgVideoUploading) {
          return (
            <div className="absolute inset-0 z-0 flex flex-col items-center justify-center gap-2" style={{ background: colorBackground }}>
              <Film className="w-8 h-8 text-white/30 animate-pulse" />
              <span className="text-[11px] text-white/50 font-mono">Uploading video…</span>
            </div>
          );
        }
        if (!bgVideoUrl) {
          return (
            <div
              className="absolute inset-0 z-0 flex flex-col items-center justify-center gap-2 cursor-pointer"
              style={{ background: colorBackground }}
              onClick={() => bgVideoFileInputRef.current?.click()}
            >
              <Film className="w-8 h-8 text-white/30" />
              <span className="text-[11px] text-white/40">Tap to upload video or paste YouTube URL</span>
            </div>
          );
        }
        const yt = getYoutubeId(bgVideoUrl);
        if (yt) {
          return (
            <div className="absolute inset-0 z-0 overflow-hidden">
              <iframe
                title="bg-video"
                className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ width: '177.78vh', height: '56.25vw', minWidth: '100%', minHeight: '100%' }}
                src={`https://www.youtube.com/embed/${yt}?autoplay=1&mute=1&loop=1&playlist=${yt}&controls=0&modestbranding=1&playsinline=1&rel=0`}
                allow="autoplay; encrypted-media; picture-in-picture"
                frameBorder={0}
              />
              <div className="absolute inset-0 bg-black/30" />
            </div>
          );
        }
        return (
          <div className="absolute inset-0 z-0 overflow-hidden">
            <video
              src={bgVideoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>
        );
      }
      default:
        return <div className="absolute inset-0 z-0" style={{ backgroundColor: colorBackground }} />;
    }
  };

  return (
    <div className="w-full max-w-[390px] mx-auto min-h-screen flex flex-col bg-[#0a0a0a] text-white relative border-x border-white/5 shadow-2xl pb-24 font-sans">
      
      {/* Toast Helper */}
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white text-black font-bold text-xs py-2 px-4 rounded-full shadow-2xl animate-bounce border border-[#FCD116]">
          {toastMsg}
        </div>
      )}

      {/* Save indicator */}
      {saveState !== 'idle' && (
        <div className="fixed top-3 right-3 z-50 text-[10px] font-mono px-2 py-1 rounded-full border border-white/10 bg-black/70 backdrop-blur">
          {saveState === 'saving' && <span className="text-white/70">Saving…</span>}
          {saveState === 'saved' && <span className="text-emerald-400">✓ Saved</span>}
          {saveState === 'error' && <span className="text-rose-400">⚠ Save failed</span>}
        </div>
      )}

      {/* TOP BAR */}
      <div className="flex items-center justify-between p-4 bg-surface-1 border-b border-white/10 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <span className="text-lg font-display font-black tracking-tight">
            <span className="text-white">pinoy</span>
            <span className="text-[#FCD116]">.</span>
            <span className="text-white">digital</span>
          </span>
          <span className="bg-white/10 text-white/50 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">
            PROTOTYPE
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* DEV: PRO Plan toggle — preview locked features */}
          <button
            type="button"
            onClick={() => {
              setIsPro(!isPro);
              triggerToast(!isPro ? '⚡ PRO unlocked — every feature live' : 'Switched to FREE plan');
            }}
            title="Toggle PRO plan (dev)"
            className={`flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-bold font-mono cursor-pointer transition-all ${
              isPro
                ? 'bg-[#FCD116] text-black border-[#FCD116] shadow-[0_0_12px_rgba(252,209,22,0.5)]'
                : 'bg-surface-2 text-white/50 border-white/10 hover:text-white hover:border-white/30'
            }`}
          >
            <Zap className={`w-3 h-3 ${isPro ? 'fill-black' : ''}`} strokeWidth={isPro ? 0 : 2} />
            <span>PRO</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${isPro ? 'bg-black' : 'bg-white/20'}`}
            />
          </button>

          {/* EN/FIL Toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'tl' : 'en')}
            className="flex items-center gap-1 bg-surface-2 hover:bg-surface-3 transition-colors px-2.5 py-1 rounded-full border border-white/10 text-[11px] font-bold cursor-pointer"
          >
            <Globe className="w-3 h-3 text-[#FCD116]" />
            <span className={lang === 'en' ? 'text-white font-black' : 'text-white/40'}>EN</span>
            <span className="text-white/20">|</span>
            <span className={lang === 'tl' ? 'text-white font-black' : 'text-white/40'}>FIL</span>
          </button>
        </div>
      </div>

      {/* SEGMENTED CONTROL */}
      <div className="px-3 pt-3 bg-surface-1">
        <div className="flex items-center bg-surface-2 rounded-xl p-1 border border-white/10">
          {(['edit', 'design', 'preview', 'analytics'] as const).map((tab) => {
            const isActive = activeTab === tab;
            const isLocked = tab === 'analytics' && !isPro;

            return (
              <button
                key={tab}
                onClick={() => {
                  if (isLocked) {
                    triggerToast("🔒 Analytics requires the ₱149/mo PRO tier!");
                  } else {
                    setActiveTab(tab);
                  }
                }}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition-all capitalize cursor-pointer ${
                  isActive 
                    ? 'bg-white text-black shadow-md' 
                    : isLocked 
                    ? 'text-white/20 hover:text-white/30' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {isLocked && <Lock className="w-2.5 h-2.5 inline shrink-0" />}
                <span>{tab === 'edit' ? t.edit : tab === 'design' ? t.design : tab === 'preview' ? t.preview : t.analytics}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN BUILDER PANELS */}
      <div className="flex-1 p-4 overflow-y-auto">

        {/* --------------------------------------------- */}
        {/* TAB 1: EDIT TAB                               */}
        {/* --------------------------------------------- */}
        {activeTab === 'edit' && (
          <div className="space-y-6 animate-fadeIn text-left">
            
            {/* Profile Info Section */}
            <div className="bg-surface-1 p-4 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#FCD116]">
                  👤 Profile Details
                </span>
                <span className="text-[10px] text-white/40 font-mono">Live Syncing</span>
              </div>

              {/* Avatar upload — real file picker */}
              <div className="flex items-start gap-4">

                {/* Hidden file input — triggered by tapping the circle or "+" badge */}
                <input
                  ref={avatarFileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/gif"
                  onChange={handleAvatarFileSelected}
                  className="hidden"
                />

                {/* Hidden background image file input */}
                <input
                  ref={bgFileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleBgFileSelected}
                  className="hidden"
                />

                <div
                  onClick={() => avatarFileInputRef.current?.click()}
                  className="relative w-[68px] h-[68px] rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-pink-500 flex items-center justify-center font-display text-xl font-bold text-white cursor-pointer group shrink-0 border-2 border-white/20 shadow-lg overflow-hidden"
                  title="Tap to upload a photo from your device"
                >
                  {avatarImage ? (
                    <img
                      src={avatarImage}
                      alt="Profile"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <span className="select-none">{avatarInitials}</span>
                  )}

                  {/* Hover overlay: camera icon */}
                  <div className="absolute inset-0 bg-black/55 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-5 h-5 text-white" />
                  </div>

                  {/* Bottom-right "+" badge — also opens file picker */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      avatarFileInputRef.current?.click();
                    }}
                    className="absolute -bottom-1 -right-1 bg-[#FCD116] text-black rounded-full p-0.5 shadow-md hover:scale-110 transition-transform cursor-pointer"
                    title="Upload photo"
                  >
                    <Plus className="w-3 h-3 stroke-[3]" />
                  </button>
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="text-sm font-bold text-white leading-tight">Profile photo</div>
                  <p className="text-[11px] text-white/55 leading-snug">
                    Tap the circle to upload a photo from your device.
                  </p>

                  {avatarImage && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => avatarFileInputRef.current?.click()}
                        className="text-[10px] font-mono text-white/70 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer transition-colors"
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        onClick={removeAvatarImage}
                        className="text-[10px] font-mono text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-0.5 rounded cursor-pointer transition-colors flex items-center gap-1"
                      >
                        <X className="w-2.5 h-2.5 stroke-[3]" /> Remove
                      </button>
                    </div>
                  )}

                  <div className="text-[10px] text-white/30 pt-1">
                    Hero & page backgrounds → Design tab
                  </div>
                </div>
              </div>

              {/* Name Field */}
              <div>
                <label className="block text-[11px] font-medium text-muted uppercase tracking-wider mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-surface-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FCD116] transition-colors"
                  placeholder="Your Name"
                />
              </div>

              {/* Bio Field with 80 chars counter */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-medium text-muted uppercase tracking-wider">
                    Bio / Tagline
                  </label>
                  <span className={`text-[10px] font-mono font-bold ${bio.length > 80 ? 'text-rose-400 animate-pulse' : 'text-white/40'}`}>
                    {bio.length} / 80 chars
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setCustomBio(e.target.value.slice(0, 100))}
                  className="w-full bg-surface-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FCD116] transition-colors resize-none"
                  placeholder="Say something engaging..."
                />
              </div>

              {/* Location Field */}
              <div>
                <label className="block text-[11px] font-medium text-muted uppercase tracking-wider mb-1">
                  Location Pin
                </label>
                <div className="relative flex items-center bg-surface-2 rounded-xl border border-white/10 px-3 py-2">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-transparent text-xs text-white focus:outline-none"
                    placeholder="Palawan, Philippines"
                  />
                </div>
              </div>

            </div>

            {/* ==================================================== */}
            {/* QUICK TOOLS — editorial card grid (Linktree-inspired) */}
            {/* ==================================================== */}
            <div className="bg-surface-1 p-4 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#FCD116]">
                  Quick Tools
                </span>
                <span className="text-[10px] text-white/40 font-mono">Tap to launch</span>
              </div>

              <p className="text-[11px] text-secondary font-light">
                {lang === 'en' 
                  ? 'Power utilities for growing your bio: shorten links, generate QRs, manage channels, and watch live stats.'
                  : 'Mga makapangyarihang gamit para sa iyong bio: i-shorten ang links, gumawa ng QR, at higit pa.'}
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                {/* TILE 1 — Shorten link */}
                <button
                  type="button"
                  onClick={() => setActiveTool('shorten')}
                  className="relative aspect-[1.15] rounded-2xl p-3 text-left flex flex-col justify-between cursor-pointer overflow-hidden border border-white/5 hover:scale-[1.02] active:scale-[0.98] transition-transform"
                  style={{ background: 'linear-gradient(135deg, #d3f37a 0%, #a3d11f 100%)' }}
                >
                  <div className="flex items-start justify-between">
                    <Scissors className="w-5 h-5 text-black" strokeWidth={2.5} />
                    <span className="text-[8px] font-mono font-bold bg-black/20 text-black px-1.5 py-0.5 rounded">FREE</span>
                  </div>
                  <div>
                    <div className="text-xs font-display font-extrabold text-black leading-tight">
                      {lang === 'en' ? 'Shorten link' : 'I-shorten'}
                    </div>
                    <div className="text-[10px] font-light text-black/70 mt-0.5 leading-tight">
                      {lang === 'en' ? 'pdig.li/yourslug' : 'pdig.li/iyongslug'}
                    </div>
                  </div>
                </button>

                {/* TILE 2 — QR code */}
                <button
                  type="button"
                  onClick={() => setActiveTool('qr')}
                  className="relative aspect-[1.15] rounded-2xl p-3 text-left flex flex-col justify-between cursor-pointer overflow-hidden border border-white/5 hover:scale-[1.02] active:scale-[0.98] transition-transform"
                  style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #c2410c 100%)' }}
                >
                  <div className="flex items-start justify-between">
                    <QrCode className="w-5 h-5 text-white" strokeWidth={2.5} />
                    <span className="text-[8px] font-mono font-bold bg-black/20 text-white px-1.5 py-0.5 rounded">FREE</span>
                  </div>
                  <div>
                    <div className="text-xs font-display font-extrabold text-white leading-tight">
                      {lang === 'en' ? 'Generate QR' : 'Gumawa ng QR'}
                    </div>
                    <div className="text-[10px] font-light text-white/80 mt-0.5 leading-tight">
                      {lang === 'en' ? 'Print, share, scan' : 'Print, share, scan'}
                    </div>
                  </div>
                </button>

                {/* TILE 3 — Channels */}
                <button
                  type="button"
                  onClick={() => setActiveTool('channels')}
                  className="relative aspect-[1.15] rounded-2xl p-3 text-left flex flex-col justify-between cursor-pointer overflow-hidden border border-white/5 hover:scale-[1.02] active:scale-[0.98] transition-transform"
                  style={{ background: 'linear-gradient(135deg, #525252 0%, #1f1f1f 100%)' }}
                >
                  <div className="flex items-start justify-between">
                    <Layers className="w-5 h-5 text-white" strokeWidth={2.5} />
                    <span className="text-[8px] font-mono font-bold bg-white/20 text-white px-1.5 py-0.5 rounded">{activeSocials.length} ON</span>
                  </div>
                  <div>
                    <div className="text-xs font-display font-extrabold text-white leading-tight">
                      {lang === 'en' ? 'Channels' : 'Mga Channel'}
                    </div>
                    <div className="text-[10px] font-light text-white/70 mt-0.5 leading-tight">
                      {lang === 'en' ? 'Per-platform links' : 'Bawat platform'}
                    </div>
                  </div>
                </button>

                {/* TILE 4 — Stats */}
                <button
                  type="button"
                  onClick={() => setActiveTool('stats')}
                  className="relative aspect-[1.15] rounded-2xl p-3 text-left flex flex-col justify-between cursor-pointer overflow-hidden border border-white/5 hover:scale-[1.02] active:scale-[0.98] transition-transform"
                  style={{ background: 'linear-gradient(135deg, #f0abfc 0%, #c026d3 100%)' }}
                >
                  <div className="flex items-start justify-between">
                    <TrendingUp className="w-5 h-5 text-white" strokeWidth={2.5} />
                    <span className="text-[8px] font-mono font-bold bg-black/30 text-white px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      {isPro
                        ? <><Zap className="w-2 h-2 fill-white" strokeWidth={0} /> ON</>
                        : <><Lock className="w-2 h-2" /> PRO</>}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-display font-extrabold text-white leading-tight">
                      {lang === 'en' ? 'Live stats' : 'Live stats'}
                    </div>
                    <div className="text-[10px] font-light text-white/80 mt-0.5 leading-tight">
                      {lang === 'en' ? 'Clicks, sources, peaks' : 'Clicks, source, peak'}
                    </div>
                  </div>
                </button>
              </div>

              {/* Active Tool Inline Panels */}
              {activeTool === 'shorten' && (
                <div className="bg-surface-2 rounded-xl p-3 border border-[#FCD116]/30 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#FCD116] flex items-center gap-1.5">
                      <Scissors className="w-3 h-3" /> Link Shortener
                    </span>
                    <button onClick={() => { setActiveTool(null); setShortenedSlug(''); setShortenInput(''); }} className="text-white/40 hover:text-white cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <input
                    type="url"
                    value={shortenInput}
                    onChange={(e) => setShortenInput(e.target.value)}
                    placeholder="https://your-very-long-url-here.com/article/2025"
                    className="w-full bg-surface-3 border border-white/10 rounded px-2.5 py-2 text-[11px] font-mono text-white placeholder-white/25 focus:outline-none focus:border-[#FCD116]"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      if (!shortenInput.trim()) { triggerToast('Paste a URL first'); return; }
                      const slug = Math.random().toString(36).slice(2, 7);
                      setShortenedSlug(slug);
                      triggerToast('Short link created!');
                    }}
                    className="w-full bg-[#FCD116] text-black font-bold text-xs py-2 rounded cursor-pointer hover:bg-white transition-colors"
                  >
                    Shorten
                  </button>

                  {shortenedSlug && (
                    <div className="bg-[#0a0a0a] border border-emerald-500/30 rounded-lg p-2.5 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[9px] uppercase font-mono text-emerald-400 font-bold">Live short link</div>
                        <div className="text-xs font-mono font-bold text-white truncate">pdig.li/{shortenedSlug}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => { navigator.clipboard?.writeText(`https://pdig.li/${shortenedSlug}`); triggerToast('Copied!'); }}
                        className="shrink-0 bg-white/10 hover:bg-white hover:text-black text-white text-[10px] px-2.5 py-1 rounded font-mono font-bold cursor-pointer transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTool === 'qr' && (
                <div className="bg-surface-2 rounded-xl p-3 border border-[#FCD116]/30 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#FCD116] flex items-center gap-1.5">
                      <QrCode className="w-3 h-3" /> Profile QR Code
                    </span>
                    <button onClick={() => setActiveTool(null)} className="text-white/40 hover:text-white cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="bg-white rounded-xl p-3 flex flex-col items-center gap-2">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=4&data=${encodeURIComponent('https://link.merqato.digital/' + (handle || 'mariasantos'))}`}
                      alt="QR for your bio link"
                      className="w-40 h-40 rounded"
                    />
                    <div className="text-[10px] font-mono text-black/60 text-center">
                      link.merqato.digital/<span className="font-bold text-black">{handle || 'mariasantos'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        const el = profileCardRef.current;
                        if (!el) { triggerToast('Preview not ready'); return; }
                        triggerToast('Generating image…');
                        try {
                          const canvas = await html2canvas(el, {
                            useCORS: true,
                            allowTaint: true,
                            scale: 2,
                            backgroundColor: null,
                          });
                          const link = document.createElement('a');
                          link.download = `${handle || 'profile'}-hero.png`;
                          link.href = canvas.toDataURL('image/png');
                          link.click();
                          triggerToast('Hero card downloaded! ✓');
                        } catch {
                          triggerToast('Download failed — try again');
                        }
                      }}
                      className="bg-white/10 hover:bg-white hover:text-black text-white text-[10px] py-2 rounded font-mono font-bold cursor-pointer transition-colors flex items-center justify-center gap-1"
                    >
                      <Download className="w-3 h-3" /> Download PNG
                    </button>
                    <button
                      type="button"
                      onClick={() => { navigator.clipboard?.writeText(`https://link.merqato.digital/${handle || 'mariasantos'}`); triggerToast('URL copied!'); }}
                      className="bg-[#FCD116] text-black text-[10px] py-2 rounded font-mono font-bold cursor-pointer hover:bg-white transition-colors"
                    >
                      Copy URL
                    </button>
                  </div>
                </div>
              )}

              {activeTool === 'channels' && (
                <div className="bg-surface-2 rounded-xl p-3 border border-[#FCD116]/30 space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#FCD116] flex items-center gap-1.5">
                      <Layers className="w-3 h-3" /> Active Channels
                    </span>
                    <button onClick={() => setActiveTool(null)} className="text-white/40 hover:text-white cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-white/50">
                    Tap a channel below to scroll to its row in the social list and add a URL.
                  </p>
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {SOCIAL_ICONS.filter(s => activeSocials.includes(s.id)).map(s => (
                      <div key={s.id} className="bg-[#0a0a0a] rounded p-1.5 flex items-center gap-1.5 border border-white/5">
                        <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                        <span className="text-[9px] truncate">{s.name}</span>
                      </div>
                    ))}
                    {activeSocials.length === 0 && (
                      <div className="col-span-3 text-center py-2 text-[10px] text-white/30 italic">No channels active yet.</div>
                    )}
                  </div>
                </div>
              )}

              {activeTool === 'stats' && (
                <div className="bg-surface-2 rounded-xl p-3 border border-[#FCD116]/30 space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#FCD116] flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3" /> Live Stats {isPro
                        ? <span className="text-emerald-400 font-mono text-[9px] flex items-center gap-0.5"><Zap className="w-2 h-2 fill-emerald-400" strokeWidth={0} /> PRO</span>
                        : <Lock className="w-2.5 h-2.5 text-white/40" />}
                    </span>
                    <button onClick={() => setActiveTool(null)} className="text-white/40 hover:text-white cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className={`space-y-1.5 ${isPro ? '' : 'filter blur-[2px] opacity-50 select-none pointer-events-none'}`}>
                    <div className="flex justify-between text-[10px] font-mono"><span>Visits today</span><span className="font-bold text-emerald-400">2,481</span></div>
                    <div className="flex justify-between text-[10px] font-mono"><span>Unique visitors</span><span className="font-bold text-emerald-400">1,907</span></div>
                    <div className="h-1.5 bg-white/10 rounded overflow-hidden"><div className="w-3/4 h-full bg-gradient-to-r from-emerald-500 to-[#FCD116]" /></div>
                    <div className="flex justify-between text-[10px] font-mono"><span>Top channel</span><span className="font-bold text-white">TikTok 38%</span></div>
                  </div>
                  {!isPro && (
                    <button
                      type="button"
                      onClick={() => { setIsPro(true); triggerToast('⚡ PRO unlocked'); }}
                      className="w-full bg-[#FCD116] text-black font-bold text-[11px] py-2 rounded cursor-pointer hover:bg-white"
                    >
                      Unlock for ₱149/mo
                    </button>
                  )}
                </div>
              )}

            </div>

            {/* Social Icons Section */}
            <div className="bg-surface-1 p-4 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#FCD116]">
                  {t.socialLabel}
                </span>
                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded font-mono text-white/60">
                  {activeSocials.length} Active
                </span>
              </div>

              {/* Vertical list — one platform per row */}
              <div className="space-y-0.5">
                {SOCIAL_ICONS.map((item) => {
                  const isActive = activeSocials.includes(item.id);
                  const savedUrl = socialUrls[item.id] || '';
                  const isExpanded = expandedSocial === item.id;

                  return (
                    <div key={item.id} className="rounded-xl overflow-hidden">

                      {/* Main row */}
                      <div
                        className={`flex items-center gap-3 px-2 py-2.5 transition-colors ${
                          isActive ? 'bg-surface-2' : 'bg-surface-2/40'
                        }`}
                      >
                        {/* LEFT: brand circle — tap to toggle on/off */}
                        <button
                          type="button"
                          aria-label={`${isActive ? 'Remove' : 'Add'} ${item.name}`}
                          onClick={() => {
                            toggleSocialIcon(item.id);
                            triggerToast(`${isActive ? 'Removed' : 'Added'} ${item.name}`);
                          }}
                          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer focus:outline-none"
                          style={{
                            backgroundColor: isActive ? item.color : 'rgba(255,255,255,0.07)',
                          }}
                        >
                          <SocialBrandIcon
                            id={item.id}
                            className="w-4 h-4"
                            color={isActive ? '#ffffff' : 'rgba(255,255,255,0.3)'}
                          />
                        </button>

                        {/* MIDDLE: platform name */}
                        <span
                          className={`flex-1 min-w-0 text-xs font-medium truncate select-none ${
                            isActive ? 'text-white' : 'text-white/35'
                          }`}
                        >
                          {item.name}
                        </span>

                        {/* RIGHT: url pill / "add url" / "off" — tap to expand input */}
                        <button
                          type="button"
                          onClick={() => {
                            if (!isActive) return;
                            if (isExpanded) {
                              setExpandedSocial(null);
                            } else {
                              setExpandedSocial(item.id);
                              setSocialUrlDraft(savedUrl);
                            }
                          }}
                          className={`shrink-0 flex items-center gap-1 text-[10px] font-mono rounded px-2 py-0.5 transition-all cursor-pointer ${
                            !isActive
                              ? 'text-white/20 cursor-default'
                              : savedUrl
                              ? 'text-white/60 bg-white/5 hover:bg-white/10 max-w-[90px]'
                              : 'text-[#FCD116] bg-[#FCD116]/10 hover:bg-[#FCD116]/20'
                          }`}
                        >
                          {!isActive ? (
                            <span>off</span>
                          ) : savedUrl ? (
                            <span className="truncate max-w-[80px]">{savedUrl.replace(/^https?:\/\//, '')}</span>
                          ) : (
                            <span>add url →</span>
                          )}
                        </button>
                      </div>

                      {/* Inline URL input — expands below the row */}
                      {isExpanded && isActive && (
                        <div className="bg-[#1a1a1a] border-t border-white/5 px-2 py-2.5 flex items-center gap-2">
                          {/* Mini brand icon repeated for context */}
                          <div
                            className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center"
                            style={{ backgroundColor: item.color }}
                          >
                            <SocialBrandIcon id={item.id} className="w-3 h-3" color="#fff" />
                          </div>

                          {/* URL input */}
                          <input
                            type="url"
                            autoFocus
                            value={socialUrlDraft}
                            onChange={(e) => setSocialUrlDraft(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                setSocialUrls(prev => ({ ...prev, [item.id]: socialUrlDraft.trim() }));
                                setExpandedSocial(null);
                                triggerToast(`${item.name} URL saved!`);
                              }
                              if (e.key === 'Escape') setExpandedSocial(null);
                            }}
                            placeholder={item.urlPlaceholder}
                            className="flex-1 min-w-0 bg-transparent text-[11px] font-mono text-white placeholder-white/25 focus:outline-none"
                          />

                          {/* Gold save checkmark */}
                          <button
                            type="button"
                            onClick={() => {
                              setSocialUrls(prev => ({ ...prev, [item.id]: socialUrlDraft.trim() }));
                              setExpandedSocial(null);
                              triggerToast(`${item.name} URL saved!`);
                            }}
                            className="shrink-0 w-6 h-6 rounded-full bg-[#FCD116] flex items-center justify-center cursor-pointer hover:bg-white transition-colors"
                          >
                            <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
                          </button>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            </div>

            {/* Links Section */}
            <div className="bg-surface-1 p-4 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#FCD116]">
                  🔗 {t.linksLabel}
                </span>
                
                {/* Tier badge — flips to PRO when active */}
                {isPro ? (
                  <span className="bg-[#FCD116]/20 text-[#FCD116] border border-[#FCD116]/40 text-[10px] font-bold font-mono px-2 py-0.5 rounded flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5 fill-[#FCD116]" strokeWidth={0} /> PRO • {links.length} active • unlimited
                  </span>
                ) : (
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold font-mono px-2 py-0.5 rounded">
                    FREE ({links.length} / 2 used)
                  </span>
                )}
              </div>

              {/* Two existing link rows rendering */}
              <div className="space-y-2.5">
                {links.map((link) => (
                  <div 
                    key={link.id} 
                    className={`flex items-center gap-2 bg-surface-2 p-2.5 rounded-xl border transition-all ${
                      link.enabled ? 'border-white/15 opacity-100' : 'border-white/5 opacity-40'
                    }`}
                  >
                    <GripVertical className="w-4 h-4 text-white/20 shrink-0 cursor-grab" />
                    
                    {/* Icon circle colored per type 38px */}
                    <div 
                      className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-inner"
                      style={{ backgroundColor: link.iconColor || '#FCD116', color: '#000' }}
                    >
                      <DynamicLucideIcon name={link.customIcon || 'LinkIcon'} className="w-4 h-4 text-black" />
                    </div>

                    <div className="flex-1 min-w-0 pr-1">
                      <div className="text-xs font-bold text-white truncate">
                        {lang === 'en' ? link.titleEN : link.titleTL}
                      </div>
                      <div className="text-[10px] text-white/40 truncate font-mono">
                        {link.type} • {link.url.replace('https://', '')}
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => {
                        toggleLinkEnabled(link.id);
                        triggerToast(`Link ${link.enabled ? 'disabled' : 'enabled'}`);
                      }}
                      className={`w-10 h-6 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                        link.enabled ? 'bg-[#FCD116]' : 'bg-white/20'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-black transition-transform ${
                        link.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>

                    {/* Delete Icon */}
                    <button
                      type="button"
                      onClick={() => deleteLink(link.id)}
                      className="text-white/30 hover:text-rose-400 p-1 cursor-pointer transition-colors shrink-0"
                      title="Remove Link"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                
                {links.length === 0 && (
                  <div className="text-center py-4 text-xs text-white/30 italic">
                    No links configured. Tap "Add a link" below to place items.
                  </div>
                )}
              </div>

              {/* Add Link Row Trigger / Form */}
              {showAddForm ? (
                <form onSubmit={handleCreateLink} className="bg-surface-2 p-3 rounded-xl border border-dashed border-[#FCD116] space-y-3">
                  <div className="text-xs font-bold text-[#FCD116]">➕ Configure New Link Item</div>
                  
                  <div>
                    <label className="block text-[10px] uppercase text-white/50 mb-1">Link Type</label>
                    <select
                      value={newLinkType}
                      onChange={(e) => setNewLinkType(e.target.value)}
                      className="w-full bg-surface-3 border border-white/10 rounded px-2 py-1 text-xs text-white"
                    >
                      {AVAILABLE_LINK_TYPES.map(typeOpt => (
                        <option key={typeOpt} value={typeOpt} className="bg-[#111] text-white">
                          {typeOpt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-white/50 mb-1">Lucide Icon Asset</label>
                    <select
                      value={newLinkCustomIcon}
                      onChange={(e) => setNewLinkCustomIcon(e.target.value)}
                      className="w-full bg-surface-3 border border-white/10 rounded px-2 py-1 text-xs text-white"
                    >
                      {AVAILABLE_LUCIDE_ICONS.map(iObj => (
                        <option key={iObj.name} value={iObj.name} className="bg-[#111] text-white">
                          {iObj.label} ({iObj.name})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-white/50 mb-1">Display Title</label>
                    <input
                      type="text"
                      required
                      value={newLinkTitle}
                      onChange={(e) => setNewLinkTitle(e.target.value)}
                      placeholder="e.g. 🔥 Watch my Viral TikTok"
                      className="w-full bg-surface-3 border border-white/10 rounded px-2 py-1 text-xs text-white"
                    >
                    </input>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-white/50 mb-1">Target URL</label>
                    <input
                      type="text"
                      required
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                      placeholder="tiktok.com/@maria.ph"
                      className="w-full bg-surface-3 border border-white/10 rounded px-2 py-1 text-xs text-white font-mono"
                    >
                    </input>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 bg-surface-3 hover:bg-surface-1 text-white text-xs py-1.5 rounded cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-[#FCD116] text-black font-bold text-xs py-1.5 rounded cursor-pointer shadow-md"
                    >
                      Save Link
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (links.length >= 2 && !isPro) {
                      triggerToast("⭐ Free Tier Maxed! See PRO wall below to unlock unlimited links.");
                    } else {
                      setShowAddForm(true);
                    }
                  }}
                  className="w-full border border-dashed border-white/20 hover:border-[#FCD116] text-white/80 hover:text-[#FCD116] transition-colors rounded-xl py-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer bg-surface-2/50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.addLink}</span>
                </button>
              )}

              {/* PRO WALL — only when not PRO. When PRO, show an active confirmation banner. */}
              {!isPro ? (
                <div className="bg-gradient-to-br from-[#1a1600] to-[#2a2400] rounded-xl p-4 border border-[#FCD116]/30 space-y-2 mt-4 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-[#FCD116] font-display font-bold text-sm">
                    <Lock className="w-4 h-4" />
                    <span>{t.proWallUnlock}</span>
                  </div>
                  <p className="text-[11px] text-white/80 leading-relaxed font-light">
                    {t.proWallSub}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPro(true);
                      triggerToast("⚡ PRO unlocked — every feature live");
                    }}
                    className="w-full bg-[#FCD116] text-black hover:bg-white transition-all py-2.5 rounded-lg font-bold text-xs mt-2 cursor-pointer uppercase tracking-wider shadow-[0_2px_10px_rgba(252,209,22,0.4)]"
                  >
                    {t.goPro}
                  </button>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-[#1a1600] to-[#2a2400] rounded-xl p-3 border border-[#FCD116]/40 flex items-center gap-2 mt-4">
                  <div className="w-7 h-7 rounded-full bg-[#FCD116] flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-black fill-black" strokeWidth={0} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-display font-bold text-[#FCD116]">PRO active</div>
                    <div className="text-[10px] text-white/70 leading-tight">Unlimited links, fonts, wallpapers & live analytics.</div>
                  </div>
                </div>
              )}

            </div>

            {/* Payment Button Section */}
            <div className="bg-surface-1 p-4 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#FCD116]">
                  💸 {t.paymentLabel}
                </span>
                
                {/* On toggle switch */}
                <button
                  type="button"
                  onClick={() => {
                    setPaymentEnabled(!paymentEnabled);
                    triggerToast(`Payment widget ${!paymentEnabled ? 'enabled' : 'disabled'}`);
                  }}
                  className={`w-10 h-6 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                    paymentEnabled ? 'bg-emerald-500' : 'bg-white/20'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    paymentEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <p className="text-[11px] text-secondary font-light">
                Allows your visitors to send money or scan QR codes instantly directly from the bio panel.
              </p>

              {/* Expandable sub-options */}
              {paymentEnabled && (
                <div className="space-y-3 pt-2 border-t border-white/5 animate-fadeIn">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">
                      GCash Mobile Number
                    </label>
                    <input
                      type="text"
                      value={gcashNumber}
                      onChange={(e) => setGcashNumber(e.target.value)}
                      className="w-full bg-surface-2 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-mono text-white"
                      placeholder="0917-XXX-XXXX"
                    />
                    <span className="text-[9px] text-emerald-400 block mt-0.5 pl-1">✓ Live masked on external preview</span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">
                      Maya Mobile Number
                    </label>
                    <input
                      type="text"
                      value={mayaNumber}
                      onChange={(e) => setMayaNumber(e.target.value)}
                      className="w-full bg-surface-2 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-mono text-white"
                      placeholder="0918-XXX-XXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">
                      {t.customLabel}
                    </label>
                    <input
                      type="text"
                      value={customPayLabel}
                      onChange={(e) => setCustomPayLabel(e.target.value)}
                      className="w-full bg-surface-2 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-white"
                      placeholder="Send me a payment"
                    />
                  </div>

                  {/* Upload QR image mock */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">
                      QR Code Graphic
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setQrUploaded(!qrUploaded);
                        triggerToast(qrUploaded ? "QR cleared" : "Simulated QR code graphic uploaded successfully!");
                      }}
                      className={`w-full text-left p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                        qrUploaded ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300' : 'bg-surface-2 border-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      <span className="truncate">
                        {qrUploaded ? "📸 my-gcash-qr-ready.png (Active)" : "📁 Tap to upload mock QR from camera roll"}
                      </span>
                      <Upload className="w-3.5 h-3.5 shrink-0 ml-1 text-[#FCD116]" />
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}


        {/* --------------------------------------------- */}
        {/* TAB 2: DESIGN TAB                             */}
        {/* --------------------------------------------- */}
        {activeTab === 'design' && (
          <div className="space-y-6 animate-fadeIn text-left">
            
            {/* Template Switcher */}
            <div className="bg-surface-1 p-4 rounded-2xl border border-white/10 space-y-3 overflow-hidden">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono uppercase tracking-wider font-bold text-[#FCD116]">
                  Signature Templates
                </label>
                <span className="text-[10px] text-white/40 font-mono">
                  {tplFilter === 'all' ? TEMPLATES.length : TEMPLATES.filter(t => t.category === tplFilter).length} designs
                </span>
              </div>

              {/* Category filter pills */}
              <div className="flex gap-1.5 flex-wrap">
                {(['all', 'dark', 'light', 'vibrant'] as const).map((cat) => {
                  const counts = {
                    all: TEMPLATES.length,
                    dark: TEMPLATES.filter(t => t.category === 'dark').length,
                    light: TEMPLATES.filter(t => t.category === 'light').length,
                    vibrant: TEMPLATES.filter(t => t.category === 'vibrant').length,
                  };
                  const labels = { all: 'All', dark: '🌙 Dark', light: '☀️ Light', vibrant: '⚡ Vibrant' };
                  const isActive = tplFilter === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setTplFilter(cat)}
                      className="px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all"
                      style={{
                        background: isActive ? '#FCD116' : 'rgba(255,255,255,0.07)',
                        color: isActive ? '#000' : 'rgba(255,255,255,0.55)',
                        border: isActive ? '1px solid #FCD116' : '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      {labels[cat]} <span style={{ opacity: 0.6 }}>({counts[cat]})</span>
                    </button>
                  );
                })}
              </div>

              {/* Template card grid — 2 columns */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {TEMPLATES.filter(tpl => tplFilter === 'all' || tpl.category === tplFilter).map((tpl) => {
                  const isSelected = selectedTemplate === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => {
                        setSelectedTemplate(tpl.id);
                        setButtonStyleOverride(tpl.btnStyle);
                        triggerToast(`Switched to ${tpl.name}`);
                      }}
                      className={`relative rounded-xl overflow-hidden cursor-pointer transition-all text-left group ${
                        isSelected
                          ? 'ring-2 ring-[#FCD116] scale-[1.02] shadow-lg shadow-black/40'
                          : 'opacity-70 hover:opacity-100 hover:scale-[1.01]'
                      }`}
                      style={{ border: isSelected ? '2px solid #FCD116' : '2px solid rgba(255,255,255,0.08)' }}
                    >
                      {/* Background preview */}
                      <div className={`${tpl.bgClass} h-[88px] w-full relative flex flex-col items-center justify-center gap-1.5 px-2`}>
                        {/* Mini avatar */}
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black"
                          style={{
                            border: `1.5px solid ${tpl.accentColor}`,
                            background: `${tpl.accentColor}22`,
                            color: tpl.accentColor,
                            boxShadow: `0 0 8px ${tpl.accentColor}44`,
                          }}
                        >
                          MS
                        </div>
                        {/* Mini link pills */}
                        <div
                          className="w-full h-[9px] rounded-md"
                          style={{ background: tpl.btnBgColor, border: `1px solid ${tpl.accentColor}33` }}
                        />
                        <div
                          className="w-4/5 h-[9px] rounded-md"
                          style={{ background: tpl.btnBgColor, border: `1px solid ${tpl.accentColor}33` }}
                        />

                        {/* Selected checkmark */}
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#FCD116] flex items-center justify-center z-10">
                            <Check className="w-3 h-3 text-black stroke-[3]" />
                          </div>
                        )}

                        {/* Category badge */}
                        <div
                          className="absolute top-1.5 left-1.5 text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{
                            background: tpl.category === 'light' ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.15)',
                            color: tpl.category === 'light' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.85)',
                            backdropFilter: 'blur(4px)',
                          }}
                        >
                          {tpl.category === 'dark' ? '🌙' : tpl.category === 'light' ? '☀️' : '⚡'}
                        </div>
                      </div>

                      {/* Info row */}
                      <div
                        className="px-2 py-1.5"
                        style={{ background: 'rgba(0,0,0,0.6)' }}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11px] font-bold text-white truncate">{tpl.name}</span>
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ background: tpl.accentColor }}
                          />
                        </div>
                        <div className="text-[9px] text-white/50 truncate mt-0.5 leading-tight">
                          {lang === 'en' ? tpl.descEN : tpl.descTL}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Empty state when filter has no results (shouldn't happen but safe) */}
              {TEMPLATES.filter(tpl => tplFilter === 'all' || tpl.category === tplFilter).length === 0 && (
                <div className="text-center py-4 text-xs text-white/30">
                  No templates in this category
                </div>
              )}
            </div>

            {/* Accent Color selection */}
            <div className="bg-surface-1 p-4 rounded-2xl border border-white/10 space-y-3">
              <label className="block text-xs font-mono uppercase tracking-wider font-bold text-[#FCD116]">
                🌈 Accent Swatch (16 Colors)
              </label>
              
              <p className="text-[11px] text-secondary font-light">
                Select a swatch to change the live preview's link buttons, markers, and badge highlights live:
              </p>

              {/* Scrollable pill row of 16 colors */}
              <div className="flex flex-wrap gap-2 pb-2 pt-1">
                {ACCENT_COLORS.map((swatch) => {
                  const isSelected = selectedAccentHex.toLowerCase() === swatch.hex.toLowerCase();

                  return (
                    <button
                      key={swatch.name}
                      type="button"
                      onClick={() => {
                        setSelectedAccentHex(swatch.hex);
                        triggerToast(`Accent set to ${swatch.name}`);
                      }}
                      className={`px-3 py-1.5 rounded-full shrink-0 flex items-center gap-1.5 cursor-pointer transition-all border ${
                        isSelected 
                          ? 'border-white ring-2 ring-white scale-115 bg-surface-3 font-bold z-10 shadow-lg' 
                          : 'border-white/10 bg-surface-2 text-white/70 hover:text-white'
                      }`}
                    >
                      <span 
                        className="w-3 h-3 rounded-full border border-black/40 shrink-0"
                        style={{ backgroundColor: swatch.hex }}
                      />
                      <span className="text-[11px] whitespace-nowrap font-mono">{swatch.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Button Style selector */}
            <div className="bg-surface-1 p-4 rounded-2xl border border-white/10 space-y-3">
              <label className="block text-xs font-mono uppercase tracking-wider font-bold text-[#FCD116]">
                🎛️ Link Button Shape
              </label>
              
              <p className="text-[11px] text-secondary font-light">
                Updates preview buttons live. Shows real material CSS simulation demos:
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {(['filled', 'outline', 'glass', 'pill'] as const).map((bStyle) => {
                  const isSelected = buttonStyleOverride === bStyle;
                  const demoStyle = getButtonStyles(bStyle, selectedAccentHex);

                  return (
                    <div
                      key={bStyle}
                      onClick={() => {
                        setButtonStyleOverride(bStyle);
                        triggerToast(`Button shape set to ${bStyle}`);
                      }}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all bg-surface-2 ${
                        isSelected ? 'border-white bg-surface-3 shadow-md' : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="text-[10px] font-mono uppercase text-white/50 mb-2 font-bold">
                        {bStyle} style {isSelected && '✓'}
                      </div>

                      {/* Visual Demo simulation button */}
                      <div 
                        className="w-full py-2 px-2 text-center text-[11px] font-bold truncate transition-all select-none"
                        style={demoStyle}
                      >
                        Sample Bio Link
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ============================================ */}
            {/* LAYOUT — Classic vs Hero (visual selector)   */}
            {/* ============================================ */}
            <div className="bg-surface-1 p-4 rounded-2xl border border-white/10 space-y-3">
              <label className="block text-xs font-mono uppercase tracking-wider font-bold text-[#FCD116]">
                Layout
              </label>

              <div className="grid grid-cols-2 gap-3">
                {/* CLASSIC */}
                <button
                  type="button"
                  onClick={() => { setProfileLayout('classic'); triggerToast('Classic layout active'); }}
                  className={`relative aspect-[0.85] rounded-xl overflow-hidden flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all border-2 ${
                    profileLayout === 'classic' ? 'border-white scale-[1.02] shadow-lg' : 'border-white/10 hover:border-white/30'
                  }`}
                  style={{ backgroundColor: '#1a1a1a' }}
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-pink-500 overflow-hidden flex items-center justify-center text-[10px] font-black text-white">
                    {avatarImage ? <img src={avatarImage} alt="" className="w-full h-full object-cover" /> : 'MS'}
                  </div>
                  <div className="w-12 h-1.5 rounded bg-white/80" />
                  <div className="w-16 h-1 rounded bg-white/30" />
                  <div className="w-20 h-2.5 rounded bg-[#FCD116]/80 mt-1" />
                  <div className="absolute bottom-1.5 left-0 right-0 text-center text-[10px] font-display font-bold text-white">Classic</div>
                </button>

                {/* HERO */}
                <button
                  type="button"
                  onClick={() => { setProfileLayout('hero'); triggerToast('Hero layout active'); }}
                  className={`relative aspect-[0.85] rounded-xl overflow-hidden cursor-pointer transition-all border-2 ${
                    profileLayout === 'hero' ? 'border-white scale-[1.02] shadow-lg' : 'border-white/10 hover:border-white/30'
                  }`}
                  style={{ background: 'linear-gradient(180deg, #b91c1c 0%, #1a1a1a 70%)' }}
                >
                  <div className="absolute top-1.5 left-1.5 w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-pink-500 overflow-hidden flex items-center justify-center text-[8px] font-black text-white">
                    {avatarImage ? <img src={avatarImage} alt="" className="w-full h-full object-cover" /> : 'MS'}
                  </div>
                  <div className="absolute top-2 right-1.5 flex items-center gap-0.5">
                    <Zap className="w-2.5 h-2.5 text-[#FCD116] fill-[#FCD116]" />
                  </div>
                  <div className="absolute bottom-6 left-1.5 right-1.5 flex flex-col gap-1">
                    <div className="w-10 h-1.5 rounded bg-white/90" />
                    <div className="w-full h-2 rounded bg-white/20" />
                    <div className="w-full h-2 rounded bg-white/20" />
                  </div>
                  <div className="absolute bottom-1.5 left-0 right-0 text-center text-[10px] font-display font-bold text-white">Hero</div>
                </button>
              </div>

              <div className="bg-surface-2 rounded-lg p-2 text-[10px] text-white/50 leading-relaxed">
                <span className="text-white font-bold">{profileLayout === 'classic' ? 'Classic' : 'Hero'}:</span>{' '}
                {profileLayout === 'classic' 
                  ? 'Centered avatar above name — timeless editorial bio.' 
                  : 'Avatar tucked top-left with bold full-bleed wallpaper — magazine-cover energy.'}
              </div>
            </div>

            {/* ============================================ */}
            {/* WALLPAPER STYLE — 6-tile editorial grid      */}
            {/* ============================================ */}
            <div className="bg-surface-1 p-4 rounded-2xl border border-white/10 space-y-3">
              <label className="block text-xs font-mono uppercase tracking-wider font-bold text-[#FCD116]">
                Wallpaper Style
              </label>

              <div className="grid grid-cols-3 gap-2">
                {([
                  { id: 'fill', label: 'Fill', pro: false, render: (
                    <div className="absolute inset-0" style={{ backgroundColor: colorBackground }} />
                  ) },
                  { id: 'gradient', label: 'Gradient', pro: false, render: (
                    <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${colorBackground} 0%, ${colorButtons} 100%)` }} />
                  ) },
                  { id: 'blur', label: 'Blur', pro: false, render: (
                    <>
                      <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 30% 30%, ${colorButtons}88, transparent 60%), radial-gradient(circle at 70% 70%, ${colorBackground}, ${colorBackground})` }} />
                      <div className="absolute inset-0 backdrop-blur-md" />
                    </>
                  ) },
                  { id: 'pattern', label: 'Pattern', pro: false, render: (
                    <div className="absolute inset-0" style={{
                      backgroundColor: colorBackground,
                      backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                      backgroundSize: '12px 12px'
                    }} />
                  ) },
                  { id: 'image', label: 'Image', pro: false, render: (
                    <div className="absolute inset-0 flex items-center justify-center overflow-hidden"
                      style={bgImageDataUrl ? {
                        backgroundImage: `url(${bgImageDataUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      } : { background: 'rgba(255,255,255,0.05)' }}
                    >
                      {!bgImageDataUrl && <ImagePlus className="w-5 h-5 text-white/40" />}
                      {bgImageUploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-[9px] text-white/70 font-mono">Uploading…</span>
                        </div>
                      )}
                    </div>
                  ) },
                  { id: 'video', label: 'Video', pro: true, render: (
                    <div className="absolute inset-0 bg-surface-3 flex items-center justify-center">
                      <Film className="w-5 h-5 text-white/30" />
                    </div>
                  ) }
                ] as const).map(tile => {
                  const isActive = wallpaperStyle === tile.id;
                  return (
                    <button
                      key={tile.id}
                      type="button"
                      onClick={() => {
                        if (tile.pro && !isPro) { triggerToast(`🔒 ${tile.label} is PRO only — ₱149/mo`); return; }
                        if (tile.id === 'image') {
                          bgFileInputRef.current?.click();
                          return;
                        }
                        setWallpaperStyle(tile.id);
                        triggerToast(`Wallpaper: ${tile.label}`);
                      }}
                      className="space-y-1 cursor-pointer group"
                    >
                      <div className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        isActive ? 'border-white shadow-lg' : 'border-white/10 group-hover:border-white/30'
                      } ${tile.pro && !isPro ? 'opacity-50' : ''}`}>
                        {tile.render}
                        {tile.pro && (
                          <div className={`absolute top-1 right-1 ${isPro ? 'bg-emerald-400' : 'bg-[#FCD116]'} text-black rounded-full p-0.5`}>
                            {isPro
                              ? <Check className="w-2.5 h-2.5 stroke-[3]" />
                              : <Zap className="w-2.5 h-2.5 fill-black" strokeWidth={0} />}
                          </div>
                        )}
                        {isActive && (
                          <div className="absolute inset-0 ring-2 ring-inset ring-white/40 rounded-xl pointer-events-none" />
                        )}
                      </div>
                      <div className={`text-[10px] font-bold text-center ${isActive ? 'text-white' : 'text-white/50'}`}>
                        {tile.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ============================================ */}
            {/* COLOR PALETTE — 5 row hex pickers            */}
            {/* ============================================ */}
            <div className="bg-surface-1 p-4 rounded-2xl border border-white/10 space-y-3">
              <label className="block text-xs font-mono uppercase tracking-wider font-bold text-[#FCD116]">
                Editorial Color Palette
              </label>

              <p className="text-[11px] text-secondary font-light">
                Tap any swatch to fine-tune. Changes apply to the live preview instantly.
              </p>

              {([
                { key: 'background', label: 'Background',  value: colorBackground,  set: setColorBackground },
                { key: 'buttons',    label: 'Buttons',     value: colorButtons,     set: setColorButtons },
                { key: 'buttontext', label: 'Button text', value: colorButtonText,  set: setColorButtonText },
                { key: 'pagetext',   label: 'Page text',   value: colorPageText,    set: setColorPageText },
                { key: 'titletext',  label: 'Title text',  value: colorTitleText,   set: setColorTitleText },
              ] as const).map(row => (
                <div key={row.key} className="space-y-1">
                  <div className="text-[11px] font-medium text-white/70">{row.label}</div>
                  <label
                    htmlFor={`color-${row.key}`}
                    onMouseEnter={() => setActiveColorRow(row.key)}
                    onMouseLeave={() => setActiveColorRow(null)}
                    className={`flex items-center gap-2 bg-surface-2 rounded-xl border px-3 py-2.5 cursor-pointer transition-all ${
                      activeColorRow === row.key ? 'border-[#FCD116]' : 'border-white/10 hover:border-white/25'
                    }`}
                  >
                    <span className="text-xs font-mono font-bold text-white/90 flex-1 truncate">
                      {row.value.toUpperCase()}
                    </span>

                    {/* Hidden native color input — invisible but functional */}
                    <input
                      id={`color-${row.key}`}
                      type="color"
                      value={row.value}
                      onChange={(e) => row.set(e.target.value)}
                      className="sr-only"
                    />

                    {/* Visible swatch dot */}
                    <span
                      className="w-6 h-6 rounded-full shrink-0 border border-white/20 shadow-inner"
                      style={{ backgroundColor: row.value }}
                    />
                  </label>
                </div>
              ))}

              {/* Reset palette */}
              <button
                type="button"
                onClick={() => {
                  setColorBackground('#0a0a0a');
                  setColorButtons('#FCD116');
                  setColorButtonText('#000000');
                  setColorPageText('#FFFFFF');
                  setColorTitleText('#FFFFFF');
                  triggerToast('Palette reset to dark gold');
                }}
                className="w-full text-[10px] font-mono text-white/40 hover:text-white py-1 cursor-pointer"
              >
                ↺ Reset to defaults
              </button>
            </div>

            {/* ============================================ */}
            {/* PAGE FONT — rich 2-column grid + PRO badges  */}
            {/* ============================================ */}
            <div className="bg-surface-1 p-4 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono uppercase tracking-wider font-bold text-[#FCD116]">
                  Page Font
                </label>
                <button
                  type="button"
                  onClick={() => setShowFontPicker(s => !s)}
                  className="text-[10px] font-mono text-white/60 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {showFontPicker ? 'Collapse' : 'Browse all'} <ChevronRight className={`w-3 h-3 transition-transform ${showFontPicker ? 'rotate-90' : ''}`} />
                </button>
              </div>

              {/* Always-visible current selection */}
              <div className="bg-surface-2 rounded-xl p-3 flex items-center justify-between border border-[#FCD116]/30">
                <div>
                  <div className="text-[9px] uppercase font-mono text-[#FCD116] font-bold">Current</div>
                  <div className="text-base font-bold text-white" style={{ fontFamily: pageFont }}>{pageFont}</div>
                </div>
                <Type className="w-5 h-5 text-[#FCD116]" />
              </div>

              {showFontPicker && (
                <div className="grid grid-cols-2 gap-2 pt-1 max-h-[280px] overflow-y-auto no-scrollbar">
                  {([
                    { name: 'Bricolage Grotesque', pro: false },
                    { name: 'DM Sans',             pro: false },
                    { name: 'Inter',               pro: false },
                    { name: 'Lato',                pro: false },
                    { name: 'Manrope',             pro: false },
                    { name: 'Space Grotesk',       pro: false },
                    { name: 'Syne',                pro: true },
                    { name: 'Rubik',               pro: true },
                    { name: 'Poppins',             pro: true },
                    { name: 'Lora',                pro: true },
                  ] as const).map(f => {
                    const isActive = pageFont === f.name;
                    const locked = f.pro && !isPro;
                    return (
                      <button
                        key={f.name}
                        type="button"
                        onClick={() => {
                          if (locked) { triggerToast(`🔒 ${f.name} is PRO — ₱149/mo to unlock`); return; }
                          setPageFont(f.name);
                          triggerToast(`Font: ${f.name}`);
                        }}
                        className={`relative p-3 rounded-xl text-center transition-all cursor-pointer border-2 ${
                          isActive
                            ? 'border-white bg-surface-3 shadow-md'
                            : 'border-white/10 bg-surface-2 hover:border-white/30'
                        } ${locked ? 'opacity-60' : ''}`}
                        style={{ fontFamily: f.name }}
                      >
                        {f.pro && (
                          <span className={`absolute top-1.5 right-1.5 ${isPro ? 'bg-emerald-400' : 'bg-[#FCD116]'} text-black rounded-full p-0.5`}>
                            {isPro
                              ? <Check className="w-2 h-2 stroke-[3]" />
                              : <Zap className="w-2 h-2 fill-black" strokeWidth={0} />}
                          </span>
                        )}
                        <span className={`text-[12px] ${isActive ? 'text-white font-bold' : 'text-white/80'}`}>
                          {f.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}


        {/* --------------------------------------------- */}
        {/* TAB 3: PREVIEW TAB                            */}
        {/* --------------------------------------------- */}
        {activeTab === 'preview' && (
          <div className="space-y-4 animate-fadeIn text-left">
            
            {/* Live simulation helper disclaimer bar */}
            <div className="bg-surface-2 p-2 rounded-xl text-center text-[11px] text-white/60 border border-white/10 flex items-center justify-between px-3 font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" /> Live Preview
              </span>
              <span>Tap items to test interactions</span>
            </div>

            {/* FULL SIMULATION PHONE CONTAINER CONTAINER */}
            <div className="w-full bg-[#030303] rounded-[32px] border-4 border-white/20 shadow-2xl overflow-hidden relative min-h-[580px] flex flex-col justify-between">
              
              {/* Internal simulated browser address pill bar */}
              <div className="bg-[#111] py-2 px-3 border-b border-white/5 flex items-center justify-between z-20 relative">
                <div className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-full border border-white/10 max-w-[220px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-[10px] font-mono font-bold text-white/90 truncate">
                    link.merqato.digital/{handle || 'mariasantos'}
                  </span>
                </div>

                {/* Share Trigger button */}
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(`https://link.merqato.digital/${handle || 'mariasantos'}`);
                    triggerToast("Link copied to clipboard!");
                  }}
                  className="bg-white/10 hover:bg-white text-white hover:text-black transition-colors p-1.5 rounded-full text-xs flex items-center gap-1 cursor-pointer font-mono px-2"
                  title="Copy link to clipboard"
                >
                  <Share2 className="w-3 h-3" />
                  <span className="text-[9px]">Share</span>
                </button>
              </div>

              {/* LIVE SIMULATED RENDERED PROFILE PAGE */}
              <div className="flex-1 overflow-y-auto relative pb-8 no-scrollbar">
                
                {/* HERO SECTION exactly matching parameters (260px tall) */}
                <div ref={profileCardRef} className="h-[260px] relative w-full flex flex-col justify-end p-4 text-center overflow-hidden">
                  
                  {/* Custom Background resolver */}
                  {renderLiveHeroBg()}

                  {/* Rising Sun SVG explicitly rendered if watawat template active or requested */}
                  {(currentTpl.id === 'watawat' || bgOverrideType === 'template') && (
                    <RisingSunSVG className="right-0 top-0 w-[200px] h-[200px]" opacity={0.2} />
                  )}

                  {/* Inline EN/FIL simulated helper top right of hero */}
                  <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded text-[9px] font-mono text-white/70 z-10 border border-white/10">
                    🇵🇭 FIL-FIRST IDENTITY
                  </div>

                  {/* Contents — layout responds to profileLayout (classic = centered, hero = bottom-left) */}
                  <div className={`relative z-10 flex flex-col ${profileLayout === 'hero' ? 'items-start text-left' : 'items-center text-center'} space-y-1.5`}>
                    
                    {/* Avatar circle — sized smaller in Hero (tucked top-left visual) */}
                    <div className={`${profileLayout === 'hero' ? 'w-[56px] h-[56px] absolute -top-32 left-0' : 'w-[72px] h-[72px]'} rounded-full bg-[#111] flex items-center justify-center font-display text-2xl font-black shadow-xl overflow-hidden ${currentTpl.avatarRing}`} style={{ color: colorTitleText }}>
                      {avatarImage ? (
                        <img src={avatarImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span>{avatarInitials}</span>
                      )}
                    </div>

                    {/* Name */}
                    <h1
                      className="text-[22px] font-extrabold leading-tight tracking-tight mt-1"
                      style={{ fontFamily: pageFont, color: colorTitleText }}
                    >
                      {fullName || 'Maria Santos'}
                    </h1>

                    {/* Bio */}
                    <p
                      className={`text-[13px] font-light max-w-[280px] leading-snug ${profileLayout === 'hero' ? '' : 'mx-auto'} line-clamp-2`}
                      style={{ color: `${colorPageText}b3`, fontFamily: pageFont }}
                    >
                      {bio}
                    </p>

                    {/* Location row */}
                    {location && (
                      <div className={`flex items-center gap-1 text-xs pt-0.5 font-light ${profileLayout === 'hero' ? '' : 'justify-center'}`} style={{ color: `${colorPageText}66` }}>
                        <MapPin className="w-3 h-3 text-rose-500" />
                        <span>{location}</span>
                      </div>
                    )}

                  </div>
                </div>

                {/* SOCIAL ICONS ROW (centered, below hero, dark bg) */}
                <div className="bg-[#0b0b0b] py-3 px-4 border-y border-white/5 text-center space-y-1">
                  <div className="text-[9px] font-mono text-white/30 uppercase tracking-widest">
                    Verified Social Channels
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1 max-w-[300px] mx-auto">
                    {activeSocials.map((socId) => {
                      const plat = SOCIAL_ICONS.find(s => s.id === socId);
                      if (!plat) return null;
                      const liveUrl = socialUrls[socId] || plat.urlPlaceholder;

                      return (
                        <button
                          key={socId}
                          type="button"
                          onClick={() => triggerToast(`→ ${liveUrl}`)}
                          className="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer shadow-md"
                          style={{ backgroundColor: plat.color }}
                          title={`${plat.name}${liveUrl ? ': ' + liveUrl : ''}`}
                        >
                          <SocialBrandIcon id={plat.id} className="w-4 h-4" color="#ffffff" />
                        </button>
                      );
                    })}

                    {activeSocials.length === 0 && (
                      <span className="text-[10px] text-white/20 italic">No socials visible. Enable in Edit tab.</span>
                    )}
                  </div>
                </div>

                {/* LINKS SECTION RENDERING */}
                <div className="p-4 space-y-3">
                  <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest pl-1">
                    Direct Links
                  </div>

                  {links.filter(l => l.enabled).map((item) => {
                    // Editorial palette overrides drive the live preview button colours
                    const baseStyles = getButtonStyles(buttonStyleOverride, colorButtons);
                    const btnComputed = { ...baseStyles, color: colorButtonText, fontFamily: pageFont };

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => triggerToast(`Opening link: ${item.url}`)}
                        className="w-full text-left p-3.5 transition-all flex items-center justify-between group active:scale-95 cursor-pointer shadow-sm block font-sans"
                        style={btnComputed}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Left icon circle */}
                          <span 
                            className="w-7 h-7 rounded-full bg-black/20 flex items-center justify-center text-xs font-bold shrink-0 text-white font-mono"
                            style={{ color: btnComputed.color === '#000000' ? '#000' : '#fff', backgroundColor: btnComputed.color === '#000000' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)' }}
                          >
                            <DynamicLucideIcon name={item.customIcon || 'LinkIcon'} className="w-3.5 h-3.5" />
                          </span>

                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate leading-tight">
                              {lang === 'en' ? item.titleEN : item.titleTL}
                            </div>
                            <div className="text-[10px] opacity-75 truncate font-mono mt-0.5">
                              {item.type}
                            </div>
                          </div>
                        </div>

                        {/* Arrow right */}
                        <ExternalLink className="w-4 h-4 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity ml-2" />
                      </button>
                    );
                  })}

                  {links.filter(l => l.enabled).length === 0 && (
                    <div className="text-center py-6 bg-surface-2 rounded-xl text-xs text-white/30 italic">
                      No live link buttons active. Turn on switches in the Edit tab.
                    </div>
                  )}

                  {/* PAYMENT BUTTON RENDERING */}
                  {paymentEnabled && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setShowPaymentModal(true)}
                        className="w-full bg-gradient-to-r from-[#FCD116] via-[#ffd700] to-[#e6ac00] text-black font-display font-extrabold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xl animate-pulse hover:scale-[1.01] transition-transform"
                      >
                        <DollarSign className="w-4 h-4 text-black stroke-[3]" />
                        <span>{customPayLabel || t.sendPayment}</span>
                      </button>
                    </div>
                  )}

                  {/* PRO LOCK PLACEHOLDER */}
                  <div 
                    onClick={() => triggerToast("🔒 Upgrade to unlock unlimited full layout rows and custom metrics integration")}
                    className="p-3 rounded-xl border border-dashed border-white/20 text-center text-[11px] text-white/40 hover:border-[#FCD116] hover:text-[#FCD116] transition-colors cursor-pointer flex items-center justify-center gap-1 mt-4"
                  >
                    <Lock className="w-3 h-3 shrink-0" />
                    <span>{t.proLocked}</span>
                  </div>

                </div>

                {/* FOOTER */}
                <div className="pt-4 pb-8 text-center text-[10px] text-white/30 font-mono">
                  {t.poweredBy} <span className="font-bold text-white/60">link.merqato.digital</span> 🇵🇭
                </div>

              </div>

              {/* INLINE PAYMENT PANEL MODAL OVERLAY TRIGGERED ON PREVIEW PAY BUTTON TAP */}
              {showPaymentModal && (
                <div className="absolute inset-x-0 bottom-0 bg-[#161616] rounded-t-3xl border-t-2 border-[#FCD116] z-50 p-5 space-y-4 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] animate-slideUp">
                  
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div className="text-sm font-display font-bold text-white flex items-center gap-2">
                      <span className="text-xl">💸</span> 
                      <span>Send payment to {fullName.split(' ')[0] || 'Maria'}</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setShowPaymentModal(false)}
                      className="text-white/40 hover:text-white p-1 rounded-full bg-white/5 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-[11px] text-white/60 font-light">
                    Choose an official verified digital wallet below to transfer money safely instantly:
                  </p>

                  {/* Option Cards */}
                  <div className="space-y-2.5">
                    
                    {/* GCash Card */}
                    <div className="bg-[#0038A8]/20 border border-[#0038A8] rounded-xl p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded bg-[#0038A8] text-white font-black text-[10px] flex items-center justify-center shrink-0">
                          GC
                        </span>
                        <div>
                          <div className="text-xs font-bold text-white">GCash Transfer</div>
                          <div className="text-[10px] text-white/70 font-mono">
                            Send to: <span className="text-[#FCD116] font-bold">{gcashNumber.replace(/.(?=.{4})/g, 'X')}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(gcashNumber);
                          triggerToast("Copied GCash number to clipboard!");
                        }}
                        className="bg-white/10 text-[10px] text-white px-2 py-1 rounded hover:bg-white hover:text-black transition-colors shrink-0 cursor-pointer font-mono font-bold"
                      >
                        Copy #
                      </button>
                    </div>

                    {/* Maya Card */}
                    <div className="bg-[#00B14F]/20 border border-[#00B14F] rounded-xl p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded bg-[#00B14F] text-white font-black text-[10px] flex items-center justify-center shrink-0">
                          MY
                        </span>
                        <div>
                          <div className="text-xs font-bold text-white">Maya Wallet</div>
                          <div className="text-[10px] text-white/70 font-mono">
                            Send to: <span className="text-emerald-300 font-bold">{mayaNumber}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(mayaNumber);
                          triggerToast("Copied Maya number to clipboard!");
                        }}
                        className="bg-white/10 text-[10px] text-white px-2 py-1 rounded hover:bg-white hover:text-black transition-colors shrink-0 cursor-pointer font-mono font-bold"
                      >
                        Copy #
                      </button>
                    </div>

                    {/* Optional Mock QR graphic rendering */}
                    {qrUploaded && (
                      <div className="bg-white/5 p-2 rounded-lg text-center border border-white/10">
                        <span className="text-[9px] text-white/40 block uppercase mb-1 font-mono">Custom Uploaded QR Preview</span>
                        <div className="w-20 h-20 bg-white mx-auto rounded flex flex-col items-center justify-center text-black font-black text-[9px] p-1">
                          🔳🔳🔳
                          🔳🇵🇭🔳
                          🔳🔳🔳
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Note requested */}
                  <div className="bg-[#FCD116]/10 text-[#FCD116] p-2 rounded text-[10px] text-center italic font-mono border border-[#FCD116]/20">
                    "{t.payNote}"
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="w-full bg-white text-black font-bold text-xs py-2 rounded-lg text-center cursor-pointer hover:bg-white/80"
                  >
                    Done Reading
                  </button>

                </div>
              )}

            </div>

          </div>
        )}


        {/* --------------------------------------------- */}
        {/* TAB 4: ANALYTICS TAB (LOCKED)                 */}
        {/* --------------------------------------------- */}
        {activeTab === 'analytics' && (
          <div className="space-y-4 text-center py-12 animate-fadeIn bg-surface-1 rounded-2xl p-6 border border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#FCD116]/5 via-transparent to-transparent z-0 pointer-events-none" />
            
            <div className="w-12 h-12 rounded-full bg-[#FCD116]/10 text-[#FCD116] flex items-center justify-center mx-auto relative z-10">
              <Lock className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div className="relative z-10 space-y-2">
              <h3 className="text-lg font-display font-bold text-white">
                Cinematic Traffic Metrics Locked
              </h3>
              <p className="text-xs text-secondary max-w-[260px] mx-auto">
                Track how many people tap your TikTok drops, Shopee codes, and GCash buttons live per minute.
              </p>
            </div>

            {/* Mock blurred stats */}
            <div className="bg-surface-2 p-3 rounded-xl border border-white/5 space-y-3 filter blur-[2px] opacity-40 select-none pointer-events-none">
              <div className="flex justify-between text-xs font-mono">
                <span>Total Unique Clicks</span>
                <span className="font-bold text-emerald-400">14,921</span>
              </div>
              <div className="h-2 bg-white/10 rounded overflow-hidden">
                <div className="w-3/4 h-full bg-emerald-500" />
              </div>
              <div className="text-[10px] text-left text-white/50">Top Source: Manila, Cebu, Davao</div>
            </div>

            <button
              type="button"
              onClick={() => {
                alert("🛒 Redirecting to fast PayMongo / Gcash PRO upgrade plan subscription.");
                triggerToast("Simulated upgrade success!");
              }}
              className="w-full bg-[#FCD116] text-black hover:bg-white transition-colors py-3 rounded-xl font-bold text-xs cursor-pointer relative z-10 shadow-lg"
            >
              Unlock Analytics — ₱149/mo
            </button>

            <div className="text-[10px] text-white/30 italic pt-2">
              Free forever for pure links. No sneaky paywalls on the main builder.
            </div>

          </div>
        )}


        {/* --------------------------------------------- */}
        {/* TAB 5: SETTINGS TAB                           */}
        {/* --------------------------------------------- */}
        {activeTab === 'settings' && (
          <div className="space-y-4 animate-fadeIn text-left">
            <div className="bg-surface-1 p-4 rounded-2xl border border-white/10 space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#FCD116] block">
                ⚙️ Platform Configuration
              </span>

              <div className="space-y-2 pt-1 text-xs text-secondary">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span>Current Link Profile</span>
                  <span className="text-white font-mono font-bold">{handle || 'mariasantos'}</span>
                </div>
                
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span>Account State</span>
                  <span className="text-emerald-400 font-bold">Verified FREE Tier</span>
                </div>

                <div className="flex justify-between py-1 border-b border-white/5">
                  <span>Language String Set</span>
                  <span className="text-white uppercase">{lang}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-white/5">
                  <span>Cinematic Mobile Fit</span>
                  <span className="text-white font-mono">390px (Perfect)</span>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Reset current builder back to full initial mock drops?")) {
                      setFullName("Maria Santos");
                      setCustomBio('');
                      setLocation(t.locationPlaceholder);
                      setLinks(INITIAL_LINKS);
                      setActiveSocials(['facebook', 'instagram', 'tiktok', 'shopee']);
                      triggerToast("Reset all settings cleanly");
                    }
                  }}
                  className="w-full bg-surface-2 hover:bg-surface-3 py-2 rounded text-xs text-white text-center cursor-pointer transition-colors block font-mono"
                >
                  🔄 Reset Mock Data Values
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSignOut();
                  }}
                  className="w-full bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-colors py-2 rounded text-xs text-center cursor-pointer block font-bold"
                >
                  🚪 Return to Onboarding Start
                </button>
              </div>

              <div className="bg-surface-2 p-3 rounded-lg text-[11px] text-white/50 space-y-1">
                <div className="font-bold text-white/80">Filipino-First Commitment</div>
                <p>
                  Built completely with deep pride energy, clean fast CDN fonts, and no generic third-party bootstrap scripts. Optimized for rapid loading across Globe, Smart, and Dito cell networks.
                </p>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* --------------------------------------------- */}
      {/* PERSISTENT BOTTOM NAV ON BUILDER SCREEN       */}
      {/* 5 tabs: Edit, Design, Preview, Analytics, Settings */}
      {/* Active: white icon + white label. Inactive: 20% white. */}
      {/* --------------------------------------------- */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-[#0a0a0a]/95 backdrop-blur-md border-t border-white/10 py-2 px-1 z-40 flex items-center justify-around shadow-[0_-5px_20px_rgba(0,0,0,0.8)]">
        
        {/* Tab 1: Edit */}
        <button
          type="button"
          onClick={() => setActiveTab('edit')}
          className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer transition-all ${
            activeTab === 'edit' ? 'text-white font-bold scale-105' : 'text-white/20 hover:text-white/50'
          }`}
        >
          <Pencil className="w-5 h-5 mb-1 stroke-[2.5]" />
          <span className="text-[10px] tracking-tight">{t.edit}</span>
        </button>

        {/* Tab 2: Design */}
        <button
          type="button"
          onClick={() => setActiveTab('design')}
          className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer transition-all ${
            activeTab === 'design' ? 'text-white font-bold scale-105' : 'text-white/20 hover:text-white/50'
          }`}
        >
          <Palette className="w-5 h-5 mb-1 stroke-[2.5]" />
          <span className="text-[10px] tracking-tight">{t.design}</span>
        </button>

        {/* Tab 3: Preview */}
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer transition-all ${
            activeTab === 'preview' ? 'text-white font-bold scale-105' : 'text-white/20 hover:text-white/50'
          }`}
        >
          <Eye className="w-5 h-5 mb-1 stroke-[2.5]" />
          <span className="text-[10px] tracking-tight">{t.preview}</span>
        </button>

        {/* Tab 4: Analytics — locked overlay only when not PRO */}
        <button
          type="button"
          onClick={() => {
            if (!isPro) {
              triggerToast("🔒 Analytics requires the ₱149/mo PRO tier!");
            }
            setActiveTab('analytics');
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer relative transition-all ${
            activeTab === 'analytics'
              ? 'text-white font-bold scale-105'
              : isPro
              ? 'text-white/50 hover:text-white'
              : 'text-white/20 hover:text-white/50'
          }`}
        >
          <div className="relative">
            <BarChart2 className={`w-5 h-5 mb-1 stroke-[2.5] ${isPro ? '' : 'opacity-50'}`} />
            {!isPro ? (
              <div className="absolute -top-1 -right-2 bg-[#FCD116] text-black rounded-full p-0.5 shadow-xs">
                <Lock className="w-2 h-2 stroke-[3]" />
              </div>
            ) : (
              <div className="absolute -top-1 -right-2 bg-[#FCD116] text-black rounded-full p-0.5 shadow-xs">
                <Zap className="w-2 h-2 fill-black" strokeWidth={0} />
              </div>
            )}
          </div>
          <span className="text-[10px] tracking-tight">{t.analytics}</span>
        </button>

        {/* Tab 5: Settings */}
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer transition-all ${
            activeTab === 'settings' ? 'text-white font-bold scale-105' : 'text-white/20 hover:text-white/50'
          }`}
        >
          <Settings className="w-5 h-5 mb-1 stroke-[2.5]" />
          <span className="text-[10px] tracking-tight">{t.settings}</span>
        </button>

      </div>

    </div>
  );
}
