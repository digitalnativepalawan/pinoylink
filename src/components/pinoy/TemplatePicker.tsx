// @ts-nocheck
import { useState, useRef, useEffect, useCallback } from 'react';
import { Check, ChevronRight, ChevronLeft } from 'lucide-react';
import { TEMPLATES, type TemplateItem } from '../data';
import RisingSunSVG from './RisingSunSVG';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface TemplatePickerProps {
  lang: 'en' | 'tl';
  selectedTemplate: string;
  setSelectedTemplate: (id: string) => void;
}

// ─────────────────────────────────────────────────────────────
// Vibe filter config — Filipino labels
// ─────────────────────────────────────────────────────────────
const VIBES = [
  { key: 'all',     labelTL: 'Lahat',      labelEN: 'All' },
  { key: 'dark',    labelTL: '🌙 Gabi',    labelEN: '🌙 Dark' },
  { key: 'light',   labelTL: '☀️ Liwanag', labelEN: '☀️ Light' },
  { key: 'vibrant', labelTL: '⚡ Makulay', labelEN: '⚡ Vibrant' },
] as const;
type VibeKey = 'all' | 'dark' | 'light' | 'vibrant';

// ─────────────────────────────────────────────────────────────
// Mini link button preview
// ─────────────────────────────────────────────────────────────
function MiniLinkBtn({ tpl, emoji }: { tpl: TemplateItem; emoji: string }) {
  const radius =
    tpl.btnStyle === 'pill' ? '999px'
    : tpl.btnStyle === 'glass' ? '10px'
    : '8px';
  return (
    <div
      className="flex items-center gap-2 w-full px-2.5 py-1.5"
      style={{
        background: tpl.btnBgColor,
        borderRadius: radius,
        border: tpl.btnStyle === 'glass'
          ? `1px solid ${tpl.accentColor}30`
          : `1px solid ${tpl.accentColor}44`,
        ...(tpl.btnStyle === 'glass'
          ? { backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }
          : {}),
      }}
    >
      <span
        className="w-4 h-4 rounded flex items-center justify-center text-[8px] flex-shrink-0"
        style={{ background: `${tpl.accentColor}22` }}
      >
        {emoji}
      </span>
      <div
        className="flex-1 h-[5px] rounded-full opacity-50"
        style={{ background: tpl.isLight ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.35)' }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Single template card — full-height cinematic preview
// ─────────────────────────────────────────────────────────────
const CARD_EMOJIS: Record<string, string[]> = {
  watawat: ['▶️', '🛍', '💬'],
  dagat:   ['🤿', '🐠', '🌴'],
  artista: ['🎤', '💄', '🛍'],
  trabaho: ['📋', '🤝', '📊'],
  kainan:  ['🍽', '🍹', '📍'],
  gabi:    ['🎭', '🌙', '💎'],
  bukid:   ['🌱', '🏕', '🌾'],
  fiesta:  ['🎊', '🎶', '🌈'],
  habi:    ['🧵', '🏺', '🌾'],
  tisa:    ['📰', '✍️', '📚'],
  buko:    ['🥥', '🌴', '🍃'],
};

function TemplateCard({
  tpl,
  isSelected,
  lang,
  onClick,
}: {
  tpl: TemplateItem;
  isSelected: boolean;
  lang: 'en' | 'tl';
  onClick: () => void;
}) {
  const emojis = CARD_EMOJIS[tpl.id] ?? ['▶️', '🔗', '💬'];
  const txtCol = tpl.isLight ? 'rgba(0,0,0,0.85)' : '#ffffff';
  const mutedCol = tpl.isLight ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.55)';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 text-left focus:outline-none ${
        isSelected ? 'scale-[1.02]' : 'opacity-70 hover:opacity-95'
      }`}
      style={{
        width: 220,
        border: isSelected
          ? '2.5px solid #FCD116'
          : '2px solid rgba(255,255,255,0.1)',
        boxShadow: isSelected
          ? '0 0 0 3px rgba(252,209,22,0.2), 0 12px 32px rgba(0,0,0,0.5)'
          : '0 4px 16px rgba(0,0,0,0.3)',
      }}
    >
      {/* ── Cinematic preview area ── */}
      <div
        className={`${tpl.bgClass} relative flex flex-col items-center justify-start px-4 pt-6 pb-4`}
        style={{ height: 290 }}
      >
        {/* Watawat easter egg */}
        {tpl.id === 'watawat' && (
          <RisingSunSVG
            className="absolute right-0 top-0 w-[90px] h-[90px] opacity-20"
            opacity={0.2}
          />
        )}

        {/* Selected checkmark */}
        {isSelected && (
          <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-[#FCD116] flex items-center justify-center z-20 shadow-md">
            <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
          </div>
        )}

        {/* Avatar */}
        <div className="relative mb-2 z-10">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-black"
            style={{
              border: `2px solid ${tpl.accentColor}`,
              background: `${tpl.accentColor}22`,
              color: tpl.accentColor,
              boxShadow: `0 0 0 4px ${tpl.accentColor}18, 0 0 16px ${tpl.accentColor}44`,
            }}
          >
            MS
          </div>
          {/* Pulse ring */}
          <div
            className="absolute inset-0 rounded-full animate-ping pointer-events-none"
            style={{
              border: `1.5px solid ${tpl.accentColor}`,
              opacity: 0.2,
              animationDuration: '2.8s',
            }}
          />
        </div>

        {/* Name + handle */}
        <p
          className="text-[12px] font-bold text-center leading-tight z-10"
          style={{ color: txtCol, fontFamily: `${tpl.fontDisplay}, sans-serif` }}
        >
          Maria Santos
        </p>
        <p className="text-[9px] mb-3 z-10" style={{ color: mutedCol }}>
          @mariasantos
        </p>

        {/* Mini social row */}
        <div className="flex gap-1.5 mb-3 z-10">
          {['📘', '📸', '🎵'].map((s, i) => (
            <div
              key={i}
              className="w-5 h-5 rounded-full flex items-center justify-center text-[8px]"
              style={{
                background: tpl.isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)',
                border: `1px solid ${tpl.accentColor}30`,
              }}
            >
              {s}
            </div>
          ))}
        </div>

        {/* Mini link buttons */}
        <div className="w-full space-y-1.5 z-10">
          {emojis.map((emoji, i) => (
            <MiniLinkBtn key={i} tpl={tpl} emoji={emoji} />
          ))}
        </div>
      </div>

      {/* ── Info footer ── */}
      <div
        className="px-3 py-2.5"
        style={{ background: 'rgba(0,0,0,0.78)', borderTop: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-center justify-between mb-0.5">
          <span
            className="text-[13px] font-bold text-white"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            {tpl.name}
          </span>
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ background: tpl.accentColor }}
          />
        </div>
        <p className="text-[10px] leading-snug" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {lang === 'tl' ? tpl.descTL : tpl.descEN}
        </p>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Main TemplatePicker component
// ─────────────────────────────────────────────────────────────
export default function TemplatePicker({ lang, selectedTemplate, setSelectedTemplate }: TemplatePickerProps) {
  const [vibe, setVibe] = useState<VibeKey>('all');
  const [curIdx, setCurIdx] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // Filter templates by vibe
  const visible = vibe === 'all'
    ? TEMPLATES
    : TEMPLATES.filter((t) => t.category === vibe);

  // Sync curIdx when selection or filter changes
  useEffect(() => {
    const idx = visible.findIndex((t) => t.id === selectedTemplate);
    setCurIdx(idx >= 0 ? idx : 0);
  }, [selectedTemplate, vibe]);

  // Navigate to index
  const goTo = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(idx, visible.length - 1));
    setCurIdx(clamped);
    setSelectedTemplate(visible[clamped].id);
  }, [visible, setSelectedTemplate]);

  // Apply CSS transform
  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${-curIdx * 232}px)`;
    }
  }, [curIdx]);

  // Touch / drag
  useEffect(() => {
    const stage = stageRef.current;
    const track = trackRef.current;
    if (!stage || !track) return;

    let startX = 0;
    let moved = false;

    const onDown = (e: MouseEvent | TouchEvent) => {
      startX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      moved = false;
      track.style.transition = 'none';
    };
    const onMove = (e: MouseEvent | TouchEvent) => {
      const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const dx = cx - startX;
      if (Math.abs(dx) > 6) moved = true;
      track.style.transform = `translateX(${-curIdx * 232 + dx}px)`;
    };
    const onUp = (e: MouseEvent | TouchEvent) => {
      const cx = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as MouseEvent).clientX;
      const dx = cx - startX;
      track.style.transition = 'transform 0.32s cubic-bezier(0.4,0,0.2,1)';
      if (moved) {
        if (dx < -40 && curIdx < visible.length - 1) goTo(curIdx + 1);
        else if (dx > 40 && curIdx > 0) goTo(curIdx - 1);
        else goTo(curIdx); // snap back
      }
      window.removeEventListener('mousemove', onMove as any);
      window.removeEventListener('mouseup', onUp as any);
      window.removeEventListener('touchmove', onMove as any);
      window.removeEventListener('touchend', onUp as any);
    };

    const onStart = (e: MouseEvent | TouchEvent) => {
      onDown(e);
      window.addEventListener('mousemove', onMove as any);
      window.addEventListener('mouseup', onUp as any);
      window.addEventListener('touchmove', onMove as any, { passive: true });
      window.addEventListener('touchend', onUp as any);
    };

    stage.addEventListener('mousedown', onStart as any);
    stage.addEventListener('touchstart', onStart as any, { passive: true });
    return () => {
      stage.removeEventListener('mousedown', onStart as any);
      stage.removeEventListener('touchstart', onStart as any);
    };
  }, [curIdx, visible, goTo]);

  // Filter vibe changes
  const handleVibe = (key: VibeKey) => {
    setVibe(key);
    // snap to first card with selected template, or first card
    const newVisible = key === 'all' ? TEMPLATES : TEMPLATES.filter((t) => t.category === key);
    if (!newVisible.find((t) => t.id === selectedTemplate)) {
      setSelectedTemplate(newVisible[0]?.id ?? TEMPLATES[0].id);
    }
  };

  const selectedTpl = TEMPLATES.find((t) => t.id === selectedTemplate);

  return (
    <div className="space-y-4">

      {/* Heading */}
      <div className="space-y-1">
        <h2
          className="text-xl font-extrabold leading-tight"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          {lang === 'tl' ? (
            <>Piliin ang iyong <span className="text-[#FCD116]">tema.</span></>
          ) : (
            <>Choose your <span className="text-[#FCD116]">look.</span></>
          )}
        </h2>
        <p className="text-[11px] text-white/40 leading-relaxed">
          {lang === 'tl'
            ? 'Swipe para mag-browse ng lahat ng Filipino-designed themes.'
            : 'Swipe to browse all Filipino-designed identity themes.'}
        </p>
      </div>

      {/* Vibe filter pills */}
      <div className="flex gap-1.5 flex-wrap">
        {VIBES.map((v) => {
          const count = v.key === 'all'
            ? TEMPLATES.length
            : TEMPLATES.filter((t) => t.category === v.key).length;
          const isActive = vibe === v.key;
          return (
            <button
              key={v.key}
              type="button"
              onClick={() => handleVibe(v.key)}
              className="px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all"
              style={{
                background: isActive ? '#FCD116' : 'rgba(255,255,255,0.07)',
                color: isActive ? '#000' : 'rgba(255,255,255,0.55)',
                border: isActive ? '1px solid #FCD116' : '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {lang === 'tl' ? v.labelTL : v.labelEN}
              {' '}
              <span style={{ opacity: 0.6 }}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Swipe stage */}
      <div
        ref={stageRef}
        className="overflow-hidden cursor-grab active:cursor-grabbing select-none"
        style={{ touchAction: 'pan-y' }}
      >
        <div
          ref={trackRef}
          className="flex gap-3"
          style={{ transition: 'transform 0.32s cubic-bezier(0.4,0,0.2,1)', willChange: 'transform' }}
        >
          {visible.map((tpl) => (
            <TemplateCard
              key={tpl.id}
              tpl={tpl}
              isSelected={selectedTemplate === tpl.id}
              lang={lang}
              onClick={() => {
                setSelectedTemplate(tpl.id);
                setCurIdx(visible.findIndex((t) => t.id === tpl.id));
              }}
            />
          ))}
        </div>
      </div>

      {/* Dot strip + arrows */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => goTo(curIdx - 1)}
          disabled={curIdx === 0}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-all disabled:opacity-20"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>

        <div className="flex gap-1.5 justify-center flex-1">
          {visible.map((t, i) => (
            <button
              key={t.id}
              type="button"
              onClick={() => goTo(i)}
              className="h-1.5 rounded-full transition-all duration-200"
              style={{
                width: i === curIdx ? 18 : 6,
                background: i === curIdx ? '#FCD116' : 'rgba(255,255,255,0.25)',
              }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => goTo(curIdx + 1)}
          disabled={curIdx === visible.length - 1}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-all disabled:opacity-20"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Selected template name badge */}
      {selectedTpl && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: 'rgba(252,209,22,0.08)', border: '1px solid rgba(252,209,22,0.2)' }}
        >
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: selectedTpl.accentColor }}
          />
          <span className="text-[11px] text-white/60 flex-1">
            {lang === 'tl' ? 'Napili mo:' : 'Selected:'}
          </span>
          <span className="text-[11px] font-bold text-[#FCD116]">
            {selectedTpl.name}
          </span>
          <span className="text-[10px] text-white/35">
            {lang === 'tl' ? selectedTpl.descTL : selectedTpl.descEN}
          </span>
        </div>
      )}

      <p className="text-[10px] text-center text-white/25 italic">
        {lang === 'tl'
          ? '✨ Lahat ng tema ay naka-disenyo para sa mabilis na pag-browse ng Pilipino.'
          : '✨ Every theme is tailored for Filipino mobile-first browsing.'}
      </p>
    </div>
  );
}
