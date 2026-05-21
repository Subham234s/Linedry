import React from 'react';
import { ShieldCheck, Truck, Clock, RefreshCw } from 'lucide-react';

const badges = [
  { id: 'trust-secure', icon: ShieldCheck, label: 'Secure Payments', sub: 'UPI, Cards, Net Banking' },
  { id: 'trust-delivery', icon: Truck, label: 'Free Pickup & Delivery', sub: 'On all plans' },
  { id: 'trust-turnaround', icon: Clock, label: '24–48h Turnaround', sub: 'Express available' },
  { id: 'trust-refund', label: 'Satisfaction Guarantee', sub: 'Re-wash or full refund', icon: RefreshCw },
];

export default function TrustBadges() {
  return (
    <section className="py-10 bg-muted border-y border-border">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {badges?.map((b) => (
            <div key={b?.id} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                <b.icon size={18} className="text-secondary" />
              </div>
              <div>
                <p className="text-sm font-bold text-primary">{b?.label}</p>
                <p className="text-xs text-muted-foreground">{b?.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
