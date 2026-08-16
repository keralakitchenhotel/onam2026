import MenuCard from '@/components/menu/MenuCard';
import { SADYA_MENU_ITEMS, EXTRAS_MENU } from '@/lib/constants';
import { formatINR } from '@/lib/utils';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { SectionTitle, KasavuStrip, BananaLeafDivider, PookalamMandala } from '@/components/landing/KeralaDecorations';
import { SadyaThaliIcon, DessertPayasamIcon } from '@/components/common/SvgIcons';

export default function MenuPage() {
  return (
    <div className="pt-28 pb-20 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-20 right-0 opacity-[0.03] pointer-events-none">
        <PookalamMandala size={350} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header Banner */}
        <div className="text-center space-y-4">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-maroon bg-maroon-soft px-4 py-1.5 rounded-full border border-maroon/20">
            <span className="w-1.5 h-1.5 rounded-full bg-maroon animate-pulse" />
            Kerala Kitchen Authentic Menu
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-leaf-dark">
            Traditional Onam <span className="gold-gradient-text italic">Sadya</span> Menu
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Every item is prepared strictly vegetarian using cold-pressed coconut oil, fresh grated coconut, and organic spices from Kerala farms. Served on fresh cut banana leaves.
          </p>
          <BananaLeafDivider className="max-w-md mx-auto" />
        </div>

        {/* Main Sadya Packages */}
        <div className="space-y-8">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-leaf-dark border-b-2 border-gold/20 pb-4 flex items-center gap-3">
            <SadyaThaliIcon className="w-7 h-7" />
            <span>Sadya Feast Packages</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {SADYA_MENU_ITEMS.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        </div>

        <KasavuStrip />

        {/* Payasam & Extras (if configured) */}
        {EXTRAS_MENU.length > 0 && (
          <div className="bg-white border border-gold/30 rounded-[2rem] p-6 sm:p-10 shadow-soft space-y-8 relative overflow-hidden">
            {/* Decorative corner */}
            <div className="absolute -top-6 -right-6 opacity-[0.06] pointer-events-none">
              <PookalamMandala size={160} />
            </div>

            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-leaf-dark flex items-center gap-3">
                <DessertPayasamIcon className="w-7 h-7 text-gold-deep" />
                <span>Payasam & Extra Add-ons</span>
              </h2>
              <p className="text-xs text-slate-500 mt-2">
                Order additional portions of golden Payasam or savories.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {EXTRAS_MENU.map((ext) => (
                <div
                  key={ext.id}
                  className="p-5 bg-coconut-50 rounded-2xl border border-gold/25 flex flex-col justify-between space-y-4 hover:shadow-gold hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-leaf-dark transition-colors">{ext.name}</h4>
                    <span className="font-serif font-extrabold text-leaf text-xl mt-1 block">{formatINR(ext.price)}</span>
                  </div>
                  <Link
                    href="/book"
                    className="w-full bg-gradient-to-r from-gold/15 to-gold/25 hover:from-gold/30 hover:to-gold/50 text-slate-900 border border-gold/40 text-xs font-bold py-2.5 rounded-xl text-center transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Booking</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
