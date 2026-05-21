'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bell, Search, ChevronDown, User, Settings } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import NotificationPopover from './NotificationPopover';

function getInitials(name?: string | null, email?: string) {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  if (email) {
    return email.substring(0, 2).toUpperCase();
  }
  return 'U';
}

export default function AppHeader() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [headerData, setHeaderData] = useState({ fullName: '', email: '', avatarUrl: '' });
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, phone, avatar_url')
          .eq('id', user.id)
          .single();

        setHeaderData({
          fullName: profile?.full_name || '',
          email: user.email || '',
          avatarUrl: profile?.avatar_url || '',
        });
      } catch (error) {
        console.error("Error loading header profile:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [supabase]);

  const displayName = headerData.fullName || headerData.email.split('@')[0] || 'User';
  const initials = getInitials(headerData.fullName, headerData.email);

  return (
    <header className="bg-white border-b border-border px-6 lg:px-8 h-16 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search orders, services..."
            className="pl-9 pr-4 py-2 text-sm bg-muted rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 w-64 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <NotificationPopover />

        <div className="relative">
          <button
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-muted transition-colors"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            {isLoading ? (
              <>
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse"></div>
                <div className="h-4 w-24 bg-muted rounded animate-pulse hidden sm:block"></div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full overflow-hidden bg-primary flex items-center justify-center border border-border">
                  {headerData.avatarUrl ? (
                    <Image
                      src={headerData.avatarUrl}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="text-white text-xs font-bold">{initials}</span>
                  )}
                </div>
                <span className="text-sm font-semibold text-foreground hidden sm:block truncate max-w-[120px]">
                  {displayName}
                </span>
                <ChevronDown size={14} className="text-muted-foreground" />
              </>
            )}
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-border py-1 animate-fade-in z-50">
              <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors" onClick={() => setProfileOpen(false)}>
                <User size={14} /> Dashboard
              </Link>
              <Link href="/my-orders" className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors" onClick={() => setProfileOpen(false)}>
                <Settings size={14} /> My Orders
              </Link>
              <div className="h-px bg-border my-1"></div>
              <Link href="/profile-settings" className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors" onClick={() => setProfileOpen(false)}>
                <Settings size={14} /> Profile & Settings
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
