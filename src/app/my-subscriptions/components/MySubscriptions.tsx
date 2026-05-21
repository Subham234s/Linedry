'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Crown,
  Zap,
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
  Loader2,
  X,
  ShieldCheck,
  Sparkles,
  PackageOpen,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import ConfirmModal from '@/components/ConfirmModal';

// ─── Plan catalog (maps plan_id → display data) ──────────────────────────────

interface PlanMeta {
  id: string;
  name: string;
  price: string;
  period: string;
  durationDays: number;
  features: string[];
  highlight?: boolean;
}

const PLANS: PlanMeta[] = [
  {
    id: 'essential',
    name: 'Essential',
    price: '₹499',
    period: '/month',
    durationDays: 30,
    features: ['Upto 10 Kg Wash & Fold', '2 Free Pickups & Drops per month', 'Standard Delivery (48 Hours)', 'Basic Support'],
  },
  {
    id: 'premium',
    name: 'Premium Care',
    price: '₹1,199',
    period: '/month',
    durationDays: 30,
    features: ['Upto 20 Kg Wash & Iron', '4 Free Pickups & Drops per month', 'Next-Day Express Delivery (24 Hours)', 'Premium Packaging & Covers', 'Live Order Tracking'],
    highlight: true,
  },
  {
    id: 'elite',
    name: 'Elite Family',
    price: '₹2,499',
    period: '/month',
    durationDays: 30,
    features: ['Upto 40 Kg Wash & Iron', '2 Premium Dry Cleaning items included', 'Unlimited Free Pickups & Drops', 'Same-Day Priority Delivery', '24/7 Priority Support'],
  },
];

// ─── Plan features lookup by plan_name (from Supabase) ────────────────────────

const PLAN_FEATURES: Record<string, string[]> = {
  'Essential': [
    'Upto 10 Kg Wash & Fold',
    '2 Free Pickups & Drops/month',
    'Standard Delivery (48 Hrs)',
    'Basic Support',
  ],
  'Premium Care': [
    'Upto 20 Kg Wash & Iron',
    '4 Free Pickups & Drops/month',
    'Next-Day Express Delivery',
    'Premium Packaging',
    'Live Order Tracking',
  ],
  'Elite Family': [
    'Upto 40 Kg Wash & Iron',
    '2 Premium Dry Cleaning items',
    'Unlimited Free Pickups & Drops',
    'Same-Day Priority Delivery',
    '24/7 Priority Support',
  ],
};

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function SubscriptionSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="h-7 w-52 bg-muted rounded-lg mb-2" />
        <div className="h-4 w-80 bg-muted rounded-lg" />
      </div>
      {/* Card skeleton */}
      <div className="rounded-3xl bg-muted/70 h-64 w-full" />
      {/* Features skeleton */}
      <div className="rounded-2xl bg-muted/50 h-32 w-full" />
    </div>
  );
}

// ─── Empty / No Plan State ────────────────────────────────────────────────────

