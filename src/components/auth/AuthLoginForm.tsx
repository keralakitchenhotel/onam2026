'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { DEMO_ACCOUNTS, ROLE_HOME_PATHS, ROLE_LABELS } from '@/lib/auth';
import { UserRole } from '@/types';
import { Eye, EyeOff, AlertCircle, LogIn, Sparkles, ChefHat, Truck, Shield } from 'lucide-react';
import { NilavilakkuLamp } from '@/components/landing/KeralaDecorations';
import { signInWithGoogle, isSupabaseConfigured } from '@/lib/supabase/client';

// Two modes: 'customer' login at /login, 'admin' unified login at /admin
type LoginMode = 'customer' | 'admin';

interface AuthLoginFormProps {
  mode: LoginMode;
}

export default function AuthLoginForm({ mode }: AuthLoginFormProps) {
  const { user, isAuthenticated, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // On mount: if already authenticated, redirect based on role
  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(ROLE_HOME_PATHS[user.role]);
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const loginEmail = mode === 'admin'
      ? (username.includes('@') ? username : `${username}@keralakitchen.com`)
      : email;

    const result = await login(loginEmail, password);
    if (!result.ok) {
      setError(result.error || 'Login failed');
      setIsSubmitting(false);
      return;
    }

    // On success, the login function sets the user in context.
    // The useEffect above will handle redirect based on role.
    // But also explicitly redirect for immediate navigation:
    if (result.role) {
      const targetPath = ROLE_HOME_PATHS[result.role];
      router.replace(targetPath);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isSupabaseConfigured) {
      setError('Google Sign In requires Supabase configuration.');
      return;
    }
    setGoogleLoading(true);
    try {
      await signInWithGoogle('/dashboard');
    } catch (err) {
      console.error('Google Sign In failed:', err);
      setError('Google Sign In failed. Please try again.');
      setGoogleLoading(false);
    }
  };

  // ─── Theme & Config ───
  const isCustomerMode = mode === 'customer';

  const theme = isCustomerMode
    ? {
        accent: 'from-amber-500 to-amber-600',
        btn: 'from-amber-500 via-gold to-amber-600 text-slate-900 font-extrabold',
        ring: 'focus:ring-amber-500/20',
        border: 'focus:border-amber-500',
        label: 'Customer Login',
        desc: 'Access your pre-bookings, track live delivery status, and save your addresses.',
        submitLabel: 'Sign In as Customer',
      }
    : {
        accent: 'from-maroon to-maroon-light',
        btn: 'from-maroon to-maroon-light text-white',
        ring: 'focus:ring-maroon/20',
        border: 'focus:border-maroon',
        label: 'Staff & Admin Login',
        desc: 'Restricted access portal for Admin, Kitchen Staff, and Delivery personnel.',
        submitLabel: 'Sign In',
      };

  // Role icons for the admin mode hints
  const roleIcons: Record<string, React.ReactNode> = {
    admin: <Shield className="w-3.5 h-3.5 text-maroon" />,
    staff: <ChefHat className="w-3.5 h-3.5 text-leaf" />,
    driver: <Truck className="w-3.5 h-3.5 text-orange-600" />,
  };

  // Available demo accounts for the current mode
  const hintCredentials = isCustomerMode
    ? DEMO_ACCOUNTS.filter((c) => c.role === 'customer')
    : DEMO_ACCOUNTS.filter((c) => c.role !== 'customer');

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="glass-card rounded-4xl p-8 sm:p-10 relative overflow-hidden bg-white/80 backdrop-blur-xl border border-gold/20 shadow-xl">
        {/* Top border decoration */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-gold to-transparent`} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-leaf to-leaf-dark flex items-center justify-center shadow-glow-green p-3">
            <NilavilakkuLamp className="w-full h-full text-white animate-pulse" />
          </div>
          <h1 className="font-serif text-2xl font-extrabold text-leaf-dark mt-4">
            Kerala<span className="text-gold italic">Kitchen</span>
          </h1>
          <h2 className="text-sm font-bold text-slate-800 mt-1">{theme.label}</h2>
          <p className="text-xs text-slate-500 font-medium mt-2 max-w-xs mx-auto leading-relaxed">
            {theme.desc}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 flex items-start gap-2.5 bg-maroon-soft border border-maroon/30 text-maroon-dark rounded-2xl p-3.5 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 mt-px" />
            <span>{error}</span>
          </div>
        )}

        {/* ═══ CUSTOMER MODE: Google Login + Credential Form ═══ */}
        {isCustomerMode ? (
          <div className="space-y-5">
            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-800 font-semibold py-3.5 px-5 rounded-2xl border border-slate-300 shadow-sm hover:shadow transition-all group disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.39 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.61 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">or use credentials</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Customer Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="auth-username" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Email
                </label>
                <input
                  id="auth-username"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  autoComplete="email"
                  required
                  className={`w-full pl-4 pr-4 py-3 rounded-2xl border border-slate-300 text-sm font-medium outline-none transition-all bg-white text-slate-900 ${theme.border} ${theme.ring}`}
                />
              </div>

              <div>
                <label htmlFor="auth-password" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    required
                    className={`w-full pl-4 pr-12 py-3 rounded-2xl border border-slate-300 text-sm font-medium outline-none transition-all bg-white text-slate-900 ${theme.border} ${theme.ring}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-leaf transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3.5 rounded-2xl font-extrabold text-sm bg-gradient-to-r ${theme.btn} shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                <LogIn className="w-4 h-4" />
                {isSubmitting ? 'Signing in...' : theme.submitLabel}
              </button>
            </form>
          </div>
        ) : (
          /* ═══ ADMIN/STAFF MODE: Credentials Only, Routes All Roles ═══ */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="auth-username" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Username
              </label>
              <input
                id="auth-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                required
                className={`w-full pl-4 pr-4 py-3 rounded-2xl border border-slate-300 text-sm font-medium outline-none transition-all bg-white text-slate-900 ${theme.border} ${theme.ring}`}
              />
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                  className={`w-full pl-4 pr-12 py-3 rounded-2xl border border-slate-300 text-sm font-medium outline-none transition-all bg-white text-slate-900 ${theme.border} ${theme.ring}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-leaf transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 rounded-2xl font-extrabold text-sm bg-gradient-to-r ${theme.btn} shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              <LogIn className="w-4 h-4" />
              {isSubmitting ? 'Signing in...' : theme.submitLabel}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}