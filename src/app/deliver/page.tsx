'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import DeliveryPortal from '@/components/delivery/DeliveryPortal';
import { Loader2 } from 'lucide-react';

export default function DeliverPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // If unauthenticated or wrong role → redirect to /admin for login
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'driver')) {
      router.replace('/admin');
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-coconut-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Checking credentials...</p>
      </div>
    );
  }

  // Guard: only driver can see this page
  if (!isAuthenticated || user?.role !== 'driver') {
    return (
      <div className="min-h-screen bg-coconut-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="pt-6 pb-20 bg-coconut-50 min-h-screen">
      <DeliveryPortal />
    </div>
  );
}
