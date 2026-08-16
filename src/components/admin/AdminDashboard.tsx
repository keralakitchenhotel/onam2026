'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useBookingStore } from '@/lib/store';
import { SADYA_MENU_ITEMS, AVAILABLE_SLOTS, VALID_COUPONS, ONAM_FESTIVAL_DATES } from '@/lib/constants';
import { formatINR, formatDate } from '@/lib/utils';
import { generateInvoicePDF } from '@/lib/pdf';
import { Booking, OrderStatus, MenuItem, DeliverySlot, Coupon, FulfillmentType } from '@/types';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Download,
  Search,
  Filter,
  ShieldCheck,
  Tag,
  Utensils,
  LogOut,
  User,
  Eye,
  X,
  MapPin,
  PhoneCall,
  Navigation,
  Trash2,
  Plus,
  Save,
  Calendar,
  Truck,
  IndianRupee,
  BarChart3,
  AlertCircle,
  Copy,
  Check,
  Edit3,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// ─────────────────── STATUS BADGE HELPERS ───────────────────
const getStatusBadgeColor = (status: OrderStatus) => {
  switch (status) {
    case 'Booked':
      return 'bg-slate-100 text-slate-700 border-slate-300';
    case 'Confirmed':
      return 'bg-amber-100 text-amber-900 border-amber-300';
    case 'Preparing':
      return 'bg-blue-100 text-blue-900 border-blue-300';
    case 'Ready':
      return 'bg-purple-100 text-purple-900 border-purple-300';
    case 'Out for Delivery':
      return 'bg-orange-100 text-orange-900 border-orange-300';
    case 'Delivered':
      return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    case 'Cancelled':
      return 'bg-red-100 text-red-900 border-red-300';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-300';
  }
};

