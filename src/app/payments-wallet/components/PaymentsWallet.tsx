'use client';
import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import {
  Wallet, Plus, Copy, Check, Gift,
  ChevronRight, X, Loader2, ArrowUpRight, ArrowDownLeft,
  Shield, Clock, IndianRupee,
} from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import SavedPaymentMethods from './SavedPaymentMethods';
import { useAuth } from '@/components/AuthProvider';
import { useProfile } from '@/hooks/useProfile';
import { Database } from '@/types/supabase';
import { toast } from 'react-hot-toast';
import { MetricSkeleton, ListItemSkeleton } from '@/components/ui/Skeleton';

// Razorpay global type is declared in PricingCards.tsx

// ─── Constants ────────────────────────────────────────────────────────────────

const REFERRAL_CODE = 'LINEDRY100';
const ADD_MONEY_CHIPS = [500, 1000, 2000, 5000];

type WalletTx = Database['public']['Tables']['wallet_transactions']['Row'];

// ─── Component ────────────────────────────────────────────────────────────────

export default function PaymentsWallet() {
  const { balance, transactions, isLoading, isTxLoading, fetchBalance, fetchTransactions, addFunds } = useWallet();
  const { user } = useAuth();
  const { profile, fetchProfile } = useProfile();

  const [razorpayReady, setRazorpayReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showRecharge, setShowRecharge] = useState(false);
  const [rechargeAmt, setRechargeAmt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
    fetchProfile();
  }, [fetchBalance, fetchTransactions, fetchProfile]);

  const handleCopy = () => {
    navigator.clipboard?.writeText(REFERRAL_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Razorpay payment ────────────────────────────────────────────────────

  const handleAddMoney = async (amount: number) => {
    if (!razorpayReady || typeof window.Razorpay === 'undefined') {
      // Fallback: direct DB add (dev mode)
      setIsSubmitting(true);
      const success = await addFunds(amount, 'Wallet Top-up');
      setIsSubmitting(false);
      if (success) {
        setShowRecharge(false);
        setRechargeAmt('');
      }
      return;
    }

    const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!razorpayKeyId) {
      setIsSubmitting(true);
      const success = await addFunds(amount, 'Wallet Top-up');
      setIsSubmitting(false);
      if (success) { setShowRecharge(false); setRechargeAmt(''); }
      return;
    }

    setIsSubmitting(true);

    const options = {
      key: razorpayKeyId,
      amount: amount * 100, // paise
      currency: 'INR',
      name: 'Linedry',
      description: `Add ₹${amount.toLocaleString('en-IN')} to Wallet`,
      prefill: {
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

      // ── Success ─────────────────────────────────────────────────────
      handler: async (response: any) => {
        const paymentId = response.razorpay_payment_id;
        const success = await addFunds(amount, `Wallet Top-up via Razorpay (${paymentId})`);
        setIsSubmitting(false);
        if (success) {
          setShowRecharge(false);
          setRechargeAmt('');
        }
      },

      modal: {
        ondismiss: () => setIsSubmitting(false),
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp: any) => {
        const desc = resp?.error?.description || resp?.error?.reason || 'Payment failed';
        console.error('Razorpay wallet payment failed:', desc);
        toast.error(desc);
        setIsSubmitting(false);
      });
      rzp.open();
    } catch (err) {
      console.error('Razorpay init error:', err);
      setIsSubmitting(false);
    }
  };

  const handleRechargeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(rechargeAmt);
    if (!isNaN(amt) && amt > 0) {
      handleAddMoney(amt);
    }
  };



  // ── Format helpers ──────────────────────────────────────────────────────

  const formatTxDate = (isoDate: string) => {
    const d = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const totalCredits = transactions.filter(t => t.transaction_type === 'credit').reduce((s, t) => s + t.amount, 0);
  const totalDebits = transactions.filter(t => t.transaction_type === 'debit').reduce((s, t) => s + t.amount, 0);

  return (
    <>
      {/* Razorpay script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onReady={() => setRazorpayReady(true)}
      />

      <div className="max-w-2xl mx-auto space-y-4 md:space-y-6">
        <div className="mb-2">
          <h1 className="text-xl md:text-2xl font-extrabold text-primary mb-1">Payments & Wallet</h1>
          <p className="text-muted-foreground text-sm">Manage your wallet, add money, and view transactions.</p>
        </div>

        {/* ── Premium Wallet Card ────────────────────────────────────────── */}
        {isLoading && balance === 0 ? (
          <MetricSkeleton />
        ) : (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] p-5 md:p-7 text-white shadow-xl">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-16 translate-x-12" />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5 translate-y-12 -translate-x-8" />
            <div className="absolute top-8 right-8 w-20 h-20 rounded-full bg-secondary/10 blur-2xl" />

            <div className="relative z-10">
              {/* Card header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center backdrop-blur-sm">
                    <Wallet size={18} className="text-secondary" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white/70 block leading-tight">Linedry Wallet</span>
                    <span className="text-xs text-white/40">Secure • Instant</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-white/40">
                  <Shield size={11} />
                  <span>Protected</span>
                </div>
              </div>

              {/* Balance */}
              <div className="mb-1">
                <div className="text-xs text-white/50 uppercase tracking-widest font-semibold mb-1">Available Balance</div>
                <div className="text-4xl md:text-5xl font-extrabold tracking-tight">
                  <span className="text-white/50 text-2xl mr-0.5">₹</span>
                  {balance.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Quick stats row */}
              <div className="flex items-center gap-4 mt-4 mb-5">
                <div className="flex items-center gap-1 text-xs text-green-300">
                  <ArrowDownLeft size={12} />
                  <span>₹{totalCredits.toLocaleString('en-IN')} in</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-red-300">
                  <ArrowUpRight size={12} />
                  <span>₹{totalDebits.toLocaleString('en-IN')} out</span>
                </div>
              </div>

              {/* Add money button */}
              <button
                onClick={() => setShowRecharge(true)}
                className="flex items-center gap-2 bg-secondary text-secondary-foreground px-6 h-12 rounded-full text-sm font-bold hover:opacity-90 active:scale-[0.97] transition-all shadow-lg shadow-secondary/20"
              >
                <Plus size={15} /> Add Money
              </button>
            </div>
          </div>
        )}

        {/* ── Quick Add Chips (always visible) ──────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-1 snap-x">
          {ADD_MONEY_CHIPS.map(amt => (
            <button
              key={`chip-${amt}`}
              onClick={() => { setRechargeAmt(String(amt)); setShowRecharge(true); }}
              disabled={isSubmitting}
              className="flex-shrink-0 snap-start flex items-center gap-1.5 px-4 h-10 rounded-xl border-2 border-border bg-card text-sm font-bold text-foreground hover:border-secondary hover:bg-secondary/5 transition-all disabled:opacity-40"
            >
              <Plus size={12} className="text-secondary" /> ₹{amt.toLocaleString('en-IN')}
            </button>
          ))}
        </div>

        {/* ── Transaction History ────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl p-4 md:p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-secondary" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Transaction History</span>
            </div>
            <span className="text-xs text-muted-foreground">{transactions.length} records</span>
          </div>

          {isTxLoading ? (
            <div className="space-y-3">
              <ListItemSkeleton />
              <ListItemSkeleton />
              <ListItemSkeleton />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <IndianRupee size={22} className="text-muted-foreground" />
              </div>
              <p className="font-bold text-primary text-sm mb-1">No transactions yet</p>
              <p className="text-xs text-muted-foreground mb-4">Add money to your wallet to get started.</p>
              <button
                onClick={() => setShowRecharge(true)}
                className="inline-flex items-center gap-1.5 bg-secondary text-secondary-foreground px-5 py-2 rounded-full text-xs font-bold hover:opacity-90 transition-all"
              >
                <Plus size={12} /> Add Money
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {transactions.map((tx) => {
                const isCredit = tx.transaction_type === 'credit';
                return (
                  <div key={tx.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isCredit ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                      }`}>
                        {isCredit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {tx.description || (isCredit ? 'Wallet Credit' : 'Wallet Debit')}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatTxDate(tx.created_at)}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-extrabold flex-shrink-0 ml-3 ${
                      isCredit ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {isCredit ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Saved Payment Methods (Supabase-backed) ────────────────────── */}
        <SavedPaymentMethods />

        {/* ── Refer & Earn ──────────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
              <Gift size={18} className="text-secondary-foreground" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-foreground">Refer & Earn</div>
              <div className="text-xs text-muted-foreground">Get ₹100 in wallet for every friend who books!</div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Share your unique code. When your friend completes their first order, ₹100 is credited to your wallet instantly.</p>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex-1 bg-white border border-yellow-200 rounded-xl px-3 md:px-4 py-2.5 flex items-center justify-between min-w-0">
              <span className="text-sm font-extrabold text-primary tracking-widest truncate">{REFERRAL_CODE}</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs font-bold text-secondary hover:text-secondary/80 transition-colors ml-2 flex-shrink-0 h-8"
                aria-label="Copy referral code"
              >
                {copied ? <><Check size={13} className="text-green-500" /> <span className="text-green-500">Copied!</span></> : <><Copy size={13} /> Copy</>}
              </button>
            </div>
            <button className="flex items-center gap-1.5 bg-secondary text-secondary-foreground px-3 md:px-4 h-10 rounded-xl text-xs font-bold hover:opacity-90 transition-all flex-shrink-0">
              Share <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* ── Add Money Modal ───────────────────────────────────────────── */}
        {showRecharge && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white w-full sm:max-w-sm sm:rounded-3xl sm:m-4 rounded-t-3xl shadow-2xl p-5 md:p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-extrabold text-primary">Add Money</h2>
                  <p className="text-xs text-muted-foreground">Balance: ₹{balance.toLocaleString('en-IN')}</p>
                </div>
                <button
                  onClick={() => { setShowRecharge(false); setRechargeAmt(''); }}
                  disabled={isSubmitting}
                  className="p-2 rounded-xl hover:bg-muted transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center disabled:opacity-50"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleRechargeSubmit} className="space-y-4">
                {/* Quick chips */}
                <div className="flex gap-2 flex-wrap">
                  {ADD_MONEY_CHIPS.map(amt => (
                    <button
                      type="button"
                      key={`modal-chip-${amt}`}
                      onClick={() => setRechargeAmt(String(amt))}
                      disabled={isSubmitting}
                      className={`px-4 h-10 rounded-xl text-sm font-bold border-2 transition-all ${
                        rechargeAmt === String(amt)
                          ? 'border-secondary bg-secondary/10 text-secondary'
                          : 'border-border hover:border-secondary/40'
                      } disabled:opacity-40`}
                    >
                      +₹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>

                {/* Custom input */}
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                    Or enter custom amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₹</span>
                    <input
                      type="number"
                      min="1"
                      max="50000"
                      value={rechargeAmt}
                      onChange={e => setRechargeAmt(e.target.value)}
                      placeholder="Enter amount"
                      disabled={isSubmitting}
                      className="w-full pl-8 pr-4 h-12 rounded-xl border border-border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-secondary/30 disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>

                {/* Preview */}
                {rechargeAmt && !isNaN(Number(rechargeAmt)) && Number(rechargeAmt) > 0 && (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl text-sm animate-fade-in">
                    <span className="text-green-700 font-semibold">New balance after top-up</span>
                    <span className="text-green-700 font-extrabold">
                      ₹{(balance + Number(rechargeAmt)).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !rechargeAmt || isNaN(Number(rechargeAmt)) || Number(rechargeAmt) <= 0}
                  className="w-full bg-secondary text-secondary-foreground h-12 rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <><Loader2 size={16} className="animate-spin" /> Processing...</>
                  ) : (
                    <><IndianRupee size={14} /> Pay ₹{Number(rechargeAmt || 0).toLocaleString('en-IN')}</>
                  )}
                </button>

                <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                  <Shield size={10} /> Secured by Razorpay • 100% Refundable
                </p>
              </form>
            </div>
          </div>
        )}


      </div>
    </>
  );
}
