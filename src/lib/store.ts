'use client';

import { useState, useEffect } from 'react';
import { Booking, MenuItem, ExtraItem, FulfillmentType, Coupon, SavedAddress, AuthUser } from '@/types';
import { SADYA_MENU_ITEMS, SAMPLE_BOOKINGS, EXTRAS_MENU, VALID_COUPONS } from './constants';
import { generateBookingNumber } from './utils';
import { supabase, isSupabaseConfigured } from './supabase/client';

const STORAGE_KEY_BOOKINGS = 'kerala_kitchen_bookings';
const STORAGE_KEY_CART = 'kerala_kitchen_active_draft';
const STORAGE_KEY_SAVED_ADDRESSES = 'kerala_kitchen_saved_addresses';

export interface BookingDraft {
  date: string;
  timeSlot: string;
  fulfillment: FulfillmentType;
  selectedSadyaId: string;
  adultsCount: number;
  childrenCount: number;
  extras: { [extraId: string]: number };
  
  // Customer Details
  isGuest: boolean;
  userId?: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  
  // Location & Address
  customerAddress: string;
  customerLandmark: string;
  customerPincode: string;
  deliveryInstructions: string;
  latitude: number | null;
  longitude: number | null;
  locationAccuracy: number | null;
  
  // Payment
  couponCode: string;
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'wallet' | 'cash';
}

const DEFAULT_DRAFT: BookingDraft = {
  date: '2026-08-26',
  timeSlot: '12:00 PM',
  fulfillment: 'delivery',
  selectedSadyaId: 'sadya-regular',
  adultsCount: 1,
  childrenCount: 0,
  extras: {},
  isGuest: true,
  userId: null,
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  customerAddress: '',
  customerLandmark: '',
  customerPincode: '673602',
  deliveryInstructions: '',
  latitude: null,
  longitude: null,
  locationAccuracy: null,
  couponCode: '',
  paymentMethod: 'upi',
};

const DEFAULT_SAVED_ADDRESSES: SavedAddress[] = [];

function mapDbRowToSavedAddress(row: any): SavedAddress {
  return {
    id: row.id,
    userId: row.user_id,
    label: row.label,
    address: row.address,
    landmark: row.landmark || undefined,
    pincode: row.pincode || undefined,
    deliveryInstructions: row.delivery_instructions || undefined,
    latitude: row.latitude || undefined,
    longitude: row.longitude || undefined,
    isDefault: row.is_default,
    createdAt: row.created_at,
  };
}

function mapDbRowToBooking(row: any): Booking {
  const sadya = SADYA_MENU_ITEMS.find((item) => item.id === row.sadya_item_id) || SADYA_MENU_ITEMS[0];
  const couponApplied = row.coupon_code 
    ? VALID_COUPONS.find(c => c.code.toUpperCase() === row.coupon_code.toUpperCase()) 
    : undefined;
  
  const customerName = row.is_guest 
    ? row.guest_name 
    : (row.profiles?.full_name || row.guest_name || 'Customer');
  const customerPhone = row.is_guest 
    ? row.guest_phone 
    : (row.profiles?.phone || row.guest_phone || '');
  const customerEmail = row.is_guest 
    ? row.guest_email 
    : (row.profiles?.email || row.guest_email || '');

  return {
    id: row.id,
    bookingNumber: row.booking_number,
    userId: row.user_id,
    isGuest: row.is_guest,
    guestName: row.guest_name,
    guestPhone: row.guest_phone,
    guestEmail: row.guest_email,
    createdAt: row.created_at || new Date().toISOString(),
    date: row.booking_date,
    timeSlot: row.time_slot,
    fulfillment: row.fulfillment,
    sadyaItem: sadya,
    quantity: {
      adults: row.adults_count,
      children: row.children_count,
    },
    extras: Array.isArray(row.extras_json) ? row.extras_json : [],
    customer: {
      name: customerName,
      phone: customerPhone,
      email: customerEmail,
      address: row.delivery_address,
      landmark: row.landmark,
      pincode: row.pincode,
      deliveryInstructions: row.delivery_instructions,
      latitude: row.latitude,
      longitude: row.longitude,
      locationAccuracy: row.location_accuracy,
    },
    latitude: row.latitude,
    longitude: row.longitude,
    locationAccuracy: row.location_accuracy,
    deliveryAddress: row.delivery_address,
    landmark: row.landmark,
    deliveryInstructions: row.delivery_instructions,
    deliveryOtp: row.delivery_otp,
    couponApplied,
    subtotal: Number(row.subtotal),
    discount: Number(row.discount),
    deliveryCharge: Number(row.delivery_charge),
    totalAmount: Number(row.total_amount),
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    orderStatus: row.order_status,
    qrCodeUrl: row.qr_code_url,
    tokenNumber: row.token_number,
    estimatedWaitMinutes: row.estimated_wait_minutes,
  };
}

