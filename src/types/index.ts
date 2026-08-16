export type UserRole = 'admin' | 'staff' | 'customer' | 'driver';

export interface AuthUser {
  id?: string;
  username: string;
  name: string;
  email?: string;
  role: UserRole;
  avatarUrl?: string;
  loggedInAt: string;
}

export interface UserProfile {
  id: string;
  authUserId?: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface SavedAddress {
  id: string;
  userId: string;
  label: 'Home' | 'Work' | 'Other';
  address: string;
  landmark?: string;
  pincode?: string;
  deliveryInstructions?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
  createdAt?: string;
}

export type FulfillmentType = 'pickup' | 'delivery';

export type OrderStatus = 
  | 'Booked' 
  | 'Confirmed' 
  | 'Preparing' 
  | 'Ready' 
  | 'Out for Delivery' 
  | 'Delivered' 
  | 'Cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'wallet' | 'cash';

export interface MenuItem {
  id: string;
  name: string;
  malayalamName?: string;
  category: 'Sadya Packages' | 'Payasam' | 'Savories & Chips' | 'Extras & Curries' | 'Corporate Bulk';
  price: number;
  description: string;
  itemsIncluded?: string[];
  itemCount?: number;
  imageUrl: string;
  isVeg: boolean;
  isAvailable: boolean;
  isPopular?: boolean;
  servingPax?: string;
}

export interface ExtraItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface LocationData {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  address?: string;
  landmark?: string;
  deliveryInstructions?: string;
  isDetected: boolean;
}

export interface BookingCustomerDetails {
  name: string;
  phone: string;
  email: string;
  address?: string;
  landmark?: string;
  pincode?: string;
  notes?: string;
  deliveryInstructions?: string;
  latitude?: number | null;
  longitude?: number | null;
  locationAccuracy?: number | null;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minOrderValue: number;
  expiryDate: string;
  description: string;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  userId?: string | null;
  isGuest: boolean;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  createdAt: string;
  date: string;
  timeSlot: string;
  fulfillment: FulfillmentType;
  sadyaItem: MenuItem;
  quantity: {
    adults: number;
    children: number;
  };
  extras: ExtraItem[];
  customer: BookingCustomerDetails;
  
  // Delivery location & instructions
  latitude?: number | null;
  longitude?: number | null;
  locationAccuracy?: number | null;
  deliveryAddress?: string;
  landmark?: string;
  deliveryInstructions?: string;
  deliveryOtp?: string;

  couponApplied?: Coupon;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  qrCodeUrl?: string;
  tokenNumber?: string;
  estimatedWaitMinutes?: number;
}

export interface DeliverySlot {
  time: string;
  maxOrders: number;
  bookedCount: number;
  isAvailable: boolean;
}

export interface CustomerReview {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  location: string;
  avatarUrl?: string;
  verifiedBooking?: boolean;
}
