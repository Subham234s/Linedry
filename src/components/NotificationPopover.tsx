'use client';
import React, { useState, useRef, useEffect } from 'react';
import {
  Bell, Package, CreditCard, Wallet, Sparkles, Check,
  CheckCheck, BellOff, X,
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

// ─── Relative time formatter (no dependencies) ───────────────────────────────

function timeAgo(isoDate: string): string {
  const now = Date.now();
  const past = new Date(isoDate).getTime();
  const diffMs = now - past;
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(isoDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

// ─── Icon by notification type ────────────────────────────────────────────────

const typeConfig: Record<string, { icon: typeof Package; bgColor: string; iconColor: string }> = {
  order: { icon: Package, bgColor: 'bg-blue-50', iconColor: 'text-blue-500' },
  subscription: { icon: CreditCard, bgColor: 'bg-purple-50', iconColor: 'text-purple-500' },
  wallet: { icon: Wallet, bgColor: 'bg-green-50', iconColor: 'text-green-500' },
  promo: { icon: Sparkles, bgColor: 'bg-amber-50', iconColor: 'text-amber-500' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function NotificationPopover() {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      return () => document.removeEventListener('keydown', handleKey);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={popoverRef}>
      {/* ── Trigger Button ──────────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-muted transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell size={18} className="text-foreground/70" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Popover Dropdown ────────────────────────────────────────── */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[360px] max-h-[480px] bg-white rounded-2xl shadow-2xl border border-border overflow-hidden animate-fade-in z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-gradient-to-r from-primary/[0.03] to-transparent">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-primary">Notifications</h3>
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-xs font-bold text-secondary hover:underline px-2 py-1 rounded-lg hover:bg-secondary/5 transition-colors"
                >
                  <CheckCheck size={12} /> Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                aria-label="Close notifications"
              >
                <X size={14} className="text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="overflow-y-auto max-h-[400px]">
            {isLoading ? (
              <div className="space-y-0">
                {[1, 2, 3].map(i => (
                  <div key={`notif-skel-${i}`} className="flex items-start gap-3 p-4 animate-pulse border-b border-border/50">
                    <div className="w-9 h-9 rounded-xl bg-muted flex-shrink-0" />
                    <div className="flex-1">
                      <div className="w-32 h-4 bg-muted rounded mb-1.5" />
                      <div className="w-full h-3 bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              /* ── Empty State ──────────────────────────────────────── */
              <div className="flex flex-col items-center justify-center py-14 px-6">
                <div className="w-16 h-16 rounded-2xl bg-muted/80 flex items-center justify-center mb-4">
                  <BellOff size={28} className="text-muted-foreground/50" />
                </div>
                <p className="text-sm font-bold text-primary mb-1">All caught up!</p>
                <p className="text-xs text-muted-foreground text-center">
                  No notifications right now. We&apos;ll let you know when something important happens.
                </p>
              </div>
            ) : (
              /* ── Notification List ───────────────────────────────── */
              <div>
                {notifications.map((notif) => {
                  const config = typeConfig[notif.type] || typeConfig.promo;
                  const IconComponent = config.icon;

                  return (
                    <button
                      key={notif.id}
                      onClick={() => {
                        if (!notif.is_read) markAsRead(notif.id);
                      }}
                      className={`w-full flex items-start gap-3 p-4 text-left transition-colors border-b border-border/50 last:border-b-0 ${
                        notif.is_read
                          ? 'bg-white hover:bg-muted/30'
                          : 'bg-primary/[0.03] hover:bg-primary/[0.06]'
                      }`}
                    >
                      {/* Icon */}
                      <div className={`w-9 h-9 rounded-xl ${config.bgColor} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <IconComponent size={16} className={config.iconColor} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm leading-tight ${
                            notif.is_read ? 'font-semibold text-foreground/70' : 'font-extrabold text-primary'
                          }`}>
                            {notif.title}
                          </p>
                          {!notif.is_read && (
                            <span className="w-2 h-2 rounded-full bg-secondary flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1.5 font-semibold">
                          {timeAgo(notif.created_at)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
