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
    descEN: 'Bold patriot, gold-edged pride',
    descTL: 'Matapang na makabayang pagkakakilanlan',
    bgClass: 'bg-watawat',
    avatarRing: 'border-2 border-[#FCD116] shadow-[0_0_16px_rgba(252,209,22,0.45)]',
    btnStyle: 'filled',
    btnBgColor: 'rgba(252, 209, 22, 0.15)',
    btnBorder: 'border border-[#FCD116]/60',
    fontDisplay: 'Bricolage Grotesque'
  },
  {
    id: 'dagat',
    name: 'Dagat',
    descEN: 'Palawan deep-sea luminescence',
    descTL: 'Liwanag ng kailaliman ng Palawan',
    bgClass: 'bg-dagat',
    avatarRing: 'border-2 border-[#06b6d4]/70 shadow-[0_0_18px_rgba(6,182,212,0.35)]',
    btnStyle: 'glass',
    btnBgColor: 'rgba(6, 182, 212, 0.1)',
    btnBorder: 'border border-cyan-400/25',
    fontDisplay: 'DM Sans'
  },
  {
    id: 'artista',
    name: 'Artista',
    descEN: 'Aurora mesh, Gen-Z superstar',
    descTL: 'Sikat na sikat, bagong henerasyon',
    bgClass: 'bg-artista',
    avatarRing: 'border-[2.5px] border-purple-400/80 shadow-[0_0_20px_rgba(192,132,252,0.5)]',
    btnStyle: 'glass',
    btnBgColor: 'rgba(168, 85, 247, 0.18)',
    btnBorder: 'border border-purple-400/30',
    fontDisplay: 'Bricolage Grotesque'
  },
  {
    id: 'trabaho',
    name: 'Trabaho',
    descEN: 'Precision dark, Apple-grade focus',
    descTL: 'Malinis, pormal at mapagkakatiwalaan',
    bgClass: 'bg-trabaho',
    avatarRing: 'border-2 border-blue-400/50 shadow-[0_0_12px_rgba(96,165,250,0.2)]',
    btnStyle: 'outline',
    btnBgColor: 'transparent',
    btnBorder: 'border border-blue-400/30',
    fontDisplay: 'DM Sans'
  },
  {
    id: 'kainan',
    name: 'Kainan',
    descEN: 'Luxury ember, fine-dining dark',
    descTL: 'Mainit na apoy, pang-negosyong handa',
    bgClass: 'bg-kainan',
    avatarRing: 'border-2 border-orange-500/80 shadow-[0_0_16px_rgba(234,88,12,0.4)]',
    btnStyle: 'filled',
    btnBgColor: 'rgba(234, 88, 12, 0.85)',
    btnBorder: 'border border-orange-400/20',
    fontDisplay: 'Bricolage Grotesque'
  },
  {
    id: 'gabi',
    name: 'Gabi',
    descEN: 'BGC constellation, velvet night',
    descTL: 'Eksklusibo sa gabi ng BGC',
    bgClass: 'bg-gabi',
    avatarRing: 'border border-indigo-400/40 shadow-[0_0_20px_rgba(99,102,241,0.3)]',
    btnStyle: 'glass',
    btnBgColor: 'rgba(5, 5, 20, 0.75)',
    btnBorder: 'border border-indigo-400/18',
    fontDisplay: 'Bricolage Grotesque'
  },
  {
    id: 'bukid',
    name: 'Bukid',
    descEN: 'Banaue terrace mist, forest depth',
    descTL: 'Mahangin at malinis na bundok',
    bgClass: 'bg-bukid',
    avatarRing: 'border-2 border-emerald-400/60 shadow-[0_0_14px_rgba(74,222,128,0.25)]',
    btnStyle: 'outline',
    btnBgColor: 'transparent',
    btnBorder: 'border border-emerald-400/45',
    fontDisplay: 'Bricolage Grotesque'
  },
  {
    id: 'fiesta',
    name: 'Fiesta',
    descEN: 'Sinulog neon carnival, electric',
    descTL: 'Makulay na sayaw at liwanag',
    bgClass: 'bg-fiesta',
    avatarRing: 'border-[2.5px] border-cyan-300/80 shadow-[0_0_18px_rgba(34,211,238,0.45)]',
    btnStyle: 'pill',
    btnBgColor: 'rgba(124, 58, 237, 0.8)',
    btnBorder: 'border border-cyan-300/25',
    fontDisplay: 'Bricolage Grotesque'
  },
  {
    id: 'tisa',
    name: 'Tisa',
    descEN: 'Warm Manila broadsheet editorial',
    descTL: 'Mainit na pahayagan, malinis na disenyo',
    bgClass: 'bg-tisa',
    avatarRing: 'border-2 border-slate-600/60',
    btnStyle: 'filled',
    btnBgColor: '#1e293b',
    btnBorder: 'border-none',
    fontDisplay: 'DM Sans'
  },
  {
    id: 'habi',
    name: 'Habi',
    descEN: 'Ifugao amber forge, woven richness',
    descTL: 'Gintong hinabing yaman ng Ifugao',
    bgClass: 'bg-habi',
    avatarRing: 'border-2 border-amber-300/65 shadow-[0_0_16px_rgba(251,191,36,0.3)]',
    btnStyle: 'glass',
    btnBgColor: 'rgba(40, 14, 0, 0.65)',
    btnBorder: 'border border-amber-400/25',
    fontDisplay: 'DM Sans'
  },
  {
    id: 'buko',
    name: 'Buko',
    descEN: 'Tropical coconut grove, crisp fresh',
    descTL: 'Sariwa at malamig tulad ng buko',
    bgClass: 'bg-buko',
    avatarRing: 'border-2 border-green-700/70',
    btnStyle: 'pill',
    btnBgColor: '#15803d',
    btnBorder: 'border border-green-900/30',
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
    claimBtn: "Claim link.merqato.digital/",
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
    claimBtn: "I-claim ang link.merqato.digital/",
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
