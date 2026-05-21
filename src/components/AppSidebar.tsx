'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import {
  LayoutDashboard,
  ShoppingBag,
  CalendarCheck,
  MapPin,
  Crown,
  Wallet,
  UserCog,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: ShoppingBag, label: 'My Orders', href: '/my-orders' },
  { icon: CalendarCheck, label: 'Schedule Pickup', href: '/schedule-pickup' },
  { icon: MapPin, label: 'Manage Addresses', href: '/manage-addresses' },
  { icon: Crown, label: 'My Subscriptions', href: '/my-subscriptions' },
  { icon: Wallet, label: 'Payments & Wallet', href: '/payments-wallet' },
  { icon: UserCog, label: 'Profile & Settings', href: '/profile-settings' },
  { icon: HelpCircle, label: 'Help & Support', href: '/help-support' },
];

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`hidden lg:flex flex-col bg-primary transition-all duration-300 ease-in-out ${
        collapsed ? 'w-16' : 'w-56'
      } min-h-screen sticky top-0 h-screen`}
    >
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b border-white/10 ${collapsed ? 'justify-center' : 'gap-2'}`}>
        <AppLogo size={32} />
        {!collapsed && (
          <span className="font-extrabold text-white text-sm tracking-tight">LINEDRY</span>
        )}
      </div>
      {/* Nav */}
      <nav className="flex-1 px-2 py-4 flex flex-col gap-1 overflow-y-auto">
        {navItems?.map((item) => {
          const isActive = pathname === item?.href || (item?.href !== '/' && pathname?.startsWith(item?.href));
          return (
            <Link
              key={`sidebar-${item?.label}`}
              href={item?.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative ${
                isActive
                  ? 'bg-secondary text-secondary-foreground'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <item.icon size={18} className="flex-shrink-0" />
              {!collapsed && (
                <span className="text-sm font-semibold">{item?.label}</span>
              )}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2 py-1 bg-foreground text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  {item?.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="m-3 p-2 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all duration-150 flex items-center justify-center"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}
