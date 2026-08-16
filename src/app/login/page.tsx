'use client';

import AuthLoginForm from '@/components/auth/AuthLoginForm';
import { PookalamMandala } from '@/components/landing/KeralaDecorations';

export default function LoginPage() {
  return (
    <div className="pt-28 pb-20 min-h-screen relative overflow-hidden">
      {/* Background Pookalam */}
      <div className="absolute bottom-10 right-10 opacity-[0.03] pointer-events-none animate-pookalam">
        <PookalamMandala size={280} />
      </div>
      <div className="absolute top-20 left-10 opacity-[0.025] pointer-events-none animate-pookalam">
        <PookalamMandala size={200} />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <AuthLoginForm mode="customer" />
      </div>
    </div>
  );
}