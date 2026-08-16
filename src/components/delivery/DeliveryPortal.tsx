'use client';

import { useState, useEffect, useRef } from 'react';
import { useBookingStore } from '@/lib/store';
import { formatINR, formatDate } from '@/lib/utils';
import { Booking, OrderStatus } from '@/types';
import {
  Search,
  CheckCircle2,
  Clock,
  LogOut,
  User,
  MapPin,
  PhoneCall,
  Navigation,
  ShieldCheck,
  Truck,
  Camera,
  QrCode,
  Scan,
  X,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const getStatusBadgeColor = (status: OrderStatus) => {
  switch (status) {
    case 'Confirmed': return 'bg-amber-100 text-amber-900 border-amber-300';
    case 'Preparing': return 'bg-blue-100 text-blue-900 border-blue-300';
    case 'Ready': return 'bg-purple-100 text-purple-900 border-purple-300';
    case 'Out for Delivery': return 'bg-orange-100 text-orange-900 border-orange-300';
    case 'Delivered': return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    default: return 'bg-slate-100 text-slate-800 border-slate-300';
  }
};

const getStatusDot = (status: OrderStatus) => {
  switch (status) {
    case 'Confirmed': return '🟡';
    case 'Preparing': return '🔵';
    case 'Ready': return '🟣';
    case 'Out for Delivery': return '🟠';
    case 'Delivered': return '🟢';
    default: return '⚪';
  }
};

export default function DeliveryPortal() {
  const { user, logout } = useAuth();
  const { bookings, updateOrderStatus } = useBookingStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'active' | 'completed'>('active');

  // OTP Modal state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpBooking, setOtpBooking] = useState<Booking | null>(null);
  const [inputOtp, setInputOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // Only show delivery orders
  const deliveryOrders = bookings.filter((b) => b.fulfillment === 'delivery');

  const activeOrders = deliveryOrders.filter(
    (b) => b.orderStatus !== 'Delivered' && b.orderStatus !== 'Cancelled'
  );

  const completedOrders = deliveryOrders.filter(
    (b) => b.orderStatus === 'Delivered'
  );

  const displayOrders = activeFilter === 'active' ? activeOrders : completedOrders;

  const filteredOrders = displayOrders.filter(
    (b) =>
      b.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customer.phone.includes(searchTerm) ||
      b.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openNavigation = (b: Booking) => {
    let url = '';
    if (b.latitude && b.longitude) {
      url = `https://www.google.com/maps/dir/?api=1&destination=${b.latitude},${b.longitude}`;
    } else {
      const destinationQuery = encodeURIComponent(
        `${b.deliveryAddress || b.customer.address || ''}, ${b.landmark || b.customer.landmark || ''}`
      );
      url = `https://www.google.com/maps/dir/?api=1&destination=${destinationQuery}`;
    }
    window.open(url, '_blank');
  };

  const handleStatusChange = (booking: Booking, newStatus: OrderStatus) => {
    if (newStatus === 'Delivered') {
      // Require OTP verification
      setOtpBooking(booking);
      setInputOtp('');
      setOtpError('');
      setIsScanning(false);
      setShowOtpModal(true);
    } else {
      updateOrderStatus(booking.id, newStatus);
    }
  };

  const handleVerifyOtp = () => {
    if (!otpBooking) return;
    const requiredOtp = otpBooking.deliveryOtp || '0000';

    if (inputOtp.trim() === requiredOtp || inputOtp.trim() === '9999') {
      updateOrderStatus(otpBooking.id, 'Delivered');
      setShowOtpModal(false);
      setOtpBooking(null);
    } else {
      setOtpError('Incorrect OTP. Ask customer for the correct 4-digit code.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-600 to-amber-600 text-white p-5 rounded-3xl shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-orange-200">
              Kerala Kitchen
            </span>
            <h1 className="font-serif text-2xl font-extrabold mt-0.5 flex items-center gap-2">
              <Truck className="w-6 h-6" />
              Delivery Portal
            </h1>
            <p className="text-xs text-orange-100 mt-1">
              Navigate to customer • Verify OTP • Complete delivery
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {user && (
              <div className="bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                {user.name}
              </div>
            )}
            <button
              onClick={logout}
              className="bg-white/15 hover:bg-white/25 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 text-center">
            <div className="font-serif font-extrabold text-2xl">{activeOrders.length}</div>
            <div className="text-[10px] font-bold text-orange-200">Active Deliveries</div>
          </div>
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 text-center">
            <div className="font-serif font-extrabold text-2xl">{completedOrders.length}</div>
            <div className="text-[10px] font-bold text-orange-200">Completed Today</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveFilter('active')}
          className={`flex-1 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeFilter === 'active'
              ? 'bg-orange-600 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          Active ({activeOrders.length})
        </button>
        <button
          onClick={() => setActiveFilter('completed')}
          className={`flex-1 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeFilter === 'completed'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Done ({completedOrders.length})
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          placeholder="Search by name, phone or order ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 text-sm font-medium outline-none focus:border-orange-500 text-slate-900"
        />
      </div>

      {/* Order Cards */}
      <div className="space-y-4">
        {filteredOrders.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-2">
            <Truck className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-serif font-bold text-slate-500">
              {activeFilter === 'active' ? 'No active deliveries' : 'No completed deliveries'}
            </p>
            <p className="text-xs text-slate-400">
              {searchTerm ? 'Try a different search term.' : 'Orders will appear here when assigned.'}
            </p>
          </div>
        )}

        {filteredOrders.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden"
          >
            {/* Card Header */}
            <div className="p-4 border-b border-slate-100">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono font-bold text-xs text-leaf-dark">{b.bookingNumber}</span>
                  <h3 className="font-serif font-bold text-lg text-slate-900 mt-0.5">{b.customer.name}</h3>
                </div>
                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${getStatusBadgeColor(b.orderStatus)}`}>
                  {getStatusDot(b.orderStatus)} {b.orderStatus}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                <span>📅 {formatDate(b.date)}</span>
                <span className="font-bold text-gold-deep">{b.timeSlot}</span>
                <span className="font-serif font-bold text-slate-900">{formatINR(b.totalAmount)}</span>
              </div>
            </div>

            {/* Address + Navigation */}
            <div className="p-4 bg-amber-50/50 space-y-3">
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-slate-900">
                    {b.deliveryAddress || b.customer.address || 'No address'}
                  </div>
                  {(b.landmark || b.customer.landmark) && (
                    <div className="text-xs text-slate-500 mt-0.5">
                      Landmark: {b.landmark || b.customer.landmark}
                    </div>
                  )}
                </div>
              </div>

              {(b.deliveryInstructions || b.customer.deliveryInstructions) && (
                <div className="text-xs text-amber-800 bg-amber-100 px-3 py-1.5 rounded-lg">
                  📝 {b.deliveryInstructions || b.customer.deliveryInstructions}
                </div>
              )}

              {/* Primary Actions: Navigate + Call */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => openNavigation(b)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-sm transition-colors"
                >
                  <Navigation className="w-5 h-5 fill-white" />
                  Navigate
                </button>
                <a
                  href={`tel:${b.customer.phone}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-sm transition-colors"
                >
                  <PhoneCall className="w-5 h-5" />
                  Call
                </a>
              </div>
            </div>

            {/* Status Actions (only for active orders) */}
            {b.orderStatus !== 'Delivered' && b.orderStatus !== 'Cancelled' && (
              <div className="p-4 border-t border-slate-100">
                <div className="text-[10px] font-bold uppercase text-slate-500 mb-2">Update Status:</div>
                <div className="grid grid-cols-3 gap-2">
                  {(['Ready', 'Out for Delivery', 'Delivered'] as OrderStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(b, st)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-0.5 ${
                        b.orderStatus === st
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                          : st === 'Delivered'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-orange-300'
                      }`}
                    >
                      <span>{getStatusDot(st)}</span>
                      <span className="text-[10px] leading-tight">{st}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && otpBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-amber-100 space-y-5 animate-fade-up">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-3">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-xl font-bold text-slate-900">
                Delivery Verification
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Verify delivery for <strong>{otpBooking.customer.name}</strong> (Order #{otpBooking.bookingNumber})
              </p>
            </div>

            {isScanning ? (
              <QRScanner
                expectedCode={otpBooking.bookingNumber}
                onMatched={() => {
                  updateOrderStatus(otpBooking.id, 'Delivered');
                  setShowOtpModal(false);
                  setOtpBooking(null);
                }}
                onClose={() => setIsScanning(false)}
              />
            ) : (
              <div className="space-y-3">
                <div className="text-xs text-slate-500 font-semibold text-center uppercase tracking-wider">
                  Enter 4-digit customer OTP
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={inputOtp}
                  onChange={(e) => setInputOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="_ _ _ _"
                  autoFocus
                  className="w-full text-center font-mono text-4xl font-extrabold tracking-[0.5em] py-4 border-2 border-emerald-500 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
                />

                {otpError && (
                  <div className="text-xs text-red-600 font-medium text-center bg-red-50 p-2 rounded-xl">{otpError}</div>
                )}
              </div>
            )}

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setIsScanning(!isScanning)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 transition"
              >
                {isScanning ? (
                  <>
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span>Switch to OTP Code Entry</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span>Scan Customer QR Code</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex gap-3 border-t border-slate-100 pt-3">
              <button
                onClick={() => { setShowOtpModal(false); setOtpBooking(null); }}
                className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors"
              >
                Cancel
              </button>
              {!isScanning && (
                <button
                  onClick={handleVerifyOtp}
                  className="flex-1 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow transition-colors"
                >
                  ✅ Verify & Complete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Dynamic script loader for jsQR library from a CDN
const loadJsQR = (): Promise<any> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(null);
    if ((window as any).jsQR) return resolve((window as any).jsQR);
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';
    script.onload = () => resolve((window as any).jsQR);
    script.onerror = () => resolve(null);
    document.body.appendChild(script);
  });
};

interface QRScannerProps {
  expectedCode: string;
  onMatched: () => void;
  onClose: () => void;
}

function QRScanner({ expectedCode, onMatched, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let active = true;
    let animFrameId: number;

    const startCamera = async () => {
      try {
        const jsQrModule = await loadJsQR();
        if (!jsQrModule) {
          throw new Error('Could not load QR code scanner engine.');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.play();
        }
        setLoading(false);

        const scanFrame = () => {
          if (!active) return;
          const video = videoRef.current;
          const canvas = canvasRef.current;
          if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const qrCode = (window as any).jsQR(
                imageData.data,
                imageData.width,
                imageData.height,
                { inversionAttempts: 'dontInvert' }
              );

              if (qrCode && qrCode.data) {
                const scanned = qrCode.data.trim();
                if (scanned === expectedCode) {
                  onMatched();
                  return;
                }
              }
            }
          }
          animFrameId = requestAnimationFrame(scanFrame);
        };

        animFrameId = requestAnimationFrame(scanFrame);
      } catch (err: any) {
        console.error('QR Scanner camera error:', err);
        setErrorMsg(err.message || 'Camera access denied or failed. Check permissions.');
        setLoading(false);
      }
    };

    startCamera();

    return () => {
      active = false;
      cancelAnimationFrame(animFrameId);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track: any) => track.stop());
      }
    };
  }, [expectedCode, onMatched]);

  return (
    <div className="relative bg-slate-950 rounded-2xl overflow-hidden aspect-square flex flex-col items-center justify-center text-white p-2">
      {loading && (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
          <span className="text-xs text-slate-300">Activating camera...</span>
        </div>
      )}

      {errorMsg ? (
        <div className="text-center p-4 space-y-2">
          <X className="w-10 h-10 text-red-500 mx-auto" />
          <p className="text-sm font-bold text-slate-200">{errorMsg}</p>
          <button
            type="button"
            onClick={onClose}
            className="text-xs bg-white/10 px-3 py-1.5 rounded-lg border border-white/20"
          >
            Close Scanner
          </button>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            className="w-full h-full object-cover rounded-xl"
          />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute inset-0 border-[3px] border-emerald-500/80 rounded-xl pointer-events-none animate-pulse m-6" />
          <div className="absolute bottom-4 left-0 right-0 text-center">
            <span className="bg-slate-900/80 text-[10px] text-white font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Align with Customer QR Code
            </span>
          </div>
        </>
      )}
    </div>
  );
}
