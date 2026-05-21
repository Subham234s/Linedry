'use client';
import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { CheckCircle, Loader2, Sparkles, ArrowRight, Wallet, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useProfile } from '@/hooks/useProfile';
import { useWallet } from '@/hooks/useWallet';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'react-hot-toast';
import { CardSkeleton } from '@/components/ui/Skeleton';

// Razorpay types imported from shared declaration
import type { RazorpayOptions, RazorpayResponse, RazorpayInstance } from '@/types/razorpay.d';

// ─── Plan data ────────────────────────────────────────────────────────────────

interface Plan {
  id: string;
  badge: string;
  badgeColor: string;
  tagline: string;
  description: string;
  price: string;
  priceNumeric: number;
  unit: string;
  durationDays: number;
  features: string[];
  cta: string;
  ctaStyle: string;
  featured: boolean;
  cardBg: string;
}

const plans: Plan[] = [
  {
    id: 'essential',
    badge: 'Essential',
    badgeColor: 'bg-secondary text-secondary-foreground',
    tagline: 'Perfect for routine laundry needs',
    description: 'Perfect for routine laundry needs.',
    price: '₹499',
    priceNumeric: 499,
    unit: '/ month',
    durationDays: 30,
    features: ['Upto 10 Kg Wash & Fold', '2 Free Pickups & Drops per month', 'Standard Delivery (48 Hours)', 'Basic Support'],
    cta: 'Get Essential',
    ctaStyle: 'bg-primary text-white hover:opacity-90',
    featured: false,
    cardBg: 'bg-background',
  },
  {
    id: 'premium',
    badge: 'Premium Care',
    badgeColor: 'bg-secondary text-secondary-foreground',
    tagline: 'For busy professionals',
    description: 'For busy professionals requiring crisp, ironed clothes.',
    price: '₹1,199',
    priceNumeric: 1199,
    unit: '/ month',
    durationDays: 30,
    features: ['Upto 20 Kg Wash & Iron', '4 Free Pickups & Drops per month', 'Next-Day Express Delivery (24 Hours)', 'Premium Packaging & Covers', 'Live Order Tracking'],
    cta: 'Subscribe Now',
    ctaStyle: 'bg-secondary text-secondary-foreground hover:opacity-90',
    featured: true,
    cardBg: 'bg-primary',
  },
  {
    id: 'elite',
    badge: 'Elite Family',
    badgeColor: 'bg-primary text-white',
    tagline: 'Complete care for families',
    description: 'Complete laundry & dry-cleaning care for families.',
    price: '₹2,499',
    priceNumeric: 2499,
    unit: '/ month',
    durationDays: 30,
    features: ['Upto 40 Kg Wash & Iron', '2 Premium Dry Cleaning items included', 'Unlimited Free Pickups & Drops', 'Same-Day Priority Delivery', '24/7 Priority Support'],
    cta: 'Go Elite',
    ctaStyle: 'bg-primary text-white hover:opacity-90',
    featured: false,
    cardBg: 'bg-background',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function PricingCards() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, fetchProfile } = useProfile();
  const { balance, fetchBalance, deductFunds } = useWallet();
  const supabase = createClient();

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [walletLoadingPlan, setWalletLoadingPlan] = useState<string | null>(null);
  const [razorpayReady, setRazorpayReady] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Fetch profile + wallet balance on mount
  useEffect(() => {
    async function init() {
      if (user) {
        await Promise.all([fetchProfile(), fetchBalance()]);
      }
      // Add a tiny delay for that "premium" smooth transition feel
      setTimeout(() => setIsInitialLoading(false), 800);
    }
    init();
  }, [user, fetchProfile, fetchBalance]);

  // ── Shared: upsert subscription in Supabase ─────────────────────────────

  const upsertSubscription = async (plan: Plan, paymentRef: string) => {
    let userId = user?.id;
    if (!userId) {
      const { data: { user: supaUser } } = await supabase.auth.getUser();
      userId = supaUser?.id;
    }
    if (!userId) throw new Error('Session expired. Please log in again.');

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + plan.durationDays);

    const subscriptionData = {
      user_id: userId,
      plan_name: plan.badge,
      plan_id: paymentRef,
      amount: plan.priceNumeric,
      status: 'active',
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    };

    // Check if user already has a subscription row
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
      .single();

    let dbError;

    if (existing?.id) {
      const { error } = await supabase
        .from('subscriptions')
        .update(subscriptionData)
        .eq('id', existing.id);
      dbError = error;
    } else {
      const { error } = await supabase
        .from('subscriptions')
        .insert(subscriptionData);
      dbError = error;
    }

    if (dbError) throw new Error(dbError.message || JSON.stringify(dbError));
  };

  // ── Pay via Razorpay ────────────────────────────────────────────────────

  const handleSelectPlan = (plan: Plan) => {
    if (!user) {
      toast('Please sign in to subscribe', { icon: '🔒' });
      router.push('/auth');
      return;
    }

    if (!razorpayReady || typeof window.Razorpay === 'undefined') {
      toast.error('Payment system is loading. Please try again in a moment.');
      return;
    }

    setLoadingPlan(plan.id);

    const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!razorpayKeyId) {
      toast.error('Payment configuration error. Please contact support.');
      setLoadingPlan(null);
      return;
    }

    const options: RazorpayOptions = {
      key: razorpayKeyId,
      amount: plan.priceNumeric * 100,
      currency: 'INR',
      name: 'Linedry',
      description: `${plan.badge} Subscription`,
      prefill: {
        // ⚠️ DEV MODE: Using test credentials to avoid real OTPs.
        name: 'Test User',
        email: 'test@linedry.in',
        contact: '9876543210',
      },
      theme: { color: '#1a1a2e' },

      method: {
        upi: true,
        card: true,
        netbanking: true,
        wallet: true,
        paylater: true,
      },
      config: {
        display: {
          blocks: {
            upi: {
              name: 'Pay via UPI',
              instruments: [
                {
                  method: 'upi',
                  flows: ['qr', 'collect', 'intent'],
                  apps: ['google_pay', 'phonepe', 'paytm'],
                },
              ],
            },
          },
          sequence: ['block.upi', 'block.recommended'],
          preferences: { show_default_blocks: true },
        },
      },

      // ─── Success handler ─────────────────────────────────────────────
      handler: async (response: RazorpayResponse) => {
        try {
          await upsertSubscription(plan, response.razorpay_payment_id);
          
          // ── Trigger Notification ─────────────────────────────────────
          import('@/utils/notifications').then(({ notifyUser }) => {
            notifyUser({
              title: 'Plan Activated!',
              message: `Welcome to the ${plan.badge} family. Your subscription is now active.`,
              type: 'subscription'
            });
          });

          toast.success(`${plan.badge} plan activated! 🎉`, { duration: 3000 });
          setTimeout(() => router.push('/my-subscriptions'), 1500);
        } catch (err: any) {
          const errMsg = err?.message || String(err);
          console.error('Subscription DB error:', errMsg);
          toast.error(errMsg || 'Payment succeeded but failed to save subscription.');
        } finally {
          setLoadingPlan(null);
        }
      },

      modal: {
        ondismiss: () => {
          toast('Payment cancelled. No charges were made.', { icon: '⚠️' });
          setLoadingPlan(null);
        },
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        const errObj = response?.error || {};
        const errMsg = errObj.description || errObj.reason || 'Payment failed.';
        console.error('Razorpay payment failed:', JSON.stringify(errObj, null, 2));
        toast.error(errMsg);
        setLoadingPlan(null);
      });
      rzp.open();
    } catch (err) {
      console.error('Razorpay init error:', err);
      toast.error('Could not open payment gateway. Please try again.');
      setLoadingPlan(null);
    }
  };

  // ── Pay via Wallet ──────────────────────────────────────────────────────

  const handlePayWithWallet = async (plan: Plan) => {
    if (!user) {
      toast('Please sign in to subscribe', { icon: '🔒' });
      router.push('/auth');
      return;
    }

    // 1. Pre-check: refresh live balance before proceeding
    const liveBalance = await fetchBalance();

    if (typeof liveBalance === 'number' && liveBalance < plan.priceNumeric) {
      toast.error(
        `Insufficient balance! You have ₹${liveBalance.toLocaleString('en-IN')} but need ₹${plan.priceNumeric.toLocaleString('en-IN')}. Please top up your wallet.`,
        { duration: 5000 }
      );
      return;
    }

    setWalletLoadingPlan(plan.id);

    try {
      // 2. Deduct from wallet (atomic: updates balance + inserts debit record)
      const deducted = await deductFunds(
        plan.priceNumeric,
        `Plan Purchase: ${plan.badge}`
      );

      if (!deducted) {
        // deductFunds already shows an error toast
        setWalletLoadingPlan(null);
        return;
      }

      // 3. Activate the subscription
      try {
        await upsertSubscription(plan, `wallet_${Date.now()}`);
      } catch (subscriptionErr: any) {
        // ── CRITICAL ROLLBACK: subscription failed, but wallet was deducted.
        // We must refund the wallet balance.
        console.error('Subscription activation failed after wallet debit, refunding...');

        const { addFunds: refundFunds } = await import('@/hooks/useWallet').then(() => {
          // We can't use addFunds from the same hook instance inside here cleanly,
          // so we'll do a direct Supabase operation for the rollback.
          return { addFunds: null };
        });

        // Direct rollback via Supabase
        let uid = user.id;
        if (!uid) {
          const { data: { user: supaUser } } = await supabase.auth.getUser();
          uid = supaUser?.id || '';
        }
        if (uid) {
          const { data: freshProfile } = await supabase
            .from('profiles')
            .select('wallet_balance')
            .eq('id', uid)
            .single();

          const currentBal = freshProfile?.wallet_balance || 0;
          await supabase
            .from('profiles')
            .update({ wallet_balance: currentBal + plan.priceNumeric })
            .eq('id', uid);

          await supabase
            .from('wallet_transactions')
            .insert({
              user_id: uid,
              amount: plan.priceNumeric,
              transaction_type: 'credit' as const,
              description: `Refund: ${plan.badge} plan activation failed`,
            });

          await fetchBalance();
        }

        toast.error(
          subscriptionErr?.message || 'Subscription activation failed. Your wallet has been refunded.',
          { duration: 5000 }
        );
        setWalletLoadingPlan(null);
        return;
      }

      // 4. Success!
      // ── Trigger Notification ─────────────────────────────────────
      import('@/utils/notifications').then(({ notifyUser }) => {
        notifyUser({
          title: 'Plan Activated!',
          message: `Welcome to the ${plan.badge} family. Your subscription is now active.`,
          type: 'subscription'
        });
      });

      toast.success(`${plan.badge} plan activated via Wallet! 🎉`, { duration: 3000 });
      setTimeout(() => router.push('/my-subscriptions'), 1500);
    } catch (err: any) {
      console.error('Wallet payment error:', err);
      toast.error(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setWalletLoadingPlan(null);
    }
  };

  // ── Helper: can the user afford this plan? ──────────────────────────────
  const canAfford = (plan: Plan) => balance >= plan.priceNumeric;
  const anyLoading = loadingPlan !== null || walletLoadingPlan !== null;

  return (
    <>
      {/* Load Razorpay Checkout Script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onReady={() => setRazorpayReady(true)}
        onError={() => toast.error('Failed to load payment gateway.')}
      />

      <section className="py-12 bg-background">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
          {/* Wallet balance strip */}
          {user && (
            <div className="max-w-4xl ml-auto mb-5">
              <div className="flex items-center justify-between p-3 px-5 bg-gradient-to-r from-primary/5 to-secondary/5 border border-border rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Wallet size={15} className="text-secondary" />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Wallet Balance</span>
                    <p className="text-sm font-extrabold text-primary">₹{balance.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/payments-wallet')}
                  className="text-xs font-bold text-secondary hover:underline"
                >
                  + Top Up
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {isInitialLoading ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : (
              plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-7 flex flex-col ${plan.cardBg} ${
                  plan.featured
                    ? 'shadow-2xl scale-[1.02] border-0'
                    : 'border border-border shadow-sm'
                }`}
              >
                {/* Badge */}
                <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full mb-4 self-start ${plan.badgeColor}`}>
                  {plan.badge}
                </span>

                {/* Tagline */}
                <p className={`font-extrabold text-base mb-2 ${plan.featured ? 'text-white' : 'text-primary'}`}>
                  {plan.tagline}
                </p>
                <p className={`text-xs leading-relaxed mb-6 ${plan.featured ? 'text-white/60' : 'text-muted-foreground'}`}>
                  {plan.description}
                </p>

                {/* Price */}
                <div className="flex items-end gap-1 mb-6">
                  <span className={`text-5xl font-extrabold font-tabular ${plan.featured ? 'text-white' : 'text-primary'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm mb-2 ${plan.featured ? 'text-white/60' : 'text-muted-foreground'}`}>
                    {plan.unit}
                  </span>
                </div>

                {/* Features */}
                <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${plan.featured ? 'text-white/50' : 'text-muted-foreground'}`}>
                  What You Get
                </p>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={`${plan.id}-feat-${f}`} className="flex items-center gap-2.5">
                      <CheckCircle size={14} className={plan.featured ? 'text-secondary flex-shrink-0' : 'text-green-500 flex-shrink-0'} />
                      <span className={`text-sm ${plan.featured ? 'text-white/80' : 'text-foreground/70'}`}>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* ── CTA Buttons ─────────────────────────────────────────── */}
                <div className="space-y-2.5 mt-auto">
                  {/* Primary: Razorpay */}
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={anyLoading}
                    className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-150 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed ${plan.ctaStyle}`}
                  >
                    {loadingPlan === plan.id ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {plan.featured && <Sparkles size={14} />}
                        {plan.cta}
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>

                  {/* Secondary: Pay with Wallet */}
                  {user && (
                    <button
                      onClick={() => handlePayWithWallet(plan)}
                      disabled={anyLoading || !canAfford(plan)}
                      title={
                        !canAfford(plan)
                          ? `Need ₹${(plan.priceNumeric - balance).toLocaleString('en-IN')} more in wallet`
                          : `Pay ₹${plan.priceNumeric.toLocaleString('en-IN')} from wallet`
                      }
                      className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-xs transition-all duration-150 active:scale-[0.98] border-2 ${
                        canAfford(plan)
                          ? plan.featured
                            ? 'border-white/20 text-white/80 hover:bg-white/10'
                            : 'border-border text-foreground/70 hover:border-secondary/40 hover:bg-secondary/5'
                          : plan.featured
                            ? 'border-white/10 text-white/30 cursor-not-allowed'
                            : 'border-border/50 text-muted-foreground/50 cursor-not-allowed'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {walletLoadingPlan === plan.id ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          Deducting from Wallet...
                        </>
                      ) : !canAfford(plan) ? (
                        <>
                          <AlertTriangle size={13} />
                          Low Balance — Top Up Wallet
                        </>
                      ) : (
                        <>
                          <Wallet size={13} />
                          Pay with Wallet (₹{balance.toLocaleString('en-IN')})
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )))}
          </div>
        </div>
      </section>
    </>
  );
}
