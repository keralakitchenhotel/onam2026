'use client';
import Image from 'next/image';

/* ================================================
   Kerala Cultural SVG Decorations & Dividers
   Authentic Pookalam, Nilavilakku, Banana Leaf motifs
   ================================================ */

/* ---- Pookalam Floral Mandala ---- */
export function PookalamMandala({ size = 200, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" className={className} aria-hidden="true">
      {/* Outer ring of petals */}
      {[...Array(12)].map((_, i) => (
        <g key={`outer-${i}`} transform={`rotate(${i * 30} 100 100)`}>
          <ellipse cx="100" cy="30" rx="14" ry="28" fill={i % 3 === 0 ? '#F9A825' : i % 3 === 1 ? '#E67E22' : '#D4AF37'} opacity="0.8" />
          <ellipse cx="100" cy="30" rx="8" ry="20" fill={i % 2 === 0 ? '#FFEB3B' : '#FFC107'} opacity="0.5" />
        </g>
      ))}
      {/* Middle ring of petals */}
      {[...Array(8)].map((_, i) => (
        <g key={`mid-${i}`} transform={`rotate(${i * 45} 100 100)`}>
          <ellipse cx="100" cy="52" rx="11" ry="22" fill={i % 2 === 0 ? '#EF5350' : '#8E2430'} opacity="0.7" />
          <ellipse cx="100" cy="54" rx="6" ry="15" fill="#FF8A65" opacity="0.4" />
        </g>
      ))}
      {/* Inner small petals */}
      {[...Array(6)].map((_, i) => (
        <g key={`inner-${i}`} transform={`rotate(${i * 60} 100 100)`}>
          <ellipse cx="100" cy="70" rx="8" ry="16" fill={i % 2 === 0 ? '#4CAF50' : '#2E7D32'} opacity="0.75" />
        </g>
      ))}
      {/* Center circle */}
      <circle cx="100" cy="100" r="12" fill="#D4AF37" stroke="#B78103" strokeWidth="2" />
      <circle cx="100" cy="100" r="6" fill="#FFEB3B" />
    </svg>
  );
}

/* ---- Nilavilakku (Kerala Traditional Brass Lamp) ---- */
export function NilavilakkuLamp({ className = '' }: { className?: string }) {
  return (
    <svg width="40" height="56" viewBox="0 0 40 56" className={className} aria-hidden="true">
      {/* Flame */}
      <ellipse cx="20" cy="8" rx="5" ry="8" fill="#F9A825" className="animate-flame" />
      <ellipse cx="20" cy="8" rx="3" ry="5" fill="#FFEB3B" opacity="0.8" className="animate-flame" />
      {/* Wick */}
      <rect x="19" y="12" width="2" height="6" fill="#8D6E63" rx="1" />
      {/* Lamp body */}
      <ellipse cx="20" cy="22" rx="10" ry="5" fill="#D4AF37" stroke="#B78103" strokeWidth="1" />
      <rect x="17" y="22" width="6" height="14" fill="#D4AF37" rx="1" />
      {/* Stem */}
      <rect x="18" y="36" width="4" height="10" fill="#B78103" rx="1" />
      {/* Base */}
      <ellipse cx="20" cy="48" rx="14" ry="5" fill="#D4AF37" stroke="#B78103" strokeWidth="1" />
      <ellipse cx="20" cy="50" rx="12" ry="4" fill="#B78103" opacity="0.5" />
    </svg>
  );
}

/* ---- Banana Leaf Divider ---- */
export function BananaLeafDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`w-full flex items-center justify-center gap-3 py-4 ${className}`}>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/40 to-gold/60" />
      <svg width="60" height="24" viewBox="0 0 60 24" aria-hidden="true">
        {/* Left leaf */}
        <path d="M5 12 Q15 4 28 12 Q15 20 5 12Z" fill="#4CAF50" opacity="0.6" />
        <path d="M8 12 Q15 7 25 12" stroke="#2E7D32" strokeWidth="0.5" fill="none" />
        {/* Center dot */}
        <circle cx="30" cy="12" r="3" fill="#D4AF37" />
        <circle cx="30" cy="12" r="1.5" fill="#F9A825" />
        {/* Right leaf */}
        <path d="M55 12 Q45 4 32 12 Q45 20 55 12Z" fill="#4CAF50" opacity="0.6" />
        <path d="M52 12 Q45 7 35 12" stroke="#2E7D32" strokeWidth="0.5" fill="none" />
      </svg>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gold/40 to-gold/60" />
    </div>
  );
}

