import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'Kerala Kitchen | Authentic Kerala Onam Sadya Pre-Booking 2026',
  description: 'Pre-book authentic 26-item Kerala Onam Sadya online. Fresh organic delicacies served traditionally on banana leaf with Palada Payasam. Pickup & Home Delivery available.',
  keywords: ['Onam Sadya', 'Kerala Sadya Pre Booking', 'Onam Sadya Delivery Kochi', 'Authentic Sadya', 'Palada Payasam', 'Onam 2026 Feast'],
  openGraph: {
    title: 'Kerala Kitchen | Authentic Onam Sadya Pre-Booking 2026',
    description: 'Pre-book your 26-item traditional Kerala Onam Sadya online today. Hotel counter pickup & home delivery.',
    images: ['https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&q=80&w=1200'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#FFFDF8" />
      </head>
      <body className="min-h-screen bg-coconut-50 text-slate-800 flex flex-col antialiased" suppressHydrationWarning>
        <AuthProvider>
          <Navbar />
          <main className="flex-1 pb-nav-safe md:pb-0">{children}</main>
          <Footer />
          <MobileBottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
