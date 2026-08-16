'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useBookingStore } from '@/lib/store';
import { SADYA_MENU_ITEMS, EXTRAS_MENU, AVAILABLE_SLOTS, ONAM_FESTIVAL_DATES, VALID_COUPONS } from '@/lib/constants';
import { formatINR, formatDate, isValidKeralaPincode } from '@/lib/utils';
import { generateInvoicePDF } from '@/lib/pdf';
import { Booking } from '@/types';
import confetti from 'canvas-confetti';
import AuthCheckoutModal from '@/components/auth/AuthCheckoutModal';
import LocationSelector from '@/components/booking/LocationSelector';
import SavedAddressesManager from '@/components/customer/SavedAddressesManager';
import { signInWithGoogle, isSupabaseConfigured } from '@/lib/supabase/client';
import BottomSheet from '@/components/ui/BottomSheet';

import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Plus,
  Minus,
  CheckCircle2,
  Tag,
  CreditCard,
  QrCode,
  Download,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShoppingBag,
  Info,
  ShieldCheck,
  X,
} from 'lucide-react';

import { FestivalFireIcon } from '@/components/common/SvgIcons';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function BookingWizard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sadyaParam = searchParams.get('sadya');

  const {
    draft,
    updateDraft,
    createBookingFromDraft,
    savedAddresses,
    selectSavedAddress,
    addSavedAddress,
    authUser,
    linkGuestBookingToUser,
  } = useBookingStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLocationSheet, setShowLocationSheet] = useState(false);

  const activeSadya = SADYA_MENU_ITEMS.find((s) => s.id === (sadyaParam || draft.selectedSadyaId)) || SADYA_MENU_ITEMS[0];

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 7));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const adultPrice = activeSadya.price;
  const childPrice = Math.round(activeSadya.price * 0.6);
  const baseTotal = adultPrice * draft.adultsCount + childPrice * draft.childrenCount;

  let extrasTotal = 0;
  EXTRAS_MENU.forEach((ext) => {
    const qty = draft.extras[ext.id] || 0;
    extrasTotal += ext.price * qty;
  });

  const subtotal = baseTotal + extrasTotal;

  let discount = 0;
  const appliedCouponObj = VALID_COUPONS.find(c => c.code.toUpperCase() === draft.couponCode.toUpperCase());
  const couponIsValid = appliedCouponObj && new Date(appliedCouponObj.expiryDate).getTime() >= Date.now();
  if (couponIsValid && subtotal >= appliedCouponObj.minOrderValue) {
    if (appliedCouponObj.discountType === 'percentage') {
      discount = Math.round((subtotal * appliedCouponObj.discountValue) / 100);
    } else {
      discount = appliedCouponObj.discountValue;
    }
  }

  const deliveryCharge = draft.fulfillment === 'delivery' ? 50 : 0;
  const finalTotal = Math.max(0, subtotal - discount + deliveryCharge);

  const handleApplyCoupon = (codeToApply: string) => {
    setCouponError('');
    setCouponSuccess('');
    const coupon = VALID_COUPONS.find((c) => c.code.toUpperCase() === codeToApply.trim().toUpperCase());
    if (!coupon) {
      setCouponError('Invalid coupon code. Try ONAM2026 or EARLYBIRD');
      return;
    }
    if (new Date(coupon.expiryDate).getTime() < Date.now()) {
      setCouponError(`Coupon ${coupon.code} has expired (valid until ${formatDate(coupon.expiryDate)}).`);
      updateDraft({ couponCode: '' });
      return;
    }
    if (subtotal < coupon.minOrderValue) {
      setCouponError(`Minimum order value of ${formatINR(coupon.minOrderValue)} required for code ${coupon.code}`);
      return;
    }
    updateDraft({ couponCode: coupon.code });
    setCouponSuccess(`Coupon ${coupon.code} applied! Saved ${coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : formatINR(coupon.discountValue)}.`);
  };

  const handleExtraQtyChange = (extraId: string, delta: number) => {
    const current = draft.extras[extraId] || 0;
    const nextQty = Math.max(0, current + delta);
    updateDraft({
      extras: {
        ...draft.extras,
        [extraId]: nextQty,
      },
    });
  };

  const handleFinalPayment = async () => {
    if (!draft.customerName || !draft.customerPhone || !draft.customerEmail) {
      alert('Please fill in your Name, Phone Number, and Email before proceeding.');
      setCurrentStep(4);
      return;
    }
    if (draft.fulfillment === 'delivery' && !draft.customerAddress) {
      alert('Please provide your complete Delivery Address.');
      setCurrentStep(4);
      return;
    }

    setIsProcessing(true);

    // 1. COD / Cash Counter Checkout (Bypasses Payment Gateway)
    if (draft.paymentMethod === 'cash') {
      setTimeout(() => {
        const booking = createBookingFromDraft('pending');
        setConfirmedBooking(booking);
        setIsProcessing(false);
        setCurrentStep(8);
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#D4AF37', '#2E7D32', '#F9A825', '#8E2430'],
          });
        } catch (e) {
          console.error(e);
        }
      }, 1000);
      return;
    }

    // 2. Gateway Checkout (UPI/Card payments) via Razorpay
    const sdkLoaded = await loadRazorpayScript();
    const rzpKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';

    if (sdkLoaded && rzpKey) {
      const options = {
        key: rzpKey,
        amount: Math.round(finalTotal * 100), // paise
        currency: 'INR',
        name: 'Kerala Kitchen',
        description: `Sadya Pre-Booking - ${activeSadya.name}`,
        image: '/favicon.ico',
        handler: function (response: any) {
          // Razorpay payment success callback
          const booking = createBookingFromDraft('paid');
          setConfirmedBooking(booking);
          setIsProcessing(false);
          setCurrentStep(8);
          try {
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.6 },
              colors: ['#D4AF37', '#2E7D32', '#F9A825', '#8E2430'],
            });
          } catch (e) {
            console.error(e);
          }
        },
        prefill: {
          name: draft.customerName,
          email: draft.customerEmail,
          contact: draft.customerPhone,
        },
        theme: {
          color: '#2E7D32', // leaf-dark brand color
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } else {
      // 3. Fallback Sandbox/Local Checkout Simulation (If SDK failed or Razorpay Key ID is empty)
      console.warn('Razorpay Key ID missing or SDK load failed. Running sandbox checkout simulation.');
      setTimeout(() => {
        const booking = createBookingFromDraft('paid');
        setConfirmedBooking(booking);
        setIsProcessing(false);
        setCurrentStep(8);
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#D4AF37', '#2E7D32', '#F9A825', '#8E2430'],
          });
        } catch (e) {
          console.error(e);
        }
      }, 1500);
    }
  };

  const handleGuestAccountConversion = async () => {
    if (!confirmedBooking) return;
    try {
      if (isSupabaseConfigured) {
        await signInWithGoogle(`/book?link_booking=${confirmedBooking.id}`);
      } else if (authUser) {
        await linkGuestBookingToUser(confirmedBooking.id, authUser);
        alert('Your guest booking has been linked to your Google account!');
      } else {
        alert('Google Authentication ready! Connect your Google account to save address and bookings.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Mobile: show location as bottom sheet on step 4
  useEffect(() => {
    if (currentStep === 4 && draft.fulfillment === 'delivery') {
      setShowLocationSheet(true);
    } else {
      setShowLocationSheet(false);
    }
  }, [currentStep, draft.fulfillment]);

  const steps = [
    { num: 1, label: 'Date' },
    { num: 2, label: 'Slot & Mode' },
    { num: 3, label: 'Quantities' },
    { num: 4, label: 'Auth & Location' },
    { num: 5, label: 'Offers' },
    { num: 6, label: 'Payment' },
    { num: 7, label: 'Confirmed' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Wizard Header Progress Bar - Mobile optimized */}
      <div className="mb-6">
        {/* Mobile: Dot indicator */}
        <div className="md:hidden flex items-center justify-center gap-1.5 mb-3">
          {steps.map((s, i) => (
            <button
              key={s.num}
              onClick={() => i + 1 < currentStep && currentStep !== 7 && setCurrentStep(i + 1)}
              disabled={currentStep === 7 || i + 1 > currentStep}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === currentStep - 1
                  ? 'bg-leaf w-8'
                  : i < currentStep - 1
                  ? 'bg-gold'
                  : 'bg-gold/40'
              }`}
              aria-label={`Step ${s.num}: ${s.label}`}
            />
          ))}
          <span className="text-xs font-bold text-leaf-dark ml-2">
            Step {currentStep} of 7
          </span>
        </div>
        
        {/* Desktop: Full stepper */}
        <div className="hidden md:block">
          <div className="flex items-center justify-between mb-4 overflow-x-auto pb-2 scrollbar-none">
            {steps.map((s) => (
              <button
                key={s.num}
                onClick={() => s.num < currentStep && currentStep !== 7 && setCurrentStep(s.num)}
                disabled={currentStep === 7 || s.num > currentStep}
                className={`flex flex-col items-center min-w-[64px] transition-colors ${
                  s.num === currentStep
                    ? 'text-leaf-dark font-bold'
                    : s.num < currentStep
                    ? 'text-gold-deep font-semibold cursor-pointer'
                    : 'text-slate-400'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all mb-1 ${
                    s.num === currentStep
                      ? 'bg-leaf text-white shadow-md scale-110'
                      : s.num < currentStep
                      ? 'bg-gold text-slate-900'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {s.num < currentStep ? '✓' : s.num}
                </div>
                <span className="text-[11px] uppercase tracking-wider whitespace-nowrap">{s.label}</span>
              </button>
            ))}
          </div>
          <div className="w-full bg-slate-200 h-4 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-gold via-leaf to-leaf-dark h-full transition-all duration-300"
              style={{ width: `${(currentStep / 7) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step Container Card */}
      <div className="bg-white border border-gold/30 rounded-3xl p-4 sm:p-6 shadow-card relative">
        {/* STEP 1: Date Selection */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-up">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-maroon">Step 1 of 7</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-leaf-dark">
                Choose Festival Date
              </h2>
              <p className="text-sm text-slate-600">Select your preferred date for Onam Sadya pre-booking.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ONAM_FESTIVAL_DATES.map((dateObj) => {
                const isSelected = draft.date === dateObj.date;
                return (
                  <button
                    key={dateObj.date}
                    onClick={() => updateDraft({ date: dateObj.date })}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all touch-target ${
                      isSelected
                        ? 'border-leaf bg-coconut-100 shadow-md scale-[1.02]'
                        : 'border-slate-200 hover:border-gold/50 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-500 uppercase">{dateObj.day}</span>
                      {dateObj.isPopular && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-gold text-slate-900 flex items-center gap-1">
                          <FestivalFireIcon className="w-3 h-3 text-slate-900" />
                          <span>Main Festival</span>
                        </span>
                      )}
                    </div>
                    <div className="font-serif text-lg font-bold text-slate-900">{dateObj.label}</div>
                    <div className="text-xs font-semibold text-leaf mt-1">Available for Pre-Booking</div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={nextStep}
                className="bg-leaf hover:bg-leaf-dark text-white font-bold px-8 py-3.5 rounded-full shadow-md flex items-center gap-2 touch-target"
              >
                <span>Continue to Fulfillment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Slot & Fulfillment Mode */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-up">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-maroon">Step 2 of 7</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-leaf-dark">
                Fulfillment Mode & Slot
              </h2>
              <p className="text-sm text-slate-600">Choose doorstep thermal delivery or hotel counter pickup.</p>
            </div>

            {/* Fulfillment mode - stacked on mobile, side-by-side on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => updateDraft({ fulfillment: 'delivery' })}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all touch-target text-left ${
                  draft.fulfillment === 'delivery'
                    ? 'border-leaf bg-coconut-100 shadow-md'
                    : 'border-slate-200 hover:border-gold/50 bg-white'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-leaf text-white flex items-center justify-center font-bold flex-shrink-0">
                    🚗
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-slate-900">Doorstep Delivery</h3>
                    <span className="text-xs text-slate-500">Thermal leak-proof boxes</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-2">Delivered fresh in eco-friendly plant leaf boxes to your home.</p>
              </button>

              <button
                onClick={() => updateDraft({ fulfillment: 'pickup' })}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all touch-target text-left ${
                  draft.fulfillment === 'pickup'
                    ? 'border-leaf bg-coconut-100 shadow-md'
                    : 'border-slate-200 hover:border-gold/50 bg-white'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gold text-slate-900 flex items-center justify-center font-bold flex-shrink-0">
                    🏪
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-slate-900">Hotel Counter Pickup</h3>
                    <span className="text-xs text-slate-500">Fast token QR verification</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-2">Collect directly at Kerala Kitchen express takeaway counters.</p>
              </button>
            </div>

            {/* Time Slot Selector - 2 cols on mobile, 4 on desktop */}
            <div className="space-y-3 pt-2">
              <label className="block text-sm font-bold text-slate-700">
                Select Preferred Time Slot:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {AVAILABLE_SLOTS.map((slot) => {
                  const isSelected = draft.timeSlot === slot.time;
                  return (
                    <button
                      key={slot.time}
                      onClick={() => updateDraft({ timeSlot: slot.time })}
                      className={`min-h-[48px] px-4 py-3 rounded-xl border text-sm font-bold transition-all touch-target ${
                        isSelected
                          ? 'border-leaf bg-leaf text-white shadow'
                          : 'border-slate-200 hover:border-gold text-slate-800 bg-white'
                      }`}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                onClick={prevStep}
                className="text-slate-600 hover:text-slate-900 font-semibold px-6 py-3 rounded-full flex items-center gap-2 touch-target"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={nextStep}
                className="bg-leaf hover:bg-leaf-dark text-white font-bold px-8 py-3.5 rounded-full shadow-md flex items-center gap-2 touch-target"
              >
                <span>Select Quantities</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Quantity Calculator */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-up">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-maroon">Step 3 of 7</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-leaf-dark">
                Meal Quantities & Pax
              </h2>
              <p className="text-sm text-slate-600">Selected Sadya: <strong>{activeSadya.name}</strong> ({formatINR(activeSadya.price)}/adult)</p>
            </div>

            <div className="space-y-4 max-w-md">
              <div className="p-4 bg-coconut-100 rounded-2xl border border-gold/40 flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-slate-900 text-base">Adult Sadya Meals</h4>
                  <p className="text-xs text-slate-500">Full 23-item authentic banquet serving</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateDraft({ adultsCount: Math.max(1, draft.adultsCount - 1) })}
                    className="w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 touch-target"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="font-serif text-xl font-bold text-slate-900 min-w-[24px] text-center">
                    {draft.adultsCount}
                  </span>
                  <button
                    onClick={() => updateDraft({ adultsCount: draft.adultsCount + 1 })}
                    className="w-11 h-11 rounded-full bg-leaf text-white hover:bg-leaf-dark flex items-center justify-center font-bold touch-target"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-4 bg-coconut-100 rounded-2xl border border-gold/40 flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-slate-900 text-base">Child Sadya Meals</h4>
                  <p className="text-xs text-slate-500">Half portion (40% discount)</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateDraft({ childrenCount: Math.max(0, draft.childrenCount - 1) })}
                    className="w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 touch-target"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="font-serif text-xl font-bold text-slate-900 min-w-[24px] text-center">
                    {draft.childrenCount}
                  </span>
                  <button
                    onClick={() => updateDraft({ childrenCount: draft.childrenCount + 1 })}
                    className="w-11 h-11 rounded-full bg-leaf text-white hover:bg-leaf-dark flex items-center justify-center font-bold touch-target"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                onClick={prevStep}
                className="text-slate-600 hover:text-slate-900 font-semibold px-6 py-3 rounded-full flex items-center gap-2 touch-target"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={nextStep}
                className="bg-leaf hover:bg-leaf-dark text-white font-bold px-8 py-3.5 rounded-full shadow-md flex items-center gap-2 touch-target"
              >
                <span>Auth & Location Capture</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Auth Choice, Contact & Dual Location Capture */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fade-up">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-maroon">Step 4 of 7</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-leaf-dark">
                Customer & Delivery Location
              </h2>
              <p className="text-sm text-slate-600">Choose Google Auth or Guest checkout & capture delivery address.</p>
            </div>

            {/* 1. AUTHENTICATION SELECTION MODAL CARD (Section 1 & 2 Requirement) */}
            <AuthCheckoutModal
              authUser={authUser}
              isGuest={draft.isGuest}
              onSelectGuest={() => updateDraft({ isGuest: true })}
              onSelectGoogle={() => updateDraft({ isGuest: false })}
            />

            {/* 2. CONTACT DETAILS INPUTS - improved touch targets */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-serif font-bold text-slate-900">Contact Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Anjali Kurup"
                    value={draft.customerName}
                    onChange={(e) => updateDraft({ customerName: e.target.value })}
                    className="w-full px-4 py-4 rounded-xl border border-slate-300 focus:border-leaf focus:ring-2 focus:ring-leaf/20 outline-none text-base font-medium text-slate-900 touch-target"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Mobile Phone (WhatsApp) *</label>
                  <input
                    type="tel"
                    placeholder="+91 98470 XXXXX"
                    value={draft.customerPhone}
                    onChange={(e) => updateDraft({ customerPhone: e.target.value })}
                    className="w-full px-4 py-4 rounded-xl border border-slate-300 focus:border-leaf focus:ring-2 focus:ring-leaf/20 outline-none text-base font-medium text-slate-900 touch-target"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    placeholder="anjali@example.com"
                    value={draft.customerEmail}
                    onChange={(e) => updateDraft({ customerEmail: e.target.value })}
                    className="w-full px-4 py-4 rounded-xl border border-slate-300 focus:border-leaf focus:ring-2 focus:ring-leaf/20 outline-none text-base font-medium text-slate-900 touch-target"
                  />
                </div>
              </div>
            </div>

            {/* 3. SAVED ADDRESSES FOR GOOGLE AUTHENTICATED CUSTOMERS (Section 18 Requirement) */}
            {authUser && savedAddresses.length > 0 && draft.fulfillment === 'delivery' && (
              <SavedAddressesManager
                savedAddresses={savedAddresses}
                onSelectAddress={selectSavedAddress}
                onAddNewAddress={addSavedAddress}
              />
            )}

            {/* 4. DUAL LOCATION CAPTURE SYSTEM - Desktop inline, Mobile in BottomSheet */}
            {draft.fulfillment === 'delivery' && (
              <>
                {/* Desktop: inline LocationSelector */}
                <div className="hidden md:block">
                  <LocationSelector
                    address={draft.customerAddress}
                    landmark={draft.customerLandmark}
                    pincode={draft.customerPincode}
                    deliveryInstructions={draft.deliveryInstructions}
                    latitude={draft.latitude}
                    longitude={draft.longitude}
                    locationAccuracy={draft.locationAccuracy}
                    onUpdateLocation={(locData) => {
                      updateDraft({
                        customerAddress: locData.address,
                        customerLandmark: locData.landmark,
                        customerPincode: locData.pincode,
                        deliveryInstructions: locData.deliveryInstructions,
                        latitude: locData.latitude,
                        longitude: locData.longitude,
                        locationAccuracy: locData.locationAccuracy,
                      });
                    }}
                  />
                </div>
                
                {/* Mobile: BottomSheet trigger */}
                <div className="md:hidden">
                  <button
                    onClick={() => setShowLocationSheet(true)}
                    className="w-full py-4 bg-coconut-100 border border-gold/30 rounded-2xl flex items-center justify-center gap-2 text-leaf-dark font-bold touch-target"
                  >
                    <MapPin className="w-5 h-5" />
                    <span>Set Delivery Location</span>
                  </button>
                </div>
              </>
            )}

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                onClick={prevStep}
                className="text-slate-600 hover:text-slate-900 font-semibold px-6 py-3 rounded-full flex items-center gap-2 touch-target"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={nextStep}
                className="bg-leaf hover:bg-leaf-dark text-white font-bold px-8 py-3.5 rounded-full shadow-md flex items-center gap-2 touch-target"
              >
                <span>Apply Offers & Discounts</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Location Bottom Sheet for Mobile */}
        <BottomSheet
          isOpen={showLocationSheet}
          onClose={() => setShowLocationSheet(false)}
          title="Delivery Location"
          showDragHandle
        >
          <LocationSelector
            address={draft.customerAddress}
            landmark={draft.customerLandmark}
            pincode={draft.customerPincode}
            deliveryInstructions={draft.deliveryInstructions}
            latitude={draft.latitude}
            longitude={draft.longitude}
            locationAccuracy={draft.locationAccuracy}
            onUpdateLocation={(locData) => {
              updateDraft({
                customerAddress: locData.address,
                customerLandmark: locData.landmark,
                customerPincode: locData.pincode,
                deliveryInstructions: locData.deliveryInstructions,
                latitude: locData.latitude,
                longitude: locData.longitude,
                locationAccuracy: locData.locationAccuracy,
              });
              setShowLocationSheet(false);
            }}
          />
        </BottomSheet>

        {/* STEP 5: Coupon & Summary */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fade-up">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-maroon">Step 5 of 7</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-leaf-dark">
                Apply Promo Coupons
              </h2>
              <p className="text-sm text-slate-600">Save on your festival feast with exclusive Onam discount codes.</p>
            </div>

            <div className="p-4 bg-coconut-100 rounded-2xl border border-gold/40 space-y-3">
              <label className="block text-sm font-bold text-slate-800">Enter Promo Code</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="ONAM2026"
                  value={draft.couponCode}
                  onChange={(e) => updateDraft({ couponCode: e.target.value.toUpperCase() })}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-300 uppercase font-mono font-bold text-sm outline-none focus:border-gold text-slate-900 touch-target"
                />
                <button
                  onClick={() => handleApplyCoupon(draft.couponCode)}
                  className="bg-gold hover:bg-gold-warm text-slate-900 font-bold px-5 py-3 rounded-xl text-sm shadow-sm touch-target whitespace-nowrap"
                >
                  Apply
                </button>
              </div>

              {couponError && <p className="text-xs text-red-600 font-medium">{couponError}</p>}
              {couponSuccess && <p className="text-xs text-emerald-700 font-semibold">{couponSuccess}</p>}

              <div className="pt-2 flex flex-wrap gap-2">
                {VALID_COUPONS.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => handleApplyCoupon(c.code)}
                    className="text-sm bg-white border border-gold/30 hover:border-gold px-3 py-2 rounded-lg font-mono text-slate-700 flex items-center gap-1 touch-target"
                  >
                    <Tag className="w-3.5 h-3.5 text-gold" />
                    <span>{c.code} ({c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`})</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Sadya Base Total ({draft.adultsCount} Adult, {draft.childrenCount} Child):</span>
                <span className="font-semibold text-slate-900">{formatINR(baseTotal)}</span>
              </div>
              {extrasTotal > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Extras & Payasam Total:</span>
                  <span className="font-semibold text-slate-900">{formatINR(extrasTotal)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount ({draft.couponCode}):</span>
                  <span>-{formatINR(discount)}</span>
                </div>
              )}
              {draft.fulfillment === 'delivery' && (
                <div className="flex justify-between text-slate-600">
                  <span>Thermal Box Delivery Charge:</span>
                  <span className="font-semibold text-slate-900">{formatINR(50)}</span>
                </div>
              )}
              <div className="border-t border-slate-300 pt-3 flex justify-between items-center">
                <span className="font-serif font-bold text-lg text-slate-900">Total Payable Amount:</span>
                <span className="font-serif font-extrabold text-2xl text-leaf-dark">{formatINR(finalTotal)}</span>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                onClick={prevStep}
                className="text-slate-600 hover:text-slate-900 font-semibold px-6 py-3 rounded-full flex items-center gap-2 touch-target"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={nextStep}
                className="bg-leaf hover:bg-leaf-dark text-white font-bold px-8 py-3.5 rounded-full shadow-md flex items-center gap-2 touch-target"
              >
                <span>Proceed to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Payment Options */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-fade-up">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-maroon">Step 6 of 7</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-leaf-dark">
                Choose Payment Method
              </h2>
              <p className="text-sm text-slate-600">Total to Pay: <strong className="text-leaf-dark font-serif text-lg">{formatINR(finalTotal)}</strong></p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => updateDraft({ paymentMethod: 'upi' })}
                className={`w-full p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between touch-target ${
                  draft.paymentMethod === 'upi' ? 'border-leaf bg-coconut-100 shadow-sm' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    UPI
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Instant UPI / Google Pay / PhonePe / Paytm</h4>
                    <p className="text-xs text-slate-500">Fast zero-fee digital payment</p>
                  </div>
                </div>
                <input type="radio" checked={draft.paymentMethod === 'upi'} readOnly className="accent-leaf" />
              </button>

              <button
                onClick={() => updateDraft({ paymentMethod: 'card' })}
                className={`w-full p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between touch-target ${
                  draft.paymentMethod === 'card' ? 'border-leaf bg-coconut-100 shadow-sm' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Credit / Debit Cards</h4>
                    <p className="text-xs text-slate-500">Visa, Mastercard, RuPay cards accepted</p>
                  </div>
                </div>
                <input type="radio" checked={draft.paymentMethod === 'card'} readOnly className="accent-leaf" />
              </button>

              <button
                onClick={() => updateDraft({ paymentMethod: 'cash' })}
                className={`w-full p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between touch-target ${
                  draft.paymentMethod === 'cash' ? 'border-leaf bg-coconut-100 shadow-sm' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    CASH
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {draft.fulfillment === 'delivery' ? 'Cash on Delivery (COD)' : 'Pay Cash at Hotel Counter'}
                    </h4>
                    <p className="text-xs text-slate-500">Pay directly when receiving food</p>
                  </div>
                </div>
                <input type="radio" checked={draft.paymentMethod === 'cash'} readOnly className="accent-leaf" />
              </button>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                onClick={prevStep}
                className="text-slate-600 hover:text-slate-900 font-semibold px-6 py-3 rounded-full flex items-center gap-2 touch-target"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleFinalPayment}
                disabled={isProcessing}
                className="bg-gradient-to-r from-gold via-gold-warm to-gold text-slate-900 font-extrabold px-9 py-4 rounded-full shadow-gold hover:scale-105 active:scale-95 transition-all flex items-center gap-2 touch-target"
              >
                {isProcessing ? (
                  <>
                    <Sparkles className="w-5 h-5 animate-spin text-slate-900" />
                    <span>Confirming Booking...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-slate-900" />
                    <span>Pay {formatINR(finalTotal)} & Confirm</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 7: Confirmation Screen & Guest -> Google Conversion */}
        {currentStep === 7 && confirmedBooking && (
          <div className="space-y-6 text-center animate-fade-up py-4">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-lg border-2 border-emerald-400">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-maroon">Pre-Booking Successful</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-leaf-dark mt-1">
                Your Sadya Booking is Confirmed!
              </h2>
              <p className="text-slate-600 text-sm mt-2">
                We have received your pre-booking for {confirmedBooking.date} ({confirmedBooking.timeSlot}).
              </p>
            </div>

            {/* QR Code & Booking Card */}
            <div className="max-w-md mx-auto bg-coconut-100 p-6 rounded-3xl border border-gold/40 shadow-soft text-left space-y-4">
              <div className="flex items-center justify-between border-b border-gold/20 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Booking ID</span>
                  <div className="font-mono text-lg font-extrabold text-leaf-dark">{confirmedBooking.bookingNumber}</div>
                </div>
                {confirmedBooking.tokenNumber && (
                  <div className="bg-gold text-slate-900 text-xs font-extrabold px-3 py-1.5 rounded-full">
                    Token: {confirmedBooking.tokenNumber}
                  </div>
                )}
              </div>

              {/* Dynamic QR Code */}
              <div className="flex flex-col items-center py-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={confirmedBooking.qrCodeUrl}
                  alt="Order Verification QR Code"
                  className="w-36 h-36 border-2 border-white rounded-xl shadow-sm"
                />
                <span className="text-[11px] text-slate-500 mt-2 font-medium">Show QR Code at pickup / delivery for fast verification</span>
              </div>

              {/* DELIVERY OTP VERIFICATION CODE DISPLAY (Section 15 Requirement) */}
              {confirmedBooking.fulfillment === 'delivery' && confirmedBooking.deliveryOtp && (
                <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-2xl text-center space-y-0.5">
                  <div className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                    Delivery Verification OTP
                  </div>
                  <div className="font-mono text-2xl font-extrabold text-emerald-700 tracking-widest">
                    {confirmedBooking.deliveryOtp}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium">
                    Provide this code to delivery executive upon arrival
                  </div>
                </div>
              )}

              <div className="space-y-1.5 text-xs text-slate-700 border-t border-gold/20 pt-3">
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <strong className="text-slate-900">{confirmedBooking.customer.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Fulfillment:</span>
                  <strong className="text-slate-900 uppercase">{confirmedBooking.fulfillment} ({confirmedBooking.timeSlot})</strong>
                </div>
                <div className="flex justify-between">
                  <span>Total Amount Paid:</span>
                  <strong className="text-leaf-dark font-serif text-sm">{formatINR(confirmedBooking.totalAmount)}</strong>
                </div>
              </div>
            </div>

            {/* GUEST -> GOOGLE ACCOUNT CONVERSION PROMPT (Section 17 Requirement) */}
            {confirmedBooking.isGuest && (
              <div className="max-w-md mx-auto bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-3xl border border-amber-200/80 shadow-sm text-center space-y-3">
                <div className="flex items-center justify-center gap-1.5 text-amber-900 font-serif font-bold text-base">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  <span>Want to save your orders and addresses?</span>
                </div>
                <p className="text-xs text-slate-600">
                  Connect your Google account to track order history, save delivery locations & reorder with one tap.
                </p>
                <button
                  type="button"
                  onClick={handleGuestAccountConversion}
                  className="w-full bg-white hover:bg-slate-50 text-slate-800 font-semibold py-2.5 px-4 rounded-2xl border border-slate-300 shadow-sm flex items-center justify-center gap-2 text-xs transition"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.39 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.61 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={() => generateInvoicePDF(confirmedBooking)}
                className="w-full sm:w-auto bg-leaf hover:bg-leaf-dark text-white font-bold px-7 py-3.5 rounded-full shadow-md flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5 text-gold-light" />
                <span>Download PDF Invoice</span>
              </button>

              <button
                onClick={() => router.push(`/track?id=${confirmedBooking.bookingNumber}`)}
                className="w-full sm:w-auto bg-white border-2 border-gold/40 hover:bg-coconut-100 text-slate-900 font-bold px-7 py-3.5 rounded-full shadow-sm flex items-center justify-center gap-2"
              >
                <QrCode className="w-5 h-5 text-gold" />
                <span>Track Order Live</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
