'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import StaffTerminal from '@/components/staff/StaffTerminal';
import { Loader2 } from 'lucide-react';

export default function KitchenPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // If unauthenticated or wrong role → redirect to /admin for login
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'staff')) {
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

  // Guard: only staff can see this page
  if (!isAuthenticated || user?.role !== 'staff') {
    return (
      <div className="min-h-screen bg-coconut-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 bg-coconut-50 min-h-screen">
      <StaffTerminal />
    </div>
  );
}
