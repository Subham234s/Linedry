import React from 'react';
import Link from 'next/link';
import { Tag } from 'lucide-react';

export default function PromoBanner() {
  return (
    <section className="py-6 bg-background">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <div className="bg-primary rounded-3xl px-8 md:px-12 py-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full"></div>
          <div className="absolute -bottom-10 right-20 w-60 h-60 bg-white/5 rounded-full"></div>

          <div className="relative z-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-secondary/20 text-secondary text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              <Tag size={12} />
              Limited Time Offer
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
              20% OFF Your First Order
            </h2>
            <p className="text-white/60 text-sm md:text-base max-w-md">
              New to Linedry? Sign up today and get 20% off your first laundry pickup. Use code{' '}
              <span className="text-secondary font-bold">FRESH20</span> at checkout.
            </p>
          </div>

          <Link
            href="/auth"
            className="relative z-10 flex-shrink-0 bg-secondary text-secondary-foreground px-8 py-3.5 rounded-full font-bold text-sm hover:opacity-90 active:scale-95 transition-all duration-150 whitespace-nowrap"
          >
            Claim Your Discount
          </Link>
        </div>
      </div>
    </section>
  );
}
