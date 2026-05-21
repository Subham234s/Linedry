'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import { Clock, CheckCircle, ArrowRight } from 'lucide-react';

const categories = ['All', 'Everyday', 'Premium', 'Specialty'];

const services = [
{
  id: 'svc-detail-wash-fold',
  category: 'Everyday',
  title: 'Wash & Fold',
  tagline: 'Your everyday clean, done right.',
  price: '₹79',
  unit: '/ kg',
  turnaround: '24–48 hours',
  image: "https://images.unsplash.com/photo-1702971916926-948dd75f0898",
  alt: 'Modern washing machines in a bright professional laundry facility with clean clothes',
  tag: 'Most Popular',
  tagColor: 'bg-green-100 text-green-700',
  includes: [
  'Machine wash (30°–40°C)',
  'Tumble dry on low heat',
  'Neatly folded & packed',
  'Fragrance included',
  'Up to 7 kg per order']

},
{
  id: 'svc-detail-iron',
  category: 'Everyday',
  title: 'Iron & Fold',
  tagline: 'Crisp, wrinkle-free every time.',
  price: '₹15',
  unit: '/ piece',
  turnaround: '24 hours',
  image: "https://images.unsplash.com/photo-1678517098327-ae5a2b07c410",
  alt: 'Neatly pressed and folded white shirts on a clean ironing board surface',
  tag: 'Popular',
  tagColor: 'bg-blue-100 text-blue-700',
  includes: [
  'Steam ironing',
  'Collar & cuff pressing',
  'Hanger or folded option',
  'Per-piece pricing',
  'Formal & casual wear']

},
{
  id: 'svc-detail-express',
  category: 'Everyday',
  title: 'Express Wash',
  tagline: 'Clean clothes in 6 hours flat.',
  price: '₹99',
  unit: '/ kg',
  turnaround: '6 hours',
  image: "https://images.unsplash.com/photo-1646217355995-5c6a9e7fd2aa",
  alt: 'Fast spinning washing machine drum with colorful clothes in motion',
  tag: '6-Hour',
  tagColor: 'bg-orange-100 text-orange-700',
  includes: [
  'Priority processing',
  'Express wash & dry',
  'Same-day delivery',
  'SMS updates',
  'Available Mon–Sat']

},
{
  id: 'svc-detail-dry-clean',
  category: 'Premium',
  title: 'Dry Cleaning',
  tagline: 'Professional care for delicates.',
  price: '₹199',
  unit: '/ piece',
  turnaround: '48–72 hours',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_191c12766-1772905507206.png",
  alt: 'Formal suits and delicate garments hanging neatly in dry cleaning plastic bags',
  tag: 'Premium',
  tagColor: 'bg-purple-100 text-purple-700',
  includes: [
  'Chemical solvent cleaning',
  'Stain pre-treatment',
  'Suits, sarees, blazers',
  'Delicate fabric care',
  'Individual garment bagging']

},
{
  id: 'svc-detail-bedding',
  category: 'Specialty',
  title: 'Bedding Care',
  tagline: 'Fresh bed linens, zero effort.',
  price: '₹149',
  unit: '/ set',
  turnaround: '48 hours',
  image: "https://images.unsplash.com/photo-1620506476819-1adb37c6ef65",
  alt: 'Fresh white bed linens and pillowcases neatly folded and stacked',
  tag: 'Specialty',
  tagColor: 'bg-teal-100 text-teal-700',
  includes: [
  'Bedsheets & pillowcases',
  'Duvet covers',
  'High-temp wash (60°C)',
  'Anti-allergen treatment',
  'Folded & bagged']

},
{
  id: 'svc-detail-student',
  category: 'Everyday',
  title: 'Student Bundle',
  tagline: 'The PG & hostel student plan.',
  price: '₹299',
  unit: '/ week',
  turnaround: '24–48 hours',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_187f85c94-1772782290418.png",
  alt: 'Young student organizing clean laundry in a bright dormitory room',
  tag: 'Best Value',
  tagColor: 'bg-secondary/20 text-secondary-foreground',
  includes: [
  '2 pickups per week',
  'Wash, Dry & Fold',
  'Up to 5 kg per load',
  'Free fragrance',
  'Hostel-friendly bags']

}];


export default function ServicesGrid() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All' ?
  services :
  services?.filter((s) => s?.category === activeCategory);

  return (
    <section className="py-12 bg-background">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        {/* Category Filters */}
        <div className="flex gap-2 flex-wrap mb-10">
          {categories?.map((cat) =>
          <button
            key={`cat-${cat}`}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-150 ${
            activeCategory === cat ?
            'bg-primary text-white' : 'bg-white border border-border text-foreground/70 hover:border-primary/30 hover:text-primary'}`
            }>
            
              {cat}
            </button>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered?.map((svc) =>
          <div
            key={svc?.id}
            className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col">
            
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <AppImage
                src={svc?.image}
                alt={svc?.alt}
                fill
                className="object-cover" />
              
                <span className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full ${svc?.tagColor}`}>
                  {svc?.tag}
                </span>
              </div>

              <div className="p-6 flex flex-col flex-1">
                {/* Header */}
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-extrabold text-lg text-primary">{svc?.title}</h3>
                  <div className="text-right flex-shrink-0 ml-2">
                    <span className="text-xl font-extrabold text-primary font-tabular">{svc?.price}</span>
                    <span className="text-xs text-muted-foreground ml-0.5">{svc?.unit}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{svc?.tagline}</p>

                {/* Turnaround */}
                <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 mb-4">
                  <Clock size={12} />
                  Turnaround: {svc?.turnaround}
                </div>

                {/* Includes */}
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">What's Included</p>
                  <ul className="space-y-1.5">
                    {svc?.includes?.map((inc) =>
                  <li key={`${svc?.id}-inc-${inc}`} className="flex items-center gap-2 text-xs text-foreground/70">
                        <CheckCircle size={12} className="text-green-500 flex-shrink-0" />
                        {inc}
                      </li>
                  )}
                  </ul>
                </div>

                {/* CTA */}
                <Link
                href="/auth"
                className="mt-5 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl text-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all duration-150">
                
                  Book Now <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>);

}
