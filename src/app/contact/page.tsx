'use client';

import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, MessageSquare, Send, AlertCircle, Building2, CheckCircle2 } from 'lucide-react';
import { SectionTitle, PookalamMandala, BananaLeafDivider, NilavilakkuLamp } from '@/components/landing/KeralaDecorations';

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="pt-28 pb-20 relative overflow-hidden">
      {/* Background Pookalam */}
      <div className="absolute bottom-10 right-10 opacity-[0.03] pointer-events-none animate-pookalam">
        <PookalamMandala size={280} />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12 pb-nav-safe">
        <SectionTitle
          badge="Get in Touch"
          title="Contact Kerala Kitchen"
          subtitle="Have questions about your pre-booking, custom Sadya orders for corporate events, or festival specials? We're here to help!"
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Contact Details Column */}
          <div className="md:col-span-5 space-y-5">
            {/* Location Card */}
            <div className="bg-white rounded-3xl p-6 border border-gold/25 shadow-soft space-y-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-leaf via-gold to-maroon" />

              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-leaf to-leaf-dark flex items-center justify-center text-white shadow-md">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-serif text-lg font-bold text-leaf-dark">Our Hotel</h3>
              </div>

              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium">KERALA KITCHEN, Valiyaparamba, Kerala</span>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gold shrink-0 mt-1" />
                  <div className="space-y-1">
                    <a href="tel:9447445078" className="text-leaf font-bold hover:underline text-base block">📞 9447 44 50 78</a>
                    <a href="tel:9745627203" className="text-leaf font-bold hover:underline text-base block">📞 9745 62 72 03</a>
                    <span className="text-[10px] text-slate-500 block pt-0.5">Official Booking & Inquiries</span>
                  </div>
                </li>
                <li className="flex items-center gap-3 text-xs font-semibold text-slate-700 bg-coconut-100 p-2.5 rounded-xl border border-gold/20">
                  <span>🍛 All-you-can-eat • 🌿 Outdoor seating • 🍽️ Dine-in</span>
                </li>
              </ul>
            </div>

            {/* Festival Hours Card */}
            <div className="bg-gradient-to-br from-gold-soft to-coconut-100 rounded-3xl p-6 border border-gold/35 shadow-soft space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-deep to-gold flex items-center justify-center text-white shadow-md">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-bold text-leaf-dark">Opening Status</h3>
              </div>
              <div className="text-sm space-y-2">
                <div className="flex justify-between px-3 py-2 bg-white/70 rounded-xl">
                  <span className="text-slate-600 font-medium">Daily Status</span>
                  <strong className="text-emerald-700 uppercase font-extrabold">OPEN</strong>
                </div>
                <div className="flex justify-between px-3 py-2 bg-white/70 rounded-xl">
                  <span className="text-slate-600 font-medium">Closing Time</span>
                  <strong className="text-leaf-dark">Around 9:00 PM</strong>
                </div>
                <div className="flex justify-between px-3 py-2 bg-white/70 rounded-xl">
                  <span className="text-slate-600 font-medium">Thiruvonam 2026</span>
                  <strong className="text-maroon font-bold">Aug 26, 2026</strong>
                </div>
              </div>
            </div>

            {/* Quick Note */}
            <div className="bg-maroon-soft/50 border border-maroon/20 rounded-2xl p-4 flex items-start gap-3 text-xs">
              <AlertCircle className="w-5 h-5 text-maroon shrink-0 mt-0.5" />
              <div className="text-slate-700">
                <strong className="text-maroon block mb-1">Note for Bulk Orders:</strong>
                For orders above 50 plates, please call us at least 2 days in advance for guaranteed preparation.
              </div>
            </div>
          </div>

          {/* Contact Form Column */}
          <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-gold/25 shadow-soft relative overflow-hidden">
            {/* Decorative corner */}
            <div className="absolute -top-4 -right-4 opacity-[0.05] pointer-events-none">
              <PookalamMandala size={120} />
            </div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-maroon to-maroon-light flex items-center justify-center text-white shadow-md">
                <Send className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-leaf-dark">Send Us a Message</h3>
            </div>

            {sent ? (
              <div className="bg-leaf-soft border border-leaf/30 rounded-2xl p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-leaf text-white mx-auto flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-serif text-xl font-bold text-leaf-dark">Message Sent Successfully!</h4>
                <p className="text-sm text-slate-600">We'll get back to you within 2-3 hours during festival season.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Meera Nair"
                      className="w-full px-4 py-4 rounded-xl border border-slate-200 outline-none focus:border-leaf focus:ring-2 focus:ring-leaf/10 font-medium text-base touch-target"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98XXX XXXXX"
                      className="w-full px-4 py-4 rounded-xl border border-slate-200 outline-none focus:border-leaf focus:ring-2 focus:ring-leaf/10 font-medium text-base touch-target"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full px-4 py-4 rounded-xl border border-slate-200 outline-none focus:border-leaf focus:ring-2 focus:ring-leaf/10 font-medium text-base touch-target"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Enquiry Type</label>
                  <select className="w-full px-4 py-4 rounded-xl border border-slate-200 outline-none focus:border-leaf focus:ring-2 focus:ring-leaf/10 font-medium text-base bg-white touch-target">
                    <option value="">Select topic...</option>
                    <option>Pre-Booking Help</option>
                    <option>Bulk / Corporate Order</option>
                    <option>Menu Customization</option>
                    <option>Delivery / Pickup Info</option>
                    <option>Feedback / Complaint</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Your Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="How can we help you celebrate Onam?"
                    className="w-full px-4 py-4 rounded-xl border border-slate-200 outline-none focus:border-leaf focus:ring-2 focus:ring-leaf/10 font-medium text-base touch-target"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-leaf to-leaf-dark hover:from-leaf-dark hover:to-leaf text-white font-bold py-4 rounded-full shadow-glow-green text-sm flex items-center justify-center gap-2 transition-all touch-target"
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Embedded Map View */}
        <div className="w-full aspect-[16/9] sm:aspect-[21/9] rounded-3xl bg-coconut-100 border border-gold/25 shadow-sm overflow-hidden relative">
          <iframe
            src="https://maps.google.com/maps?q=KERALA%20KITCHEN,%20Valiyaparamba&t=&z=15&ie=UTF8&iwloc=&output=embed"
            className="w-full h-full border-0"
            allowFullScreen
            loading="lazy"
            title="Kerala Kitchen Valiyaparamba Location Map"
          />
        </div>
      </div>
    </div>
  );
}
