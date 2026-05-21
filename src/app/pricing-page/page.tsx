import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PricingHero from './components/PricingHero';
import PricingCards from './components/PricingCards';
import PricingFAQ from './components/PricingFAQ';
import TrustBadges from './components/TrustBadges';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PricingHero />
      <PricingCards />
      <TrustBadges />
      <PricingFAQ />
      <Footer />
    </div>
  );
}
