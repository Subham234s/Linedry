'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Phone, Mail } from 'lucide-react';

const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);

const footerCompanyLinks = [
  { label: 'About Us', href: '#' },
  { label: 'Our Services', href: '/services-page' },
  { label: 'Contact', href: '/contact' },
  { label: 'Pricing', href: '/pricing-page' },
];

const footerLegalLinks = [
  { label: 'Terms & Conditions', href: '#' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'FAQs', href: '#' },
];

const socialLinks = [
  { icon: InstagramIcon, href: '#', label: 'Instagram' },
  { icon: FacebookIcon, href: '#', label: 'Facebook' },
  { icon: TwitterIcon, href: '#', label: 'Twitter' },
];

export default function Footer() {
  const [email, setEmail] = useState('');

  return (
    <footer className="bg-[#111827] text-white">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-16">
        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* Column 1: Brand */}
          <div>
            <div className="mb-4">
              <span className="font-extrabold text-2xl tracking-tight text-white">Linedry</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
              Clean clothes, zero hassle. We pick up, wash, and deliver fresh laundry right to your door.
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <Phone size={14} className="text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Customer Support</p>
                <a
                  href="tel:+919876543210"
                  className="text-sm font-semibold text-white hover:text-yellow-400 transition-colors duration-200"
                  aria-label="Call customer support at +91 98765 43210"
                >
                  +91 98765 43210
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <Mail size={14} className="text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Email Us</p>
                <a
                  href="mailto:hello@linedry.in"
                  className="text-sm font-semibold text-white hover:text-yellow-400 transition-colors duration-200"
                  aria-label="Email Linedry at hello@linedry.in"
                >
                  hello@linedry.in
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Company */}
          <div>
            <h4 className="font-bold text-sm text-white mb-5 tracking-wide uppercase">Company</h4>
            <ul className="flex flex-col gap-3">
              {footerCompanyLinks?.map((link) => (
                <li key={`company-${link?.label}`}>
                  <Link
                    href={link?.href}
                    className="text-sm text-gray-400 hover:text-yellow-400 transition-colors duration-200"
                  >
                    {link?.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Legal & Support */}
          <div>
            <h4 className="font-bold text-sm text-white mb-5 tracking-wide uppercase">Legal & Support</h4>
            <ul className="flex flex-col gap-3">
              {footerLegalLinks?.map((link) => (
                <li key={`legal-${link?.label}`}>
                  <Link
                    href={link?.href}
                    className="text-sm text-gray-400 hover:text-yellow-400 transition-colors duration-200"
                  >
                    {link?.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter & Socials */}
          <div>
            <h4 className="font-bold text-sm text-white mb-5 tracking-wide uppercase">Stay Updated</h4>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
              Get laundry tips and exclusive offers in your inbox.
            </p>
            <div className="flex flex-col gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e?.target?.value)}
                placeholder="Enter your email"
                aria-label="Email address for newsletter"
                className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all duration-200"
              />
              <button
                type="button"
                aria-label="Subscribe to newsletter"
                className="w-full px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg text-sm font-bold transition-colors duration-200 active:scale-95"
              >
                Subscribe
              </button>
            </div>

            {/* Social Icons */}
            <div className="mt-6">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">Follow Us</p>
              <div className="flex gap-3">
                {socialLinks?.map((s) => (
                  <a
                    key={`social-${s?.label}`}
                    href={s?.href}
                    aria-label={`Follow Linedry on ${s?.label}`}
                    className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-yellow-400 hover:text-gray-900 text-gray-400 transition-all duration-200"
                  >
                    <s.icon />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-xs">© 2026 Linedry — Laundry Service. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="text-gray-500 text-xs hover:text-gray-300 transition-colors duration-200">Privacy Policy</a>
            <a href="#" className="text-gray-500 text-xs hover:text-gray-300 transition-colors duration-200">Terms of Service</a>
            <a href="#" className="text-gray-500 text-xs hover:text-gray-300 transition-colors duration-200">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
