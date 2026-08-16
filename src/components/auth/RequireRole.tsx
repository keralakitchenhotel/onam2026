'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { UserRole } from '@/types';
import { ROLE_HOME_PATHS } from '@/lib/auth';

interface RequireRoleProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

export default function RequireRole({ children, allowedRoles }: RequireRoleProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Redirection target depends on role
        router.replace('/login');
      } else if (user && !allowedRoles.includes(user.role)) {
        router.replace(ROLE_HOME_PATHS[user.role]);
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router]);

  if (isLoading || !isAuthenticated || (user && !allowedRoles.includes(user.role))) {
    return (
      <div className="min-h-screen bg-coconut-50 flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Checking authorization...</p>
      </div>
    );
  }

  return <>{children}</>;
}
