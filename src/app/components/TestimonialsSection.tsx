'use client';
import React, { useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
{
  id: 'testimonial-juno',
  name: 'Juno Levant',
  role: 'UX Designer',
  quote: 'Linedry saves my weekends! My clothes always come back fresh and neatly folded. Love the pickup and delivery!',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1863bbcdd-1772738965853.png",
  avatarAlt: 'Smiling woman with short blonde hair, professional headshot',
  rating: 5
},
{
  id: 'testimonial-rahul',
  name: 'Rahul Mehta',
  role: 'Software Engineer, Bengaluru',
  quote: 'As a working professional with no time to spare, Linedry is a lifesaver. The weekly subscription pays for itself easily.',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1b5ea51b0-1763293852695.png",
  avatarAlt: 'Young Indian man smiling in casual attire, outdoor background',
  rating: 5
},
{
  id: 'testimonial-priya',
  name: 'Priya Nair',
  role: 'PG Student, Mumbai',
  quote: 'The student bundle is incredible value. ₹299 a week for pickup, wash, and fold? I tell every hostel friend about this.',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1613c5d3c-1763294680610.png",
  avatarAlt: 'Young Indian woman with dark hair smiling, university campus background',
  rating: 5
},
{
  id: 'testimonial-sandeep',
  name: 'Sandeep Verma',
  role: 'Small Business Owner, Delhi',
  quote: 'Premium Care plan handles all my formal wear. The stain pre-treatment actually works — got out a turmeric stain!',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_149bf6de3-1763295161377.png",
  avatarAlt: 'Middle-aged Indian man with glasses smiling confidently, office setting',
  rating: 5
}];


export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => c === 0 ? testimonials?.length - 1 : c - 1);
  const next = () => setCurrent((c) => c === testimonials?.length - 1 ? 0 : c + 1);

  const t = testimonials?.[current];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: heading + image */}
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-secondary mb-3 block">Happy Clients</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-primary mb-4">
              What They Say About
              <br />
              Our Service
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm">
              Say goodbye to laundry day stress. Linedry picks up, cleans, and delivers your laundry — so you can focus on what really matters.
            </p>
            <div className="rounded-2xl overflow-hidden h-64 relative">
              <AppImage
                src="https://images.unsplash.com/photo-1709477542164-ae852db0d019"
                alt="Happy woman smiling while doing laundry in a bright modern laundromat"
                fill
                className="object-cover" />
              
            </div>
          </div>

          {/* Right: testimonial card */}
          <div>
            <div className="bg-white rounded-2xl p-8 border border-border shadow-sm relative">
              <div className="flex items-start gap-4 mb-6">
                <AppImage
                  src={t?.avatar}
                  alt={t?.avatarAlt}
                  width={56}
                  height={56}
                  className="rounded-full object-cover flex-shrink-0" />
                
                <div className="flex-1">
                  <p className="font-bold text-primary text-base">{t?.name}</p>
                  <p className="text-muted-foreground text-xs">{t?.role}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Quote size={16} className="text-secondary" />
                </div>
              </div>

              <p className="text-foreground/80 text-base leading-relaxed font-medium mb-6">
                "{t?.quote}"
              </p>

              <div className="flex items-center gap-1 mb-6">
                {Array.from({ length: t?.rating })?.map((_, si) =>
                <span key={`star-${t?.id}-${si}`} className="text-secondary text-lg">★</span>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {testimonials?.map((_, ti) =>
                  <button
                    key={`dot-${ti}`}
                    onClick={() => setCurrent(ti)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${ti === current ? 'bg-primary w-6' : 'bg-border'}`}
                    aria-label={`Go to testimonial ${ti + 1}`} />

                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={prev}
                    className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white transition-all duration-150"
                    aria-label="Previous testimonial">
                    
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={next}
                    className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center hover:opacity-90 transition-all duration-150"
                    aria-label="Next testimonial">
                    
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>);

}