const VALID_ROLES: AuthUser['role'][] = ['admin', 'staff', 'driver', 'customer'];

async function resolveRoleFor(userId: string, fallbackRole: string): Promise<AuthUser['role']> {
  if (!supabase) return 'customer';
  const { data } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
  if (data?.role && VALID_ROLES.includes(data.role)) return data.role;
  return VALID_ROLES.includes(fallbackRole as AuthUser['role']) ? (fallbackRole as AuthUser['role']) : 'customer';
}

export function useBookingStore() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [draft, setDraft] = useState<BookingDraft>(DEFAULT_DRAFT);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 1. Initial Load from LocalStorage
    try {
      const storedBookings = localStorage.getItem(STORAGE_KEY_BOOKINGS);
      if (storedBookings) {
        setBookings(JSON.parse(storedBookings));
      } else {
        setBookings(SAMPLE_BOOKINGS);
      }

      const storedAddresses = localStorage.getItem(STORAGE_KEY_SAVED_ADDRESSES);
      if (storedAddresses) {
        setSavedAddresses(JSON.parse(storedAddresses));
      }

      const storedDraft = localStorage.getItem(STORAGE_KEY_CART);
      if (storedDraft) {
        setDraft(JSON.parse(storedDraft));
      }
    } catch (e) {
      console.error('Failed to load stored data', e);
    } finally {
      setIsLoaded(true);
    }

    // 2. Fetch from Supabase Database if Configured
    if (isSupabaseConfigured && supabase) {
      // Fetch all bookings (joins profiles to get user metadata)
      supabase
        .from('bookings')
        .select('*, profiles:user_id(*)')
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (!error && data) {
            const fetchedBookings = data.map(mapDbRowToBooking);
            setBookings(fetchedBookings);
            localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(fetchedBookings));
          } else if (error) {
            console.error('Failed to load bookings from Supabase:', error);
          }
        });

      // Listen to Auth State Changes
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
          const role = await resolveRoleFor(session.user.id, (session.user.app_metadata?.role as string) || 'customer');
          const userObj: AuthUser = {
            id: session.user.id,
            username: session.user.email?.split('@')[0] || 'customer',
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Customer',
            email: session.user.email,
            role,
            avatarUrl: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
            loggedInAt: new Date().toISOString(),
          };
          setAuthUser(userObj);
          setDraft((prev) => ({
            ...prev,
            isGuest: false,
            userId: session.user.id,
            customerName: prev.customerName || userObj.name,
            customerEmail: prev.customerEmail || userObj.email || '',
          }));
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const role = await resolveRoleFor(session.user.id, (session.user.app_metadata?.role as string) || 'customer');
          const userObj: AuthUser = {
            id: session.user.id,
            username: session.user.email?.split('@')[0] || 'customer',
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Customer',
            email: session.user.email,
            role,
            avatarUrl: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
            loggedInAt: new Date().toISOString(),
          };
          setAuthUser(userObj);
          setDraft((prev) => ({
            ...prev,
            isGuest: false,
            userId: session.user.id,
            customerName: userObj.name,
            customerEmail: userObj.email || '',
          }));
        } else if (event === 'SIGNED_OUT') {
          setAuthUser(null);
          setDraft((prev) => ({
            ...prev,
            isGuest: true,
            userId: null,
          }));
        }
      });

      const client = supabase;

      // Listen to real-time changes on public.bookings
      const channel = client
        .channel('realtime-bookings')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bookings',
          },
          async (payload) => {
            if (payload.eventType === 'INSERT') {
              const { data, error } = await client
                .from('bookings')
                .select('*, profiles:user_id(*)')
                .eq('id', payload.new.id)
                .single();
              
              if (!error && data) {
                const newBooking = mapDbRowToBooking(data);
                setBookings((prev) => {
                  if (prev.some((b) => b.id === newBooking.id)) return prev;
                  return [newBooking, ...prev];
                });
              }
            } else if (payload.eventType === 'UPDATE') {
              const { data, error } = await client
                .from('bookings')
                .select('*, profiles:user_id(*)')
                .eq('id', payload.new.id)
                .single();
              
              if (!error && data) {
                const updatedBooking = mapDbRowToBooking(data);
                setBookings((prev) =>
                  prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b))
                );
              }
            } else if (payload.eventType === 'DELETE') {
              setBookings((prev) => prev.filter((b) => b.id !== payload.old.id));
            }
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
        client.removeChannel(channel);
      };
    }
  }, []);

  useEffect(() => {
    if (isSupabaseConfigured && supabase && authUser?.id) {
      supabase
        .from('saved_addresses')
        .select('*')
        .eq('user_id', authUser.id)
        .then(({ data, error }) => {
          if (!error && data) {
            const mapped = data.map(mapDbRowToSavedAddress);
            setSavedAddresses(mapped);
            localStorage.setItem(STORAGE_KEY_SAVED_ADDRESSES, JSON.stringify(mapped));
          } else if (error) {
            console.error('Failed to load saved addresses from Supabase:', error);
          }
        });
    }
  }, [authUser]);

  const updateDraft = (fields: Partial<BookingDraft>) => {
    setDraft((prev) => {
      const updated = { ...prev, ...fields };
      try {
        localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save draft', e);
      }
      return updated;
    });
  };

  const selectSavedAddress = (address: SavedAddress) => {
    updateDraft({
      customerAddress: address.address,
      customerLandmark: address.landmark || '',
      customerPincode: address.pincode || '673602',
      deliveryInstructions: address.deliveryInstructions || '',
      latitude: address.latitude || null,
      longitude: address.longitude || null,
    });
  };

  const addSavedAddress = (newAddr: Omit<SavedAddress, 'id' | 'userId'>) => {
    const userId = authUser?.id || 'user-demo-1';
    const created: SavedAddress = {
      ...newAddr,
      id: `addr-${Date.now()}`,
      userId,
      createdAt: new Date().toISOString(),
    };
    const updated = [created, ...savedAddresses];
    setSavedAddresses(updated);
    localStorage.setItem(STORAGE_KEY_SAVED_ADDRESSES, JSON.stringify(updated));

    if (isSupabaseConfigured && supabase && authUser?.id) {
      supabase
        .from('saved_addresses')
        .insert([{
          user_id: authUser.id,
          label: newAddr.label,
          address: newAddr.address,
          landmark: newAddr.landmark,
          pincode: newAddr.pincode,
          delivery_instructions: newAddr.deliveryInstructions,
          latitude: newAddr.latitude,
          longitude: newAddr.longitude,
          is_default: newAddr.isDefault || false,
        }])
        .then(({ error }) => {
          if (error) console.error('Failed to insert saved address into Supabase:', error);
        });
    }

    return created;
  };

  const createBookingFromDraft = (paymentStatus: Booking['paymentStatus'] = 'paid'): Booking => {
    const sadya = SADYA_MENU_ITEMS.find((item) => item.id === draft.selectedSadyaId) || SADYA_MENU_ITEMS[0];

    const extrasList: ExtraItem[] = [];
    let extrasTotal = 0;
    Object.entries(draft.extras).forEach(([id, qty]) => {
      if (qty > 0) {
        const item = EXTRAS_MENU.find((e) => e.id === id);
        if (item) {
          extrasList.push({ id, name: item.name, price: item.price, quantity: qty });
          extrasTotal += item.price * qty;
        }
      }
    });

    const adultPrice = sadya.price;
    const childPrice = Math.round(sadya.price * 0.6);
    const baseTotal = adultPrice * draft.adultsCount + childPrice * draft.childrenCount;
    const subtotal = Math.round(baseTotal + extrasTotal);

    let discount = 0;
    let couponApplied: Coupon | undefined = undefined;
    if (draft.couponCode) {
      const foundCoupon = VALID_COUPONS.find((c) => c.code.toUpperCase() === draft.couponCode.trim().toUpperCase());
      const notExpired = foundCoupon && new Date(foundCoupon.expiryDate).getTime() >= Date.now();
      if (foundCoupon && notExpired && subtotal >= foundCoupon.minOrderValue) {
        couponApplied = foundCoupon;
        discount =
          foundCoupon.discountType === 'percentage'
            ? Math.round((subtotal * foundCoupon.discountValue) / 100)
            : foundCoupon.discountValue;
      }
    }

    const deliveryCharge = draft.fulfillment === 'delivery' ? 50 : 0;
    const totalAmount = Math.max(0, subtotal - discount + deliveryCharge);
    const bookingNum = generateBookingNumber();

    // Generate a 4-digit Delivery OTP (e.g. 4821)
    const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      bookingNumber: bookingNum,
      userId: draft.isGuest ? null : (draft.userId || authUser?.id || null),
      isGuest: draft.isGuest,
      guestName: draft.isGuest ? draft.customerName : undefined,
      guestPhone: draft.isGuest ? draft.customerPhone : undefined,
      guestEmail: draft.isGuest ? draft.customerEmail : undefined,
      createdAt: new Date().toISOString(),
      date: draft.date,
      timeSlot: draft.timeSlot,
      fulfillment: draft.fulfillment,
      sadyaItem: sadya,
      quantity: {
        adults: draft.adultsCount,
        children: draft.childrenCount,
      },
      extras: extrasList,
      customer: {
        name: draft.customerName,
        phone: draft.customerPhone,
        email: draft.customerEmail,
        address: draft.customerAddress,
        landmark: draft.customerLandmark,
        pincode: draft.customerPincode,
        deliveryInstructions: draft.deliveryInstructions,
        latitude: draft.latitude,
        longitude: draft.longitude,
        locationAccuracy: draft.locationAccuracy,
      },
      latitude: draft.latitude,
      longitude: draft.longitude,
      locationAccuracy: draft.locationAccuracy,
      deliveryAddress: draft.customerAddress,
      landmark: draft.customerLandmark,
      deliveryInstructions: draft.deliveryInstructions,
      deliveryOtp,
      couponApplied,
      subtotal,
      discount,
      deliveryCharge,
      totalAmount,
      paymentMethod: draft.paymentMethod,
      paymentStatus: paymentStatus,
      orderStatus: paymentStatus === 'paid' ? 'Confirmed' : 'Booked',
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${bookingNum}`,
      tokenNumber:
        draft.fulfillment === 'pickup'
          ? `PK-${Math.floor(10 + Math.random() * 90)}`
          : draft.fulfillment === 'dinein'
          ? `DI-${Math.floor(10 + Math.random() * 90)}`
          : undefined,
      estimatedWaitMinutes: draft.fulfillment === 'pickup' || draft.fulfillment === 'dinein' ? 12 : undefined,
    };

    const updatedBookings = [newBooking, ...bookings];
    setBookings(updatedBookings);
    try {
      localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(updatedBookings));
    } catch (e) {
      console.error('Failed to update stored bookings', e);
    }

    // Sync to Supabase DB if enabled
    if (isSupabaseConfigured && supabase) {
      supabase
        .from('bookings')
        .insert([{
          id: newBooking.id,
          booking_number: newBooking.bookingNumber,
          user_id: newBooking.userId,
          is_guest: newBooking.isGuest,
          guest_name: newBooking.guestName,
          guest_phone: newBooking.guestPhone,
          guest_email: newBooking.guestEmail,
          fulfillment: newBooking.fulfillment,
          booking_date: newBooking.date,
          time_slot: newBooking.timeSlot,
          sadya_item_id: sadya.id,
          adults_count: draft.adultsCount,
          children_count: draft.childrenCount,
          extras_json: extrasList,
          latitude: draft.latitude,
          longitude: draft.longitude,
          location_accuracy: draft.locationAccuracy,
          delivery_address: draft.customerAddress,
          landmark: draft.customerLandmark,
          pincode: draft.customerPincode,
          delivery_instructions: draft.deliveryInstructions,
          delivery_otp: deliveryOtp,
          subtotal: subtotal,
          discount: discount,
          delivery_charge: deliveryCharge,
          total_amount: totalAmount,
          coupon_code: draft.couponCode || null,
          payment_method: draft.paymentMethod,
          payment_status: paymentStatus,
          order_status: paymentStatus === 'paid' ? 'Confirmed' : 'Booked',
          qr_code_url: newBooking.qrCodeUrl,
          token_number: newBooking.tokenNumber,
        }])
        .then(({ error }) => {
          if (error) console.error('Failed to persist booking to Supabase:', error);
        });
    }

    // Trigger SMTP transactional email alerts for both Customer & Admin
    fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking: newBooking, type: 'new_booking' })
    }).catch((err) => console.error('Failed to trigger email notification API:', err));

    return newBooking;
  };

  const linkGuestBookingToUser = async (bookingId: string, user: AuthUser) => {
    const updated = bookings.map((b) =>
      b.id === bookingId ? { ...b, userId: user.id || 'user-demo-1', isGuest: false } : b
    );
    setBookings(updated);
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(updated));

    if (isSupabaseConfigured && supabase && user.id) {
      await supabase
        .from('bookings')
        .update({ user_id: user.id, is_guest: false, updated_at: new Date().toISOString() })
        .eq('id', bookingId);
    }
  };

  const updateOrderStatus = (bookingId: string, status: Booking['orderStatus']) => {
    const updated = bookings.map((b) => (b.id === bookingId ? { ...b, orderStatus: status } : b));
    setBookings(updated);
    try {
      localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to update status', e);
    }

    // Trigger SMTP transactional email status updates for Customer
    const targetBooking = updated.find((b) => b.id === bookingId);
    if (targetBooking) {
      fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking: targetBooking, type: 'status_update' })
      }).catch((err) => console.error('Failed to trigger email notification API:', err));
    }

    if (isSupabaseConfigured && supabase) {
      supabase
        .from('bookings')
        .update({ order_status: status, updated_at: new Date().toISOString() })
        .eq('id', bookingId)
        .then(({ error }) => {
          if (error) console.error('Failed to update status in Supabase', error);
        });
    }
  };

  const updateBooking = (bookingId: string, fields: Partial<Booking>) => {
    const updated = bookings.map((b) => (b.id === bookingId ? { ...b, ...fields } : b));
    setBookings(updated);
    try {
      localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to update booking', e);
    }

    // Trigger SMTP transactional email status updates if status changed via edit details form
    if (fields.orderStatus !== undefined) {
      const targetBooking = updated.find((b) => b.id === bookingId);
      if (targetBooking) {
        fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ booking: targetBooking, type: 'status_update' })
        }).catch((err) => console.error('Failed to trigger email notification API:', err));
      }
    }

    if (isSupabaseConfigured && supabase) {
      const dbUpdate: any = {};
      if (fields.orderStatus !== undefined) dbUpdate.order_status = fields.orderStatus;
      if (fields.paymentStatus !== undefined) dbUpdate.payment_status = fields.paymentStatus;
      if (fields.paymentMethod !== undefined) dbUpdate.payment_method = fields.paymentMethod;
      if (fields.deliveryOtp !== undefined) dbUpdate.delivery_otp = fields.deliveryOtp;
      
      // Portions / Quantity
      if (fields.quantity?.adults !== undefined) dbUpdate.adults_count = fields.quantity.adults;
      if (fields.quantity?.children !== undefined) dbUpdate.children_count = fields.quantity.children;
      
      // Scheduling details
      if (fields.date !== undefined) dbUpdate.booking_date = fields.date;
      if (fields.timeSlot !== undefined) dbUpdate.time_slot = fields.timeSlot;
      
      // Delivery coordinates & info
      if (fields.latitude !== undefined) dbUpdate.latitude = fields.latitude;
      if (fields.longitude !== undefined) dbUpdate.longitude = fields.longitude;
      if (fields.locationAccuracy !== undefined) dbUpdate.location_accuracy = fields.locationAccuracy;
      if (fields.deliveryAddress !== undefined) dbUpdate.delivery_address = fields.deliveryAddress;
      if (fields.landmark !== undefined) dbUpdate.landmark = fields.landmark;
      if (fields.deliveryInstructions !== undefined) dbUpdate.delivery_instructions = fields.deliveryInstructions;
      
      // Financials
      if (fields.subtotal !== undefined) dbUpdate.subtotal = fields.subtotal;
      if (fields.discount !== undefined) dbUpdate.discount = fields.discount;
      if (fields.deliveryCharge !== undefined) dbUpdate.delivery_charge = fields.deliveryCharge;
      if (fields.totalAmount !== undefined) dbUpdate.total_amount = fields.totalAmount;
      
      // Customer Details (for guest or profile fallbacks)
      if (fields.customer?.name !== undefined) dbUpdate.guest_name = fields.customer.name;
      if (fields.customer?.phone !== undefined) dbUpdate.guest_phone = fields.customer.phone;
      if (fields.customer?.email !== undefined) dbUpdate.guest_email = fields.customer.email;
      
      // Extras
      if (fields.extras !== undefined) dbUpdate.extras_json = fields.extras;

      dbUpdate.updated_at = new Date().toISOString();

      supabase
        .from('bookings')
        .update(dbUpdate)
        .eq('id', bookingId)
        .then(({ error }) => {
          if (error) console.error('Failed to update booking in Supabase:', error);
        });
    }
  };

  const deleteBooking = (bookingId: string) => {
    const updated = bookings.filter((b) => b.id !== bookingId);
    setBookings(updated);
    try {
      localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to delete booking', e);
    }

    if (isSupabaseConfigured && supabase) {
      supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId)
        .then(({ error }) => {
          if (error) console.error('Failed to delete booking in Supabase', error);
        });
    }
  };

  return {
    bookings,
    draft,
    savedAddresses,
    authUser,
    isLoaded,
    updateDraft,
    selectSavedAddress,
    addSavedAddress,
    createBookingFromDraft,
    linkGuestBookingToUser,
    updateOrderStatus,
    updateBooking,
    deleteBooking,
  };
}
