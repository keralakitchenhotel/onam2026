'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MenuItem } from '@/types';
import { formatINR } from '@/lib/utils';
import { Sparkles, CheckCircle2, ChevronDown, ChevronUp, ShoppingBag, Star, Users } from 'lucide-react';
import { useState } from 'react';
import { VegBadgeIcon, FestivalFireIcon, BananaLeafIcon } from '@/components/common/SvgIcons';

interface MenuCardProps {
  item: MenuItem;
  onSelect?: (item: MenuItem) => void;
}

export default function MenuCard({ item, onSelect }: MenuCardProps) {
  const [showItems, setShowItems] = useState(false);

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-gold/30 shadow-soft hover:shadow-card-lg hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between group relative">
      {/* Card Image Header */}
      <div>
        <div className="relative aspect-[4/3] md:aspect-[16/10] overflow-hidden bg-coconut-200">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          {/* Top badges row */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1.5 rounded-full bg-emerald-600/95 text-white shadow-lg backdrop-blur-md">
              <VegBadgeIcon className="w-3.5 h-3.5" />
              Pure Veg
            </span>
            {item.isPopular && (
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-3 py-1.5 rounded-full bg-gold/95 text-slate-900 shadow-lg backdrop-blur-md">
                <FestivalFireIcon className="w-3.5 h-3.5 text-maroon" />
                Popular
              </span>
            )}
          </div>

          {/* Price Tag */}
          <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xl px-4 py-2 rounded-2xl border border-gold/50 shadow-gold">
            <span className="font-serif text-xl font-black text-leaf-dark">
              {formatINR(item.price)}
            </span>
            <span className="text-[10px] text-slate-500 block text-right -mt-0.5">per pax</span>
          </div>
        </div>

        {/* Card Content Body */}
        <div className="p-5 sm:p-6 space-y-3.5">
          {/* Title Block */}
          <div>
            <h3 className="font-serif text-xl font-bold text-leaf-dark leading-snug group-hover:text-leaf transition-colors">
              {item.name}
            </h3>
            {item.malayalamName && (
              <p className="text-xs font-semibold text-maroon/80 mt-1">
                {item.malayalamName}
              </p>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          {/* Meta Info Row */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-leaf" />
              <strong className="text-slate-800">{item.servingPax || '1 Person'}</strong>
            </span>
            {item.itemCount && (
              <span className="bg-gradient-to-r from-coconut-200 to-coconut-300 text-leaf-dark font-extrabold px-3 py-1 rounded-full text-[11px] border border-gold/20">
                {item.itemCount} Items
              </span>
            )}
          </div>

          {/* Collapsible Included Items */}
          {item.itemsIncluded && item.itemsIncluded.length > 0 && (
            <div className="pt-1">
              <button
                onClick={() => setShowItems(!showItems)}
                className="w-full text-xs font-bold text-leaf hover:text-leaf-dark flex items-center justify-between py-2 border-t border-dashed border-gold/30 transition-colors touch-target"
              >
                <span className="flex items-center gap-1.5">
                  <BananaLeafIcon className="w-4 h-4" />
                  View All {item.itemsIncluded.length} Included Items
                </span>
                {showItems ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showItems && (
                <div className="mt-2 p-3.5 bg-coconut-100 rounded-2xl max-h-64 overflow-y-auto text-xs space-y-1.5 border border-gold/20">
                  {item.itemsIncluded.map((inc, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-leaf shrink-0" />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="p-5 sm:p-6 pt-0">
        <Link
          href={`/book?sadya=${item.id}`}
          className="w-full bg-gradient-to-r from-leaf via-leaf-dark to-leaf hover:from-leaf-dark hover:via-leaf hover:to-leaf-dark text-white font-bold text-sm py-3.5 rounded-2xl shadow-sm hover:shadow-glow-green transition-all flex items-center justify-center gap-2.5 group/btn touch-target"
        >
          <ShoppingBag className="w-4 h-4 text-gold-light group-hover/btn:scale-110 transition-transform" />
          <span>Pre-Book This Package</span>
        </Link>
      </div>
    </div>
  );
}
