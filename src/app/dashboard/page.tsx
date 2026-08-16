'use client';

import { useAuth } from '@/context/AuthContext';
import CustomerDashboard from '@/components/customer/CustomerDashboard';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'customer')) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || !isAuthenticated || user?.role !== 'customer') {
    return (
      <div className="min-h-screen bg-coconut-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Checking session...</p>
      </div>
    );
  }

  return (
    <div className="pt-6 pb-20 bg-coconut-50 min-h-screen">
      <CustomerDashboard />
    </div>
  );
}
