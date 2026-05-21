import React from 'react';
import { Clock, MapPin, CalendarDays } from 'lucide-react';
import { Database } from '@/types/supabase';
import Link from 'next/link';

type Order = Database['public']['Tables']['orders']['Row'];

interface Props {
  upcomingOrder?: Order;
  isLoading: boolean;
}

export default function UpcomingPickupCard({ upcomingOrder, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="bg-primary rounded-2xl p-6 h-[220px] animate-pulse">
        <div className="flex justify-between mb-4">
          <div className="h-4 w-24 bg-white/20 rounded"></div>
          <div className="h-6 w-20 bg-white/20 rounded-full"></div>
        </div>
        <div className="h-8 w-32 bg-white/20 rounded mb-2"></div>
        <div className="h-4 w-24 bg-white/20 rounded mb-6"></div>
        <div className="space-y-3">
          <div className="h-4 w-3/4 bg-white/20 rounded"></div>
          <div className="h-4 w-5/6 bg-white/20 rounded"></div>
        </div>
      </div>
    );
  }

  if (!upcomingOrder) {
    return (
      <div className="bg-muted rounded-2xl p-6 border border-border flex flex-col items-center justify-center text-center h-[220px]">
        <CalendarDays size={32} className="text-muted-foreground mb-3" />
        <h2 className="font-extrabold text-sm text-primary mb-1">No Upcoming Pickups</h2>
        <p className="text-xs text-muted-foreground mb-4">Schedule your next pickup today.</p>
        <Link href="/schedule-pickup" className="text-xs font-bold text-secondary hover:text-secondary/80 transition-colors">
          Schedule Now →
        </Link>
      </div>
    );
  }

  const pickupDate = new Date(upcomingOrder.pickup_date || '');
  const formattedDate = pickupDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const dayName = pickupDate.toLocaleDateString('en-IN', { weekday: 'long' });

  return (
    <div className="bg-primary rounded-2xl p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-extrabold text-sm">Next Pickup</h2>
        <span className="text-xs font-bold bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full capitalize">
          {upcomingOrder.status}
        </span>
      </div>

      <p className="text-3xl font-extrabold mb-1">{dayName}</p>
      <p className="text-white/60 text-sm">{formattedDate}</p>

      <div className="mt-4 space-y-2.5">
        <div className="flex items-center gap-2.5 text-white/80 text-sm">
          <Clock size={14} className="text-secondary flex-shrink-0" />
          {upcomingOrder.pickup_slot}
        </div>
        <div className="flex items-center gap-2.5 text-white/80 text-sm">
          <MapPin size={14} className="text-secondary flex-shrink-0" />
          <span className="truncate">View in address manager</span>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
        <p className="text-white/50 text-xs capitalize">{upcomingOrder.service_type.replace('_', ' ')}</p>
        <Link href="/my-orders" className="text-xs font-bold text-secondary hover:text-secondary/80 transition-colors">
          View Details →
        </Link>
      </div>
    </div>
  );
}
