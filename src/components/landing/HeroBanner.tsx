'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Utensils, ChevronRight, Award, ShieldCheck, Clock, MapPin, Sparkles, Phone, FileText, X, Eye } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import { FloatingPetals, PookalamMandala, CoconutPalm, KasavuStrip, NilavilakkuLamp, KingMaveliIllustration, MaveliBannerBadge } from './KeralaDecorations';
import { LeafIcon, BananaLeafIcon, VegBadgeIcon, FestivalFireIcon, SadyaThaliIcon } from '@/components/common/SvgIcons';
import { RESTAURANT_DETAILS } from '@/lib/constants';

export default function HeroBanner() {
  const [showPosterModal, setShowPosterModal] = useState(false);

  return (
    <section className="relative pt-24 pb-12 md:pt-32 md:pb-20 bg-hero-gradient overflow-hidden ribbon-top">
      {/* ---- Background Kerala Cultural Decorations ---- */}
      
      {/* Pookalam mandala in top left corner */}
      <div className="absolute -top-16 -left-16 opacity-[0.06] animate-pookalam pointer-events-none">
        <PookalamMandala size={340} />
      </div>
      
      {/* Pookalam mandala in bottom right corner */}
      <div className="absolute -bottom-20 -right-20 opacity-[0.05] animate-pookalam pointer-events-none" style={{ animationDirection: 'reverse' }}>
        <PookalamMandala size={300} />
      </div>

      {/* Coconut Palm silhouettes on edges */}
      <div className="absolute bottom-0 left-0 opacity-40 hidden lg:block pointer-events-none">
        <CoconutPalm side="left" />
      </div>
      <div className="absolute bottom-0 right-0 opacity-40 hidden lg:block pointer-events-none">
        <CoconutPalm side="right" />
      </div>
      
      {/* Floating flower petals */}
      <FloatingPetals />

      {/* Soft radial glow behind content */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[650px] bg-gold/[0.08] rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="space-y-6">
          {/* Welcome Banner Badge */}
          <div className="flex justify-center">
            <MaveliBannerBadge className="animate-pulse-subtle" />
          </div>

          {/* Hero Main Content Split Layout: Text + King Maveli / Poster Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2 text-center lg:text-left">
            {/* Left Column: Headline & Description */}
            <div className="lg:col-span-8 space-y-5">
              {/* Location & Status Pill */}
              <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md border border-gold/40 shadow-sm text-leaf-dark text-xs sm:text-sm font-semibold mx-auto lg:mx-0">
                <MapPin className="w-4 h-4 text-maroon shrink-0" />
                <span>Valiyaparamba, Kerala</span>
                <span className="w-1.5 h-1.5 rounded-full bg-leaf animate-ping" />
                <span className="text-[11px] font-extrabold text-maroon uppercase bg-maroon-soft px-3 py-0.5 rounded-full border border-maroon/20">
                  ഓഗസ്റ്റ് 25, 26, 27
                </span>
              </div>

              {/* Main Headline with Extracted Logo Styling */}
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-black text-leaf-dark leading-[1.12] tracking-tight">
                <span className="text-maroon">കേരള കിച്ചൺ</span> വലിയപറമ്പ് <br />
                <span className="gold-gradient-text font-serif italic">ഓണ സദ്യ (Onam Sadya 2026)</span>
              </h1>

              {/* Subheading with exact pricing from poster */}
              <p className="text-slate-700 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Celebrate Thiruvonam with authentic 23-item traditional Kerala Sadya served fresh on cut plantain banana leaf. 
                Pre-book your feast today!
              </p>

              {/* Pricing Cards Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto lg:mx-0 pt-1">
                <div className="p-3.5 bg-gradient-to-br from-white to-coconut-100 rounded-2xl border-2 border-gold/40 shadow-sm text-center sm:text-left space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Dine-in / Per Person</div>
                  <div className="text-2xl font-black text-maroon flex items-baseline gap-1">
                    <span>₹220</span>
                    <span className="text-xs font-bold text-slate-600">/ ഡൈനിംഗ്</span>
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold">23 Traditional Delicacies</div>
                </div>

                <div className="p-3.5 bg-gradient-to-br from-gold-soft to-white rounded-2xl border-2 border-gold/60 shadow-sm text-center sm:text-left space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-maroon">Family Pack (5 Pax)</div>
                  <div className="text-2xl font-black text-leaf-dark flex items-baseline gap-1">
                    <span>₹1300</span>
                    <span className="text-xs font-bold text-slate-600">/ 5 പേർക്ക്</span>
                  </div>
                  <div className="text-[11px] text-maroon font-semibold">Includes 5 Leaves & Payasam</div>
                </div>
              </div>

              {/* Quick Contact & Dates Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-1">
                <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold shadow-sm">
                  <span>📅</span> ഓഗസ്റ്റ് 25 (Uthradam)
                </div>
                <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold shadow-sm">
                  <span>✨</span> ഓഗസ്റ്റ് 26 (Thiruvonam)
                </div>
                <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold shadow-sm">
                  <span>🌿</span> ഓഗസ്റ്റ് 27 (Avittom)
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-3">
                <Link
                  href="/book"
                  className="w-full sm:w-auto bg-gradient-to-r from-leaf via-leaf-dark to-leaf hover:from-leaf-dark hover:via-leaf hover:to-leaf-dark text-white font-bold text-base px-9 py-4 rounded-full shadow-glow-green hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 group"
                >
                  <Calendar className="w-5 h-5 text-gold-light" />
                  <span>Pre-Book Sadya (₹220)</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <button
                  type="button"
                  onClick={() => setShowPosterModal(true)}
                  className="w-full sm:w-auto bg-white hover:bg-coconut-100 text-maroon border-2 border-gold/50 font-bold text-base px-8 py-4 rounded-full shadow-soft hover:shadow-gold transition-all flex items-center justify-center gap-2.5"
                >
                  <Eye className="w-5 h-5 text-gold-deep" />
                  <span>View Official Poster</span>
                </button>
              </div>
            </div>

            {/* Right Column: Poster Card & King Maveli (Hidden on smartphone view to save space) */}
            <div className="hidden lg:flex lg:col-span-4 flex-col items-center justify-center relative">
              <div className="relative p-5 rounded-3xl bg-gradient-to-b from-white via-coconut-50 to-gold-soft/80 border-2 border-gold/40 shadow-card-lg backdrop-blur-md max-w-sm w-full text-center space-y-3 group hover:border-gold transition-all duration-300">
                {/* Brand Logo header */}
                <div className="relative h-16 w-full overflow-hidden rounded-2xl bg-leaf-dark p-2 border border-gold/40 shadow-inner flex items-center justify-center">
                  <Image
                    src="/kerala-kitchen-logo-transparent.png"
                    alt="കേരള കിച്ചൺ വലിയപറമ്പ്"
                    fill
                    sizes="(min-width: 1024px) 384px, 90vw"
                    className="object-contain p-1"
                  />
                </div>

                {/* Poster Graphic Miniature Preview */}
                <button
                  type="button"
                  onClick={() => setShowPosterModal(true)}
                  aria-label="View official Onam Sadya poster"
                  className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border-2 border-gold/30 shadow-md cursor-pointer group-hover:shadow-card-lg transition-all block text-left"
                >
                  <Image
                    src="/onam-poster.jpg"
                    alt="Kerala Kitchen Onam Sadya Poster"
                    fill
                    sizes="(min-width: 1024px) 384px, 90vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-center p-3">
                    <span className="text-xs font-bold text-white bg-maroon/90 px-3 py-1.5 rounded-full border border-gold/40 flex items-center gap-1.5 shadow-lg">
                      <Eye className="w-3.5 h-3.5 text-gold-light" /> Click to Zoom Poster
                    </span>
                  </div>
                </button>

                {/* Phone Contact Box */}
                <div className="bg-white rounded-2xl p-3 border border-gold/30 shadow-sm text-xs space-y-1">
                  <div className="font-serif font-bold text-leaf-dark text-sm">
                    ബുക്കിംഗ് ആരംഭിച്ചു! (Booking Started)
                  </div>
                  <div className="pt-1 space-y-1">
                    <a href="tel:9447445078" className="flex items-center justify-center gap-1.5 font-bold text-maroon hover:underline">
                      <Phone className="w-3.5 h-3.5" /> 9447 44 50 78
                    </a>
                    <a href="tel:9745627203" className="flex items-center justify-center gap-1.5 font-bold text-maroon hover:underline">
                      <Phone className="w-3.5 h-3.5" /> 9745 62 72 03
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kasavu Gold Divider */}
        <KasavuStrip className="mt-12 mb-4" />

        {/* Live Festival Countdown */}
        <CountdownTimer />

        {/* Official Poster Modal */}
        {showPosterModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="relative bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-card-lg border-2 border-gold max-h-[90vh] flex flex-col">
              <div className="p-4 bg-leaf-dark text-white flex items-center justify-between border-b border-gold/30">
                <div className="font-serif font-bold text-lg flex items-center gap-2">
                  <span>കേരള കിച്ചൺ വലിയപറമ്പ് - ഓണ സദ്യ Poster</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPosterModal(false)}
                  aria-label="Close poster"
                  className="p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="relative flex-1 overflow-auto p-2 bg-coconut-100 flex items-center justify-center">
                <Image
                  src="/onam-poster.jpg"
                  alt="Kerala Kitchen Onam Sadya Official Poster"
                  width={768}
                  height={1024}
                  className="w-full h-auto rounded-xl shadow-md"
                />
              </div>
              <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div>
                  <div className="text-xs font-extrabold text-maroon">ബുക്കിംഗ് ആരംഭിച്ചു: 9447445078 / 9745627203</div>
                  <div className="text-[11px] text-slate-600 font-semibold">ഡൈനിംഗ്: ₹220 | ഫാമിലി പാക്ക് (5 Pax): ₹1300</div>
                </div>
                <Link
                  href="/book"
                  onClick={() => setShowPosterModal(false)}
                  className="bg-leaf text-white text-xs font-bold px-5 py-2.5 rounded-full hover:bg-leaf-dark transition-colors shrink-0"
                >
                  Pre-Book Now
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

