'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ShoppingBag, Check, Truck, Sparkles, Package, MapPin, Clock } from 'lucide-react';
import { Database } from '@/types/supabase';
import Link from 'next/link';

type Order = Database['public']['Tables']['orders']['Row'];

interface Props {
  activeOrder?: Order;
  isLoading: boolean;
}

const statusOrder = ['pending', 'confirmed', 'picked_up', 'in_wash', 'out_for_delivery', 'delivered'];

const statusMeta: Record<string, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  pending:          { icon: Clock,    label: 'Order Placed',      color: 'text-blue-600',   bg: 'bg-blue-50' },
  confirmed:        { icon: Check,    label: 'Confirmed',         color: 'text-yellow-600', bg: 'bg-yellow-50' },
  picked_up:        { icon: Package,  label: 'Out for Pickup',    color: 'text-green-600',  bg: 'bg-green-50' },
  in_wash:          { icon: Sparkles, label: 'Processing',        color: 'text-purple-600', bg: 'bg-purple-50' },
  out_for_delivery: { icon: Truck,    label: 'Out for Delivery',  color: 'text-orange-600', bg: 'bg-orange-50' },
  delivered:        { icon: Check,    label: 'Delivered',          color: 'text-green-600',  bg: 'bg-green-50' },
};

export default function ActiveOrderTracker({ activeOrder, isLoading }: Props) {
  const [prevStatus, setPrevStatus] = useState<string | null>(null);
  const [animatingStep, setAnimatingStep] = useState<string | null>(null);
  const prevOrderIdRef = useRef<string | null>(null);

  // Detect status changes and trigger animation
  useEffect(() => {
    if (!activeOrder) return;

    if (prevOrderIdRef.current === activeOrder.id && prevStatus && prevStatus !== activeOrder.status) {
      setAnimatingStep(activeOrder.status);
      const timer = setTimeout(() => setAnimatingStep(null), 600);
      return () => clearTimeout(timer);
    }

    prevOrderIdRef.current = activeOrder.id;
    setPrevStatus(activeOrder.status);
  }, [activeOrder?.id, activeOrder?.status, prevStatus]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-border p-4 md:p-6 animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="h-5 w-24 bg-muted rounded mb-2" />
            <div className="h-3 w-32 bg-muted rounded" />
          </div>
          <div className="h-6 w-24 bg-muted rounded-full" />
        </div>
        <div className="h-20 bg-muted rounded-xl mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-muted" />
              <div className="flex-1">
                <div className="h-4 w-1/3 bg-muted rounded mb-2" />
                <div className="h-3 w-1/4 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!activeOrder) {
    return (
      <div className="bg-white rounded-2xl border border-border p-8 md:p-12 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground">
          <ShoppingBag size={24} />
        </div>
        <h2 className="font-extrabold text-lg text-primary mb-2">No active orders</h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          You don't have any active orders right now. Let's get your laundry done!
        </p>
        <Link href="/schedule-pickup" className="bg-primary text-primary-foreground font-bold px-6 py-2.5 rounded-full hover:opacity-90 transition-opacity">
          Schedule Pickup
        </Link>
      </div>
    );
  }

  const currentIndex = statusOrder.indexOf(activeOrder.status);
  const progressPercent = Math.round(((currentIndex) / (statusOrder.length - 1)) * 100);

  const steps = [
    { id: 'pending',          label: 'Order Placed',     time: activeOrder.created_at ? new Date(activeOrder.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'N/A' },
    { id: 'picked_up',        label: 'Out for Pickup',   time: currentIndex >= 2 ? 'Completed' : 'Pending' },
    { id: 'in_wash',          label: 'Processing',       time: currentIndex >= 3 ? 'Completed' : 'Pending' },
    { id: 'out_for_delivery', label: 'Out for Delivery', time: currentIndex >= 4 ? 'Today' : 'Pending' },
    { id: 'delivered',        label: 'Delivered',         time: currentIndex >= 5 ? 'Done' : 'Pending' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-border p-4 md:p-6 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 md:mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-extrabold text-base text-primary">Live Order Tracker</h2>
            {/* Live indicator */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Order #{activeOrder.id.slice(0, 8).toUpperCase()}</p>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize transition-all duration-300 ${
          statusMeta[activeOrder.status]?.bg || 'bg-muted'
        } ${statusMeta[activeOrder.status]?.color || 'text-muted-foreground'}`}>
          {activeOrder.status.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Order meta */}
      <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-5 p-3 md:p-4 bg-muted/50 rounded-xl">
        <div>
          <p className="text-xs text-muted-foreground font-medium">Service</p>
          <p className="text-xs md:text-sm font-bold text-primary mt-0.5 capitalize">{activeOrder.service_type.replace(/_/g, ' ')}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">Weight</p>
          <p className="text-xs md:text-sm font-bold text-primary mt-0.5">{activeOrder.weight_kg ? `${activeOrder.weight_kg} kg` : 'TBD'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">Amount</p>
          <p className="text-xs md:text-sm font-bold text-primary mt-0.5">₹{activeOrder.total_amount || 0}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-muted-foreground">Progress</span>
          <span className="text-xs font-bold text-primary">{progressPercent}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary via-secondary to-green-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Status steps timeline */}
      <div className="relative">
        {steps.map((step, i) => {
          const stepIdx = statusOrder.indexOf(step.id);
          const done = currentIndex >= stepIdx;
          const active = currentIndex === stepIdx;
          const isAnimating = animatingStep === step.id;
          const meta = statusMeta[step.id] || statusMeta.pending;
          const StepIcon = meta.icon;

          return (
            <div key={step.id} className={`flex gap-3 md:gap-4 pb-4 last:pb-0 transition-all duration-300 ${isAnimating ? 'animate-fade-in' : ''}`}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                    active
                      ? `${meta.bg} ${meta.color} ring-4 ring-offset-1 ${meta.bg.replace('bg-', 'ring-')}/30 scale-110`
                      : done
                        ? 'bg-primary text-white'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {done && !active ? (
                    <Check size={14} />
                  ) : active ? (
                    <StepIcon size={14} />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-current opacity-40" />
                  )}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`w-px flex-1 mt-1 transition-all duration-500 ${done ? 'bg-primary/30' : 'bg-border'}`}
                    style={{ minHeight: '20px' }}
                  />
                )}
              </div>
              <div className="pb-1">
                <p className={`text-sm font-semibold transition-all duration-300 ${
                  active ? meta.color : done ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{step.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
