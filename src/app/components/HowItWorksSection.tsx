import React from 'react';
import { CalendarDays, Truck, Sparkles, PackageCheck } from 'lucide-react';

const steps = [
  {
    id: 'step-schedule',
    icon: CalendarDays,
    step: '01',
    title: 'Schedule Pickup',
    desc: 'Choose a convenient time slot. We\'ll confirm your booking instantly via SMS.',
  },
  {
    id: 'step-collect',
    icon: Truck,
    step: '02',
    title: 'We Collect',
    desc: 'Our rider arrives at your door to collect your laundry in our branded bag.',
  },
  {
    id: 'step-clean',
    icon: Sparkles,
    step: '03',
    title: 'Clean & Fold',
    desc: 'Expert washing, drying, and folding at our facility. Stain treatment included.',
  },
  {
    id: 'step-deliver',
    icon: PackageCheck,
    step: '04',
    title: 'Delivered to You',
    desc: 'Fresh, clean clothes delivered back to your door within 24–48 hours.',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-secondary mb-3 block">Simple Process</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-primary">How Linedry Works</h2>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto text-base">
            Four simple steps to clean clothes. No hassle, no waiting, no stress.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps?.map((step, i) => (
            <div key={step?.id} className="relative">
              {/* Connector line */}
              {i < steps?.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-full w-full h-px bg-border z-0 -translate-x-1/2"></div>
              )}
              <div className="bg-white rounded-2xl p-6 border border-border hover:shadow-md transition-shadow duration-200 relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                    <step.icon size={22} className="text-secondary" />
                  </div>
                  <span className="text-3xl font-extrabold text-muted/80 font-tabular">{step?.step}</span>
                </div>
                <h3 className="font-bold text-base text-primary mb-2">{step?.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step?.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