function EmptyState({ reason }: { reason: 'none' | 'expired' | 'cancelled' }) {
  const messaging = {
    none: {
      title: 'No Active Subscription',
      desc: "You don't have an active plan yet. Explore our plans to enjoy premium laundry services with priority pickup and delivery.",
      cta: 'Explore Plans',
    },
    expired: {
      title: 'Subscription Expired',
      desc: 'Your previous plan has expired. Renew now to continue enjoying seamless laundry services without interruption.',
      cta: 'Renew Plan',
    },
    cancelled: {
      title: 'Subscription Cancelled',
      desc: 'Your plan was cancelled. You can resubscribe anytime to pick up right where you left off.',
      cta: 'Resubscribe',
    },
  };

  const m = messaging[reason];

  return (
    <div className="bg-card border border-border rounded-3xl p-8 sm:p-10 text-center">
      {/* Illustration circle */}
      <div className="relative mx-auto w-24 h-24 mb-6">
        <div className="absolute inset-0 rounded-full bg-secondary/10 animate-pulse" />
        <div className="absolute inset-2 rounded-full bg-secondary/5 flex items-center justify-center">
          <PackageOpen size={36} className="text-muted-foreground/50" strokeWidth={1.5} />
        </div>
      </div>

      <h3 className="text-xl font-extrabold text-foreground mb-2">{m.title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed">{m.desc}</p>

      <Link
        href="/pricing-page"
        className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-7 py-3 rounded-full text-sm font-bold hover:opacity-90 active:scale-[0.97] transition-all shadow-sm"
      >
        <Sparkles size={16} />
        {m.cta}
        <ArrowRight size={14} />
      </Link>

      {reason === 'expired' && (
        <div className="mt-5 inline-flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2">
          <AlertTriangle size={13} />
          Your benefits are no longer active
        </div>
      )}
    </div>
  );
}

// ─── Active Subscription Card ─────────────────────────────────────────────────

function ActiveSubscriptionCard({
  subscription,
  daysRemaining,
  onCancel,
}: {
  subscription: NonNullable<ReturnType<typeof useSubscription>['subscription']>;
  daysRemaining: number;
  onCancel: () => void;
}) {
  const planName = subscription.plan_name || subscription.plan_id;
  const planMeta = PLANS.find((p) => p.name === planName);
  const planPrice = subscription.amount
    ? `₹${subscription.amount.toLocaleString('en-IN')}`
    : planMeta?.price || '—';
  const planPeriod = planMeta?.period || '/month';
  // Lookup features by plan_name from the dictionary, fallback to PLANS catalog
  const features = PLAN_FEATURES[planName] || planMeta?.features || [];

  const urgencyLevel = daysRemaining <= 2 ? 'critical' : daysRemaining <= 5 ? 'warning' : 'normal';

  return (
    <div className="space-y-5">
      {/* Main card */}
      <div className="bg-primary rounded-3xl p-6 text-white relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-white/[0.04] -translate-y-12 translate-x-12" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/[0.04] translate-y-10 -translate-x-8" />

        <div className="relative z-10">
          {/* Header row */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shadow-md">
                <Crown size={18} className="text-secondary-foreground" />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-white/50 uppercase tracking-widest">Active Plan</div>
                <div className="text-lg font-extrabold leading-tight">{planName}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold">{planPrice}</div>
              <div className="text-xs text-white/50">{planPeriod}</div>
            </div>
          </div>

          {/* Date pills */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-white/[0.08] rounded-xl px-3.5 py-2.5">
              <div className="flex items-center gap-1.5 text-[10px] text-white/50 uppercase tracking-wide font-semibold mb-0.5">
                <Calendar size={10} /> Started
              </div>
              <div className="text-sm font-bold">{formatDate(subscription.start_date)}</div>
            </div>
            <div className="bg-white/[0.08] rounded-xl px-3.5 py-2.5">
              <div className="flex items-center gap-1.5 text-[10px] text-white/50 uppercase tracking-wide font-semibold mb-0.5">
                <Clock size={10} /> Expires
              </div>
              <div className="text-sm font-bold">{formatDate(subscription.end_date)}</div>
            </div>
          </div>

          {/* Days remaining */}
          <div
            className={`flex items-center gap-2 text-xs rounded-xl px-3.5 py-2.5 mb-5 ${
              urgencyLevel === 'critical'
                ? 'bg-red-500/20 text-red-200'
                : urgencyLevel === 'warning'
                ? 'bg-amber-500/20 text-amber-200'
                : 'bg-white/[0.08] text-white/70'
            }`}
          >
            <Zap size={12} className={urgencyLevel === 'normal' ? 'text-secondary' : ''} />
            <span>
              {daysRemaining === 0
                ? 'Expires today'
                : daysRemaining === 1
                ? '1 day remaining'
                : `${daysRemaining} days remaining`}
              {urgencyLevel !== 'normal' && ' — Renew soon!'}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Link
              href="/pricing-page"
              className="flex-1 bg-secondary text-secondary-foreground py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 active:scale-[0.97]"
            >
              <TrendingUp size={15} /> Upgrade / Renew
            </Link>
            <button
              onClick={onCancel}
              className="flex-1 bg-white/10 text-white py-3 rounded-xl text-sm font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2 active:scale-[0.97]"
            >
              <X size={15} /> Cancel Plan
            </button>
          </div>
        </div>
      </div>

      {/* Features card */}
      {features.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-green-500" />
            What's Included in {planName}
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {features.map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-foreground">
                <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status badge */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        Subscription is active
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MySubscriptions() {
  const {
    subscription,
    isLoading,
    isActive,
    isExpired,
    isCancelled,
    daysRemaining,
    fetchSubscription,
    cancelSubscription,
  } = useSubscription();

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const handleCancel = async () => {
    setIsCancelling(true);
    const success = await cancelSubscription();
    setIsCancelling(false);
    if (success) setShowCancelConfirm(false);
  };

  if (isLoading) return <SubscriptionSkeleton />;

  // Determine empty-state reason
  const emptyReason: 'none' | 'expired' | 'cancelled' | null =
    !subscription
      ? 'none'
      : isExpired
      ? 'expired'
      : isCancelled
      ? 'cancelled'
      : null;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-primary mb-1">My Subscription</h1>
        <p className="text-muted-foreground text-sm">
          {isActive
            ? 'Your active plan details and management options.'
            : 'Manage your laundry subscription plans.'}
        </p>
      </div>

      {/* Content */}
      {isActive && subscription ? (
        <ActiveSubscriptionCard
          subscription={subscription}
          daysRemaining={daysRemaining}
          onCancel={() => setShowCancelConfirm(true)}
        />
      ) : (
        <EmptyState reason={emptyReason || 'none'} />
      )}

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        open={showCancelConfirm}
        title="Cancel Your Subscription?"
        message={`Your ${subscription?.plan_name || 'current'} plan will be cancelled immediately. You'll lose access to all premium benefits.`}
        confirmLabel="Yes, Cancel Plan"
        cancelLabel="Keep My Plan"
        variant="danger"
        icon={<AlertTriangle size={26} className="text-red-500" />}
        isLoading={isCancelling}
        onConfirm={handleCancel}
        onCancel={() => setShowCancelConfirm(false)}
      />
    </div>
  );
}
