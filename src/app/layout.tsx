import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import '../styles/tailwind.css';
import { Toaster } from 'react-hot-toast';
import AuthProvider from '@/components/AuthProvider';
import SubscriptionProvider from '@/components/SubscriptionProvider';
import UpgradeModal from '@/components/UpgradeModal';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Linedry — Effortless Laundry for Urban India',
  description: 'Linedry picks up, washes, folds, and delivers your laundry — serving students, professionals, and families across urban India.',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={plusJakartaSans.variable} suppressHydrationWarning>
      <body className={plusJakartaSans.className}>
        <AuthProvider>
          <SubscriptionProvider>
            {children}
            <UpgradeModal />
          </SubscriptionProvider>
        </AuthProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}


