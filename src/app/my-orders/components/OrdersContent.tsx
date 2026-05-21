'use client';
import React, { useState, useEffect } from 'react';
import { Search, Eye, HelpCircle, CheckCircle, Clock, Crown, BadgePercent } from 'lucide-react';
import OrderDetailPanel from './OrderDetailPanel';
import DownloadReceiptButton from './DownloadReceiptButton';
import OrderSupportModal from './OrderSupportModal';
import type { ReceiptOrderData } from '@/components/ReceiptPDF';
import { useOrders } from '@/hooks/useOrders';
import { useEntitlements } from '@/components/SubscriptionProvider';
import { Database } from '@/types/supabase';
import { ListItemSkeleton } from '@/components/ui/Skeleton';

type OrderRow = Database['public']['Tables']['orders']['Row'];
type OrderStatus = 'Pending' | 'Confirmed' | 'Picked Up' | 'Processing' | 'In Wash' | 'Out for Delivery' | 'Delivered';

type BillingType = 'subscription' | 'paid' | 'pending';

interface UIOrder {
  id: string;
  orderNo: string;
  service: string;
  pickupDate: string;
  deliveryDate: string;
  weight: string;
  amount: string;
  amountNumeric: number;
  billingType: BillingType;
  status: OrderStatus;
  items: string;
  address: string;
}

const statusColors: Record<OrderStatus, string> = {
  'Pending': 'status-pending',
  'Confirmed': 'status-pending', // use pending styling for confirmed
  'Picked Up': 'status-picked-up',
  'Processing': 'status-processing',
  'In Wash': 'status-processing', // reuse processing styling
  'Out for Delivery': 'status-out-for-delivery',
  'Delivered': 'status-delivered',
};

const allStatuses: OrderStatus[] = ['Pending', 'Picked Up', 'In Wash', 'Out for Delivery', 'Delivered'];

// ─── Helper: map Database Order → UI Order ────────────────────────────────────

