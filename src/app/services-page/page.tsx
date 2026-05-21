import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ServicesHero from './components/ServicesHero';
import ServicesGrid from './components/ServicesGrid';
import ServicesPromoBanner from './components/ServicesPromoBanner';

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ServicesHero />
      <ServicesGrid />
      <ServicesPromoBanner />
      <Footer />
    </div>
  );
}
