import React from 'react';

export default function ServicesHero() {
  return (
    <section className="pt-28 pb-4 bg-background">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <span className="text-xs font-bold uppercase tracking-[0.15em] text-secondary mb-3 block">What We Offer</span>
        <h1 className="text-5xl md:text-7xl font-extrabold text-primary leading-[1.0] mb-4">
          Our
          <br />
          Services
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
          From everyday wash to delicate dry cleaning — Linedry has a service for every garment and every lifestyle.
        </p>
      </div>
    </section>
  );
}