function mapToUIOrder(order: OrderRow): UIOrder {
  // Normalize the DB status to match the UI status map
  let uiStatus: OrderStatus = 'Pending';
  const rawStatus = order.status.toLowerCase();
  
  if (rawStatus === 'confirmed') uiStatus = 'Confirmed';
  else if (rawStatus === 'picked_up') uiStatus = 'Picked Up';
  else if (rawStatus === 'processing') uiStatus = 'Processing';
  else if (rawStatus === 'in_wash') uiStatus = 'In Wash';
  else if (rawStatus === 'out_for_delivery') uiStatus = 'Out for Delivery';
  else if (rawStatus === 'delivered' || rawStatus === 'completed') uiStatus = 'Delivered';

  // Determine billing type and format amount
  const rawAmount = order.total_amount ?? 0;
  let billingType: BillingType = 'pending';
  let amountStr = 'Pending';

  if (rawAmount > 0) {
    billingType = 'paid';
    amountStr = `₹${rawAmount.toLocaleString('en-IN')}`;
  } else if (rawAmount === 0 && order.weight_kg && order.weight_kg > 0) {
    // Has weight but zero amount → covered by subscription
    billingType = 'subscription';
    amountStr = '₹0';
  }
  
  // Format dates in human-readable format
  const pickup = order.pickup_date
    ? new Date(order.pickup_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'TBD';
  
  let delivery = 'TBD';
  if (order.pickup_date) {
    const dDate = new Date(order.pickup_date);
    dDate.setDate(dDate.getDate() + 2);
    delivery = dDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  // Weight from DB
  const weight = order.weight_kg ? `${order.weight_kg} kg` : 'Checked at pickup';

  return {
    id: order.id,
    orderNo: `LD-${order.id.slice(0, 8).toUpperCase()}`,
    service: order.service_type.replace(/_/g, ' '),
    pickupDate: pickup,
    deliveryDate: delivery,
    weight,
    amount: amountStr,
    amountNumeric: rawAmount,
    billingType,
    status: uiStatus,
    items: order.weight_kg ? `~${Math.ceil(order.weight_kg * 3)} items (est.)` : 'Counted at pickup',
    address: 'View in address manager',
  };
}

// ─── Helper: map UI Order → ReceiptOrderData ────────────────────────────────────

function buildReceiptData(order: UIOrder): ReceiptOrderData {
  const amountNum = parseFloat(order.amount.replace(/[₹,]/g, '')) || 0;
  const subtotal = parseFloat((amountNum / 1.18).toFixed(2));
  const cgst = parseFloat((subtotal * 0.09).toFixed(2));
  const sgst = parseFloat((subtotal * 0.09).toFixed(2));
  const grandTotal = parseFloat((subtotal + cgst + sgst).toFixed(2));

  const items = [
    { description: order.service, qty: '1 lot', unitPrice: subtotal, total: subtotal }
  ];

  return {
    orderNo: order.orderNo,
    orderDate: order.pickupDate,
    paymentMethod: 'Online Payment',
    customerName: 'Customer', // Would come from profile ideally
    customerPhone: '',
    deliveryAddress: order.address,
    items,
    subtotal,
    cgst,
    sgst,
    grandTotal,
  };
}

// ─── Smart Price Display ──────────────────────────────────────────────────────

function SmartPriceDisplay({ order, hasSubscription }: { order: UIOrder; hasSubscription: boolean }) {
  if (order.billingType === 'subscription') {
    return (
      <div className="flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-lg">
          <CheckCircle size={12} />
          Included in Plan
        </span>
      </div>
    );
  }

  if (order.billingType === 'pending') {
    if (hasSubscription) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-lg">
          <Crown size={12} />
          Prepaid via Plan
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
        <Clock size={12} />
        To be invoiced
      </span>
    );
  }

  // billingType === 'paid'
  return (
    <p className="text-lg font-extrabold text-primary font-tabular">{order.amount}</p>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OrdersContent() {
  const { orders: dbOrders, isLoading, fetchOrders } = useOrders();
  const { isActive: hasActiveSubscription } = useEntitlements();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
  const [selectedOrder, setSelectedOrder] = useState<UIOrder | null>(null);
  const [supportOrder, setSupportOrder] = useState<UIOrder | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 6;

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const uiOrders = dbOrders.map(mapToUIOrder);

  const filtered = uiOrders.filter((o) => {
    const matchSearch = o.orderNo.toLowerCase().includes(search.toLowerCase()) ||
      o.service.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-primary">My Orders</h1>
          <p className="text-muted-foreground text-xs md:text-sm mt-1">{filtered.length} orders found</p>
        </div>
        <a
          href="/schedule-pickup"
          className="hidden md:inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-5 py-2.5 rounded-full text-sm font-bold hover:opacity-90 active:scale-95 transition-all duration-150 flex-shrink-0"
        >
          New Pickup
        </a>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-border p-3 md:p-4">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by order number or service..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 h-12 text-sm bg-muted rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 snap-x">
            {(['All', ...allStatuses] as const).map((s) => (
              <button
                key={`filter-${s}`}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`flex-shrink-0 snap-start px-3 h-9 rounded-xl text-xs font-semibold transition-all duration-150 whitespace-nowrap ${
                  statusFilter === s
                    ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-border'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders list */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            <ListItemSkeleton />
            <ListItemSkeleton />
            <ListItemSkeleton />
            <ListItemSkeleton />
          </div>
        ) : paginated.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-10 md:p-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-muted-foreground" />
            </div>
            <p className="font-bold text-primary text-base mb-1">No orders found</p>
            <p className="text-muted-foreground text-sm mb-4">You haven't placed any orders yet, or none match your filters.</p>
            <a href="/schedule-pickup" className="inline-flex bg-primary text-primary-foreground font-bold px-6 py-2 rounded-full text-sm">
              Schedule your first pickup
            </a>
          </div>
        ) : (
          paginated.map((order) => {
            const receiptData = buildReceiptData(order);
            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-border p-4 md:p-5 hover:shadow-sm transition-all duration-150 cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                {/* Mobile: stacked card layout */}
                <div className="flex flex-col gap-3 md:hidden">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-sm text-primary font-mono">{order.orderNo}</p>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-foreground/80 capitalize">{order.service}</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <p className="text-xs text-muted-foreground">Pickup: <span className="font-semibold text-foreground">{order.pickupDate}</span></p>
                    <p className="text-xs text-muted-foreground">Delivery: <span className="font-semibold text-foreground">{order.deliveryDate}</span></p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <SmartPriceDisplay order={order} hasSubscription={hasActiveSubscription} />
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {order.status === 'Delivered' && (
                        <DownloadReceiptButton order={receiptData} />
                      )}
                      <button
                        className="flex items-center gap-1.5 px-3 h-9 rounded-xl bg-yellow-50 border border-yellow-200 text-xs font-semibold text-yellow-700 hover:bg-yellow-100 transition-all duration-150"
                        onClick={(e) => { e.stopPropagation(); setSupportOrder(order); }}
                      >
                        <HelpCircle size={13} /> Help
                      </button>
                      <button
                        className="flex items-center gap-1.5 px-3 h-9 rounded-xl bg-muted text-xs font-semibold text-foreground hover:bg-primary hover:text-white transition-all duration-150"
                        onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                      >
                        <Eye size={13} /> View
                      </button>
                    </div>
                  </div>
                </div>

                {/* Desktop: horizontal layout */}
                <div className="hidden md:flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="font-bold text-sm text-primary font-mono">{order.orderNo}</p>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-foreground/80 mt-1 capitalize">{order.service}</p>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2">
                      <p className="text-xs text-muted-foreground">Pickup: <span className="font-semibold text-foreground">{order.pickupDate}</span></p>
                      <p className="text-xs text-muted-foreground">Delivery: <span className="font-semibold text-foreground">{order.deliveryDate}</span></p>
                      <p className="text-xs text-muted-foreground">Weight: <span className="font-semibold text-foreground">{order.weight}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <SmartPriceDisplay order={order} hasSubscription={hasActiveSubscription} />
                    {order.status === 'Delivered' && (
                      <DownloadReceiptButton order={receiptData} />
                    )}
                    <button
                      className="flex items-center gap-1.5 px-3 h-9 rounded-xl bg-yellow-50 border border-yellow-200 text-xs font-semibold text-yellow-700 hover:bg-yellow-100 transition-all duration-150"
                      onClick={(e) => { e.stopPropagation(); setSupportOrder(order); }}
                    >
                      <HelpCircle size={13} /> Need Help?
                    </button>
                    <button
                      className="p-2 rounded-xl bg-muted hover:bg-primary hover:text-white transition-all duration-150"
                      onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                      aria-label="View order details"
                    >
                      <Eye size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length} orders
          </p>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }).map((_, pi) => (
              <button
                key={`page-${pi + 1}`}
                onClick={() => setPage(pi + 1)}
                className={`w-9 h-9 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  page === pi + 1 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-border'
                }`}
              >
                {pi + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Support Modal */}
      {supportOrder && (
        <OrderSupportModal
          orderId={supportOrder.id}
          orderStatus={supportOrder.status as 'Pending' | 'Picked Up' | 'Processing' | 'Out for Delivery' | 'Delivered'}
          onClose={() => setSupportOrder(null)}
        />
      )}

      {/* Detail Panel */}
      {selectedOrder && (
        <OrderDetailPanel order={selectedOrder as any} onClose={() => setSelectedOrder(null)} onOpenSupport={() => setSupportOrder(selectedOrder)} />
      )}
    </div>
  );
}
