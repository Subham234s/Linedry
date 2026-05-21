'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, CalendarCheck, UserCog, Wallet } from 'lucide-react';

const bottomNavItems = [
  { icon: LayoutDashboard, label: 'Home', href: '/dashboard' },
  { icon: ShoppingBag, label: 'Orders', href: '/my-orders' },
  { icon: CalendarCheck, label: 'Book Now', href: '/schedule-pickup' },
  { icon: Wallet, label: 'Wallet', href: '/payments-wallet' },
  { icon: UserCog, label: 'Profile', href: '/profile-settings' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full z-50 bg-white border-t border-border flex md:hidden">
      {bottomNavItems?.map((item) => {
        const isActive = pathname === item?.href || (item?.href !== '/' && pathname?.startsWith(item?.href));
        return (
          <Link
            key={item?.href}
            href={item?.href}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 min-h-[56px] transition-colors ${
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <item.icon size={20} className={isActive ? 'text-primary' : ''} />
            <span className={`text-[10px] font-semibold ${isActive ? 'text-primary' : ''}`}>{item?.label}</span>
            {isActive && <span className="absolute bottom-0 w-8 h-0.5 bg-primary rounded-t-full" />}
          </Link>
        );
      })}
    </nav>
  );
}
