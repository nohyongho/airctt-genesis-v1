
'use client';

import { ReactNode } from 'react';
import MerchantBottomNav from '@/components/merchant/MerchantBottomNav';

interface MerchantLayoutProps {
  children: ReactNode;
}

export default function MerchantLayout({ children }: MerchantLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-950 flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 sm:w-60 md:w-80 h-40 sm:h-60 md:h-80 bg-pink-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-20 sm:-left-40 w-40 sm:w-60 md:w-80 h-40 sm:h-60 md:h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-20 sm:-bottom-40 right-1/3 w-40 sm:w-60 md:w-80 h-40 sm:h-60 md:h-80 bg-violet-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      <main className="flex-1 pb-16 sm:pb-20 relative z-10 safe-area-top">
        {children}
      </main>
      <MerchantBottomNav />
    </div>
  );
}
