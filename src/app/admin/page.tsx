'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AuthLoginForm from '@/components/auth/AuthLoginForm';
import { ROLE_HOME_PATHS } from '@/lib/auth';
import { PookalamMandala } from '@/components/landing/KeralaDecorations';
import { Loader2 } from 'lucide-react';

export default function AdminPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // If authenticated but NOT admin, redirect to their proper portal
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === 'staff') {
        router.replace('/kitchen');
      } else if (user.role === 'driver') {
        router.replace('/deliver');
      } else if (user.role === 'customer') {
        router.replace('/dashboard');
      }
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

  // If authenticated as admin → show dashboard
  if (isAuthenticated && user?.role === 'admin') {
    return (
      <div className="pt-6 pb-20 bg-coconut-50 min-h-screen">
        <AdminDashboard />
      </div>
    );
  }

  // Not authenticated (or non-admin role being redirected) → show unified login
  return (
    <div className="pt-6 pb-20 min-h-screen relative overflow-hidden bg-coconut-50">
      <div className="absolute bottom-10 right-10 opacity-[0.03] pointer-events-none animate-pookalam">
        <PookalamMandala size={280} />
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <AuthLoginForm mode="admin" />
      </div>
    </div>
  );
}