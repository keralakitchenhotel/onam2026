import { MenuItem, DeliverySlot, Coupon, CustomerReview, Booking } from '@/types';

export const POSTER_23_DELICACIES = [
  { id: 1, mlName: 'സാമ്പാർ', enName: 'Sambar' },
  { id: 2, mlName: 'അവിയൽ', enName: 'Avial' },
  { id: 3, mlName: 'പൈനാപ്പിൾ പച്ചടി', enName: 'Pineapple Pachadi' },
  { id: 4, mlName: 'കിച്ചടി', enName: 'Kichadi' },
  { id: 5, mlName: 'ബീറ്റ്‌റൂട്ട് പച്ചടി', enName: 'Beetroot Pachadi' },
  { id: 6, mlName: 'പരിപ്പ് കറി', enName: 'Parippu Curry' },
  { id: 7, mlName: 'മോര് കറി', enName: 'Moru Curry' },
  { id: 8, mlName: 'പുളിഞ്ചി', enName: 'Pulissery' },
  { id: 9, mlName: 'കായ വറുത്തത്', enName: 'Kaya Varuthathu' },
  { id: 10, mlName: 'ശർക്കര വരട്ടി', enName: 'Sharkara Varatti' },
  { id: 11, mlName: 'ഉപ്പ്', enName: 'Salt' },
  { id: 12, mlName: 'ഇല', enName: 'Banana Leaf' },
  { id: 13, mlName: 'പായസം അട', enName: 'Payasam Ada' },
  { id: 14, mlName: 'തോരൻ', enName: 'Thoran' },
  { id: 15, mlName: 'ഓലൻ', enName: 'Olan' },
  { id: 16, mlName: 'കാളൻ', enName: 'Kalan' },
  { id: 17, mlName: 'പപ്പടം', enName: 'Pappadam' },
  { id: 18, mlName: 'മാങ്ങാ അച്ചാർ', enName: 'Mango Pickle' },
  { id: 19, mlName: 'പഴം', enName: 'Banana' },
  { id: 20, mlName: 'രസം', enName: 'Rasam' },
  { id: 21, mlName: 'ചോറ്', enName: 'Rice' },
  { id: 22, mlName: 'പച്ചടി', enName: 'Pachadi' },
  { id: 23, mlName: 'കൂട്ടു കറി', enName: 'Koottu Curry' },
];

export const SADYA_MENU_ITEMS: MenuItem[] = [
  {
    id: 'sadya-regular',
    name: 'Grand Onam Sadya (Dine-in)',
    malayalamName: 'ഓണ സദ്യ (ഡൈനിംഗ്)',
    category: 'Sadya Packages',
    price: 220,
    servingPax: '1 Person',
    isVeg: true,
    isAvailable: true,
    isPopular: true,
    imageUrl: '/onam-sadya-dine-in.jpg',
    description: 'Authentic 23-item Kerala Onam Sadya served fresh on cut banana leaf at Kerala Kitchen, Valiyaparambu.',
    itemsIncluded: POSTER_23_DELICACIES.map(item => `${item.id}. ${item.mlName} (${item.enName})`),
    itemCount: 23,
  },
  {
    id: 'sadya-family-5',
    name: 'Family Sadya Pack (5 Pax)',
    malayalamName: 'ഫാമിലി പാക്ക് (5 പേർക്ക്)',
    category: 'Sadya Packages',
    price: 1300,
    servingPax: '5 Persons',
    isVeg: true,
    isAvailable: true,
    isPopular: true,
    imageUrl: '/onam-sadya-family-pack.jpg',
    description: 'Complete Onam Sadya feast for 5 persons. Includes 5 fresh plantain leaves and packed 23 delicacies.',
    itemsIncluded: [
      'All 23 Poster Delicacies for 5 Persons', '5 Cut Plantain Leaves', 'Ada Payasam Portion', 'Banana Chips & Sharkara Varatti'
    ],
    itemCount: 23,
  }
];

export const EXTRAS_MENU: { id: string; name: string; price: number }[] = [];

export const RESTAURANT_DETAILS = {
  name: 'കേരള കിച്ചൺ വലിയപറമ്പ്',
  shortName: 'Kerala Kitchen',
  category: 'Restaurant',
  location: 'Valiyaparambu, Kerala',
  phone: '9447445078',
  phoneNumbers: ['9447 44 50 78', '9745 62 72 03'],
  formattedPhone: '9447 44 50 78 / 9745 62 72 03',
  priceRange: '₹220 – ₹1300',
  openingStatus: 'Open for Onam Pre-Booking',
  closingTime: 'Around 9:00 PM',
  serviceOptions: [
    { label: 'All-you-can-eat options', icon: '🍛' },
    { label: 'Outdoor seating', icon: '🌿' },
    { label: 'Dine-in experience', icon: '🍽️' },
  ],
  atmosphere: 'Calm, peaceful, and family-friendly dining environment',
};

export const AVAILABLE_SLOTS: DeliverySlot[] = [
  { time: '11:00 AM', maxOrders: 50, bookedCount: 0, isAvailable: true },
  { time: '12:00 PM', maxOrders: 60, bookedCount: 0, isAvailable: true },
  { time: '01:00 PM', maxOrders: 60, bookedCount: 0, isAvailable: true },
  { time: '02:00 PM', maxOrders: 40, bookedCount: 0, isAvailable: true },
  { time: '07:00 PM', maxOrders: 40, bookedCount: 0, isAvailable: true },
];

export const ONAM_FESTIVAL_DATES = [
  { date: '2026-08-25', label: 'First Onam (Uthradam)', day: 'Tue', isPopular: true, malayalamDate: 'ഓഗസ്റ്റ് 25' },
  { date: '2026-08-26', label: 'THIRUVONAM (Main Sadya)', day: 'Wed', isPopular: true, malayalamDate: 'ഓഗസ്റ്റ് 26' },
  { date: '2026-08-27', label: 'Third Onam (Avittom)', day: 'Thu', isPopular: true, malayalamDate: 'ഓഗസ്റ്റ് 27' },
];

export const VALID_COUPONS: Coupon[] = [
  {
    code: 'ONAM2026',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 150,
    expiryDate: '2026-08-29',
    description: 'Get 10% OFF on all Onam Sadya pre-bookings at Kerala Kitchen!'
  }
];

export const REVIEWS_DATA: CustomerReview[] = [];

export const SAMPLE_BOOKINGS: Booking[] = [];