/* ---- Floating Flower Petals (animated, for Hero) ---- */
export function FloatingPetals({ className = '' }: { className?: string }) {
  const petals = [
    { x: '8%', y: '15%', size: 20, color: '#F9A825', delay: '0s', dur: '7s' },
    { x: '20%', y: '70%', size: 16, color: '#EF5350', delay: '1s', dur: '9s' },
    { x: '75%', y: '20%', size: 18, color: '#FF8A65', delay: '0.5s', dur: '8s' },
    { x: '85%', y: '60%', size: 14, color: '#D4AF37', delay: '2s', dur: '6s' },
    { x: '40%', y: '80%', size: 12, color: '#FFEB3B', delay: '1.5s', dur: '10s' },
    { x: '60%', y: '10%', size: 15, color: '#FF7043', delay: '3s', dur: '7.5s' },
    { x: '92%', y: '40%', size: 11, color: '#81C784', delay: '0.8s', dur: '8.5s' },
    { x: '15%', y: '45%', size: 13, color: '#CE93D8', delay: '2.5s', dur: '9s' },
  ];

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
      {petals.map((p, i) => (
        <div
          key={i}
          className="absolute animate-float-petal"
          style={{
            left: p.x,
            top: p.y,
            animationDelay: p.delay,
            animationDuration: p.dur,
          }}
        >
          <svg width={p.size} height={p.size} viewBox="0 0 20 20">
            <ellipse cx="10" cy="10" rx="8" ry="5" fill={p.color} opacity="0.45" transform="rotate(30 10 10)" />
          </svg>
        </div>
      ))}
    </div>
  );
}

/* ---- Coconut Palm Tree Silhouette ---- */
export function CoconutPalm({ side = 'left', className = '' }: { side?: 'left' | 'right'; className?: string }) {
  return (
    <div
      className={className}
      style={side === 'right' ? { transform: 'scale(-1, 1)' } : undefined}
      aria-hidden="true"
    >
      <svg width="120" height="200" viewBox="0 0 120 200" className="animate-sway">
        {/* Trunk */}
        <path d="M60 200 Q55 150 58 100 Q60 80 62 100 Q65 150 60 200Z" fill="#8D6E63" opacity="0.2" />
        {/* Fronds */}
        <path d="M60 100 Q30 60 5 70" stroke="#2E7D32" strokeWidth="2" fill="none" opacity="0.15" />
        <path d="M60 100 Q20 50 10 40" stroke="#2E7D32" strokeWidth="2" fill="none" opacity="0.12" />
        <path d="M60 100 Q40 45 20 30" stroke="#4CAF50" strokeWidth="1.5" fill="none" opacity="0.12" />
        <path d="M60 100 Q90 60 115 70" stroke="#2E7D32" strokeWidth="2" fill="none" opacity="0.15" />
        <path d="M60 100 Q100 50 110 40" stroke="#2E7D32" strokeWidth="2" fill="none" opacity="0.12" />
        <path d="M60 100 Q80 45 100 30" stroke="#4CAF50" strokeWidth="1.5" fill="none" opacity="0.12" />
        {/* Coconuts */}
        <circle cx="55" cy="97" r="4" fill="#8D6E63" opacity="0.2" />
        <circle cx="65" cy="96" r="4" fill="#795548" opacity="0.18" />
      </svg>
    </div>
  );
}

/* ---- Kasavu Gold Border Strip (horizontal) ---- */
export function KasavuStrip({ className = '' }: { className?: string }) {
  return (
    <div className={`w-full ${className}`} aria-hidden="true">
      <div className="h-[3px] bg-gradient-to-r from-transparent via-gold to-transparent" />
      <div className="h-[1px] mt-[2px] bg-gradient-to-r from-transparent via-gold-deep/50 to-transparent" />
    </div>
  );
}

