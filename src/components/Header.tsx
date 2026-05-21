'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import { Menu, X } from 'lucide-react';

const navLinks = [
{ label: 'Home', href: '/' },
{ label: 'Services', href: '/services-page' },
{ label: 'Pricing', href: '/pricing-page' },
{ label: 'Contact', href: '/contact' }];


export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-border' : 'bg-transparent'}`
      }>

      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <AppLogo size={36} />
          <span className="font-extrabold text-xl tracking-tight text-slate-950">LINEDRY</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks?.map((link) =>
          <Link
            key={`nav-${link?.label}`}
            href={link?.href}
            className="text-sm font-semibold hover:text-primary transition-colors duration-150 text-[#000]">

              {link?.label}
            </Link>
          )}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/auth"
            className="text-sm font-semibold px-4 py-2 rounded-full border border-primary/20 hover:bg-primary/5 transition-all duration-150 text-zinc-950">

            Log In
          </Link>
          <Link
            href="/auth"
            className="text-sm font-semibold bg-secondary text-secondary-foreground px-5 py-2 rounded-full hover:opacity-90 active:scale-95 transition-all duration-150">

            Book Now
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-foreground hover:bg-muted transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu">

          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {/* Mobile Drawer */}
      {mobileOpen &&
      <div className="md:hidden bg-white border-t border-border animate-slide-up">
          <div className="px-6 py-4 flex flex-col gap-4">
            {navLinks?.map((link) =>
          <Link
            key={`mobile-nav-${link?.label}`}
            href={link?.href}
            className="text-sm font-semibold text-foreground/80 hover:text-primary py-2 border-b border-border/50 transition-colors"
            onClick={() => setMobileOpen(false)}>

                {link?.label}
              </Link>
          )}
            <div className="flex flex-col gap-3 pt-2">
              <Link
              href="/auth"
              className="text-center text-sm font-semibold text-primary px-4 py-2.5 rounded-full border border-primary/20"
              onClick={() => setMobileOpen(false)}>

                Log In
              </Link>
              <Link
              href="/auth"
              className="text-center text-sm font-semibold bg-secondary text-secondary-foreground px-5 py-2.5 rounded-full"
              onClick={() => setMobileOpen(false)}>

                Book Now
              </Link>
            </div>
          </div>
        </div>
      }
    </header>);

}
