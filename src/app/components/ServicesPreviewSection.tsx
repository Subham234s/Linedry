import React from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import { ArrowRight } from 'lucide-react';

const services = [
{
  id: 'svc-iron-fold',
  title: 'Iron & Fold',
  price: 'From ₹15/piece',
  image: "https://images.unsplash.com/photo-1678517098327-ae5a2b07c410",
  alt: 'Neatly pressed and folded white shirts on a clean surface',
  tag: 'Popular'
},
{
  id: 'svc-bedding',
  title: 'Bedding Care',
  price: 'From ₹149/set',
  image: "https://images.unsplash.com/photo-1620506476819-1adb37c6ef65",
  alt: 'Fresh white bed linens and pillowcases neatly folded',
  tag: ''
},
{
  id: 'svc-student',
  title: 'Student Bundle',
  price: '₹299/week',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1639cf5d8-1775453124390.png",
  alt: 'Young student sorting laundry in a hostel room',
  tag: 'Best Value'
},
{
  id: 'svc-express',
  title: 'Express Wash',
  price: 'From ₹79/kg',
  image: "https://images.unsplash.com/photo-1702971916926-948dd75f0898",
  alt: 'Modern washing machines in a bright professional laundry facility',
  tag: '6-Hour'
},
{
  id: 'svc-dry-clean',
  title: 'Dry Cleaning',
  price: 'From ₹199/piece',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_191c12766-1772905507206.png",
  alt: 'Formal suits and delicate garments hanging in dry cleaning bags',
  tag: ''
},
{
  id: 'svc-premium',
  title: 'Premium Garment',
  price: 'From ₹249/piece',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1e19d73e1-1772090789628.png",
  alt: 'Elegant designer clothing displayed in a boutique setting',
  tag: 'Premium'
}];


export default function ServicesPreviewSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-secondary mb-3 block">What We Offer</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-primary">Our Services</h2>
          </div>
          <Link
            href="/services-page"
            className="hidden md:inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/70 transition-colors">
            
            View All Services <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-5">
          {services?.map((svc) =>
          <div
            key={svc?.id}
            className="group relative bg-background rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            
              <div className="relative h-48 overflow-hidden">
                <AppImage
                src={svc?.image}
                alt={svc?.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500" />
              
                {svc?.tag &&
              <span className="absolute top-3 left-3 bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    {svc?.tag}
                  </span>
              }
              </div>
              <div className="p-5">
                <h3 className="font-bold text-base text-primary">{svc?.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{svc?.price}</p>
                <Link
                href="/services-page"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/70 transition-colors">
                
                  Book Now <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            href="/services-page"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary">
            
            View All Services <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>);

}
