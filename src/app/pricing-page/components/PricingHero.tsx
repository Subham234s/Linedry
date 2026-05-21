import React from 'react';

export default function PricingHero() {
  return (
    <section className="pt-28 pb-4 bg-background">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <div className="max-w-xl">
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-secondary mb-3 block">Plans & Pricing</span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-primary leading-[1.0] mb-4">
            Pricing
            <br />
            Plans
          </h1>
          <h2 className="text-2xl font-bold text-foreground/80 mb-3">Flexible Packages For Every Need</h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
            Choose a plan that suits your lifestyle — perfect for students, professionals, or families.
          </p>
        </div>
      </div>
    </section>
  );
}
