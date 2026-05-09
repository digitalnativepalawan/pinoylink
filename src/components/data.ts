export interface TemplateItem {
  id: string;
  name: string;
  descEN: string;
  descTL: string;
  bgClass: string;
  avatarRing: string;
  btnStyle: 'filled' | 'glass' | 'pill' | 'outline';
  btnBgColor: string;
  btnBorder: string;
  fontDisplay: string;
}

export const TEMPLATES: TemplateItem[] = [
  {
    id: 'watawat',
    name: 'Watawat',
    descEN: 'Dramatic patriot identity',
    descTL: 'Madramang makabayang dating',
    bgClass: 'bg-watawat',
    avatarRing: 'border-2 border-[#FCD116]',
    btnStyle: 'filled',
    btnBgColor: '#ffffff',
    btnBorder: 'border-l-4 border-l-[#FCD116]',
    fontDisplay: 'Bricolage Grotesque'
  },
  {
    id: 'dagat',
    name: 'Dagat',
    descEN: 'Palawan island paradise vibes',
    descTL: 'Paraiso ng islang Palawan',
    bgClass: 'bg-dagat',
    avatarRing: 'border-2 border-[#0d9488] shadow-[0_0_15px_rgba(13,148,136,0.5)]',
    btnStyle: 'glass',
    btnBgColor: 'rgba(255, 255, 255, 0.08)',
    btnBorder: 'border border-white/10',
    fontDisplay: 'DM Sans'
  },
  {
    id: 'artista',
    name: 'Artista',
    descEN: 'Gen-Z viral superstar energy',
    descTL: 'Buhay na buhay na sikat',
    bgClass: 'bg-artista',
    avatarRing: 'border-2 border-transparent bg-gradient-to-r from-purple-500 to-pink-500 p-[2px]',
    btnStyle: 'pill',
    btnBgColor: '#9333ea',
    btnBorder: 'border-none',
    fontDisplay: 'Bricolage Grotesque'
  },
  {
    id: 'trabaho',
    name: 'Trabaho',
    descEN: 'LinkedIn-meets-Apple precision',
    descTL: 'Pormal at propesyonal',
    bgClass: 'bg-trabaho',
    avatarRing: 'border-2 border-slate-400',
    btnStyle: 'outline',
    btnBgColor: 'transparent',
    btnBorder: 'border border-white/40 hover:border-white',
    fontDisplay: 'DM Sans'
  },
  {
    id: 'kainan',
    name: 'Kainan',
    descEN: 'Sizzling local flavor & delivery',
    descTL: 'Pang-negosyo at masarap',
    bgClass: 'bg-kainan',
    avatarRing: 'border-2 border-[#ea580c]',
    btnStyle: 'filled',
    btnBgColor: '#ea580c',
    btnBorder: 'border-none',
    fontDisplay: 'Bricolage Grotesque'
  },
  {
    id: 'gabi',
    name: 'Gabi',
    descEN: 'High-end BGC luxury lounge',
    descTL: 'Eksklusibong pang-gabi',
    bgClass: 'bg-gabi',
    avatarRing: 'border border-indigo-500/50',
    btnStyle: 'glass',
    btnBgColor: 'rgba(0, 0, 0, 0.6)',
    btnBorder: 'border border-white/15',
    fontDisplay: 'Bricolage Grotesque'
  },
  {
    id: 'bukid',
    name: 'Bukid',
    descEN: 'Banaue terraces nature artist',
    descTL: 'Berdeng bundok at hardin',
    bgClass: 'bg-bukid',
    avatarRing: 'border-2 border-[#FCD116]',
    btnStyle: 'outline',
    btnBgColor: 'transparent',
    btnBorder: 'border-2 border-[#FCD116]',
    fontDisplay: 'Bricolage Grotesque'
  },
  {
    id: 'fiesta',
    name: 'Fiesta',
    descEN: 'Sinulog street parade rave',
    descTL: 'Makulay na pista sa kalye',
    bgClass: 'bg-fiesta',
    avatarRing: 'border-[3px] border-[#22d3ee]',
    btnStyle: 'pill',
    btnBgColor: '#7c3aed',
    btnBorder: 'border-2 border-black/40',
    fontDisplay: 'Bricolage Grotesque'
  },
  {
    id: 'tisa',
    name: 'Tisa',
    descEN: 'Cream paper editorial calm',
    descTL: 'Malinis na papel at tisa',
    bgClass: 'bg-tisa',
    avatarRing: 'border-2 border-[#475569]',
    btnStyle: 'filled',
    btnBgColor: '#1e293b',
    btnBorder: 'border-none',
    fontDisplay: 'DM Sans'
  },
  {
    id: 'habi',
    name: 'Habi',
    descEN: 'Ifugao woven warm earth',
    descTL: 'Mainit na hinabing tela',
    bgClass: 'bg-habi',
    avatarRing: 'border-2 border-[#fef3c7]/70 shadow-[0_0_18px_rgba(254,243,199,0.35)]',
    btnStyle: 'glass',
    btnBgColor: 'rgba(28, 16, 8, 0.55)',
    btnBorder: 'border border-white/15',
    fontDisplay: 'DM Sans'
  },
  {
    id: 'buko',
    name: 'Buko',
    descEN: 'Coconut grove fresh organic',
    descTL: 'Sariwa at masarap na buko',
    bgClass: 'bg-buko',
    avatarRing: 'border-2 border-[#365314]',
    btnStyle: 'pill',
    btnBgColor: '#ecfccb',
    btnBorder: 'border-2 border-[#365314]/40',
    fontDisplay: 'Bricolage Grotesque'
  }
];

