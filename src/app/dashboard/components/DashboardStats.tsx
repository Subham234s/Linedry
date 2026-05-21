'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ShoppingBag, TrendingUp, Crown, Wallet, Package, Zap } from 'lucide-react';
import { Database } from '@/types/supabase';
import { MetricSkeleton } from '@/components/ui/Skeleton';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Subscription = Database['public']['Tables']['subscriptions']['Row'];
type Order = Database['public']['Tables']['orders']['Row'];

// ─── Plan Limits (duplicated from SubscriptionProvider for self-contained usage)
const PLAN_LIMITS: Record<string, { maxKg: number }> = {
  'Essential':    { maxKg: 10 },
  'Premium Care': { maxKg: 20 },
  'Elite Family': { maxKg: 40 },
};

interface Props {
  profile: Profile | null;
  subscription: Subscription | null;
  activeOrders: Order[];
  allOrders: Order[];
  isLoading: boolean;
}

// ─── Animated Number Component ────────────────────────────────────────────────

function AnimatedValue({ value, prefix = '', suffix = '' }: { value: string | number; prefix?: string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [flash, setFlash] = useState(false);
  const prevRef = useRef(value);

  useEffect(() => {
    if (prevRef.current !== value) {
      setFlash(true);
      const timer = setTimeout(() => {
        setDisplayValue(value);
        setFlash(false);
      }, 150);
      prevRef.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <span className={`transition-all duration-300 ${flash ? 'scale-110 text-secondary' : 'scale-100'}`}>
      {prefix}{displayValue}{suffix}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardStats({ profile, subscription, activeOrders, allOrders, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        <MetricSkeleton />
        <MetricSkeleton />
        <MetricSkeleton />
        <MetricSkeleton />
      </div>
    );
  }

  const activeCount = activeOrders?.length || 0;
  const totalOrders = allOrders?.length || 0;
  const walletBalance = profile?.wallet_balance || 0;
  const outForDeliveryCount = activeOrders?.filter(o => o.status === 'out_for_delivery').length || 0;

  // Subscription capacity
  let planName = 'No Plan';
  let remainingKg = 0;
  let maxKg = 0;

  if (subscription?.status === 'active' && subscription.plan_name) {
    planName = subscription.plan_name;
    maxKg = PLAN_LIMITS[planName]?.maxKg || 0;
    // Calculate kg used this billing period from allOrders
    const periodStart = subscription.start_date ? new Date(subscription.start_date) : new Date();
    const usedKg = allOrders
      .filter(o => {
        if (!o.created_at) return false;
        return new Date(o.created_at) >= periodStart && o.total_amount === 0 && (o.weight_kg || 0) > 0;
      })
      .reduce((sum, o) => sum + (o.weight_kg || 0), 0);
    remainingKg = Math.max(0, maxKg - usedKg);
  }

  const stats = [
    {
      id: 'stat-active',
      icon: ShoppingBag,
      label: 'Active Orders',
      value: activeCount,
      displayValue: activeCount.toString(),
      sub: activeCount > 0 ? `${outForDeliveryCount} out for delivery` : 'No active orders',
      color: 'bg-blue-50 text-blue-600',
      ringColor: 'ring-blue-100',
    },
    {
      id: 'stat-wallet',
      icon: Wallet,
      label: 'Wallet Balance',
      value: walletBalance,
      displayValue: `₹${walletBalance.toLocaleString('en-IN')}`,
      sub: 'Available funds',
      color: 'bg-green-50 text-green-600',
      ringColor: 'ring-green-100',
    },
    {
      id: 'stat-total',
      icon: Package,
      label: 'Total Orders',
      value: totalOrders,
      displayValue: totalOrders.toString(),
      sub: 'Lifetime orders',
      color: 'bg-yellow-50 text-yellow-600',
      ringColor: 'ring-yellow-100',
    },
    {
      id: 'stat-plan',
      icon: subscription?.status === 'active' ? Zap : Crown,
      label: subscription?.status === 'active' ? 'Plan Capacity' : 'Current Plan',
      value: subscription?.status === 'active' ? remainingKg : 0,
      displayValue: subscription?.status === 'active' ? `${remainingKg}/${maxKg} kg` : planName,
      sub: subscription?.status === 'active' ? `${planName} — Active` : 'Upgrade to save',
      color: 'bg-purple-50 text-purple-600',
      ringColor: 'ring-purple-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
      {stats.map((s) => (
        <div
          key={s.id}
          className="bg-white rounded-2xl p-4 md:p-5 border border-border hover:shadow-md transition-all duration-300 group"
        >
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center ${s.color} group-hover:ring-4 ${s.ringColor} transition-all duration-300`}>
              <s.icon size={16} />
            </div>
            {/* Live pulse indicator */}
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
          </div>
          <p className="text-xl md:text-2xl font-extrabold text-primary font-tabular transition-all duration-300">
            <AnimatedValue value={s.displayValue} />
          </p>
          <p className="text-xs font-semibold text-foreground/70 mt-0.5">{s.label}</p>
          <p className="text-xs text-muted-foreground mt-1 hidden sm:block">{s.sub}</p>
        </div>
      ))}
    </div>
  );
}
