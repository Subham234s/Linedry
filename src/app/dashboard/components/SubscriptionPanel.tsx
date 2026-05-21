import React from 'react';
import Link from 'next/link';
import { Crown, CheckCircle } from 'lucide-react';
import { Database } from '@/types/supabase';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];

interface Props {
  subscription: Subscription | null;
  isLoading: boolean;
}

export default function SubscriptionPanel({ subscription, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-border p-6 h-[260px] animate-pulse">
        <div className="h-4 w-32 bg-muted rounded mb-4"></div>
        <div className="h-8 w-24 bg-muted rounded mb-4"></div>
        <div className="h-4 w-40 bg-muted rounded mb-6"></div>
        <div className="space-y-3 mb-6">
          <div className="h-3 w-3/4 bg-muted rounded"></div>
          <div className="h-3 w-2/3 bg-muted rounded"></div>
        </div>
        <div className="h-10 w-full bg-muted rounded-xl"></div>
      </div>
    );
  }

  // Base Pay-As-You-Go if no subscription
  if (!subscription || subscription.status !== 'active') {
    return (
      <div className="bg-white rounded-2xl border border-border p-6 h-full flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Crown size={16} className="text-secondary" />
            <h2 className="font-extrabold text-sm text-primary">Your Subscription</h2>
          </div>
          <p className="text-xs font-bold text-muted-foreground mb-4">Pay-As-You-Go Plan</p>
          <div className="space-y-2 mb-5">
            <div className="flex items-center gap-2 text-xs text-foreground/70">
              <CheckCircle size={13} className="text-muted-foreground flex-shrink-0" />
              Standard Pricing per Kg
            </div>
            <div className="flex items-center gap-2 text-xs text-foreground/70">
              <CheckCircle size={13} className="text-muted-foreground flex-shrink-0" />
              Delivery fee applies
            </div>
          </div>
        </div>
        <Link
          href="/my-subscriptions"
          className="block text-center text-xs font-bold bg-secondary text-secondary-foreground hover:bg-secondary/90 py-2.5 rounded-xl transition-colors"
        >
          Upgrade to Save →
        </Link>
      </div>
    );
  }

  // Active Subscription Plan mapping
  const PLAN_FEATURES: Record<string, string[]> = {
    'Essential': ['Upto 10 Kg Wash & Fold', '2 Free Pickups/month', 'Standard Delivery (48 Hrs)'],
    'Premium Care': ['Upto 20 Kg Wash & Iron', '4 Free Pickups/month', 'Next-Day Express Delivery'],
    'Elite Family': ['Upto 40 Kg Wash & Iron', 'Unlimited Pickups & Drops', 'Same-Day Priority Delivery'],
  };

  const planName = subscription.plan_name || 'Premium Plan';
  const price = subscription.amount ? subscription.amount.toLocaleString('en-IN') : '0';
  const features: string[] = PLAN_FEATURES[planName] || ['Active subscription'];

  return (
    <div className="bg-white rounded-2xl border border-border p-6 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Crown size={16} className="text-secondary" />
          <h2 className="font-extrabold text-sm text-primary">Your Subscription</h2>
        </div>
        <div className="flex items-end gap-1 mb-1">
          <span className="text-3xl font-extrabold text-primary font-tabular">₹{price}</span>
          <span className="text-muted-foreground text-sm mb-1">/month</span>
        </div>
        <p className="text-xs font-bold text-secondary mb-4">{planName}</p>
        <div className="space-y-2 mb-5">
          {features?.map((f) => (
            <div key={`sub-feat-${f}`} className="flex items-center gap-2 text-xs text-foreground/70">
              <CheckCircle size={13} className="text-green-500 flex-shrink-0" />
              {f}
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="p-3 bg-muted rounded-xl mb-4">
           <div className="flex justify-between text-xs mb-1.5">
             <span className="text-muted-foreground">Status</span>
             <span className="font-bold text-green-600 capitalize">{subscription.status}</span>
           </div>
        </div>
        <Link
          href="/my-subscriptions"
          className="block text-center text-xs font-bold text-primary border border-primary/20 hover:bg-primary/5 py-2.5 rounded-xl transition-colors"
        >
          Manage Subscription →
        </Link>
      </div>
    </div>
  );
}
