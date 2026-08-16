'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Utensils, Calendar, ClipboardList } from 'lucide-react';
import { SadyaThaliIcon } from '@/components/common/SvgIcons';
import { isPortalPath } from '@/lib/navigation';

export default function MobileBottomNav() {
  const pathname = usePathname();

  if (isPortalPath(pathname)) return null;

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/menu', icon: Utensils, label: 'Menu' },
    { href: '/book', icon: Calendar, label: 'Book', primary: true },
    { href: '/track', icon: ClipboardList, label: 'Track' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-xl border-t border-gold/30 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] safe-bottom">
      {/* Kasavu gold top line - thicker for visibility */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-leaf via-gold to-maroon" />

      <div className="flex items-center justify-around py-2.5 px-2">
        {navItems.map(({ href, icon: Icon, label, primary }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-2 rounded-xl transition-all relative touch-target ${
                primary
                  ? isActive
                    ? 'bg-gradient-to-br from-leaf to-leaf-dark text-white shadow-glow-green -mt-4 py-3 rounded-2xl border-2 border-gold/40'
                    : 'bg-gradient-to-br from-leaf to-leaf-dark text-white -mt-4 py-3 rounded-2xl border-2 border-gold/30 shadow-lg'
                  : isActive
                  ? 'text-leaf-dark bg-leaf-soft/60'
                  : 'text-slate-500 hover:text-leaf-dark hover:bg-coconut-100'
              }`}
            >
              <Icon className={`${primary ? 'w-5 h-5 text-gold-light' : 'w-5 h-5'}`} />
              <span className={`text-[11px] font-extrabold mt-1 ${primary ? 'text-gold-light' : 'uppercase tracking-wider'}`}>
                {label}
              </span>
              {isActive && !primary && (
                <div className="absolute bottom-1.5 w-4 h-[2.5px] bg-gradient-to-r from-gold to-leaf rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
