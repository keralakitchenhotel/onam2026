'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { NilavilakkuLamp } from './KeralaDecorations';
import { FlowerIconSvg, LeafIcon, FestivalFireIcon } from '@/components/common/SvgIcons';

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 28,
    hours: 14,
    minutes: 32,
    seconds: 45,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Thiruvonam 2026 in Kerala falls on August 26, 2026
    const targetDate = new Date('2026-08-26T10:00:00').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const timeUnits = [
    { label: 'Days', value: timeLeft.days, accent: 'from-leaf to-leaf-dark' },
    { label: 'Hours', value: timeLeft.hours, accent: 'from-gold-deep to-gold' },
    { label: 'Minutes', value: timeLeft.minutes, accent: 'from-maroon to-maroon-light' },
    { label: 'Seconds', value: timeLeft.seconds, accent: 'from-kerala-orange to-gold-light' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto my-8 relative">
      {/* Decorative background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-leaf/5 to-gold/5 rounded-[2rem] blur-xl" />
      
      <div className="relative bg-white/70 backdrop-blur-xl border border-gold/30 rounded-[2rem] p-5 sm:p-7 shadow-gold overflow-hidden">
        {/* Kasavu gold top border */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-gold to-transparent" />
        
        {/* Decorative lamp icons */}
        <div className="absolute top-3 left-5 opacity-30 hidden sm:block">
          <NilavilakkuLamp />
        </div>
        <div className="absolute top-3 right-5 opacity-30 hidden sm:block">
          <NilavilakkuLamp />
        </div>

        {/* Decorative SVG floral corners */}
        <div className="absolute top-2 right-2 text-gold/20 select-none pointer-events-none">
          <FlowerIconSvg className="w-6 h-6" />
        </div>
        <div className="absolute bottom-2 left-2 text-leaf/20 select-none pointer-events-none">
          <LeafIcon className="w-6 h-6" />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/40 border border-gold/50 flex items-center justify-center text-gold-deep shrink-0 shadow-inner-gold">
              <Clock className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-maroon flex items-center justify-center sm:justify-start gap-1">
                <FestivalFireIcon className="w-3.5 h-3.5" />
                <span>Onam 2026 Countdown</span>
              </span>
              <h3 className="font-serif text-lg sm:text-xl lg:text-2xl font-bold text-leaf-dark">
                Thiruvonam <span className="gold-gradient-text">2026</span> is Approaching!
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">August 26, 2026 • Valiyaparamba, Kerala 673602</span>
            </div>
          </div>

          {/* Counter Grid */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-3.5 w-full sm:w-auto">
            {timeUnits.map((unit) => (
              <div
                key={unit.label}
                className="relative flex flex-col items-center justify-center bg-white border border-gold/30 rounded-2xl py-3 px-1 sm:px-5 min-w-0 shadow-soft overflow-hidden group hover:shadow-gold transition-shadow"
              >
                {/* Background accent stripe */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${unit.accent}`} />
                
                <span className="font-serif text-2xl sm:text-3xl font-extrabold text-leaf-dark tabular-nums animate-count-pulse">
                  {mounted ? String(unit.value).padStart(2, '0') : '--'}
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mt-0.5">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
