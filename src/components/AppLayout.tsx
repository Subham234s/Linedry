import React from 'react';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import BottomNav from './BottomNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader />
        <main className="flex-1 px-4 md:px-6 lg:px-8 xl:px-10 py-4 md:py-8 max-w-screen-2xl w-full mx-auto pb-24 md:pb-8">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
