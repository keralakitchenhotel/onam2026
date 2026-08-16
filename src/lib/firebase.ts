import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const isSupported = typeof window !== 'undefined' && !!firebaseConfig.apiKey;

const app = isSupported ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()) : null;

export const getFirebaseMessaging = async (): Promise<Messaging | null> => {
  if (!isSupported || !app) return null;
  try {
    const { isSupported: isMessagingSupported } = await import('firebase/messaging');
    const supported = await isMessagingSupported();
    if (!supported) return null;
    return getMessaging(app);
  } catch (err) {
    console.error('FCM is not supported or failed to load:', err);
    return null;
  }
};

export const getFcmToken = async (): Promise<string | null> => {
  const messaging = await getFirebaseMessaging();
  if (!messaging) return null;
  try {
    const currentToken = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });
    return currentToken || null;
  } catch (err) {
    console.error('Error fetching FCM token:', err);
    return null;
  }
};
