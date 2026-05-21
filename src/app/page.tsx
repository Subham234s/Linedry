import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from './components/HeroSection';
import StatsSection from './components/StatsSection';
import HowItWorksSection from './components/HowItWorksSection';
import ServicesPreviewSection from './components/ServicesPreviewSection';
import PromoBanner from './components/PromoBanner';
import TestimonialsSection from './components/TestimonialsSection';
import BlogSection from './components/BlogSection';
import LocationsSection from './components/LocationsSection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <StatsSection />
      <HowItWorksSection />
      <ServicesPreviewSection />
      <PromoBanner />
      <TestimonialsSection />
      <BlogSection />
      <LocationsSection />
      <Footer />
    </div>
  );
}
