'use client';

import { useState } from 'react';
import { REVIEWS_DATA } from '@/lib/constants';
import { CustomerReview } from '@/types';
import { Star, MessageSquare, CheckCircle2, MapPin, Edit3, Send } from 'lucide-react';
import { SectionTitle, PookalamMandala, BananaLeafDivider } from '@/components/landing/KeralaDecorations';

export default function ReviewsPage() {
  const [reviewsList, setReviewsList] = useState<CustomerReview[]>(REVIEWS_DATA);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [location, setLocation] = useState('Kochi');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !comment) return;
    const newRev: CustomerReview = {
      id: `rev-${Date.now()}`,
      customerName: name,
      rating,
      comment,
      date: 'Just Now',
      location,
      verifiedBooking: true,
    };
    setReviewsList([newRev, ...reviewsList]);
    setName('');
    setComment('');
    alert('Thank you for your Onam Sadya review!');
  };

  return (
    <div className="pt-28 pb-20 relative overflow-hidden">
      {/* Background Pookalam */}
      <div className="absolute top-20 right-0 opacity-[0.03] pointer-events-none">
        <PookalamMandala size={300} />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12 pb-nav-safe">
        <SectionTitle
          badge="Customer Voice"
          title="Ratings & Customer Experience"
          subtitle="Over 10,000+ satisfied families across Kerala have celebrated Onam with Kerala Kitchen Sadya."
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Form Left */}
          <div className="md:col-span-5 bg-white border border-gold/30 rounded-3xl p-6 sm:p-7 shadow-soft space-y-5 relative overflow-hidden">
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-leaf via-gold to-maroon" />
            
            <h2 className="font-serif text-xl font-bold text-leaf-dark flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-gold-deep" />
              <span>Share Your Experience</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Lakshmi Menon"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-4 rounded-xl border border-slate-200 outline-none focus:border-leaf focus:ring-2 focus:ring-leaf/10 font-medium text-base touch-target"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Kochi / Trivandrum"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-4 rounded-xl border border-slate-200 outline-none focus:border-leaf focus:ring-2 focus:ring-leaf/10 font-medium text-base touch-target"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Star Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className={`p-2 transition-transform hover:scale-110 touch-target ${star <= rating ? 'text-gold' : 'text-slate-200'}`}
                    >
                      <Star className={`w-8 h-8 ${star <= rating ? 'fill-gold' : ''}`} />
                    </button>
                  ))}
                  <span className="ml-2 font-bold text-slate-700 text-sm self-center">{rating}/5</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Your Feedback</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tell us about the Sadya taste, Payasam, packaging..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-4 py-4 rounded-xl border border-slate-200 outline-none focus:border-leaf focus:ring-2 focus:ring-leaf/10 font-medium text-base touch-target"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-leaf to-leaf-dark hover:from-leaf-dark hover:to-leaf text-white font-bold py-3.5 rounded-full shadow-glow-green text-sm transition-all flex items-center justify-center gap-2 touch-target"
              >
                <Send className="w-4 h-4 text-gold-light" />
                <span>Submit Review</span>
              </button>
            </form>
          </div>

          {/* Reviews List Right */}
          <div className="md:col-span-7 space-y-4">
            {reviewsList.map((rev) => (
              <div key={rev.id} className="bg-white p-6 rounded-3xl border border-gold/20 shadow-sm hover:shadow-soft transition-shadow space-y-3 relative group">
                <div className="flex items-center gap-0.5 text-gold">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                  "{rev.comment}"
                </p>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-slate-900 font-serif text-base block">{rev.customerName}</strong>
                    <span className="text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {rev.location} • {rev.date}
                    </span>
                  </div>
                  {rev.verifiedBooking && (
                    <span className="text-leaf-dark font-bold text-[10px] flex items-center gap-1 bg-leaf-soft px-2.5 py-1 rounded-full border border-leaf/20">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