/* ---- King Maveli (Mahabali) Cultural SVG Illustration ---- */
export function KingMaveliIllustration({ className = '' }: { className?: string }) {
  return (
    <div className={`relative inline-flex flex-col items-center ${className}`} aria-label="King Mahabali Illustration">
      {/* Outer ambient glow ring */}
      <div className="absolute inset-0 rounded-full" style={{
        background: 'radial-gradient(ellipse at 50% 60%, rgba(212,175,55,0.45) 0%, rgba(212,175,55,0.18) 45%, transparent 75%)',
        filter: 'blur(18px)',
        transform: 'scale(1.15)',
        zIndex: 0,
      }} />

      {/* Animated rotating halo ring */}
      <div className="absolute" style={{
        top: '4%', left: '5%', right: '5%', bottom: '10%',
        borderRadius: '50%',
        border: '2px solid rgba(212,175,55,0.35)',
        boxShadow: '0 0 24px 4px rgba(212,175,55,0.25), inset 0 0 16px 2px rgba(212,175,55,0.1)',
        animation: 'spin 18s linear infinite',
        zIndex: 1,
      }} />

      {/* Second thinner ring */}
      <div className="absolute" style={{
        top: '2%', left: '2%', right: '2%', bottom: '8%',
        borderRadius: '50%',
        border: '1px dashed rgba(212,175,55,0.25)',
        animation: 'spin 30s linear infinite reverse',
        zIndex: 1,
      }} />

      {/* Main 3D image container */}
      <div className="relative z-10" style={{
        filter: 'drop-shadow(0 12px 40px rgba(212,175,55,0.55)) drop-shadow(0 4px 16px rgba(139,0,0,0.25))',
      }}>
        <Image
          src="/maveli-3d.png"
          alt="King Mahabali — the legendary benevolent ruler of Kerala, depicted in royal attire with golden crown, jewels and Kasavu dhoti"
          width={260}
          height={320}
          className="object-contain"
          priority
          style={{
            filter: 'contrast(1.06) saturate(1.12) brightness(1.04)',
            maxHeight: '320px',
            width: 'auto',
          }}
        />
      </div>

      {/* Corner jewel decorations */}
      <div className="absolute top-4 left-6 w-3 h-3 rounded-full z-20" style={{ background: 'radial-gradient(circle, #FFF176, #F9A825)', boxShadow: '0 0 8px 2px rgba(249,168,37,0.7)' }} />
      <div className="absolute top-4 right-6 w-3 h-3 rounded-full z-20" style={{ background: 'radial-gradient(circle, #FF8A80, #B71C1C)', boxShadow: '0 0 8px 2px rgba(183,28,28,0.6)' }} />
      <div className="absolute top-12 left-2 w-2 h-2 rounded-full z-20" style={{ background: 'radial-gradient(circle, #B9F6CA, #1B5E20)', boxShadow: '0 0 6px 1px rgba(27,94,32,0.6)' }} />
      <div className="absolute top-12 right-2 w-2 h-2 rounded-full z-20" style={{ background: 'radial-gradient(circle, #B9F6CA, #1B5E20)', boxShadow: '0 0 6px 1px rgba(27,94,32,0.6)' }} />

      {/* Cultural label badge */}
      <div className="relative z-10 mt-2 px-4 py-1 rounded-full text-center" style={{
        background: 'linear-gradient(90deg, rgba(212,175,55,0.15), rgba(212,175,55,0.3), rgba(212,175,55,0.15))',
        border: '1px solid rgba(212,175,55,0.5)',
        backdropFilter: 'blur(8px)',
      }}>
        <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-amber-800">👑 King Mahabali</span>
      </div>
    </div>
  );
}

/* ---- King Maveli Welcome Banner Component ---- */
export function MaveliBannerBadge({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-gold-soft via-white to-gold-soft border-2 border-gold/60 shadow-gold backdrop-blur-md ${className}`}>
      <span className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center border border-gold shrink-0">
        <span className="text-base">👑</span>
      </span>
      <div className="text-left">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-maroon block leading-tight">
          King Mahabali's Royal Welcome
        </span>
        <span className="text-xs sm:text-sm font-bold text-leaf-dark font-serif">
          "മാവേലി നാടു വാണീടും കാലം..." Welcome to Onam 2026!
        </span>
      </div>
    </div>
  );
}

/* ---- Section Title with Decorative Elements ---- */
export function SectionTitle({
  badge,
  title,
  subtitle,
  className = '',
}: {
  badge: string;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={`text-center max-w-3xl mx-auto space-y-3 ${className}`}>
      <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-coconut-100 to-coconut-200 border border-gold/30 text-xs font-bold uppercase tracking-[0.15em] text-maroon shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
        {badge}
        <span className="w-1.5 h-1.5 rounded-full bg-leaf animate-pulse" />
      </span>
      <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-leaf-dark leading-tight tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-slate-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
      <BananaLeafDivider className="pt-2" />
    </div>
  );
}
