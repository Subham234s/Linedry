import React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function ServicesPromoBanner() {
  return (
    <section className="py-12 bg-background">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <div className="bg-primary rounded-3xl p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-secondary/20 text-secondary text-xs font-bold px-4 py-2 rounded-full mb-5">
              <Sparkles size={12} />
              New Customer Offer
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
              First Order 20% OFF
            </h2>
            <p className="text-white/60 text-sm md:text-base max-w-md mx-auto mb-8">
              Try Linedry risk-free. Use code{' '}
              <span className="text-secondary font-bold">FRESH20</span>{' '}
              on your first order and experience the difference.
            </p>
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-8 py-4 rounded-full font-bold text-sm hover:opacity-90 active:scale-95 transition-all duration-150"
            >
              Get Started Today
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
