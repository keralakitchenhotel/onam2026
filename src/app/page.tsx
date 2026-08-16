import Link from 'next/link';
import Image from 'next/image';
import HeroBanner from '@/components/landing/HeroBanner';
import MenuCard from '@/components/menu/MenuCard';
import { SADYA_MENU_ITEMS, REVIEWS_DATA, EXTRAS_MENU } from '@/lib/constants';
import { formatINR } from '@/lib/utils';
import { ArrowRight, Star, Sparkles, MapPin, Phone, Calendar, Heart, CheckCircle2, Users, Award, ShoppingBag, Truck, UtensilsCrossed, Clock } from 'lucide-react';
import { SectionTitle, KasavuStrip, BananaLeafDivider, PookalamMandala, NilavilakkuLamp } from '@/components/landing/KeralaDecorations';
import {
  RiceBowlIcon,
  CurryPotIcon,
  SaladBowlIcon,
  SnackChipsIcon,
  DessertPayasamIcon,
  PickleJarIcon,
  WaterDrinkIcon,
  BananaLeafIcon,
  SadyaThaliIcon,
  FestivalFireIcon
} from '@/components/common/SvgIcons';

export default function HomePage() {
  const delicacies = [
    { num: 1, mlName: 'സാമ്പാർ', name: 'Sambar', icon: <CurryPotIcon className="w-6 h-6 text-orange-600" /> },
    { num: 2, mlName: 'അവിയൽ', name: 'Avial', icon: <SaladBowlIcon className="w-6 h-6 text-emerald-600" /> },
    { num: 3, mlName: 'പൈനാപ്പിൾ പച്ചടി', name: 'Pineapple Pachadi', icon: <SaladBowlIcon className="w-6 h-6 text-amber-500" /> },
    { num: 4, mlName: 'കിച്ചടി', name: 'Kichadi', icon: <SaladBowlIcon className="w-6 h-6 text-yellow-600" /> },
    { num: 5, mlName: 'ബീറ്റ്‌റൂട്ട് പച്ചടി', name: 'Beetroot Pachadi', icon: <SaladBowlIcon className="w-6 h-6 text-rose-600" /> },
    { num: 6, mlName: 'പരിപ്പ് കറി', name: 'Parippu Curry', icon: <CurryPotIcon className="w-6 h-6 text-amber-600" /> },
    { num: 7, mlName: 'മോര് കറി', name: 'Moru Curry', icon: <WaterDrinkIcon className="w-6 h-6 text-amber-400" /> },
    { num: 8, mlName: 'പുളിഞ്ചി', name: 'Pulissery', icon: <PickleJarIcon className="w-6 h-6 text-maroon" /> },
    { num: 9, mlName: 'കായ വറുത്തത്', name: 'Kaya Varuthathu', icon: <SnackChipsIcon className="w-6 h-6 text-gold" /> },
    { num: 10, mlName: 'ശർക്കര വരട്ടി', name: 'Sharkara Varatti', icon: <SnackChipsIcon className="w-6 h-6 text-amber-800" /> },
    { num: 11, mlName: 'ഉപ്പ്', name: 'Salt', icon: <PickleJarIcon className="w-6 h-6 text-slate-400" /> },
    { num: 12, mlName: 'ഇല', name: 'Banana Leaf', icon: <BananaLeafIcon className="w-6 h-6 text-leaf" /> },
    { num: 13, mlName: 'പായസം അട', name: 'Payasam Ada', icon: <DessertPayasamIcon className="w-6 h-6 text-gold-deep" /> },
    { num: 14, mlName: 'തോരൻ', name: 'Thoran', icon: <SaladBowlIcon className="w-6 h-6 text-green-600" /> },
    { num: 15, mlName: 'ഓലൻ', name: 'Olan', icon: <SaladBowlIcon className="w-6 h-6 text-teal-600" /> },
    { num: 16, mlName: 'കാളൻ', name: 'Kalan', icon: <CurryPotIcon className="w-6 h-6 text-yellow-700" /> },
    { num: 17, mlName: 'പപ്പടം', name: 'Pappadam', icon: <SnackChipsIcon className="w-6 h-6 text-yellow-500" /> },
    { num: 18, mlName: 'മാങ്ങാ അച്ചാർ', name: 'Mango Pickle', icon: <PickleJarIcon className="w-6 h-6 text-orange-500" /> },
    { num: 19, mlName: 'പഴം', name: 'Banana', icon: <BananaLeafIcon className="w-6 h-6 text-amber-400" /> },
    { num: 20, mlName: 'രസം', name: 'Rasam', icon: <WaterDrinkIcon className="w-6 h-6 text-red-500" /> },
    { num: 21, mlName: 'ചോറ്', name: 'Rice', icon: <RiceBowlIcon className="w-6 h-6 text-leaf-dark" /> },
    { num: 22, mlName: 'പച്ചടി', name: 'Pachadi', icon: <SaladBowlIcon className="w-6 h-6 text-emerald-500" /> },
    { num: 23, mlName: 'കൂട്ടു കറി', name: 'Koottu Curry', icon: <CurryPotIcon className="w-6 h-6 text-amber-700" /> },
  ];

  return (
    <div>
      {/* Hero Section */}
      <HeroBanner />



      {/* ========================================
          SADYA MENU SHOWCASE SECTION
          ======================================== */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 opacity-[0.03] pointer-events-none">
          <PookalamMandala size={400} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-maroon bg-maroon-soft px-4 py-1.5 rounded-full border border-maroon/20">
                <span className="w-1.5 h-1.5 rounded-full bg-maroon animate-pulse" />
                Traditional Onam Delicacies
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-leaf-dark">
                Our Signature <span className="gold-gradient-text italic">Sadya</span> Packages
              </h2>
              <p className="text-slate-600 text-sm sm:text-base max-w-lg">
                Authentic 23-item Kerala Onam Sadya packages prepared with cold-pressed coconut oil and organic spices, served fresh on cut plantain leaves.
              </p>
            </div>
            <Link
              href="/menu"
              className="text-leaf-dark font-bold text-sm hover:text-leaf flex items-center gap-1.5 group bg-coconut-100 px-4 py-2 rounded-full border border-gold/30 hover:shadow-gold transition-all"
            >
              <span>View Full Menu</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {SADYA_MENU_ITEMS.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          WHAT'S INCLUDED IN SADYA SECTION
          ======================================== */}
      <section className="py-20 section-warm relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            badge="23 Traditional Delicacies (ഓണസദ്യ വിഭവങ്ങൾ)"
            title="What's Served on Your Banana Leaf?"
            subtitle="Authentic 23 dishes freshly prepared on festival morning as listed on our official event poster."
          />

          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {delicacies.map((item) => (
              <div
                key={item.num}
                className="relative flex flex-col items-center justify-center p-3.5 bg-white rounded-2xl border border-gold/20 shadow-sm hover:shadow-gold hover:-translate-y-1 transition-all duration-300 text-center group overflow-hidden"
              >
                <div className="absolute top-1.5 left-2 text-[10px] font-black text-gold-deep bg-coconut-100 px-1.5 py-0.5 rounded-md">
                  #{item.num}
                </div>
                <div className="mt-2 mb-1 p-2 rounded-xl bg-coconut-100 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <span className="text-xs font-black text-maroon leading-tight block">{item.mlName}</span>
                <span className="text-[10px] font-bold text-slate-600 leading-tight block mt-0.5">{item.name}</span>
              </div>
            ))}
          </div>

          {/* Banana leaf note */}
          <div className="mt-8 flex items-center justify-center gap-3 text-sm text-leaf-dark font-semibold bg-leaf-soft/50 border border-leaf/20 px-6 py-3 rounded-2xl max-w-md mx-auto">
            <BananaLeafIcon className="w-5 h-5 text-leaf" />
            <span>All items served on a fresh cut banana leaf!</span>
          </div>
        </div>
      </section>



      {/* ========================================
          STATS BAR
          ======================================== */}
      <section className="py-12 bg-gradient-to-r from-maroon via-maroon-dark to-maroon text-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 'Valiyaparamba', label: 'Local Landmark', icon: <MapPin className="w-7 h-7 text-gold mx-auto" /> },
              { value: '₹220 / ₹1300', label: 'Sadya Packages', icon: <SadyaThaliIcon className="w-7 h-7 text-gold mx-auto" /> },
              { value: '23 Items', label: 'Authentic Delicacies', icon: <Clock className="w-7 h-7 text-gold mx-auto" /> },
              { value: 'Aug 25, 26, 27', label: 'Onam Festival 2026', icon: <FestivalFireIcon className="w-7 h-7 text-gold mx-auto" /> },
            ].map((stat, i) => (
              <div key={i} className="text-center space-y-1">
                <div>{stat.icon}</div>
                <div className="font-serif text-xl sm:text-3xl font-extrabold text-gold break-words leading-tight">{stat.value}</div>
                <div className="text-xs font-semibold text-coconut-200 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          CUSTOMER TESTIMONIALS SECTION (Hidden on smartphone view to save space)
          ======================================== */}
      <section className="hidden md:block py-20 section-warm relative overflow-hidden">
        <div className="absolute -bottom-10 left-10 opacity-[0.04] pointer-events-none">
          <PookalamMandala size={250} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <SectionTitle
            badge="Guest Experiences"
            title="What Our Guests Say"
            subtitle="Guests highlight the friendly nature of our staff, authentic taste, and calm atmosphere."
          />

          {REVIEWS_DATA.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {REVIEWS_DATA.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white rounded-3xl p-7 border border-gold/25 shadow-soft hover:shadow-card-lg hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden"
                >
                  <div className="flex items-center gap-0.5 text-gold mb-4">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 italic leading-relaxed mb-5 relative z-10">
                    "{rev.comment}"
                  </p>
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <strong className="text-slate-900 block font-serif text-base">{rev.customerName}</strong>
                      <span className="text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-leaf" />
                        {rev.location}
                      </span>
                    </div>
                    <span className="bg-leaf-soft text-leaf-dark text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-leaf/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified Guest
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center bg-white rounded-3xl p-10 border border-gold/30 shadow-soft max-w-xl mx-auto space-y-3">
              <p className="font-serif text-lg font-bold text-leaf-dark">Be the first to leave a review!</p>
              <p className="text-xs text-slate-600">Pre-book your Sadya and share your experience with us.</p>
              <Link href="/reviews" className="inline-block bg-leaf text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-md hover:bg-leaf-dark transition-colors">
                Write a Review
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ========================================
          EXTRA PAYASAM & ADD-ONS PREVIEW
          ======================================== */}
      {EXTRAS_MENU.length > 0 && (
        <section className="py-16 bg-white relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionTitle
              badge="Festival Extras"
              title="Add Extra Payasam & Savories"
              subtitle="Elevate your Onam feast with additional Payasam and savories."
            />

            <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {EXTRAS_MENU.slice(0, 8).map((ext) => (
                <div
                  key={ext.id}
                  className="p-4 bg-coconut-50 rounded-2xl border border-gold/25 shadow-sm hover:shadow-gold hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">{ext.name}</h4>
                    <span className="font-serif font-extrabold text-leaf text-lg mt-1 block">{formatINR(ext.price)}</span>
                  </div>
                  <Link
                    href="/book"
                    className="mt-3 w-full bg-gradient-to-r from-gold/10 to-gold/20 hover:from-gold/30 hover:to-gold/40 text-slate-800 border border-gold/30 text-xs font-bold py-2.5 rounded-xl text-center transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Booking</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========================================
          FINAL CTA BOOKING BANNER
          ======================================== */}
      <section className="py-20 bg-gradient-to-r from-leaf-dark via-leaf to-leaf-dark text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 opacity-10 animate-pookalam pointer-events-none">
            <PookalamMandala size={200} />
          </div>
          <div className="absolute bottom-10 right-10 opacity-10 animate-pookalam pointer-events-none" style={{ animationDirection: 'reverse' }}>
            <PookalamMandala size={180} />
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 text-center space-y-7 relative z-10">
          <div className="flex items-center justify-center gap-4">
            <NilavilakkuLamp className="w-8 h-10 opacity-80" />
            <FestivalFireIcon className="w-8 h-8 text-gold animate-bounce" />
            <NilavilakkuLamp className="w-8 h-10 opacity-80" />
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
            Pre-Book Your <br className="hidden sm:block" />
            <span className="text-gold">Onam Sadya</span> Slot Today
          </h2>
          <p className="text-coconut-200 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Avoid the festival rush! Secure your preferred pickup or delivery time slot before capacity closes. Limited slots for Thiruvonam.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/book"
              className="inline-flex items-center gap-2.5 bg-gradient-to-r from-gold via-gold-warm to-gold text-slate-900 font-extrabold text-base px-10 py-4 rounded-full shadow-glow-gold hover:scale-105 active:scale-95 transition-all"
            >
              <ShoppingBag className="w-5 h-5 text-slate-900" />
              <span>Pre-Book Sadya Now</span>
            </Link>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 text-coconut-100 font-bold text-sm px-6 py-3 rounded-full border border-white/30 hover:bg-white/10 transition-colors"
            >
              <UtensilsCrossed className="w-4 h-4 text-gold" />
              <span>Browse Menu First</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
