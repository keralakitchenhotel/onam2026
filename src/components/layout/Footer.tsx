'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { MapPin, Phone, Mail, Clock, Heart } from 'lucide-react';
import { KasavuStrip, PookalamMandala, NilavilakkuLamp, BananaLeafDivider } from '@/components/landing/KeralaDecorations';
import { VegBadgeIcon, CertificateBadgeIcon, BananaLeafIcon, FlowerIconSvg, LeafIcon, FestivalFireIcon } from '@/components/common/SvgIcons';

export default function Footer() {
  const pathname = usePathname();

  const isExcluded = pathname && (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/staff') ||
    pathname.startsWith('/deliver') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/login')
  );

  if (isExcluded) return null;
  return (
    <footer className="bg-gradient-to-b from-coconut-200 via-coconut-200 to-coconut-300 border-t border-gold/25 pt-16 pb-28 md:pb-14 text-slate-700 relative overflow-hidden">
      {/* ---- Decorative Elements ---- */}
      {/* Pookalam in background */}
      <div className="absolute -bottom-16 -right-16 opacity-[0.04] pointer-events-none">
        <PookalamMandala size={300} />
      </div>
      
      {/* Kasavu Gold Top Border */}
      <div className="absolute top-0 left-0 right-0">
        <div className="h-[3px] bg-gradient-to-r from-transparent via-gold to-transparent" />
        <div className="h-[1px] mt-px bg-gradient-to-r from-transparent via-gold-deep/40 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand Info */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-52 overflow-hidden rounded-xl bg-leaf-dark/95 p-1 border border-gold/40 shadow-md">
                <Image
                  src="/kerala-kitchen-logo-transparent.png"
                  alt="കേരള കിച്ചൺ വലിയപറമ്പ്"
                  fill
                  sizes="208px"
                  className="object-contain p-1"
                />
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Bringing authentic, traditional Kerala Onam Sadya with 23 hand-prepared delicacies served fresh on cut plantain banana leaves. Celebrate Onam with Kerala Kitchen Valiyaparambu!
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-leaf-soft text-leaf-dark rounded-full border border-leaf/20">
                <VegBadgeIcon className="w-3.5 h-3.5" /> 100% Pure Veg
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-gold-soft text-gold-deep rounded-full border border-gold/30">
                <CertificateBadgeIcon className="w-3.5 h-3.5 text-gold-deep" /> Festival Certified
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-maroon-soft text-maroon rounded-full border border-maroon/20">
                <BananaLeafIcon className="w-3.5 h-3.5" /> Eco Banana Leaf
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-bold text-leaf-dark mb-5 flex items-center gap-2">
              <FlowerIconSvg className="w-4 h-4 text-gold" /> Quick Links
            </h4>
            <ul className="space-y-3 text-base">
              {[
                { href: '/', label: 'Home & Festival Highlights' },
                { href: '/menu', label: 'Full 23-Item Sadya Menu' },
                { href: '/book', label: 'Online Sadya Pre-Booking', bold: true },
                { href: '/dashboard', label: 'Customer Account & Addresses' },
                { href: '/track', label: 'Track Your Sadya Order' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`kerala-link hover:text-leaf-dark transition-colors ${link.bold ? 'font-bold text-leaf' : 'text-slate-600'} block py-2 px-2 touch-target`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-serif text-lg font-bold text-leaf-dark mb-5 flex items-center gap-2">
              <LeafIcon className="w-4 h-4 text-gold" /> Restaurant Details
            </h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <span>KERALA KITCHEN, Valiyaparamba, Kerala</span>
              </li>
              <li className="flex flex-col gap-1">
                <div className="flex items-center gap-2 font-semibold text-leaf">
                  <Phone className="w-4 h-4 text-gold shrink-0" />
                  <span>Bookings & Inquiries:</span>
                </div>
                <div className="pl-6 space-y-1 font-bold text-slate-800 text-sm">
                  <a href="tel:9447445078" className="hover:text-leaf hover:underline block py-2 touch-target">📞 9447 44 50 78</a>
                  <a href="tel:9745627203" className="hover:text-leaf hover:underline block py-2 touch-target">📞 9745 62 72 03</a>
                </div>
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-slate-700">
                <Clock className="w-4 h-4 shrink-0 text-maroon" />
                <span>Open Daily • Closing Around 9:00 PM</span>
              </li>
              <li className="flex items-center gap-2 text-sm font-semibold text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                <span>🍛 All-you-can-eat • 🌿 Outdoor seating</span>
              </li>
            </ul>
          </div>

          {/* Onam Dates & Portals */}
          <div>
            <h4 className="font-serif text-lg font-bold text-leaf-dark mb-5 flex items-center gap-2">
              <FestivalFireIcon className="w-4 h-4 text-gold" /> Onam Festival 2026
            </h4>
            <div className="space-y-2 text-sm">
              <div className="p-2.5 rounded-xl bg-white/60 border border-gold/20 flex justify-between items-center">
                <span>First Onam (Uthradam)</span>
                <span className="font-bold text-leaf-dark">Aug 25, 2026</span>
              </div>
              <div className="p-2.5 rounded-xl bg-gold-soft/80 border border-gold/50 flex justify-between items-center font-bold text-slate-900">
                <span className="flex items-center gap-1.5">
                  <FestivalFireIcon className="w-3.5 h-3.5 text-maroon" />
                  <span>THIRUVONAM</span>
                </span>
                <span className="text-maroon font-extrabold">Aug 26, 2026</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/60 border border-gold/20 flex justify-between items-center">
                <span>Third Onam (Avittom)</span>
                <span className="font-bold text-leaf-dark">Aug 27, 2026</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <BananaLeafDivider className="mt-10 mb-4" />
        <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500 gap-4">
          <p>© 2026 Kerala Kitchen Onam Booking. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" /> in Kerala, India 🇮🇳
          </p>
        </div>
      </div>
    </footer>
  );
}