const getStatusDot = (status: OrderStatus) => {
  switch (status) {
    case 'Booked': return '⚪';
    case 'Confirmed': return '🟡';
    case 'Preparing': return '🔵';
    case 'Ready': return '🟣';
    case 'Out for Delivery': return '🟠';
    case 'Delivered': return '🟢';
    case 'Cancelled': return '🔴';
    default: return '⚪';
  }
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { bookings, updateOrderStatus, updateBooking, deleteBooking, isLoaded } = useBookingStore();
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'slots' | 'coupons' | 'analytics'>('orders');

  const prevBookingsCount = useRef<number | null>(null);

  // Web Audio chime synthesizer for real-time doorbell/cash-register notification sounds
  const playAlarmSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Note 1: E5
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
      gain1.gain.setValueAtTime(0.25, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.35);

      // Note 2: A5 slightly offset
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.frequency.setValueAtTime(880, ctx.currentTime);
        gain2.gain.setValueAtTime(0.25, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.5);
      }, 120);
    } catch (err) {
      console.warn('Web Audio Context blocked or not supported:', err);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;
    
    // Initialize count on first load
    if (prevBookingsCount.current === null) {
      prevBookingsCount.current = bookings.length;
      return;
    }

    // Play chime alarm if new order enters the queue
    if (bookings.length > prevBookingsCount.current) {
      playAlarmSound();
    }
    
    prevBookingsCount.current = bookings.length;
  }, [bookings, isLoaded]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');
  const [filterFulfillment, setFilterFulfillment] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [inspectBooking, setInspectBooking] = useState<Booking | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // ── Booking Edit state (Admin complete power) ──
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTimeSlot, setEditTimeSlot] = useState('');
  const [editFulfillment, setEditFulfillment] = useState<FulfillmentType>('pickup');
  const [editAdults, setEditAdults] = useState(1);
  const [editAddress, setEditAddress] = useState('');
  const [editLandmark, setEditLandmark] = useState('');
  const [editPincode, setEditPincode] = useState('');
  const [editLatitude, setEditLatitude] = useState<number | ''>('');
  const [editLongitude, setEditLongitude] = useState<number | ''>('');
  const [editPaymentStatus, setEditPaymentStatus] = useState<'pending' | 'paid' | 'failed' | 'refunded'>('pending');
  const [editPaymentMethod, setEditPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'wallet' | 'cash'>('upi');
  const [editOtp, setEditOtp] = useState('');

  // ── Local admin-managed state for slots, menu, coupons ──
  const [localSlots, setLocalSlots] = useState<DeliverySlot[]>(AVAILABLE_SLOTS);
  const [localMenuItems, setLocalMenuItems] = useState<MenuItem[]>(SADYA_MENU_ITEMS);
  const [localCoupons, setLocalCoupons] = useState<Coupon[]>(VALID_COUPONS);
  const [showNewCouponForm, setShowNewCouponForm] = useState(false);
  const [newCoupon, setNewCoupon] = useState<Coupon>({
    code: '',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 200,
    expiryDate: '2026-08-29',
    description: '',
  });

  // ─────────────────── COMPUTED METRICS ───────────────────
  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalBookingsCount = bookings.length;
  const pendingOrdersCount = bookings.filter((b) => b.orderStatus === 'Booked' || b.orderStatus === 'Confirmed' || b.orderStatus === 'Preparing').length;
  const completedOrdersCount = bookings.filter((b) => b.orderStatus === 'Delivered').length;
  const deliveryCount = bookings.filter((b) => b.fulfillment === 'delivery').length;
  const pickupCount = bookings.filter((b) => b.fulfillment === 'pickup').length;

  // ─────────────────── FILTERED BOOKINGS ───────────────────
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesSearch =
        b.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.customer.phone.includes(searchTerm);
      const matchesStatus = filterStatus === 'all' || b.orderStatus === filterStatus;
      const matchesDate = filterDate === 'all' || b.date === filterDate;
      const matchesFulfillment = filterFulfillment === 'all' || b.fulfillment === filterFulfillment;
      return matchesSearch && matchesStatus && matchesDate && matchesFulfillment;
    });
  }, [bookings, searchTerm, filterStatus, filterDate, filterFulfillment]);

  // ─────────────────── ANALYTICS DATA ───────────────────
  const analyticsByDate = useMemo(() => {
    return ONAM_FESTIVAL_DATES.map((fd) => {
      const dateBookings = bookings.filter((b) => b.date === fd.date);
      const revenue = dateBookings.reduce((s, b) => s + b.totalAmount, 0);
      const delivery = dateBookings.filter((b) => b.fulfillment === 'delivery').length;
      const pickup = dateBookings.filter((b) => b.fulfillment === 'pickup').length;
      const cancelled = dateBookings.filter((b) => b.orderStatus === 'Cancelled').length;
      return { ...fd, count: dateBookings.length, revenue, delivery, pickup, cancelled };
    });
  }, [bookings]);

  const analyticsByPackage = useMemo(() => {
    return localMenuItems.map((item) => {
      const pkgBookings = bookings.filter((b) => b.sadyaItem.id === item.id);
      const revenue = pkgBookings.reduce((s, b) => s + b.totalAmount, 0);
      const totalPax = pkgBookings.reduce((s, b) => s + b.quantity.adults + b.quantity.children, 0);
      return { name: item.name, count: pkgBookings.length, revenue, totalPax, price: item.price };
    });
  }, [bookings, localMenuItems]);

  // ── Slot occupancy (from live bookings) ──
  const activeBookings = bookings.filter((b) => b.orderStatus !== 'Cancelled');
  const liveSlots = localSlots.map((slot) => {
    const bookedCount = activeBookings.filter((b) => b.timeSlot === slot.time).length;
    return { ...slot, bookedCount };
  });

  // ─────────────────── HANDLERS ───────────────────
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const startEditing = (b: Booking) => {
    setEditName(b.customer.name);
    setEditPhone(b.customer.phone);
    setEditEmail(b.customer.email || '');
    setEditDate(b.date);
    setEditTimeSlot(b.timeSlot);
    setEditFulfillment(b.fulfillment);
    setEditAdults(b.quantity.adults);
    setEditAddress(b.deliveryAddress || b.customer.address || '');
    setEditLandmark(b.landmark || b.customer.landmark || '');
    setEditPincode(b.customer.pincode || '');
    setEditLatitude(b.latitude ?? '');
    setEditLongitude(b.longitude ?? '');
    setEditPaymentStatus(b.paymentStatus);
    setEditPaymentMethod(b.paymentMethod);
    setEditOtp(b.deliveryOtp || '');
    setIsEditing(true);
  };

  const saveBookingEdits = () => {
    if (!inspectBooking) return;
    
    // Compute total based on portions change
    const basePrice = inspectBooking.sadyaItem.price * editAdults;
    const extrasTotal = inspectBooking.extras.reduce((s, e) => s + e.price * e.quantity, 0);
    const subtotal = basePrice + extrasTotal;
    const discount = inspectBooking.discount; // Preserve coupon discount
    const deliveryCharge = editFulfillment === 'delivery' ? 50 : 0;
    const totalAmount = Math.max(0, subtotal - discount + deliveryCharge);

    const updatedFields: Partial<Booking> = {
      date: editDate,
      timeSlot: editTimeSlot,
      fulfillment: editFulfillment,
      quantity: {
        adults: editAdults,
        children: inspectBooking.quantity.children,
      },
      customer: {
        ...inspectBooking.customer,
        name: editName,
        phone: editPhone,
        email: editEmail,
        address: editAddress,
        landmark: editLandmark,
        pincode: editPincode,
        latitude: editLatitude === '' ? null : editLatitude,
        longitude: editLongitude === '' ? null : editLongitude,
      },
      deliveryAddress: editAddress,
      landmark: editLandmark,
      deliveryOtp: editOtp,
      latitude: editLatitude === '' ? null : editLatitude,
      longitude: editLongitude === '' ? null : editLongitude,
      paymentStatus: editPaymentStatus,
      paymentMethod: editPaymentMethod,
      subtotal,
      deliveryCharge,
      totalAmount,
    };

    updateBooking(inspectBooking.id, updatedFields);
    setInspectBooking({
      ...inspectBooking,
      ...updatedFields,
    });
    setIsEditing(false);
  };

  const exportCSV = () => {
    const escapeCSV = (value: string | number) => {
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = 'Booking ID,Date,Time Slot,Fulfillment,Customer Name,Phone,Address,Total Amount,Order Status,Payment Status,Delivery OTP\n';
    const rows = bookings
      .map(
        (b) =>
          `${escapeCSV(b.bookingNumber)},${escapeCSV(b.date)},${escapeCSV(b.timeSlot)},${escapeCSV(b.fulfillment)},${escapeCSV(b.customer.name)},${escapeCSV(b.customer.phone)},${escapeCSV(b.deliveryAddress || b.customer.address || '')},${b.totalAmount},${escapeCSV(b.orderStatus)},${escapeCSV(b.paymentStatus)},${escapeCSV(b.deliveryOtp || '')}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KeralaKitchen_Onam_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

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

  const handleAddCoupon = () => {
    if (!newCoupon.code.trim()) return;
    setLocalCoupons((prev) => [...prev, { ...newCoupon, code: newCoupon.code.toUpperCase().trim() }]);
    setNewCoupon({ code: '', discountType: 'percentage', discountValue: 10, minOrderValue: 200, expiryDate: '2026-08-29', description: '' });
    setShowNewCouponForm(false);
  };

  const handleDeleteCoupon = (code: string) => {
    setLocalCoupons((prev) => prev.filter((c) => c.code !== code));
  };

  const handleUpdateSlot = (time: string, fields: Partial<DeliverySlot>) => {
    setLocalSlots((prev) => prev.map((s) => (s.time === time ? { ...s, ...fields } : s)));
  };

  const handleUpdateMenuItem = (id: string, fields: Partial<MenuItem>) => {
    setLocalMenuItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...fields } : item)));
  };

  const getWhatsAppRedirectUrl = (booking: Booking, status: OrderStatus) => {
    const rawPhone = booking.customer.phone.replace(/[^0-9]/g, '');
    const formattedPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';

    let message = '';
    switch (status) {
      case 'Booked':
        message = `Hello ${booking.customer.name}, we have received your Kerala Kitchen Onam Sadya pre-booking request #${booking.bookingNumber}. We will confirm it shortly. Track live at ${siteUrl}/track?id=${booking.bookingNumber}`;
        break;
      case 'Confirmed':
        message = `Hello ${booking.customer.name}, your Kerala Kitchen Onam Sadya booking #${booking.bookingNumber} is confirmed! ${booking.tokenNumber ? `Your token number is ${booking.tokenNumber}.` : ''} Track live at ${siteUrl}/track?id=${booking.bookingNumber}`;
        break;
      case 'Preparing':
        message = `Hello ${booking.customer.name}, our chefs have started preparing your Kerala Kitchen Onam Sadya feast! 🍛 Track live at ${siteUrl}/track?id=${booking.bookingNumber}`;
        break;
      case 'Ready':
        message = `Hello ${booking.customer.name}, your hot Kerala Kitchen Onam Sadya #${booking.bookingNumber} is ready at the counter! ${booking.tokenNumber ? `Token: ${booking.tokenNumber}.` : ''} Please present your QR code for verification. Track live at ${siteUrl}/track?id=${booking.bookingNumber}`;
        break;
      case 'Out for Delivery':
        message = `Hello ${booking.customer.name}, our delivery executive is on the way with your Kerala Kitchen Onam Sadya #${booking.bookingNumber}! ${booking.deliveryOtp ? `Verification OTP: ${booking.deliveryOtp}.` : ''} Please share this with the driver. Track live at ${siteUrl}/track?id=${booking.bookingNumber}`;
        break;
      case 'Delivered':
        message = `Hello ${booking.customer.name}, your Kerala Kitchen Onam Sadya #${booking.bookingNumber} has been delivered. We wish you a happy and prosperous Onam celebration! 🌸🍛`;
        break;
      case 'Cancelled':
        message = `Hello ${booking.customer.name}, your Kerala Kitchen Onam Sadya booking #${booking.bookingNumber} has been cancelled. Please contact support at 9447445078 / 9745627203 for queries.`;
        break;
    }
    return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
  };

  const statusOptions: OrderStatus[] = ['Booked', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled'];

  const tabs = [
    { id: 'orders', label: 'All Orders', icon: ShoppingBag },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'menu', label: 'Menu & Prices', icon: Utensils },
    { id: 'slots', label: 'Time Slots', icon: Clock },
    { id: 'coupons', label: 'Coupons', icon: Tag },
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* ═══════════════ ADMIN HEADER ═══════════════ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gold/20 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-gold" />
            <h1 className="font-serif text-3xl font-extrabold text-leaf-dark">
              Admin Control Center
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Kerala Kitchen Onam Sadya — Complete Management System</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {user && (
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-600 bg-coconut-100 border border-gold/30 px-3.5 py-2 rounded-full">
              <User className="w-3.5 h-3.5 text-gold" />
              <span>{user.name}</span>
            </div>
          )}
          <button
            onClick={exportCSV}
            className="bg-leaf hover:bg-leaf-dark text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-sm flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4 text-gold-light" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={logout}
            className="bg-white hover:bg-maroon-soft text-maroon font-bold text-xs px-4 py-2.5 rounded-full border border-maroon/30 shadow-sm flex items-center gap-2 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* ═══════════════ OVERVIEW METRICS ═══════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Revenue', value: formatINR(totalRevenue), icon: TrendingUp, color: 'text-emerald-600' },
          { label: 'Total Bookings', value: totalBookingsCount, icon: ShoppingBag, color: 'text-gold-deep' },
          { label: 'Kitchen Queue', value: pendingOrdersCount, icon: Clock, color: 'text-amber-600' },
          { label: 'Completed', value: completedOrdersCount, icon: CheckCircle2, color: 'text-emerald-600' },
          { label: 'Delivery', value: deliveryCount, icon: Truck, color: 'text-blue-600' },
          { label: 'Pickup', value: pickupCount, icon: ShoppingBag, color: 'text-purple-600' },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="bg-white p-4 rounded-2xl border border-gold/30 shadow-soft">
              <div className="flex items-center justify-between text-slate-500 mb-1.5">
                <span className="text-[10px] font-bold uppercase">{metric.label}</span>
                <Icon className={`w-4 h-4 ${metric.color}`} />
              </div>
              <div className="font-serif text-xl font-extrabold text-slate-900">{isLoaded ? metric.value : '...'}</div>
            </div>
          );
        })}
      </div>

      {/* ═══════════════ TABS BAR ═══════════════ */}
      <div className="flex flex-wrap border-b border-slate-200 gap-x-1 gap-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`pb-3 px-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
                isActive
                  ? 'border-leaf text-leaf-dark'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ═══════════════ TAB 1: ORDERS TABLE ═══════════════ */}
      {activeTab === 'orders' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-soft space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search by ID, Name or Phone..."
                aria-label="Search orders"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-300 text-xs font-medium outline-none focus:border-leaf text-slate-900"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
              <select
                value={filterDate}
                aria-label="Filter by date"
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-3 py-2 rounded-full border border-slate-300 text-xs font-semibold text-slate-700 bg-white outline-none"
              >
                <option value="all">All Dates</option>
                {ONAM_FESTIVAL_DATES.map((fd) => (
                  <option key={fd.date} value={fd.date}>{fd.label}</option>
                ))}
              </select>
              <select
                value={filterFulfillment}
                aria-label="Filter by fulfillment"
                onChange={(e) => setFilterFulfillment(e.target.value)}
                className="px-3 py-2 rounded-full border border-slate-300 text-xs font-semibold text-slate-700 bg-white outline-none"
              >
                <option value="all">All Modes</option>
                <option value="delivery">🚗 Delivery</option>
                <option value="pickup">🏪 Pickup</option>
              </select>
              <select
                value={filterStatus}
                aria-label="Filter by status"
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-full border border-slate-300 text-xs font-semibold text-slate-700 bg-white outline-none"
              >
                <option value="all">All Statuses</option>
                {statusOptions.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="text-[11px] font-semibold text-slate-500">
            Showing {filteredBookings.length} of {bookings.length} orders
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-coconut-100 border-b border-gold/20 text-[11px] font-bold uppercase text-slate-600">
                  <th className="p-3">Booking ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Date & Slot</th>
                  <th className="p-3">Mode</th>
                  <th className="p-3">Items / Pax</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-10 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Search className="w-8 h-8" />
                        <p className="font-serif font-bold text-slate-500">No orders found</p>
                        <p className="text-[11px] text-slate-400">
                          {searchTerm || filterStatus !== 'all' || filterDate !== 'all' || filterFulfillment !== 'all'
                            ? 'Try adjusting your search or filters.'
                            : 'Bookings will appear here once customers place orders.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-coconut-50/50 transition-colors">
                    <td className="p-3 font-mono font-bold text-leaf-dark">{b.bookingNumber}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{b.customer.name}</div>
                      <div className="text-[11px] text-slate-500">{b.customer.phone}</div>
                    </td>
                    <td className="p-3">
                      <div>{formatDate(b.date)}</div>
                      <div className="text-[11px] text-gold-deep font-bold">{b.timeSlot}</div>
                    </td>
                    <td className="p-3">
                      <span className={`uppercase font-bold text-[10px] px-2 py-0.5 rounded-full ${
                        b.fulfillment === 'delivery'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>
                        {b.fulfillment === 'delivery' ? '🚗 Delivery' : '🏪 Pickup'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div>{b.sadyaItem.name}</div>
                      <div className="text-[11px] text-slate-500">{b.quantity.adults} Adult(s){b.quantity.children > 0 && `, ${b.quantity.children} Child`}</div>
                    </td>
                    <td className="p-3 font-serif font-bold text-slate-900">{formatINR(b.totalAmount)}</td>
                    <td className="p-3">
                      <select
                        value={b.orderStatus}
                        aria-label={`Order status for ${b.bookingNumber}`}
                        onChange={(e) => updateOrderStatus(b.id, e.target.value as OrderStatus)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border outline-none ${getStatusBadgeColor(b.orderStatus)}`}
                      >
                        {statusOptions.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setInspectBooking(b);
                            setIsEditing(false);
                          }}
                          className="p-1.5 rounded-lg bg-coconut-100 border border-gold/30 hover:bg-coconut-200 text-slate-700 inline-flex items-center gap-1 text-[11px] font-bold transition-colors"
                          title="View Order Details"
                        >
                          <Eye className="w-3.5 h-3.5 text-leaf" />
                        </button>
                        <button
                          onClick={() => generateInvoicePDF(b)}
                          className="p-1.5 rounded-lg bg-coconut-100 border border-gold/30 hover:bg-coconut-200 text-slate-700 inline-flex items-center gap-1 text-[11px] font-bold transition-colors"
                          title="Download Invoice PDF"
                        >
                          <Download className="w-3.5 h-3.5 text-gold-deep" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete order ${b.bookingNumber}?`)) deleteBooking(b.id);
                          }}
                          className="p-1.5 rounded-lg bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 inline-flex items-center transition-colors"
                          title="Delete Order"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════════ TAB 2: ANALYTICS ═══════════════ */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Date-wise Breakdown */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-soft space-y-4">
            <h2 className="font-serif text-lg font-bold text-leaf-dark flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gold" />
              Date-wise Revenue Breakdown
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analyticsByDate.map((fd) => {
                const maxRevenue = Math.max(...analyticsByDate.map((d) => d.revenue), 1);
                const barWidth = (fd.revenue / maxRevenue) * 100;
                return (
                  <div key={fd.date} className="bg-gradient-to-br from-coconut-50 to-white p-5 rounded-2xl border border-gold/20 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-serif font-bold text-base text-slate-900">{fd.label}</div>
                        <div className="text-[11px] text-slate-500">{fd.day}, {fd.malayalamDate}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-serif font-extrabold text-lg text-leaf-dark">{formatINR(fd.revenue)}</div>
                        <div className="text-[11px] text-slate-500">{fd.count} orders</div>
                      </div>
                    </div>
                    {/* Revenue Bar */}
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-gold to-gold-warm rounded-full transition-all duration-500" style={{ width: `${barWidth}%` }} />
                    </div>
                    {/* Mini Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-blue-50 rounded-xl px-2 py-1.5">
                        <div className="text-xs font-extrabold text-blue-700">{fd.delivery}</div>
                        <div className="text-[9px] text-blue-500 font-semibold">Delivery</div>
                      </div>
                      <div className="bg-purple-50 rounded-xl px-2 py-1.5">
                        <div className="text-xs font-extrabold text-purple-700">{fd.pickup}</div>
                        <div className="text-[9px] text-purple-500 font-semibold">Pickup</div>
                      </div>
                      <div className="bg-red-50 rounded-xl px-2 py-1.5">
                        <div className="text-xs font-extrabold text-red-600">{fd.cancelled}</div>
                        <div className="text-[9px] text-red-400 font-semibold">Cancelled</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Package-wise Breakdown */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-soft space-y-4">
            <h2 className="font-serif text-lg font-bold text-leaf-dark flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-gold" />
              Package-wise Performance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analyticsByPackage.map((pkg) => (
                <div key={pkg.name} className="bg-gradient-to-br from-coconut-50 to-white p-5 rounded-2xl border border-gold/20 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-serif font-bold text-sm text-slate-900">{pkg.name}</div>
                      <div className="text-[11px] text-slate-500">{formatINR(pkg.price)} per unit</div>
                    </div>
                    <div className="text-right">
                      <div className="font-serif font-extrabold text-lg text-leaf-dark">{formatINR(pkg.revenue)}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gold-soft/30 rounded-xl px-3 py-2 text-center">
                      <div className="text-sm font-extrabold text-slate-900">{pkg.count}</div>
                      <div className="text-[10px] text-slate-500 font-semibold">Orders</div>
                    </div>
                    <div className="bg-emerald-50 rounded-xl px-3 py-2 text-center">
                      <div className="text-sm font-extrabold text-emerald-700">{pkg.totalPax}</div>
                      <div className="text-[10px] text-slate-500 font-semibold">Total Pax</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Status Summary */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-soft">
            <h2 className="font-serif text-lg font-bold text-leaf-dark mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gold" />
              Order Status Distribution
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {statusOptions.map((st) => {
                const count = bookings.filter((b) => b.orderStatus === st).length;
                return (
                  <div key={st} className="text-center bg-coconut-50 rounded-xl p-3 border border-slate-100">
                    <div className="text-lg mb-0.5">{getStatusDot(st)}</div>
                    <div className="font-serif font-extrabold text-lg text-slate-900">{count}</div>
                    <div className="text-[10px] font-bold text-slate-500">{st}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ TAB 3: MENU EDITOR ═══════════════ */}
      {activeTab === 'menu' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800">
              <strong>Menu Manager:</strong> Edit package prices, descriptions, and toggle availability below. Changes apply immediately to admin view. To persist permanently, update your <code>constants.ts</code> file.
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {localMenuItems.map((item) => (
              <div key={item.id} className="p-5 bg-white rounded-3xl border border-gold/30 shadow-soft space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-slate-900">{item.name}</h3>
                    {item.malayalamName && (
                      <span className="text-xs text-maroon font-semibold">{item.malayalamName}</span>
                    )}
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-[10px] font-bold text-slate-500">
                      {item.isAvailable ? 'Active' : 'Disabled'}
                    </span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={item.isAvailable}
                        onChange={(e) => handleUpdateMenuItem(item.id, { isAvailable: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 rounded-full bg-slate-200 peer-checked:bg-emerald-500 transition-colors" />
                      <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm peer-checked:translate-x-5 transition-transform" />
                    </div>
                  </label>
                </div>

                {/* Editable Price */}
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold text-slate-600">Price (₹):</label>
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => handleUpdateMenuItem(item.id, { price: parseInt(e.target.value) || 0 })}
                    className="w-28 px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-leaf-dark outline-none focus:border-leaf"
                  />
                </div>

                {/* Editable Description */}
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Description:</label>
                  <textarea
                    value={item.description}
                    onChange={(e) => handleUpdateMenuItem(item.id, { description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-700 outline-none focus:border-leaf resize-none"
                  />
                </div>

                {/* Serving Info */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-emerald-700 font-bold">🌿 100% Pure Veg • {item.servingPax}</span>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    {item.itemCount} Delicacies
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════ TAB 4: TIME SLOTS MANAGER ═══════════════ */}
      {activeTab === 'slots' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800">
              <strong>Slot Manager:</strong> Adjust maximum order capacity per time slot and toggle availability. Occupancy counts are computed live from actual bookings.
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveSlots.map((slot) => {
              const occupancyPct = slot.maxOrders > 0 ? Math.min(100, (slot.bookedCount / slot.maxOrders) * 100) : 0;
              const isFull = slot.bookedCount >= slot.maxOrders;
              return (
                <div key={slot.time} className="p-5 bg-white rounded-3xl border border-gold/30 shadow-soft space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-xl text-slate-900">{slot.time}</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className={`text-[10px] font-bold ${slot.isAvailable ? 'text-emerald-600' : 'text-red-500'}`}>
                        {slot.isAvailable ? 'Active' : 'Closed'}
                      </span>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={slot.isAvailable}
                          onChange={(e) => handleUpdateSlot(slot.time, { isAvailable: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 rounded-full bg-slate-200 peer-checked:bg-emerald-500 transition-colors" />
                        <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm peer-checked:translate-x-5 transition-transform" />
                      </div>
                    </label>
                  </div>

                  {/* Editable Max Orders */}
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-slate-600">Max Orders:</label>
                    <input
                      type="number"
                      value={slot.maxOrders}
                      min={1}
                      onChange={(e) => handleUpdateSlot(slot.time, { maxOrders: parseInt(e.target.value) || 1 })}
                      className="w-20 px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 outline-none focus:border-leaf"
                    />
                  </div>

                  {/* Live Occupancy */}
                  <div className="text-xs text-slate-600">
                    Booked: <strong className={isFull ? 'text-red-600' : 'text-emerald-700'}>{slot.bookedCount}</strong> / {slot.maxOrders}
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-maroon' : occupancyPct > 70 ? 'bg-amber-500' : 'bg-gold'}`}
                      style={{ width: `${occupancyPct}%` }}
                    />
                  </div>
                  {isFull && (
                    <div className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg text-center">
                      ⚠️ SLOT FULL — No more bookings accepted
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════ TAB 5: COUPONS MANAGER ═══════════════ */}
      {activeTab === 'coupons' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-leaf-dark">Active Promotional Coupons</h2>
            <button
              onClick={() => setShowNewCouponForm(true)}
              className="bg-leaf hover:bg-leaf-dark text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-sm flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Coupon</span>
            </button>
          </div>

          {/* New Coupon Form */}
          {showNewCouponForm && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-4">
              <h3 className="font-serif font-bold text-sm text-slate-900">Create New Coupon</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-600 block mb-1">Code</label>
                  <input
                    type="text"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                    placeholder="e.g. ONAM50"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold outline-none focus:border-leaf"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-600 block mb-1">Discount Type</label>
                  <select
                    value={newCoupon.discountType}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value as 'percentage' | 'flat' })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:border-leaf"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-600 block mb-1">Discount Value</label>
                  <input
                    type="number"
                    value={newCoupon.discountValue}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-leaf"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-600 block mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    value={newCoupon.minOrderValue}
                    onChange={(e) => setNewCoupon({ ...newCoupon, minOrderValue: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-leaf"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-600 block mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={newCoupon.expiryDate}
                    onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:border-leaf"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-600 block mb-1">Description</label>
                  <input
                    type="text"
                    value={newCoupon.description}
                    onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                    placeholder="Discount description..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-leaf"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddCoupon}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-5 py-2.5 rounded-full flex items-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Create Coupon
                </button>
                <button
                  onClick={() => setShowNewCouponForm(false)}
                  className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-5 py-2.5 rounded-full border border-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Existing Coupons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {localCoupons.map((cp) => {
              const isExpired = new Date(cp.expiryDate).getTime() < Date.now();
              return (
                <div
                  key={cp.code}
                  className={`p-5 bg-white rounded-3xl border shadow-soft space-y-3 ${isExpired ? 'border-red-200 opacity-60' : 'border-gold/30'}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-extrabold text-lg text-leaf-dark">{cp.code}</span>
                    <span className="text-xs font-bold bg-gold-soft text-slate-900 px-2.5 py-0.5 rounded-full">
                      {cp.discountType === 'percentage' ? `${cp.discountValue}% OFF` : `₹${cp.discountValue} OFF`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{cp.description}</p>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Min: {formatINR(cp.minOrderValue)}</span>
                    <span className={`font-bold ${isExpired ? 'text-red-500' : 'text-emerald-600'}`}>
                      {isExpired ? '⛔ Expired' : `✅ Valid till ${cp.expiryDate}`}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteCoupon(cp.code)}
                    className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl border border-red-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove Coupon
                  </button>
                </div>
              );
            })}
            {localCoupons.length === 0 && (
              <div className="col-span-full text-center py-10 text-slate-400">
                <Tag className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="font-serif font-bold text-slate-500">No active coupons</p>
                <p className="text-[11px]">Click "Add Coupon" to create a new promo code.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════ ORDER INSPECTION MODAL ═══════════════ */}
      {inspectBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setInspectBooking(null)}>
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-gold/20 space-y-5 animate-fade-up max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-leaf-dark">{inspectBooking.bookingNumber}</span>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getStatusBadgeColor(inspectBooking.orderStatus)}`}>
                    {getStatusDot(inspectBooking.orderStatus)} {inspectBooking.orderStatus}
                  </span>
                  {inspectBooking.isGuest && (
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">Guest</span>
                  )}
                </div>
                <h2 className="font-serif text-2xl font-extrabold text-leaf-dark mt-1">
                  {isEditing ? 'Edit Order Details' : inspectBooking.customer.name}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <button
                    onClick={() => startEditing(inspectBooking)}
                    className="px-3.5 py-1.5 rounded-xl bg-gold hover:bg-gold-warm text-slate-900 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Portals / Details</span>
                  </button>
                )}
                <button
                  onClick={() => setInspectBooking(null)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {isEditing ? (
              /* ✏️ COMPLETE ADMIN POWER: EDITING MODE FORM */
              <div className="space-y-4 text-xs font-semibold text-slate-700">
                {/* Section A: Customer Details */}
                <div className="bg-coconut-50 p-4 rounded-2xl border border-gold/20 space-y-3">
                  <h3 className="text-[10px] font-bold uppercase text-slate-500">A. Customer Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block mb-1">Full Name</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Email Address</label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Section B: Delivery Location / Addresses (Permission & Location Access) */}
                <div className="bg-coconut-50 p-4 rounded-2xl border border-gold/20 space-y-3">
                  <h3 className="text-[10px] font-bold uppercase text-slate-500">B. Fulfillment & Location Access</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block mb-1">Fulfillment Mode</label>
                      <select
                        value={editFulfillment}
                        onChange={(e) => setEditFulfillment(e.target.value as FulfillmentType)}
                        className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 font-bold"
                      >
                        <option value="pickup">🏪 Counter Pickup</option>
                        <option value="delivery">🚗 Doorstep Delivery</option>
                        <option value="dinein">🍽️ Dine-In at Restaurant</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1">Sadya Portions (Adults Qty)</label>
                      <input
                        type="number"
                        min={1}
                        value={editAdults}
                        onChange={(e) => setEditAdults(parseInt(e.target.value) || 1)}
                        className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Delivery Verification OTP</label>
                      <input
                        type="text"
                        maxLength={4}
                        value={editOtp}
                        onChange={(e) => setEditOtp(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 font-mono font-bold"
                      />
                    </div>
                  </div>

                  {editFulfillment === 'delivery' && (
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="block mb-1">Delivery Address</label>
                        <input
                          type="text"
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                          className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 font-bold"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block mb-1">Landmark</label>
                          <input
                            type="text"
                            value={editLandmark}
                            onChange={(e) => setEditLandmark(e.target.value)}
                            className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 font-bold"
                          />
                        </div>
                        <div>
                          <label className="block mb-1">Pincode</label>
                          <input
                            type="text"
                            value={editPincode}
                            onChange={(e) => setEditPincode(e.target.value)}
                            className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 font-bold"
                          />
                        </div>
                      </div>
                      {/* GPS coordinates access */}
                      <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-slate-200">
                        <div>
                          <label className="block mb-1 text-slate-500 font-medium text-[10px] uppercase">Latitude Coordinates</label>
                          <input
                            type="number"
                            step="any"
                            placeholder="e.g. 11.123456"
                            value={editLatitude}
                            onChange={(e) => setEditLatitude(e.target.value === '' ? '' : parseFloat(e.target.value))}
                            className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-mono font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 text-slate-500 font-medium text-[10px] uppercase">Longitude Coordinates</label>
                          <input
                            type="number"
                            step="any"
                            placeholder="e.g. 75.123456"
                            value={editLongitude}
                            onChange={(e) => setEditLongitude(e.target.value === '' ? '' : parseFloat(e.target.value))}
                            className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-mono font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section C: Payment & Schedule */}
                <div className="bg-coconut-50 p-4 rounded-2xl border border-gold/20 space-y-3">
                  <h3 className="text-[10px] font-bold uppercase text-slate-500">C. Payment & Schedule (Power Controls)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block mb-1">Date</label>
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Time Slot</label>
                      <select
                        value={editTimeSlot}
                        onChange={(e) => setEditTimeSlot(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 font-bold"
                      >
                        {AVAILABLE_SLOTS.map((s) => (
                          <option key={s.time} value={s.time}>{s.time}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1">Payment Method</label>
                      <select
                        value={editPaymentMethod}
                        onChange={(e) => setEditPaymentMethod(e.target.value as any)}
                        className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 font-bold"
                      >
                        <option value="upi">UPI (GPay/PhonePe)</option>
                        <option value="card">Credit/Debit Card</option>
                        <option value="cash">Cash on Delivery (COD)</option>
                        <option value="netbanking">Net Banking</option>
                        <option value="wallet">Mobile Wallet</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1">Payment Status</label>
                      <select
                        value={editPaymentStatus}
                        onChange={(e) => setEditPaymentStatus(e.target.value as any)}
                        className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 font-bold"
                      >
                        <option value="pending">🟡 Pending</option>
                        <option value="paid">🟢 Paid</option>
                        <option value="failed">🔴 Failed</option>
                        <option value="refunded">🔵 Refunded</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={saveBookingEdits}
                    className="flex-1 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save System Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="py-3.5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* 👁️ VIEWING MODE DETAIL LAYOUT */
              <>
                {/* Customer Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-coconut-50 p-4 rounded-2xl border border-gold/20 space-y-2">
                    <h3 className="text-[10px] font-bold uppercase text-slate-500">Customer Contact</h3>
                    <div className="flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 text-emerald-600" />
                      <a href={`tel:${inspectBooking.customer.phone}`} className="text-sm font-bold text-slate-900 underline hover:text-emerald-700">
                        {inspectBooking.customer.phone}
                      </a>
                    </div>
                    <div className="text-xs text-slate-600">
                      Email: <span className="font-medium">{inspectBooking.customer.email || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="bg-coconut-50 p-4 rounded-2xl border border-gold/20 space-y-2">
                    <h3 className="text-[10px] font-bold uppercase text-slate-500">Order Details</h3>
                    <div className="text-xs space-y-1">
                      <div>📅 <strong>{formatDate(inspectBooking.date)}</strong> at <strong className="text-gold-deep">{inspectBooking.timeSlot}</strong></div>
                      <div>{inspectBooking.fulfillment === 'delivery' ? '🚗' : '🏪'} <strong className="uppercase">{inspectBooking.fulfillment}</strong></div>
                      <div>💳 <strong>{inspectBooking.paymentMethod.toUpperCase()}</strong> — <span className={inspectBooking.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}>{inspectBooking.paymentStatus.toUpperCase()}</span></div>
                    </div>
                  </div>
                </div>

                {/* Delivery Location & Access Panel */}
                {inspectBooking.fulfillment === 'delivery' && (
                  <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-5 rounded-2xl border border-amber-300/80 space-y-3">
                    <h3 className="text-[10px] font-bold uppercase text-slate-500">Delivery Location & Coordinates Access</h3>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900">
                          {inspectBooking.deliveryAddress || inspectBooking.customer.address || 'No address provided'}
                        </span>
                        {(inspectBooking.landmark || inspectBooking.customer.landmark) && (
                          <div className="text-xs text-slate-600 mt-0.5">Landmark: {inspectBooking.landmark || inspectBooking.customer.landmark}</div>
                        )}
                      </div>
                    </div>
                    {(inspectBooking.deliveryInstructions || inspectBooking.customer.deliveryInstructions) && (
                      <div className="text-xs text-amber-900 bg-amber-100/70 px-3 py-1.5 rounded-lg border border-amber-200">
                        <strong>Note:</strong> {inspectBooking.deliveryInstructions || inspectBooking.customer.deliveryInstructions}
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openNavigation(inspectBooking)}
                        className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors"
                      >
                        <Navigation className="w-4 h-4 fill-white" />
                        🧭 Open in Google Maps
                      </button>
                      <button
                        onClick={() => handleCopy(inspectBooking.deliveryAddress || inspectBooking.customer.address || '', 'modal-addr')}
                        className="py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 flex items-center gap-2 transition-colors"
                      >
                        {copiedField === 'modal-addr' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        Copy
                      </button>
                    </div>
                    {/* Delivery OTP */}
                    {inspectBooking.deliveryOtp && (
                      <div className="bg-white border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                        <div className="text-xs text-slate-600">
                          Delivery OTP: <span className="font-mono font-extrabold text-lg text-emerald-700 ml-2">{inspectBooking.deliveryOtp}</span>
                        </div>
                        <button
                          onClick={() => handleCopy(inspectBooking.deliveryOtp || '', 'otp')}
                          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                        >
                          {copiedField === 'otp' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          Copy OTP
                        </button>
                      </div>
                    )}
                    {/* GPS Coordinates Access */}
                    {inspectBooking.latitude && inspectBooking.longitude && (
                      <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200">
                        <span>📍 GPS Location Coordinates:</span>
                        <span className="font-bold text-slate-900">{inspectBooking.latitude.toFixed(6)}, {inspectBooking.longitude.toFixed(6)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Order Items & Pricing */}
                <div className="bg-coconut-50 p-5 rounded-2xl border border-gold/20 space-y-3">
                  <h3 className="text-[10px] font-bold uppercase text-slate-500">Order Items & Pricing</h3>
                  <div className="text-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-serif font-bold text-slate-900">{inspectBooking.sadyaItem.name}</span>
                      <span className="font-bold text-slate-800">{inspectBooking.quantity.adults} Pax</span>
                    </div>
                    {inspectBooking.extras.map((ext) => (
                      <div key={ext.id} className="flex justify-between items-center text-xs text-slate-600 mt-1">
                        <span>Extra: {ext.name} (x{ext.quantity})</span>
                        <span>{formatINR(ext.price * ext.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-slate-200 pt-3 space-y-1.5 text-sm">
                    <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatINR(inspectBooking.subtotal)}</span></div>
                    {inspectBooking.discount > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Discount ({inspectBooking.couponApplied?.code})</span>
                        <span>-{formatINR(inspectBooking.discount)}</span>
                      </div>
                    )}
                    {inspectBooking.deliveryCharge > 0 && (
                      <div className="flex justify-between text-slate-600"><span>Delivery</span><span>{formatINR(inspectBooking.deliveryCharge)}</span></div>
                    )}
                    <div className="flex justify-between font-serif font-extrabold text-lg text-leaf-dark border-t border-gold/30 pt-2">
                      <span>Total</span>
                      <span>{formatINR(inspectBooking.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Status Update */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold uppercase text-slate-500">Quick Status Update</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                    {statusOptions.map((st) => (
                      <div key={st} className="flex flex-col gap-1.5">
                        <button
                          onClick={() => {
                            updateOrderStatus(inspectBooking.id, st);
                            setInspectBooking({ ...inspectBooking, orderStatus: st });
                          }}
                          className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all flex flex-col items-center gap-0.5 w-full ${
                            inspectBooking.orderStatus === st
                              ? 'bg-leaf text-white border-leaf shadow'
                              : 'bg-white border-slate-200 hover:border-leaf text-slate-700'
                          }`}
                        >
                          <span>{getStatusDot(st)}</span>
                          <span>{st}</span>
                        </button>
                        <a
                          href={getWhatsAppRedirectUrl(inspectBooking, st)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-1 px-1 rounded-lg text-[9px] font-bold bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-center flex items-center justify-center gap-1 transition"
                        >
                          <svg className="w-2.5 h-2.5 text-emerald-600 fill-emerald-600 shrink-0" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.09-3.974c1.682.998 3.447 1.524 5.3 1.525 5.617 0 10.187-4.577 10.19-10.196.002-2.722-1.054-5.28-2.973-7.202C16.745 2.23 14.19 1.171 11.472 1.17 5.856 1.17 1.284 5.744 1.281 11.362c-.001 1.95.51 3.849 1.482 5.56l-.979 3.578 3.673-.964z" />
                          </svg>
                          WhatsApp
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => generateInvoicePDF(inspectBooking)}
                    className="flex-1 py-3 bg-leaf hover:bg-leaf-dark text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Invoice PDF
                  </button>
                  <button
                    onClick={() => setInspectBooking(null)}
                    className="py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
