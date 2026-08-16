'use client';

import { useState, useEffect } from 'react';
import { getFcmToken } from '@/lib/firebase';
import { Booking } from '@/types';
import { Bell, BellOff, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';

interface PushNotificationManagerProps {
  booking: Booking;
}

export default function PushNotificationManager({ booking }: PushNotificationManagerProps) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'registered' | 'error'>('idle');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true);
      setPermission(Notification.permission);
      
      // If permission is already granted, register/renew the token in background
      if (Notification.permission === 'granted') {
        registerTokenInBackground();
      }
    }
  }, [booking.id]);

  const registerTokenInBackground = async () => {
    try {
      await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      const token = await getFcmToken();
      if (token) {
        await fetch('/api/push/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId: booking.id, fcmToken: token }),
        });
        setStatus('registered');
      }
    } catch (e) {
      console.warn('Background token registration failed:', e);
    }
  };

  const handleRequestPermission = async () => {
    if (!isSupported) return;
    setLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        const token = await getFcmToken();
        if (token) {
          const res = await fetch('/api/push/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId: booking.id, fcmToken: token }),
          });
          if (res.ok) {
            setStatus('registered');
          } else {
            setStatus('error');
          }
        } else {
          setStatus('error');
        }
      } else if (result === 'denied') {
        alert('Notifications were blocked. Please enable them in your browser settings to track your order status.');
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  if (!isSupported) return null;

  if (permission === 'granted' && status === 'registered') {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 flex items-center gap-4 text-emerald-900 animate-fade-up">
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-serif font-bold text-sm text-slate-900">Push Notifications Active</h4>
          <p className="text-xs text-slate-600 mt-0.5">We will notify you in real-time when the kitchen status of your feast changes!</p>
        </div>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 flex items-center gap-4 text-slate-500 animate-fade-up">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-400">
          <BellOff className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-serif font-bold text-sm text-slate-800">Notifications Blocked</h4>
          <p className="text-xs text-slate-500 mt-0.5">Please allow notifications in your browser address bar to get order progress alerts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 border border-gold/30 rounded-3xl p-5 space-y-3 animate-fade-up">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-700 animate-pulse">
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-serif font-bold text-slate-900 text-sm">Get Live Order Status Alerts</h4>
          <p className="text-xs text-slate-600 mt-0.5">
            Subscribe to push alerts to follow your Onam feast from preparation to home delivery!
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={handleRequestPermission}
          disabled={loading}
          className="bg-leaf hover:bg-leaf-dark text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-sm flex items-center gap-1.5 transition disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Enabling...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 text-gold-light" />
              <span>Enable Push Notifications</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
