'use client'

import React from 'react';
import AppLayout from '@/components/AppLayout';
import DashboardStats from './components/DashboardStats';
import ActiveOrderTracker from './components/ActiveOrderTracker';
import UpcomingPickupCard from './components/UpcomingPickupCard';
import SubscriptionPanel from './components/SubscriptionPanel';
import RecentActivity from './components/RecentActivity';
import dynamic from 'next/dynamic';
import { CardSkeleton } from '@/components/ui/Skeleton';

// 1. Dynamic Import for Heavy Recharts Component
// This prevents the large recharts library from blocking the initial page load.
const RealtimeCharts = dynamic(() => import('./components/RealtimeCharts'), {
  ssr: false, // Charts are often better rendered client-side to avoid hydration mismatches
  loading: () => <CardSkeleton /> // Map the loading state to our custom Skeleton
});
import { useRealtimeDashboard } from '@/hooks/useRealtimeDashboard';
import { checkPlanExpiry } from '@/utils/notifications';
import { Wifi } from 'lucide-react';

export default function DashboardPage() {
  const {
    profile,
    activeOrders,
    allOrders,
    subscription,
    walletTransactions,
    isLoading,
  } = useRealtimeDashboard();

  React.useEffect(() => {
    checkPlanExpiry();
  }, []);

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <AppLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Greeting + Live indicator */}
        <div className="flex items-start justify-between gap-3">
          <div>
            {isLoading ? (
              <div className="h-8 w-48 bg-muted animate-pulse rounded-lg mb-2" />
            ) : (
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl md:text-2xl font-extrabold text-primary">
                  {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'Guest'} 👋
                </h1>
                {/* Realtime status badge */}
                <span className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                  <Wifi size={11} />
                  Live
                </span>
              </div>
            )}
            <p className="text-muted-foreground text-xs md:text-sm mt-1">
              Here's what's happening with your laundry today.
            </p>
          </div>
          <a
            href="/schedule-pickup"
            className="hidden md:inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-5 py-2.5 rounded-full text-sm font-bold hover:opacity-90 active:scale-95 transition-all duration-150 flex-shrink-0"
          >
            Schedule Pickup
          </a>
        </div>

        {/* Real-time Stats */}
        <DashboardStats
          profile={profile}
          subscription={subscription}
          activeOrders={activeOrders}
          allOrders={allOrders}
          isLoading={isLoading}
        />

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
          <div className="xl:col-span-2 space-y-4 md:space-y-6">
            <ActiveOrderTracker activeOrder={activeOrders?.[0]} isLoading={isLoading} />
            <RealtimeCharts
              walletTransactions={walletTransactions}
              allOrders={allOrders}
              isLoading={isLoading}
            />
          </div>
          <div className="space-y-4 md:space-y-6">
            <UpcomingPickupCard
              upcomingOrder={activeOrders?.find(o => o.status === 'pending' || o.status === 'confirmed')}
              isLoading={isLoading}
            />
            <SubscriptionPanel subscription={subscription} isLoading={isLoading} />
          </div>
        </div>

        <RecentActivity activeOrders={activeOrders} isLoading={isLoading} />
      </div>
    </AppLayout>
  );
}
