'use client';
import React, { useState } from 'react';
import {
  Crown,
  Zap,
  CheckCircle,
  ChevronRight,
  ArrowLeft,
  Shield,
  Tag,
  Loader2,
  PartyPopper,
  Star,
  Sparkles,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  badge?: string;
  features: string[];
  recommended?: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const CURRENT_PLAN = {
  name: 'Weekly Saver',
  price: 499,
  period: '/week',
  renewsIn: 3,
};

const UPGRADE_PLANS: Plan[] = [
  {
    id: 'monthly',
    name: 'Monthly Comfort',
    price: 1799,
    period: '/month',
    features: ['12 pickups/month', 'Wash, Dry & Fold', 'Up to 8 kg/load', 'Email support'],
  },
  {
    id: 'premium',
    name: 'Premium Care',
    price: 1199,
    period: '/week',
    badge: 'Most Popular',
    recommended: true,
    features: [
      'Priority Processing',
      'Stain Pre-treatment',
      'Ironing Included',
      'Bed & Linen Care',
      'Dedicated support',
    ],
  },
  {
    id: 'elite',
    name: 'Elite Annual',
    price: 3999,
    period: '/month',
    badge: 'Best Value',
    features: [
      'Unlimited pickups',
      'Express 24h turnaround',
      'Dry cleaning included',
      'Free delivery always',
    ],
  },
];

// ─── GST / Pricing helpers ────────────────────────────────────────────────────

const GST_RATE = 0.18;
const WALLET_DISCOUNT = 50;

function calcBreakdown(basePrice: number) {
  const gst = Math.round(basePrice * GST_RATE);
  const total = basePrice + gst - WALLET_DISCOUNT;
  return { basePrice, gst, walletDiscount: WALLET_DISCOUNT, total };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: number }) {
  const steps = ['Plan', 'Upgrade', 'Summary', 'Payment'];
  return (
    <div className="flex items-center justify-center gap-1 mb-6">
      {steps.map((label, i) => {
        const idx = i + 1;
        const active = idx === step;
        const done = idx < step;
        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  done
                    ? 'bg-green-500 text-white'
                    : active
                    ? 'bg-yellow-400 text-slate-900' :'bg-slate-100 text-slate-400'
                }`}
              >
                {done ? <CheckCircle size={14} /> : idx}
              </div>
              <span
                className={`text-[10px] font-semibold hidden sm:block ${
                  active ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-0.5 w-8 sm:w-12 rounded-full mb-4 transition-all duration-300 ${
                  done ? 'bg-green-400' : 'bg-slate-200'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Step 1: Current Plan ─────────────────────────────────────────────────────

function CurrentPlanStep({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <div className="space-y-5">
      {/* Active plan card */}
      <div className="relative overflow-hidden bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
        {/* Decorative blobs */}
        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-yellow-400/10" />
        <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center shadow-md">
                <Crown size={18} className="text-slate-900" />
              </div>
              <div>
                <p className="text-xs text-white/50 uppercase tracking-widest font-semibold">Active Plan</p>
                <h3 className="text-lg font-extrabold leading-tight">{CURRENT_PLAN.name}</h3>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-extrabold">₹{CURRENT_PLAN.price.toLocaleString('en-IN')}</p>
              <p className="text-xs text-white/50">{CURRENT_PLAN.period}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-white/60 mb-5 bg-white/5 rounded-xl px-3 py-2">
            <Zap size={12} className="text-yellow-400" />
            <span>Renews in <strong className="text-white">{CURRENT_PLAN.renewsIn} days</strong> · Auto-pay enabled</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-5">
            {['3 pickups/week', 'Wash, Dry & Fold', 'Up to 7 kg/load', 'Priority support'].map((f) => (
              <div key={f} className="flex items-center gap-1.5 text-xs text-white/70">
                <CheckCircle size={12} className="text-green-400 flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>

          <button
            onClick={onUpgrade}
            className="w-full h-12 bg-yellow-400 text-slate-900 font-extrabold rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-300 transition-all duration-200 shadow-lg shadow-yellow-400/20"
          >
            <Sparkles size={16} />
            Upgrade Plan
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Info strip */}
      <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700">
        <Shield size={14} className="flex-shrink-0 text-blue-500" />
        <span>Upgrading is instant. Your new plan activates immediately and the remaining days are prorated.</span>
      </div>
    </div>
  );
}

// ─── Step 2: Upgrade Selection ────────────────────────────────────────────────

function UpgradeSelectionStep({
  onSelect,
  onBack,
}: {
  onSelect: (plan: Plan) => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={15} /> Back
      </button>

      <div>
        <h2 className="text-xl font-extrabold text-slate-900">Choose Your Upgrade</h2>
        <p className="text-sm text-slate-500 mt-0.5">Pick a plan that fits your laundry needs.</p>
      </div>

      <div className="space-y-3">
        {UPGRADE_PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl border-2 p-5 transition-all duration-200 ${
              plan.recommended
                ? 'border-yellow-400 bg-yellow-50 shadow-md shadow-yellow-100'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            {plan.badge && (
              <span
                className={`absolute -top-3 left-4 text-xs font-bold px-3 py-0.5 rounded-full ${
                  plan.recommended ? 'bg-yellow-400 text-slate-900' : 'bg-slate-900 text-white'
                }`}
              >
                {plan.badge}
              </span>
            )}

            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {plan.recommended && <Star size={14} className="text-yellow-500 fill-yellow-400" />}
                <span className="font-extrabold text-slate-900">{plan.name}</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-extrabold text-slate-900">
                  ₹{plan.price.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-400 ml-0.5">{plan.period}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 mb-4">
              {plan.features.map((f) => (
                <div key={f} className="flex items-center gap-1.5 text-xs text-slate-600">
                  <CheckCircle size={11} className="text-green-500 flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>

            <button
              onClick={() => onSelect(plan)}
              className={`w-full h-11 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                plan.recommended
                  ? 'bg-yellow-400 text-slate-900 hover:bg-yellow-300 shadow-sm'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {plan.recommended ? 'Select Premium' : `Select ${plan.name}`}
              <ChevronRight size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step 3: Checkout Summary ─────────────────────────────────────────────────

function CheckoutSummaryStep({
  plan,
  onProceed,
  onBack,
}: {
  plan: Plan;
  onProceed: () => void;
  onBack: () => void;
}) {
  const { basePrice, gst, walletDiscount, total } = calcBreakdown(plan.price);

  return (
    <div className="space-y-5">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={15} /> Back
      </button>

      <div>
        <h2 className="text-xl font-extrabold text-slate-900">Order Summary</h2>
        <p className="text-sm text-slate-500 mt-0.5">Review your upgrade before paying.</p>
      </div>

      {/* Plan being purchased */}
      <div className="bg-slate-900 rounded-2xl p-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-yellow-400 flex items-center justify-center">
            <Crown size={16} className="text-slate-900" />
          </div>
          <div>
            <p className="text-xs text-white/50 uppercase tracking-wide">Upgrading to</p>
            <p className="font-extrabold">{plan.name}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-extrabold">₹{basePrice.toLocaleString('en-IN')}</p>
          <p className="text-xs text-white/50">{plan.period}</p>
        </div>
      </div>

      {/* Price breakdown */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Price Breakdown</p>

        <div className="flex justify-between text-sm text-slate-700">
          <span>Base Plan</span>
          <span className="font-semibold">₹{basePrice.toLocaleString('en-IN')}</span>
        </div>

        <div className="flex justify-between text-sm text-slate-700">
          <span className="flex items-center gap-1">
            Taxes <span className="text-xs text-slate-400">(GST 18%)</span>
          </span>
          <span className="font-semibold">₹{gst.toLocaleString('en-IN')}</span>
        </div>

        <div className="flex justify-between text-sm text-green-600">
          <span className="flex items-center gap-1">
            <Tag size={13} />
            Wallet Discount
          </span>
          <span className="font-semibold">−₹{walletDiscount.toLocaleString('en-IN')}</span>
        </div>

        <div className="border-t border-dashed border-slate-200 pt-3 flex justify-between">
          <span className="font-extrabold text-slate-900">Total Payable</span>
          <span className="text-xl font-extrabold text-slate-900">₹{total.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1"><Shield size={12} className="text-green-500" /> Secure Checkout</span>
        <span className="flex items-center gap-1"><CheckCircle size={12} className="text-blue-500" /> Instant Activation</span>
        <span className="flex items-center gap-1"><Zap size={12} className="text-yellow-500" /> Cancel Anytime</span>
      </div>

      <button
        onClick={onProceed}
        className="w-full h-14 bg-yellow-400 text-slate-900 font-extrabold rounded-2xl flex items-center justify-center gap-2 hover:bg-yellow-300 transition-all duration-200 shadow-lg shadow-yellow-400/25 text-base"
      >
        <Shield size={18} />
        Proceed to Pay Securely · ₹{total.toLocaleString('en-IN')}
      </button>
    </div>
  );
}

// ─── Step 4: Mock Payment ─────────────────────────────────────────────────────

function MockPaymentStep({
  plan,
  onBack,
  onSuccess,
}: {
  plan: Plan;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const { total } = calcBreakdown(plan.price);

  /**
   * handlePayment — Mock Razorpay Integration Flow
   *
   * INDUSTRY-STANDARD RAZORPAY FLOW IN NEXT.JS:
   *
   * ─── STEP 1: Create Order on Server ──────────────────────────────────────
   * Call your own Next.js API route (e.g., POST /api/razorpay/create-order).
   * That route uses the Razorpay Node SDK to create an order:
   *   const razorpay = new Razorpay({ key_id, key_secret });
   *   const order = await razorpay.orders.create({ amount: totalInPaise, currency: 'INR', receipt });
   * The API returns { orderId, amount, currency }.
   *
   * ─── STEP 2: Load Razorpay Checkout Script ────────────────────────────────
   * Dynamically load the Razorpay checkout script in the browser:
   *   const script = document.createElement('script');
   *   script.src = 'https://checkout.razorpay.com/v1/checkout.js';
   *   document.body.appendChild(script);
   *
   * ─── STEP 3: Open Razorpay Options Object ────────────────────────────────
   * const options = {
   *   key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
   *   amount: order.amount,          // in paise (₹1 = 100 paise)
   *   currency: 'INR',
   *   name: 'Linedry',
   *   description: `Upgrade to ${plan.name}`,
   *   order_id: order.id,            // from Step 1
   *   handler: async (response) => {
   *     // ─── STEP 4: Verify Payment on Server ──────────────────────────
   *     // POST /api/razorpay/verify with:
   *     //   razorpay_order_id, razorpay_payment_id, razorpay_signature
   *     // Server uses crypto.createHmac to verify signature.
   *     // On success → update subscription in DB → show success UI.
   *   },
   *   prefill: { name: 'User Name', email: 'user@email.com', contact: '9XXXXXXXXX' },
   *   theme: { color: '#FACC15' },   // Linedry Yellow
   *   modal: { ondismiss: () => setLoading(false) },
   * };
   * const rzp = new (window as any).Razorpay(options);
   * rzp.open();
   *
   * ─── STEP 5: Handle Errors ───────────────────────────────────────────────
   * Wrap in try/catch. Show toast on failure. Always reset loading state.
   */
  async function handlePayment() {
    setLoading(true);

    // Simulate network delay (replace with real Razorpay flow above)
    await new Promise((resolve) => setTimeout(resolve, 2200));

    setLoading(false);
    setPaid(true);

    // After 1.5s show success screen
    setTimeout(() => onSuccess(), 1500);
  }

  if (paid) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center animate-bounce">
          <PartyPopper size={28} className="text-green-600" />
        </div>
        <h3 className="text-xl font-extrabold text-slate-900">Payment Successful!</h3>
        <p className="text-sm text-slate-500">
          You're now on <strong>{plan.name}</strong>. Enjoy premium laundry care!
        </p>
        <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 border border-green-200 rounded-xl px-4 py-2">
          <CheckCircle size={13} />
          Plan activated instantly
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <button
        onClick={onBack}
        disabled={loading}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors disabled:opacity-40"
      >
        <ArrowLeft size={15} /> Back
      </button>

      <div>
        <h2 className="text-xl font-extrabold text-slate-900">Confirm Payment</h2>
        <p className="text-sm text-slate-500 mt-0.5">You're one tap away from premium laundry.</p>
      </div>

      {/* Payment summary card */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Plan</span>
          <span className="font-bold text-slate-900">{plan.name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Amount</span>
          <span className="font-extrabold text-slate-900 text-base">₹{total.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Payment via</span>
          <span className="font-semibold text-slate-700 flex items-center gap-1">
            <span className="text-blue-600 font-bold">Razorpay</span>
            <span className="text-xs text-slate-400">(UPI / Card / Wallet)</span>
          </span>
        </div>
      </div>

      {/* Mock Razorpay note */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 flex items-start gap-2">
        <Zap size={13} className="flex-shrink-0 mt-0.5 text-amber-500" />
        <span>
          <strong>Demo mode:</strong> No real payment will be processed. Connect your Razorpay keys to enable live payments.
        </span>
      </div>

      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full h-14 bg-yellow-400 text-slate-900 font-extrabold rounded-2xl flex items-center justify-center gap-2 hover:bg-yellow-300 transition-all duration-200 shadow-lg shadow-yellow-400/25 text-base disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Processing Payment…
          </>
        ) : (
          <>
            <Shield size={18} />
            Pay ₹{total.toLocaleString('en-IN')} Securely
          </>
        )}
      </button>

      <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1">
        <Shield size={11} />
        256-bit SSL encrypted · Powered by Razorpay
      </p>
    </div>
  );
}

// ─── Success Screen ───────────────────────────────────────────────────────────

function SuccessScreen({ plan, onDone }: { plan: Plan; onDone: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center space-y-5">
      <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center">
        <Crown size={36} className="text-yellow-500" />
      </div>
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">Welcome to {plan.name}!</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
          Your subscription has been upgraded. Enjoy priority laundry care starting today.
        </p>
      </div>
      <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
        {plan.features.map((f) => (
          <div key={f} className="flex items-center gap-2 text-sm text-slate-700">
            <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
            {f}
          </div>
        ))}
      </div>
      <button
        onClick={onDone}
        className="w-full h-12 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all duration-200"
      >
        Go to My Subscriptions
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SubscriptionManager() {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  function handleSelectPlan(plan: Plan) {
    setSelectedPlan(plan);
    setStep(3);
  }

  function handleReset() {
    setStep(1);
    setSelectedPlan(null);
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-0.5">Subscription Manager</h1>
        <p className="text-sm text-slate-500">Manage and upgrade your Linedry plan.</p>
      </div>

      {/* Step indicator (hidden on success) */}
      {step !== 5 && <StepIndicator step={step} />}

      {/* Step content */}
      <div className="transition-all duration-300">
        {step === 1 && <CurrentPlanStep onUpgrade={() => setStep(2)} />}

        {step === 2 && (
          <UpgradeSelectionStep
            onSelect={handleSelectPlan}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && selectedPlan && (
          <CheckoutSummaryStep
            plan={selectedPlan}
            onProceed={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )}

        {step === 4 && selectedPlan && (
          <MockPaymentStep
            plan={selectedPlan}
            onBack={() => setStep(3)}
            onSuccess={() => setStep(5)}
          />
        )}

        {step === 5 && selectedPlan && (
          <SuccessScreen plan={selectedPlan} onDone={handleReset} />
        )}
      </div>
    </div>
  );
}