export interface SocialIconItem {
  id: string;
  name: string;
  color: string;
  row: number;
  initialActive: boolean;
  urlPlaceholder: string;
  lucideIcon: string;
}

export const SOCIAL_ICONS: SocialIconItem[] = [
  // ROW 1 — Major social:
  { id: 'facebook', name: 'Facebook', color: '#1877F2', row: 1, initialActive: true, urlPlaceholder: 'fb.com/mariasantos', lucideIcon: 'Share2' },
  { id: 'instagram', name: 'Instagram', color: '#E4405F', row: 1, initialActive: true, urlPlaceholder: 'instagram.com/maria', lucideIcon: 'Camera' },
  { id: 'tiktok', name: 'TikTok', color: '#00F2FE', row: 1, initialActive: true, urlPlaceholder: 'tiktok.com/@maria.ph', lucideIcon: 'Video' },
  { id: 'twitter', name: 'X (Twitter)', color: '#1DA1F2', row: 1, initialActive: false, urlPlaceholder: 'x.com/maria', lucideIcon: 'Twitter' },
  { id: 'youtube', name: 'YouTube', color: '#FF0000', row: 1, initialActive: false, urlPlaceholder: 'youtube.com/@maria', lucideIcon: 'Youtube' },
  { id: 'threads', name: 'Threads', color: '#ffffff', row: 1, initialActive: false, urlPlaceholder: 'threads.net/@maria', lucideIcon: 'MessageCircle' },

  // ROW 2 — Creator / content:
  { id: 'spotify', name: 'Spotify', color: '#1DB954', row: 2, initialActive: false, urlPlaceholder: 'open.spotify.com/artist/...', lucideIcon: 'Music' },
  { id: 'applemusic', name: 'Apple Music', color: '#FA57C1', row: 2, initialActive: false, urlPlaceholder: 'music.apple.com/...', lucideIcon: 'Headphones' },
  { id: 'soundcloud', name: 'SoundCloud', color: '#FF5500', row: 2, initialActive: false, urlPlaceholder: 'soundcloud.com/maria', lucideIcon: 'Radio' },
  { id: 'podcast', name: 'Podcast', color: '#9333ea', row: 2, initialActive: false, urlPlaceholder: 'anchor.fm/maria', lucideIcon: 'Mic' },
  { id: 'twitch', name: 'Twitch', color: '#9146FF', row: 2, initialActive: false, urlPlaceholder: 'twitch.tv/maria', lucideIcon: 'Tv' },
  { id: 'pinterest', name: 'Pinterest', color: '#E60023', row: 2, initialActive: false, urlPlaceholder: 'pinterest.com/maria', lucideIcon: 'Bookmark' },

  // ROW 3 — Professional / messaging:
  { id: 'linkedin', name: 'LinkedIn', color: '#0A66C2', row: 3, initialActive: false, urlPlaceholder: 'linkedin.com/in/mariasantos', lucideIcon: 'Briefcase' },
  { id: 'whatsapp', name: 'WhatsApp', color: '#25D366', row: 3, initialActive: false, urlPlaceholder: 'wa.me/639171234567', lucideIcon: 'PhoneCall' },
  { id: 'telegram', name: 'Telegram', color: '#0088cc', row: 3, initialActive: false, urlPlaceholder: 't.me/mariasantos', lucideIcon: 'Send' },
  { id: 'viber', name: 'Viber', color: '#7360F2', row: 3, initialActive: false, urlPlaceholder: 'viber.click/639171234567', lucideIcon: 'MessageSquare' },
  { id: 'discord', name: 'Discord', color: '#5865F2', row: 3, initialActive: false, urlPlaceholder: 'discord.gg/maria', lucideIcon: 'Hash' },
  { id: 'github', name: 'GitHub', color: '#6e5494', row: 3, initialActive: false, urlPlaceholder: 'github.com/mariasantos', lucideIcon: 'Code' },

  // ROW 4 — PH-specific / commerce:
  { id: 'shopee', name: 'Shopee', color: '#EE4D2D', row: 4, initialActive: true, urlPlaceholder: 'shopee.ph/maria.store', lucideIcon: 'ShoppingBag' },
  { id: 'lazada', name: 'Lazada', color: '#000080', row: 4, initialActive: false, urlPlaceholder: 'lazada.com.ph/shop/maria', lucideIcon: 'ShoppingCart' },
  { id: 'carousell', name: 'Carousell', color: '#D2143A', row: 4, initialActive: false, urlPlaceholder: 'carousell.ph/u/maria', lucideIcon: 'Tag' },
  { id: 'gcashqr', name: 'Gcash QR', color: '#0038A8', row: 4, initialActive: false, urlPlaceholder: 'gcash.com/qr/maria', lucideIcon: 'QrCode' },
  { id: 'grabfood', name: 'GrabFood', color: '#00B14F', row: 4, initialActive: false, urlPlaceholder: 'food.grab.com/ph/...', lucideIcon: 'Utensils' },
  { id: 'patreon', name: 'Patreon', color: '#FF424D', row: 4, initialActive: false, urlPlaceholder: 'patreon.com/mariasantos', lucideIcon: 'Heart' }
];

