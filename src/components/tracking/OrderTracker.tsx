'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useBookingStore } from '@/lib/store';
import { formatINR, formatDate } from '@/lib/utils';
import { generateInvoicePDF } from '@/lib/pdf';
import { Booking, ExtraItem } from '@/types';
import { Search, CheckCircle2, Download, AlertCircle, Loader2 } from 'lucide-react';
import PushNotificationManager from '@/components/common/PushNotificationManager';

export default function OrderTracker() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || '';

  const { bookings, isLoaded } = useBookingStore();
  const [searchQuery, setSearchQuery] = useState(initialId);
  const [activeOrder, setActiveOrder] = useState<Booking | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (initialId) {
      const found = bookings.find(
        (b) =>
          b.bookingNumber.toUpperCase() === initialId.toUpperCase() ||
          b.customer.phone.includes(initialId)
      );
      setActiveOrder(found || null);
    } else {
      setActiveOrder(bookings[0] || null);
    }
  }, [isLoaded, initialId, bookings]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const found = bookings.find(
      (b) =>
        b.bookingNumber.toUpperCase() === searchQuery.trim().toUpperCase() ||
        b.customer.phone.includes(searchQuery.trim()) ||
        b.customer.email.toLowerCase() === searchQuery.trim().toLowerCase()
    );
    setActiveOrder(found || null);
  };

  const timelineSteps = [
    { key: 'Booked', label: 'Order Booked', desc: 'Pre-booking recorded' },
    { key: 'Confirmed', label: 'Confirmed', desc: 'Kitchen slot reserved' },
    { key: 'Preparing', label: 'In Preparation', desc: 'Master chefs cooking' },
    { key: 'Ready', label: 'Ready for Pickup / Packing', desc: 'Freshly packed on banana leaf' },
    { key: 'Delivered', label: 'Out for Delivery / Delivered', desc: 'Handed to customer' },
  ];

  const getStepStatus = (stepKey: string, currentStatus: string) => {
    const statusOrder = ['Booked', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepKey);

    if (currentStatus === 'Cancelled' || currentIndex === -1) return 'upcoming';
    if (stepIndex <= currentIndex) return 'completed';
    if (stepIndex === currentIndex + 1) return 'active';
    return 'upcoming';
  };

  if (!isLoaded) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 text-center space-y-4">
        <Loader2 className="w-8 h-8 text-gold animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Loading booking records...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      {/* Tracker Search Header */}
      <div className="text-center space-y-3 mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-maroon bg-maroon-soft px-3.5 py-1 rounded-full border border-maroon/20">
          Live Order Status
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-leaf-dark">
          Track Your Onam Sadya Order
        </h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Enter your Booking Number (e.g., ONAM-2026-8492) or registered phone number.
        </p>

        {/* Search Bar Form - stacked on mobile */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto pt-2 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="ONAM-2026-XXXX or Phone"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 rounded-full border border-gold/40 shadow-sm font-mono text-sm uppercase outline-none focus:ring-2 focus:ring-leaf/20 touch-target"
          />
          <button
            type="submit"
            className="bg-leaf hover:bg-leaf-dark text-white font-bold px-6 py-3 rounded-full shadow-md flex items-center gap-1.5 touch-target"
          >
            <Search className="w-4 h-4 text-gold-light" />
            <span>Search</span>
          </button>
        </form>
      </div>

      {activeOrder ? (
        <div className="bg-white border border-gold/30 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-card space-y-8 animate-fade-up">
          {/* Top Banner Meta */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase">Booking Reference</span>
              <h2 className="font-mono text-2xl font-extrabold text-leaf-dark">{activeOrder.bookingNumber}</h2>
              <p className="text-xs text-slate-500 mt-1">Booked on {formatDate(activeOrder.createdAt)}</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-gold-soft text-slate-900 border border-gold/40">
                {activeOrder.fulfillment.toUpperCase()} ({activeOrder.timeSlot})
              </span>
              <button
                onClick={() => generateInvoicePDF(activeOrder)}
                className="p-2.5 rounded-full bg-coconut-100 border border-gold/30 hover:bg-coconut-200 text-slate-700 touch-target"
                title="Download PDF Invoice"
              >
                <Download className="w-5 h-5 text-gold-deep" />
              </button>
            </div>
          </div>

          {/* Push Notifications Opt-In */}
          <PushNotificationManager booking={activeOrder} />

          {/* Animated Timeline - Mobile optimized */}
          <div className="py-4">
            <h3 className="font-serif text-lg font-bold text-leaf-dark mb-6">Fulfillment Progress</h3>
            {activeOrder.orderStatus === 'Cancelled' && (
              <div className="mb-6 flex items-center gap-2.5 bg-maroon-soft border border-maroon/30 text-maroon-dark rounded-2xl p-4 text-sm font-semibold">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>This booking was cancelled. No further fulfillment is scheduled for this order.</span>
              </div>
            )}
            <div className="space-y-6">
              {timelineSteps.map((step, idx) => {
                const status = getStepStatus(step.key, activeOrder.orderStatus);
                const isDone = status === 'completed';
                const isActive = status === 'active';

                return (
                  <div key={idx} className="relative group">
                    {/* Mobile: inline layout, Desktop: left-aligned with line */}
                    <div className="flex items-start gap-3 md:pl-8 md:border-l-2 md:border-gold/30">
                      {/* Circle icon marker */}
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                          isDone
                            ? 'bg-leaf border-leaf text-white shadow-md'
                            : isActive
                            ? 'bg-gold border-gold text-white shadow-md animate-pulse'
                            : 'bg-white border-slate-300 text-slate-400'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-5 h-5 text-gold-soft" /> : idx + 1}
                      </div>

                      <div className="flex-1 bg-coconut-50 p-4 rounded-2xl border border-gold/20">
                        <h4 className={`font-serif font-bold text-base ${isDone ? 'text-leaf-dark' : isActive ? 'text-gold-deep' : 'text-slate-700'}`}>
                          {step.label}
                          {isActive && <span className="ml-2 text-xs bg-gold/20 text-gold-deep px-2 py-0.5 rounded-full">Current</span>}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary & QR Code Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 border-t border-slate-100">
            <div className="md:col-span-8 space-y-3">
              <h4 className="font-serif font-bold text-slate-900 text-base">Order Details</h4>
              <div className="p-4 bg-slate-50 rounded-2xl space-y-2 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span>Sadya Meal:</span>
                  <strong className="text-slate-900">{activeOrder.sadyaItem.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Quantity:</span>
                  <strong className="text-slate-900">{activeOrder.quantity.adults} Adult(s)</strong>
                </div>
                {activeOrder.extras.map((ext: ExtraItem) => (
                  <div key={ext.id} className="flex justify-between text-slate-600">
                    <span>Extra: {ext.name}</span>
                    <strong>x{ext.quantity}</strong>
                  </div>
                ))}
                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-sm">
                  <span>Total Amount Paid:</span>
                  <span className="text-leaf-dark font-serif">{formatINR(activeOrder.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-coconut-100 rounded-2xl border border-gold/30 text-center">
              <img src={activeOrder.qrCodeUrl} alt="QR Code" className="w-28 h-28 border border-white rounded-xl shadow-sm mb-2" />
              <span className="text-[10px] font-bold text-slate-600 uppercase">Order QR Scanner Token</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-maroon mx-auto" />
          <h3 className="font-serif text-xl font-bold text-slate-800">No Booking Found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            We couldn't find an active booking matching "{searchQuery}". Please check your booking code or try sample order <strong>ONAM-2026-8492</strong>.
          </p>
        </div>
      )}
    </div>
  );
}