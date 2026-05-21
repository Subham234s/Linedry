import React from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <AppImage
          src="/assets/images/Linedry_hero_images-1778058526313.png"
          alt="Woman happily doing laundry in bright modern laundromat"
          fill
          priority
          className="object-cover" />
        
        <div className="absolute inset-0 bg-primary/75"></div>
      </div>
      {/* Content */}
      <div className="relative z-10 max-w-screen-2xl mx-auto px-6 lg:px-10 w-full pt-24 pb-16">
        <div className="max-w-2xl">
          {/* Label */}
          <span className="inline-block text-secondary text-xs font-bold uppercase tracking-[0.15em] mb-6">
            Fresh Laundry
          </span>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] mb-6">
            Effortless
            <br />
            Laundry for Busy
            <br />
            Urban Living
          </h1>

          {/* Subtext */}
          <p className="text-white/70 text-base md:text-lg leading-relaxed mb-10 max-w-md">
            Say goodbye to laundry day stress. Linedry picks up, cleans, and delivers your laundry — so you can focus on what really matters.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 mb-12">
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-7 py-3.5 rounded-full font-bold text-sm hover:opacity-90 active:scale-95 transition-all duration-150">
              
              Schedule Pickup
            </Link>
            <Link
              href="/services-page"
              className="inline-flex items-center gap-2 border border-white/30 text-white px-7 py-3.5 rounded-full font-bold text-sm hover:bg-white/10 active:scale-95 transition-all duration-150">
              
              Browse Services
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-4">
            {[
            { label: 'Fast Pickup' },
            { label: 'Fresh Finish' },
            { label: 'Eco Friendly' }]?.
            map((feat) =>
            <div key={`feat-${feat?.label}`} className="flex items-center gap-2 text-white/80 text-sm font-medium">
                <CheckCircle size={16} className="text-secondary flex-shrink-0" />
                {feat?.label}
              </div>
            )}
          </div>
        </div>

        {/* Floating stat badge */}
        <div className="absolute top-32 right-10 hidden xl:block">
          <div className="bg-white rounded-2xl px-6 py-4 shadow-xl">
            <p className="text-3xl md:text-4xl font-extrabold text-primary font-tabular">23+</p>
            <p className="text-xs text-muted-foreground font-semibold mt-1">Years of<br />Experience</p>
          </div>
        </div>

        {/* Book now label */}
        <div className="absolute top-1/2 -translate-y-1/2 right-6 hidden xl:flex flex-col items-center gap-2">
          <span className="text-xs text-white/50 font-bold uppercase tracking-[0.2em] rotate-90 whitespace-nowrap">Book Now</span>
        </div>
      </div>
    </section>);

}
