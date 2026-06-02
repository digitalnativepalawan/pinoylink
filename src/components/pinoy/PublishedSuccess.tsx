// @ts-nocheck
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Check, Copy, ExternalLink, Share2, Sparkles, ArrowRight } from 'lucide-react';

interface Props {
  fullName: string;
  handle: string;
  url: string;
  shortUrl: string;
  onContinue: () => void;
}

export default function PublishedSuccess({ fullName, handle, url, shortUrl, onContinue }: Props) {
  const [qr, setQr] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(url, {
      margin: 1,
      width: 320,
      color: { dark: '#0a0a0a', light: '#FCD116' },
    }).then(setQr).catch(() => setQr(''));
  }, [url]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${fullName} on link.merqato.digital`,
          text: `Check out my link in bio: ${shortUrl}`,
          url,
        });
      } catch {}
    } else {
      copy();
    }
  };

  return (
    <div className="w-full max-w-[390px] mx-auto min-h-screen flex flex-col p-6 bg-[#0a0a0a] text-white border-x border-white/5">
      {/* Hero */}
      <div className="pt-6 text-center space-y-3 animate-fadeIn">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FCD116]/10 border border-[#FCD116]/30">
          <Sparkles className="w-3.5 h-3.5 text-[#FCD116]" />
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#FCD116]">
            YOUR LINK IS LIVE
          </span>
        </div>
        <h1
          className="text-3xl font-extrabold tracking-tight"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          Mabuhay, {fullName.split(' ')[0]}! 🎉
        </h1>
        <p className="text-sm text-white/60">
          Share your one link with the world.
        </p>
      </div>

      {/* Short URL card */}
      <div className="mt-6 rounded-2xl bg-gradient-to-br from-[#FCD116]/15 to-white/[0.02] border border-[#FCD116]/30 p-5 space-y-4">
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-widest text-white/40 font-mono mb-1">
            Your short URL
          </div>
          <div className="text-lg font-mono font-bold break-all">
            <span className="text-white/50">link.merqato.digital/</span>
            <span className="text-[#FCD116]">{handle}</span>
          </div>
        </div>

        {/* QR */}
        {qr && (
          <div className="flex justify-center">
            <div className="rounded-xl overflow-hidden border-2 border-[#FCD116] bg-[#FCD116] p-1">
              <img src={qr} alt="QR code" className="w-44 h-44 block" />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={copy}
            className="flex items-center justify-center gap-1.5 bg-white text-black font-bold text-xs py-3 rounded-xl hover:bg-[#FCD116] transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy link'}
          </button>
          <button
            onClick={share}
            className="flex items-center justify-center gap-1.5 bg-white/10 text-white font-bold text-xs py-3 rounded-xl hover:bg-white/20 transition-colors cursor-pointer border border-white/10"
          >
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
        </div>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-xs text-white/70 hover:text-white pt-1"
        >
          <ExternalLink className="w-3.5 h-3.5" /> Open my page
        </a>
      </div>

      {/* Continue */}
      <div className="mt-auto pt-8 pb-4 space-y-2">
        <button
          onClick={onContinue}
          className="w-full bg-[#FCD116] text-black py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_20px_rgba(252,209,22,0.3)]"
        >
          Continue to editor <ArrowRight className="w-4 h-4" />
        </button>
        <p className="text-[10px] text-center text-white/30 font-mono">
          You can edit links, theme, and payments next.
        </p>
      </div>
    </div>
  );
}
