import React from 'react';
import { PackageCheck, Truck, Sparkles, Calendar, Clock } from 'lucide-react';
import { Database } from '@/types/supabase';
import { ListItemSkeleton } from '@/components/ui/Skeleton';

type Order = Database['public']['Tables']['orders']['Row'];

interface Props {
  activeOrders: Order[];
  isLoading: boolean;
}

export default function RecentActivity({ activeOrders, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-border p-4 md:p-6">
        <div className="h-4 w-32 bg-muted rounded mb-5 animate-pulse"></div>
        <div className="space-y-4">
          <ListItemSkeleton />
          <ListItemSkeleton />
          <ListItemSkeleton />
        </div>
      </div>
    );
  }

  if (!activeOrders || activeOrders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-border p-4 md:p-6 text-center text-muted-foreground text-sm">
        No recent activity to show.
      </div>
    );
  }

  const activities = activeOrders.map((order, index) => {
    let icon = Clock;
    let color = 'bg-blue-50 text-blue-600';
    let title = `Order placed`;

    if (order.status === 'out_for_delivery') {
      icon = Truck;
      color = 'bg-orange-50 text-orange-600';
      title = `Order out for delivery`;
    } else if (order.status === 'in_wash') {
      icon = Sparkles;
      color = 'bg-purple-50 text-purple-600';
      title = `Order is processing`;
    } else if (order.status === 'picked_up') {
      icon = PackageCheck;
      color = 'bg-green-50 text-green-600';
      title = `Order picked up`;
    } else if (order.status === 'confirmed') {
      icon = Calendar;
      color = 'bg-yellow-50 text-yellow-600';
      title = `Pickup confirmed`;
    }

    return {
      id: `act-${order.id}`,
      icon,
      color,
      title: `${title} (#${order.id.slice(0, 8).toUpperCase()})`,
      desc: `${order.service_type.replace('_', ' ')} — ₹${order.total_amount || 0}`,
      time: order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'N/A',
    };
  });

  return (
    <div className="bg-white rounded-2xl border border-border p-4 md:p-6">
      <h2 className="font-extrabold text-base text-primary mb-4 md:mb-5">Recent Activity</h2>
      <div className="space-y-3 md:space-y-4">
        {activities?.map((a) => (
          <div key={a?.id} className="flex items-start gap-3 md:gap-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${a?.color}`}>
              <a.icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-primary truncate">{a?.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate capitalize">{a?.desc}</p>
            </div>
            <p className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">{a?.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
