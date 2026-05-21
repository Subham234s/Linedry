'use client';
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    id: 'faq-cancel',
    q: 'Can I cancel my subscription anytime?',
    a: 'Yes, you can cancel your Weekly Saver or Premium Care plan at any time before the next billing cycle. No cancellation fees.',
  },
  {
    id: 'faq-weight',
    q: 'What happens if my laundry exceeds the plan weight?',
    a: 'Extra weight is charged at ₹79/kg for Weekly Saver and ₹99/kg for Premium Care. You\'ll be notified before we process.',
  },
  {
    id: 'faq-pickup',
    q: 'How many pickups are included in Basic Wash?',
    a: 'Basic Wash is a pay-per-use service. You schedule and pay per order. No subscription commitment required.',
  },
  {
    id: 'faq-payment',
    q: 'What payment methods are accepted?',
    a: 'We accept all major UPI apps (GPay, PhonePe, Paytm), debit/credit cards, and net banking through our secure gateway.',
  },
  {
    id: 'faq-stain',
    q: 'Is stain pre-treatment available on Basic Wash?',
    a: 'Stain pre-treatment is included as standard in Premium Care. For Basic and Weekly Saver plans, it can be added for ₹49 per item.',
  },
  {
    id: 'faq-area',
    q: 'Which cities does Linedry currently serve?',
    a: 'We currently operate in Kolkata (Park Street area), Mumbai, and Delhi. We\'re expanding — sign up to be notified when we reach your area.',
  },
];

export default function PricingFAQ() {
  const [open, setOpen] = useState<string | null>('faq-cancel');

  return (
    <section className="py-20 bg-background">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="lg:sticky lg:top-24">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-secondary mb-3 block">Got Questions?</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-primary leading-tight">
              Frequently Asked
              <br />
              Questions
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mt-4 max-w-sm">
              Everything you need to know about Linedry plans. Can't find your answer?{' '}
              <a href="#" className="text-primary font-semibold hover:underline">Contact us</a>.
            </p>
          </div>

          <div className="space-y-3">
            {faqs?.map((faq) => (
              <div key={faq?.id} className="bg-white rounded-2xl border border-border overflow-hidden">
                <button
                  onClick={() => setOpen(open === faq?.id ? null : faq?.id)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-muted/50 transition-colors"
                  aria-expanded={open === faq?.id}
                >
                  <span className="text-sm font-bold text-primary pr-4">{faq?.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-muted-foreground flex-shrink-0 transition-transform duration-200 ${open === faq?.id ? 'rotate-180' : ''}`}
                  />
                </button>
                {open === faq?.id && (
                  <div className="px-6 pb-4 animate-fade-in">
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq?.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
