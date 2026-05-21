// ─── Razorpay global type declaration ─────────────────────────────────────────
// Shared across all components that use Razorpay (PricingCards, PaymentsWallet)

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  handler: (response: RazorpayResponse) => void;
  prefill: { name?: string; email?: string; contact?: string };
  theme: { color: string };
  modal?: { ondismiss?: () => void };
  method?: {
    upi?: boolean;
    card?: boolean;
    netbanking?: boolean;
    wallet?: boolean;
    paylater?: boolean;
  };
  config?: {
    display: {
      blocks?: Record<string, {
        name: string;
        instruments: Array<{ method: string; flows?: string[]; apps?: string[] }>;
      }>;
      sequence?: string[];
      preferences?: { show_default_blocks?: boolean };
    };
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: any) => void) => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}
