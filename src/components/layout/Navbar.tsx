'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Home, Calendar, ShoppingBag, Menu as MenuIcon, X, Utensils, Truck, Images, Star, PhoneCall, MapPin, LogIn, LayoutDashboard, ShieldCheck, ChevronDown } from 'lucide-react';
import { FestivalFireIcon } from '@/components/common/SvgIcons';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Update CSS custom property for header height (used by mobile menu).
  // Only measure while the menu is CLOSED: once the menu renders inside the
  // header, its own height inflates the measurement and collapses the menu
  // to ~0px (max-h = 100vh - header-height ≈ 0).
  useEffect(() => {
    if (mobileMenuOpen) return;
    if (headerRef.current) {
      const height = headerRef.current.offsetHeight;
      document.documentElement.style.setProperty('--header-height', `${height}px`);
    }
  }, [isScrolled, mobileMenuOpen]);

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/menu', label: 'Sadya Menu', icon: Utensils },
    { href: '/track', label: 'Track Order', icon: Truck },
    { href: '/contact', label: 'Contact', icon: PhoneCall },
  ];

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-[400ms] ${
        isScrolled
          ? 'bg-coconut-50/95 backdrop-blur-xl shadow-lg border-b border-gold/20 py-2'
          : 'bg-gradient-to-b from-coconut-50/80 to-transparent py-4'
      }`}
    >
      {/* Kasavu gold top line - thicker for visibility */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-leaf via-gold to-maroon" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          {/* Logo from Poster */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative h-11 w-44 sm:h-14 sm:w-52 overflow-hidden rounded-xl bg-leaf-dark/90 p-1 border border-gold/40 shadow-md group-hover:scale-105 transition-transform flex items-center justify-center">
              <Image
                src="/kerala-kitchen-logo-transparent.png"
                alt="കേരള കിച്ചൺ വലിയപറമ്പ്"
                fill
                sizes="(min-width: 640px) 208px, 176px"
                className="object-contain p-1"
                priority
              />
            </div>
            <div className="hidden xl:block">
              <span className="text-[10px] tracking-[0.15em] text-maroon font-extrabold uppercase flex items-center gap-1">
                <FestivalFireIcon className="w-3 h-3 text-gold-deep" />
                <span>ഓഗസ്റ്റ് 25, 26, 27</span>
              </span>
              <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-2.5 h-2.5 text-gold" />
                Valiyaparamba, Kerala
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`px-3.5 py-2 rounded-full text-sm font-semibold transition-all duration-200 relative ${
                    isActive
                      ? 'text-leaf-dark font-bold bg-coconut-200 border border-gold/30 shadow-inner-gold'
                      : 'text-slate-700 hover:text-leaf-dark hover:bg-coconut-100/80'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gold" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right CTA */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <a
              href="tel:09447445078"
              className="text-xs font-bold text-slate-600 hover:text-leaf flex items-center gap-1.5 bg-white/80 border border-slate-200 px-3.5 py-2 rounded-full hover:border-gold/50 transition-colors"
              title="Call us now"
            >
              <PhoneCall className="w-3.5 h-3.5 text-gold" />
              <span className="hidden xl:inline">0944 744 5078</span>
            </a>

            {isAuthenticated && user ? (
              <Link
                href={user.role === 'admin' ? '/admin' : user.role === 'staff' ? '/staff' : '/dashboard'}
                className="flex items-center gap-2 bg-white border border-leaf/30 hover:border-leaf text-leaf-dark text-xs font-bold px-3.5 py-2 rounded-full transition-colors"
                title={`Go to ${user.role} dashboard`}
              >
                {user.role === 'admin' ? (
                  <ShieldCheck className="w-4 h-4 text-gold-deep" />
                ) : (
                  <LayoutDashboard className="w-4 h-4 text-leaf" />
                )}
                <span>{user.name}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-xs font-bold text-maroon hover:bg-maroon-soft flex items-center gap-1.5 bg-white/80 border border-maroon/30 px-4 py-2 rounded-full hover:border-maroon transition-colors"
                title="Login to Admin / Staff panel"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </Link>
            )}

            <Link
              href="/book"
              className="bg-gradient-to-r from-gold via-gold-warm to-gold text-slate-900 font-bold text-sm px-6 py-2.5 rounded-full shadow-gold hover:shadow-lg hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-slate-900" />
              <span>Pre-Book Now</span>
            </Link>
          </div>

          {/* Mobile Hamburger - improved touch target */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden touch-target-lg p-3 rounded-2xl text-leaf-dark bg-coconut-100 border border-gold/25 hover:bg-coconut-200 transition-colors"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Slideout Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-coconut-50/[0.98] backdrop-blur-xl border-b border-gold/30 shadow-2xl px-4 pt-3 pb-6 overflow-y-auto max-h-[calc(100vh-var(--header-height))] max-h-[calc(100dvh-var(--header-height))]">
          {/* Festival ribbon at top */}
          <div className="h-[3px] bg-gradient-to-r from-leaf via-gold to-maroon rounded-full mb-3" />

          <nav className="space-y-1.5" aria-label="Mobile navigation">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-base font-semibold transition-colors touch-target ${
                    isActive
                      ? 'bg-gradient-to-r from-leaf to-leaf-dark text-white shadow-md'
                      : 'text-slate-800 hover:bg-coconut-200'
                  }`}
                >
                  <span
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isActive ? 'bg-white/15 text-gold' : 'bg-coconut-100 text-leaf'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </span>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-gold/20 flex flex-col gap-3">
            {isAuthenticated && user ? (
              <Link
                href={user.role === 'admin' ? '/admin' : user.role === 'staff' ? '/staff' : '/dashboard'}
                className="w-full text-center py-3.5 text-sm font-bold text-leaf-dark bg-white border border-leaf/30 rounded-2xl flex items-center justify-center gap-2 touch-target"
              >
                <LayoutDashboard className="w-4 h-4 text-leaf" />
                My Dashboard ({user.name})
              </Link>
            ) : (
              <Link
                href="/login"
                className="w-full text-center py-3.5 text-sm font-bold text-maroon bg-white border border-maroon/30 rounded-2xl flex items-center justify-center gap-2 touch-target"
              >
                <LogIn className="w-4 h-4 text-maroon" />
                Admin / Staff Login
              </Link>
            )}
            <a
              href="tel:09447445078"
              className="w-full text-center py-3.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-2xl flex items-center justify-center gap-2 touch-target"
            >
              <PhoneCall className="w-4 h-4 text-gold" />
              Call 0944 744 5078
            </a>
            <Link
              href="/book"
              className="w-full text-center py-4 text-sm font-extrabold text-slate-900 bg-gradient-to-r from-gold via-gold-warm to-gold rounded-2xl shadow-gold flex items-center justify-center gap-2 touch-target"
            >
              <Calendar className="w-4 h-4 text-slate-900" />
              Pre-Book Onam Sadya Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}