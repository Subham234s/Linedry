'use client';
import React, { useState } from 'react';
import { X, MapPin, Calendar, Weight, Package, CreditCard, CheckCircle, Crown, Clock, BadgePercent, Receipt } from 'lucide-react';
import DownloadReceiptButton from './DownloadReceiptButton';
import LiveTrackingView from './LiveTrackingView';
import type { ReceiptOrderData } from '@/components/ReceiptPDF';

interface Order {
  id: string;
  orderNo: string;
  service: string;
  pickupDate: string;
  deliveryDate: string;
  weight: string;
  amount: string;
  amountNumeric?: number;
  billingType?: 'subscription' | 'paid' | 'pending';
  status: string;
  items: string;
  address: string;
}

const statusColors: Record<string, string> = {
  'Pending': 'status-pending',
  'Picked Up': 'status-picked-up',
  'Processing': 'status-processing',
  'Out for Delivery': 'status-out-for-delivery',
  'Delivered': 'status-delivered',
};

function buildReceiptData(order: Order): ReceiptOrderData {
  const amountNum = parseFloat(order.amount.replace(/[₹,]/g, '')) || 0;
  const subtotal = parseFloat((amountNum / 1.18).toFixed(2));
  const cgst = parseFloat((subtotal * 0.09).toFixed(2));
  const sgst = parseFloat((subtotal * 0.09).toFixed(2));
  const grandTotal = parseFloat((subtotal + cgst + sgst).toFixed(2));

  return {
    orderNo: order.orderNo,
    orderDate: order.pickupDate,
    paymentMethod: order.billingType === 'subscription' ? 'Subscription (Prepaid)' : 'Online Payment (UPI)',
    customerName: 'Customer',
    customerPhone: '',
    deliveryAddress: order.address,
    items: [
      { description: order.service, qty: order.weight, unitPrice: subtotal, total: subtotal },
    ],
    subtotal,
    cgst,
    sgst,
    grandTotal,
  };
}

// ─── Billing Badge ────────────────────────────────────────────────────────────

function BillingBadge({ billingType }: { billingType: 'subscription' | 'paid' | 'pending' }) {
  if (billingType === 'subscription') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-md">
        <CheckCircle size={11} /> Included in Plan
      </span>
    );
  }
  if (billingType === 'paid') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
        <CreditCard size={11} /> Pay-on-Delivery
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
      <Clock size={11} /> To be invoiced
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OrderDetailPanel({ order, onClose, onOpenSupport }: { order: Order; onClose: () => void; onOpenSupport?: () => void }) {
  const receiptData = buildReceiptData(order);
  const [showTracking, setShowTracking] = useState(false);
  const billing = order.billingType || (order.amount === '₹0' || order.amount === 'Pending' ? 'pending' : 'paid');

  if (showTracking) {
    return (
      <>
        <div className="fixed inset-0 bg-black/40 z-40 animate-fade-in" onClick={onClose} />
        <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl overflow-hidden">
          <LiveTrackingView
            orderId={order.orderNo}
            onBack={() => setShowTracking(false)}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 animate-fade-in" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl animate-slide-in-right overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-extrabold text-lg text-primary">{order.orderNo}</h2>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full mt-1 inline-block ${statusColors[order.status] || ''}`}>
                {order.status}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-muted transition-colors"
              aria-label="Close panel"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Order details */}
            <div className="p-4 bg-muted rounded-xl space-y-3">
              {[
                { icon: Package, label: 'Service', value: order.service },
                { icon: Weight, label: 'Weight', value: order.weight },
                { icon: Package, label: 'Items', value: order.items },
              ].map((row) => (
                <div key={`detail-${row.label}`} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <row.icon size={14} />
                    {row.label}
                  </div>
                  <span className="text-sm font-bold text-primary">{row.value}</span>
                </div>
              ))}
            </div>

            {/* ── Billing breakdown card ──────────────────────────────────── */}
            <div className={`p-4 rounded-xl border space-y-3 ${
              billing === 'subscription'
                ? 'bg-green-50/50 border-green-200'
                : billing === 'pending'
                ? 'bg-amber-50/50 border-amber-200'
                : 'bg-muted border-border'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <Receipt size={14} className="text-muted-foreground" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Billing</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Amount</span>
                {billing === 'subscription' ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground line-through">₹{order.amountNumeric || 0}</span>
                    <span className="text-lg font-extrabold text-green-600">₹0</span>
                  </div>
                ) : billing === 'paid' ? (
                  <span className="text-lg font-extrabold text-primary">{order.amount}</span>
                ) : (
                  <span className="text-sm font-semibold text-amber-600">Pending calculation</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Billing Mode</span>
                <BillingBadge billingType={billing} />
              </div>

              {billing === 'subscription' && (
                <div className="flex items-center gap-1.5 text-xs text-green-600 font-semibold pt-1 border-t border-green-200">
                  <BadgePercent size={12} />
                  This order is covered by your active subscription — you save {order.amount}!
                </div>
              )}
            </div>

            {/* Dates & location */}
            <div className="p-4 bg-muted rounded-xl space-y-3">
              {[
                { icon: Calendar, label: 'Pickup Date', value: order.pickupDate },
                { icon: Calendar, label: 'Delivery Date', value: order.deliveryDate },
                { icon: MapPin, label: 'Address', value: order.address },
              ].map((row) => (
                <div key={`detail-loc-${row.label}`} className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm flex-shrink-0">
                    <row.icon size={14} />
                    {row.label}
                  </div>
                  <span className="text-sm font-semibold text-primary text-right">{row.value}</span>
                </div>
              ))}
            </div>

            {order.status === 'Delivered' && (
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <p className="text-sm font-bold text-green-700 mb-1">Order Completed</p>
                <p className="text-xs text-green-600">Your laundry was delivered clean and fresh. Thank you for choosing Linedry!</p>
              </div>
            )}

            {order.status === 'Delivered' ? (
              <DownloadReceiptButton order={receiptData} className="w-full justify-center h-12 text-sm" />
            ) : (
              <button
                className="w-full bg-primary text-white py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-all"
                onClick={() => setShowTracking(true)}
              >
                Track Order
              </button>
            )}
            <button className="w-full border border-border text-foreground py-3 rounded-xl text-sm font-semibold hover:bg-muted transition-all"
              onClick={onOpenSupport}
            >
              Need Help With This Order?
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
