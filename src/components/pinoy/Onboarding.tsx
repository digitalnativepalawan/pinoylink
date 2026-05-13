// @ts-nocheck
import { useState, useEffect } from 'react';
import { TEMPLATES, TRANSLATIONS } from '../data';
import RisingSunSVG from './RisingSunSVG';
import { Check, X, Loader2, ArrowRight, Sparkles, Globe, User, Mail } from 'lucide-react';

interface OnboardingProps {
  lang: 'en' | 'tl';
  setLang: (lang: 'en' | 'tl') => void;
  step: number;
  setStep: (step: number) => void;
  fullName: string;
  setFullName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  mobile: string;
  setMobile: (mobile: string) => void;
  handle: string;
  setHandle: (handle: string) => void;
  selectedTemplate: string;
  setSelectedTemplate: (id: string) => void;
  onFinish: () => void;
}

export default function Onboarding({
  lang,
  setLang,
  step,
  setStep,
  fullName,
  setFullName,
  email,
  setEmail,
  mobile,
  setMobile,
  handle,
  setHandle,
  selectedTemplate,
  setSelectedTemplate,
  onFinish
}: OnboardingProps) {
  const t = TRANSLATIONS[lang];

  // Live handle availability check state with debounce simulation
  const [isChecking, setIsChecking] = useState(false);
  const [handleStatus, setHandleStatus] = useState<'idle' | 'available' | 'taken'>('available');
  const [debouncedHandle, setDebouncedHandle] = useState(handle);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedHandle(handle);
    }, 600);
    return () => clearTimeout(timer);
  }, [handle]);

  useEffect(() => {
    if (!debouncedHandle.trim()) {
      setHandleStatus('idle');
      return;
    }
    setIsChecking(true);
    // Simulate server response after debounce
    const checkTimer = setTimeout(() => {
      const takenList = ['admin', 'pinoy', 'bayan', 'root', 'help', 'mabuhay'];
      if (takenList.includes(debouncedHandle.toLowerCase().trim())) {
        setHandleStatus('taken');
      } else {
        setHandleStatus('available');
      }
      setIsChecking(false);
    }, 400);

    return () => clearTimeout(checkTimer);
  }, [debouncedHandle]);

  return (
    <div className="w-full max-w-[390px] mx-auto min-h-screen flex flex-col justify-between p-6 bg-[#0a0a0a] text-white relative border-x border-white/5 shadow-2xl">
      
      {/* Top Header Row */}
      <div className="flex items-center justify-between w-full pt-2">
        {/* Step Indicator Pill */}
        <div className="flex items-center gap-1.5 bg-surface-2 px-3 py-1 rounded-full border border-white/10">
          <span className="w-2 h-2 rounded-full bg-[#FCD116] animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-widest text-white/80">
            {t.stepLabel.toUpperCase()} {step} <span className="text-white/30">/ 4</span>
          </span>
        </div>

        {/* EN / FIL language toggle pill */}
        <button
          onClick={() => setLang(lang === 'en' ? 'tl' : 'en')}
          className="flex items-center gap-1 bg-surface-2 hover:bg-surface-3 transition-colors px-3 py-1.5 rounded-full border border-white/10 text-xs font-bold cursor-pointer"
        >
          <Globe className="w-3 h-3 text-[#FCD116]" />
          <span className={lang === 'en' ? 'text-white' : 'text-white/40'}>EN</span>
          <span className="text-white/20">|</span>
          <span className={lang === 'tl' ? 'text-white' : 'text-white/40'}>FIL</span>
        </button>
      </div>

      {/* Main Screen Contents */}
      <div className="flex-1 py-6 flex flex-col justify-center">
        
        {/* STEP 1: Welcome / Register */}
        {step === 1 && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Cinematic Branding */}
            <div className="space-y-4 text-left mt-2">
              <div className="text-4xl font-display font-extrabold tracking-tight">
                <span className="text-white">pinoy</span>
                <span className="text-[#FCD116]">.</span>
                <span className="text-white">digital</span>
              </div>
              
              <h1 className="text-3xl font-display leading-[1.1] text-white tracking-tight mt-6">
                <div>{t.headlineLine1}</div>
                <div className="text-white/80">{t.headlineLine2}</div>
              </h1>

              <p className="text-base font-light text-secondary mt-2">
                {t.subhead}
              </p>
            </div>

            {/* Premium Form Fields */}
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1">
                  {t.fullName}
                </label>
                <div className="relative flex items-center bg-surface-1 rounded-xl border border-white/10 focus-within:border-white/40 transition-all px-3 py-2.5">
                  <User className="w-4 h-4 text-white/40 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Maria Santos"
                    className="w-full bg-transparent text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative flex items-center bg-surface-1 rounded-xl border border-white/10 focus-within:border-white/40 transition-all px-3 py-2.5">
                  <Mail className="w-4 h-4 text-white/40 mr-2 shrink-0" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="maria@santos.ph"
                    className="w-full bg-transparent text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1">
                  Philippine Mobile
                </label>
                <div className="relative flex items-center bg-surface-1 rounded-xl border border-white/10 focus-within:border-white/40 transition-all px-3 py-2.5">
                  {/* PH Flag simulation inline prefix */}
                  <div className="flex items-center gap-1.5 bg-surface-2 px-2 py-1 rounded border border-white/5 mr-2">
                    <span className="text-xs">🇵🇭</span>
                    <span className="text-xs font-mono font-bold text-white/90">+63</span>
                  </div>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="917 123 4567"
                    className="w-full bg-transparent text-sm text-white focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Step 1 Actions */}
            <div className="space-y-3 pt-4">
              <button
                onClick={() => {
                  if (!fullName.trim()) setFullName("Maria Santos");
                  setStep(2);
                }}
                className="w-full bg-white text-black hover:bg-[#FCD116] transition-colors py-3.5 px-4 rounded-xl font-bold text-center text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <span>{t.getStarted}</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>

              <button
                onClick={() => {
                  // Pre-fill and skip to builder
                  if (!fullName.trim()) setFullName("Maria Santos");
                  setHandle("mariasantos");
                  setStep(4);
                }}
                className="w-full text-center text-xs text-secondary hover:text-white transition-colors py-2 block cursor-pointer"
              >
                {t.alreadyHaveAccount} →
              </button>
            </div>

            {/* Cinematic hint footer */}
            <div className="text-center pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 text-[10px] text-white/40 font-mono">
                <Sparkles className="w-3 h-3 text-[#FCD116]" /> NO CREDIT CARD REQUIRED
              </span>
            </div>

          </div>
        )}

        {/* STEP 2: Claim your handle */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="text-left space-y-2">
              <h2 className="text-2xl font-display font-bold">{t.claimHeadline}</h2>
              <p className="text-xs text-secondary">
                This is your absolute universal Filipino bio identifier. Grab it before someone else does.
              </p>
            </div>

            {/* Editable Handle Input Row */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-medium text-muted uppercase tracking-wider">
                Your Link
              </label>
              
              <div className="relative flex items-center bg-surface-1 rounded-xl border border-visible focus-within:border-[#FCD116] transition-all p-1.5 pl-3">
                <span className="text-xs font-mono font-semibold text-white/40 select-none">
                  link.merqato.digital/
                </span>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                  placeholder="handle"
                  className="w-full bg-transparent text-sm font-mono font-bold text-white pl-0.5 focus:outline-none"
                />

                {/* Live Availability Status Badge */}
                <div className="ml-2 shrink-0 pr-2">
                  {isChecking ? (
                    <Loader2 className="w-4 h-4 text-white/40 animate-spin" />
                  ) : handleStatus === 'available' && handle.trim() ? (
                    <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-[11px] font-bold px-2 py-1 rounded border border-emerald-500/20">
                      <Check className="w-3 h-3 text-emerald-400 stroke-[3]" /> {t.available}
                    </span>
                  ) : handleStatus === 'taken' ? (
                    <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-400 text-[11px] font-bold px-2 py-1 rounded border border-rose-500/20">
                      <X className="w-3 h-3 text-rose-400 stroke-[3]" /> {t.taken}
                    </span>
                  ) : null}
                </div>
              </div>
              
              <p className="text-[11px] text-white/30 italic pl-1">
                Tip: Try typing "bayan" or "admin" to see live taken state check. Debounced 600ms.
              </p>
            </div>

            {/* Free Plan Summary Card */}
            <div className="bg-surface-2 rounded-2xl p-4 border border-white/10 space-y-3 mt-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-xs font-bold text-[#FCD116] uppercase font-mono tracking-wider">
                  LIBRE TIER INCLUDES
                </span>
                <span className="bg-white text-black text-[9px] font-bold px-1.5 py-0.5 rounded font-mono">
                  ₱0/mo
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-white/90">
                  <span className="text-emerald-400">✅</span> 2 total links
                </div>
                <div className="flex items-center gap-1.5 text-white/90">
                  <span className="text-emerald-400">✅</span> Profile photo
                </div>
                <div className="flex items-center gap-1.5 text-white/90">
                  <span className="text-emerald-400">✅</span> Payment button
                </div>
                <div className="flex items-center gap-1.5 text-white/90">
                  <span className="text-emerald-400">✅</span> Social icons
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 grid grid-cols-1 gap-1.5 text-[11px] text-white/40 font-light">
                <div className="flex items-center gap-1.5">
                  <span>🔒</span> Unlimited links <span className="text-[#FCD116] font-mono text-[9px] bg-white/5 px-1 rounded">PRO</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>🔒</span> Custom themes <span className="text-[#FCD116] font-mono text-[9px] bg-white/5 px-1 rounded">PRO</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>🔒</span> Analytics <span className="text-[#FCD116] font-mono text-[9px] bg-white/5 px-1 rounded">PRO</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center gap-2">
              <button
                onClick={() => setStep(1)}
                className="bg-surface-2 hover:bg-surface-3 transition-colors text-white py-3.5 px-4 rounded-xl text-xs font-bold cursor-pointer"
              >
                Back
              </button>

              <button
                disabled={handleStatus === 'taken' || !handle.trim()}
                onClick={() => {
                  if (handleStatus === 'available' && handle.trim()) {
                    setStep(3);
                  }
                }}
                className={`flex-1 transition-all py-3.5 px-4 rounded-xl font-bold text-center text-xs flex items-center justify-center gap-2 cursor-pointer ${
                  handleStatus === 'taken' || !handle.trim() 
                    ? 'bg-white/10 text-white/30 cursor-not-allowed' 
                    : 'bg-[#FCD116] text-black shadow-[0_4px_20px_rgba(252,209,22,0.3)]'
                }`}
              >
                <span>{t.claimBtn}{handle || 'handle'}</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
            </div>

          </div>
        )}

        {/* STEP 3: Pick your template */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            
            <div className="text-left space-y-1">
              <h2 className="text-xl font-display font-bold">{t.pickTemplate}</h2>
              <p className="text-xs text-secondary">
                Select from our top-tier Filipino signature identity presets. Fully customizable inside.
              </p>
            </div>

            {/* 11 Templates in a 2-column scrollable grid */}
            <div className="grid grid-cols-2 gap-3 pt-2 max-h-[420px] overflow-y-auto pr-1 no-scrollbar">
              {TEMPLATES.map((tpl) => {
                const isSelected = selectedTemplate === tpl.id;
                
                return (
                  <button
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl.id)}
                    className={`h-[165px] rounded-xl text-left relative p-3 flex flex-col justify-between overflow-hidden cursor-pointer transition-all border-2 ${
                      isSelected ? 'border-white ring-4 ring-white/10 scale-[1.02]' : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    {/* Render exact realistic background preview */}
                    <div className={`absolute inset-0 z-0 ${tpl.bgClass}`} />
                    
                    {/* Add SVG rising sun only to Watawat preview */}
                    {tpl.id === 'watawat' && (
                      <RisingSunSVG className="right-0 top-0 w-[120px] h-[120px]" opacity={0.25} />
                    )}

                    {/* Selected Checkmark Badge */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-white text-black rounded-full p-1 z-20 shadow-md">
                        <Check className="w-2.5 h-2.5 stroke-[4]" />
                      </div>
                    )}

                    {/* Realistic Mini-Preview Header (Avatar + Mock Name) */}
                    <div className="relative z-10 flex flex-col items-center pt-2 space-y-1.5 w-full">
                      {/* Avatar Circle */}
                      <div className={`w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[10px] font-bold text-white ${tpl.avatarRing}`}>
                        MS
                      </div>

                      {/* Fake lines simulating profile */}
                      <div className="w-16 h-2 rounded bg-white/90" />
                      <div className="w-20 h-1 rounded bg-white/40" />

                      {/* Fake Links Simulation */}
                      <div className="w-full space-y-1 pt-1.5">
                        <div 
                          className="h-3 rounded w-full"
                          style={{
                            backgroundColor: tpl.btnStyle === 'outline' ? 'transparent' : tpl.btnBgColor,
                            border: tpl.btnStyle === 'outline' ? '1px solid rgba(255,255,255,0.4)' : 'none',
                            borderRadius: tpl.btnStyle === 'pill' ? '999px' : '3px'
                          }}
                        />
                        <div 
                          className="h-3 rounded w-full opacity-80"
                          style={{
                            backgroundColor: tpl.btnStyle === 'outline' ? 'transparent' : tpl.btnBgColor,
                            border: tpl.btnStyle === 'outline' ? '1px solid rgba(255,255,255,0.4)' : 'none',
                            borderRadius: tpl.btnStyle === 'pill' ? '999px' : '3px'
                          }}
                        />
                      </div>

                      {/* Fake Social Dots */}
                      <div className="flex items-center justify-center gap-1 pt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                    </div>

                    {/* Footer Labels */}
                    <div className="relative z-10 bg-black/60 backdrop-blur-xs -mx-3 -mb-3 p-2 border-t border-white/10">
                      <div className="text-xs font-display font-bold text-white truncate">
                        {tpl.name}
                      </div>
                      <div className="text-[9px] font-light text-secondary line-clamp-1">
                        {lang === 'en' ? tpl.descEN : tpl.descTL}
                      </div>
                    </div>

                  </button>
                );
              })}
            </div>

            {/* Step 3 Actions */}
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => setStep(2)}
                className="bg-surface-2 hover:bg-surface-3 transition-colors text-white py-3 px-4 rounded-xl text-xs font-bold cursor-pointer"
              >
                Back
              </button>

              <button
                onClick={() => {
                  setStep(4);
                  onFinish();
                }}
                className="flex-1 bg-white text-black hover:bg-[#FCD116] transition-all py-3 px-4 rounded-xl font-bold text-center text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xl animate-bounce"
              >
                <span>Continue to Builder</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
            </div>

            <div className="text-[10px] text-center text-white/40 italic">
              ✨ Every option tailored specifically for rapid PH mobile consumption.
            </div>

          </div>
        )}

      </div>

      {/* Persistent Bottom Step Indicator Helper */}
      <div className="pt-2 text-center border-t border-white/5 flex items-center justify-between text-xs text-white/30">
        <span>link.merqato.digital © 2025</span>
        <span className="font-mono">🇵🇭 First-class platform</span>
      </div>

    </div>
  );
}