export interface AccentColorSwatch {
  name: string;
  hex: string;
}

export const ACCENT_COLORS: AccentColorSwatch[] = [
  { name: 'PH Blue', hex: '#0038A8' },
  { name: 'PH Red', hex: '#CE1126' },
  { name: 'PH Gold', hex: '#FCD116' },
  { name: 'Teal', hex: '#0d9488' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Sky', hex: '#0ea5e9' },
  { name: 'Violet', hex: '#7c3aed' },
  { name: 'Fuchsia', hex: '#d946ef' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Lime', hex: '#84cc16' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Indigo', hex: '#4f46e5' },
  { name: 'Slate', hex: '#475569' },
  { name: 'Pure White', hex: '#ffffff' }
];

export interface LinkItem {
  id: string;
  titleEN: string;
  titleTL: string;
  url: string;
  type: string;
  enabled: boolean;
  iconColor: string;
  customIcon?: string;
}

export const AVAILABLE_LINK_TYPES = [
  'Regular URL', 'YouTube video', 'Spotify track/playlist', 'Instagram post', 
  'TikTok video', 'PDF download', 'Email address', 'Phone number', 
  'WhatsApp chat', 'Booking link', 'Menu PDF', 'Google Maps location', 
  'Shopee store', 'Lazada store', 'Carousell listing'
];

export const INITIAL_LINKS: LinkItem[] = [
  {
    id: 'link-1',
    titleEN: 'Watch my Cinematic Palawan Vlog',
    titleTL: 'Panoorin ang aking Cinematic Palawan Vlog',
    url: 'https://youtube.com/watch?v=philippines-2025',
    type: 'YouTube video',
    enabled: true,
    iconColor: '#FF0000',
    customIcon: 'Youtube'
  },
  {
    id: 'link-2',
    titleEN: 'Shop my exclusive Ukay & Curated drops',
    titleTL: 'Bumili ng aking eksklusibong Ukay & Curated drops',
    url: 'https://shopee.ph/mariasantos.boutique',
    type: 'Shopee store',
    enabled: true,
    iconColor: '#EE4D2D',
    customIcon: 'ShoppingBag'
  }
];

export const TRANSLATIONS = {
  en: {
    getStarted: "Get started — libre!",
    headlineLine1: "Your link.",
    headlineLine2: "Your identity.",
    subhead: "One link for everything you are.",
    alreadyHaveAccount: "I already have an account",
    claimHeadline: "Claim your link",
    available: "Available!",
    taken: "Taken",
    claimBtn: "Claim pinoy.digital/",
    pickTemplate: "Pick your template",
    fullName: "Full name",
    sendPayment: "Send me a payment",
    poweredBy: "Powered by",
    addLink: "Add a link",
    edit: "Edit",
    design: "Design",
    preview: "Preview",
    analytics: "Analytics",
    settings: "Settings",
    bioPlaceholder: "Digital creator & proud island girl 🌴 Let's collaborate!",
    locationPlaceholder: "Palawan, Philippines",
    proWallUnlock: "Unlock unlimited links",
    proWallSub: "Add your Shopee store, booking page, menus, and more",
    goPro: "Go PRO — ₱149/mo",
    linksLabel: "Links",
    paymentLabel: "Payment button",
    socialLabel: "Social icons",
    bgImage: "Background image",
    uploadQr: "Upload QR image",
    customLabel: "Custom button label",
    proLocked: "Upgrade to add more links",
    fontChoice: "Font choice",
    lockedNote: "Locked in PRO tier",
    freeUsed: "2 / 2 used",
    payNote: "After sending, message me your reference number",
    copied: "Link copied to clipboard!",
    stepLabel: "Step",
    customIconLabel: "Choose Lucide Icon",
    placeholderLinkTitle: "Enter clear link description",
    sampleBioLink: "Sample Bio Link"
  },
  tl: {
    getStarted: "Magsimula na — libre!",
    headlineLine1: "Ang iyong link.",
    headlineLine2: "Ang iyong pagkakakilanlan.",
    subhead: "Isang link para sa lahat ng ikaw.",
    alreadyHaveAccount: "Mayroon na akong account",
    claimHeadline: "I-claim ang iyong link",
    available: "Pwede pa!",
    taken: "Ginamit na",
    claimBtn: "I-claim ang pinoy.digital/",
    pickTemplate: "Piliin ang iyong template",
    fullName: "Buong pangalan",
    sendPayment: "Magpadala ng bayad",
    poweredBy: "Pinapagana ng",
    addLink: "Magdagdag ng link",
    edit: "I-edit",
    design: "Disenyo",
    preview: "Silipin",
    analytics: "Estadistika",
    settings: "Mga Setting",
    bioPlaceholder: "Taga-gawa ng digital na nilalaman mula sa Palawan 🌴 Makipagtulungan tayo!",
    locationPlaceholder: "Palawan, Pilipinas",
    proWallUnlock: "I-unlock ang walang limitasyong links",
    proWallSub: "Ilagay ang iyong Shopee, menu, booking, at iba pa",
    goPro: "Mag-PRO — ₱149/buwan",
    linksLabel: "Mga Link",
    paymentLabel: "Pindutan ng Bayad",
    socialLabel: "Mga Social icon",
    bgImage: "Larawan sa background",
    uploadQr: "Mag-upload ng QR",
    customLabel: "Pasadya na label",
    proLocked: "Mag-upgrade para sa karagdagang links",
    fontChoice: "Piliin ang Font",
    lockedNote: "Eksklusibo sa PRO",
    freeUsed: "2 / 2 ginamit",
    payNote: "Matapos magpadala, i-message ang reference number",
    copied: "Nakopya ang link sa clipboard!",
    stepLabel: "Hakbang",
    customIconLabel: "Pumili ng Lucide Icon",
    placeholderLinkTitle: "I-type ang malinaw na paglalarawan",
    sampleBioLink: "Halimbawa ng Link sa Bio"
  }
};
