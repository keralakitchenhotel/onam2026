'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AuthUser, UserRole } from '@/types';
import { ROLE_HOME_PATHS } from '@/lib/auth';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string; role?: UserRole }>;
  logout: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const VALID_ROLES: UserRole[] = ['admin', 'staff', 'driver', 'customer'];

function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && VALID_ROLES.includes(value as UserRole);
}

// Builds the app-level AuthUser from a Supabase session user,
// resolving the role from the profiles table with app_metadata as fallback.
export async function buildAuthUser(sbUser: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
}): Promise<AuthUser | null> {
  if (!supabase) return null;

  let role: UserRole = 'customer';
  let name = '';
  let avatarUrl = '';

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, avatar_url')
    .eq('id', sbUser.id)
    .maybeSingle();

  if (profile?.role && isUserRole(profile.role)) {
    role = profile.role;
  } else if (isUserRole(sbUser.app_metadata?.role)) {
    role = sbUser.app_metadata.role;
  }

  if (profile?.full_name) name = profile.full_name;
  if (!name && typeof sbUser.user_metadata?.name === 'string') name = sbUser.user_metadata.name;
  if (!name && typeof sbUser.user_metadata?.full_name === 'string') name = sbUser.user_metadata.full_name;
  if (typeof sbUser.user_metadata?.avatar_url === 'string') avatarUrl = sbUser.user_metadata.avatar_url;
  if (typeof sbUser.user_metadata?.picture === 'string' && !avatarUrl) avatarUrl = sbUser.user_metadata.picture;

  return {
    id: sbUser.id,
    username: sbUser.email?.split('@')[0] || 'user',
    name: name || sbUser.email?.split('@')[0] || 'Customer',
    email: sbUser.email,
    role,
    avatarUrl: avatarUrl || undefined,
    loggedInAt: new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        const authUser = await buildAuthUser(session.user);
        if (mounted) setUser(authUser);
      }
      if (mounted) setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          const authUser = await buildAuthUser(session.user);
          if (mounted) setUser(authUser);
        }
      } else if (event === 'SIGNED_OUT') {
        if (mounted) setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return { ok: false, error: 'Supabase is not configured. Add credentials to .env.local.' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error || !data.user) {
      return { ok: false, error: error?.message || 'Invalid email or password. Please try again.' };
    }

    const authUser = await buildAuthUser(data.user);
    if (authUser) setUser(authUser);
    return { ok: true, role: authUser?.role ?? 'customer' };
  };

  const logout = async () => {
    setUser(null);
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    router.push('/');
  };

  const hasRole = (role: UserRole) => user?.role === role;

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function getRoleHomePath(role: UserRole): string {
  return ROLE_HOME_PATHS[role];
}