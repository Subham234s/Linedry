'use client'

import React, { useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, BarChart3, Activity } from 'lucide-react';
import { Database } from '@/types/supabase';
import { Skeleton } from '@/components/ui/Skeleton';

type WalletTx = Database['public']['Tables']['wallet_transactions']['Row'];
type Order = Database['public']['Tables']['orders']['Row'];

interface Props {
  walletTransactions: WalletTx[];
  allOrders: Order[];
  isLoading: boolean;
}

// ─── Tooltip Components ───────────────────────────────────────────────────────

const SpendingTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-xl p-3 shadow-xl text-xs min-w-[140px]">
      <p className="font-bold text-primary mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            {p.dataKey === 'credit' ? 'Top-ups' : 'Spent'}
          </span>
          <span className="font-bold text-foreground">₹{p.value?.toLocaleString('en-IN')}</span>
        </div>
      ))}
    </div>
  );
};

const UsageTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-xl p-3 shadow-xl text-xs min-w-[130px]">
      <p className="font-bold text-primary mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            {p.dataKey === 'weightKg' ? 'Weight' : 'Orders'}
          </span>
          <span className="font-bold text-foreground">
            {p.dataKey === 'weightKg' ? `${p.value} kg` : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Data transformation helpers ──────────────────────────────────────────────

function buildMonthlySpending(transactions: WalletTx[]) {
  const monthMap = new Map<string, { credit: number; debit: number }>();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Seed last 6 months
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
    monthMap.set(key, { credit: 0, debit: 0 });
  }

  transactions.forEach((tx) => {
    const d = new Date(tx.created_at);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
    if (monthMap.has(key)) {
      const current = monthMap.get(key)!;
      if (tx.transaction_type === 'credit') {
        current.credit += tx.amount;
      } else {
        current.debit += tx.amount;
      }
    }
  });

  return Array.from(monthMap.entries()).map(([month, data]) => ({
    month,
    credit: data.credit,
    debit: data.debit,
  }));
}

function buildUsageTrend(orders: Order[]) {
  const weekMap = new Map<string, { weightKg: number; orders: number }>();
  const now = new Date();

  // Seed last 8 weeks
  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (i * 7));
    const key = `W${weekStart.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`;
    weekMap.set(key, { weightKg: 0, orders: 0 });
  }

  orders.forEach((order) => {
    if (!order.created_at) return;
    const d = new Date(order.created_at);
    const daysDiff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    const weekIdx = Math.floor(daysDiff / 7);
    if (weekIdx >= 0 && weekIdx < 8) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (weekIdx * 7));
      const key = `W${weekStart.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`;
      if (weekMap.has(key)) {
        const current = weekMap.get(key)!;
        current.weightKg += order.weight_kg || 0;
        current.orders += 1;
      }
    }
  });

  return Array.from(weekMap.entries()).map(([week, data]) => ({
    week,
    weightKg: Math.round(data.weightKg * 10) / 10,
    orders: data.orders,
  }));
}

// ─── Chart Skeleton ───────────────────────────────────────────────────────────

function ChartSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-border p-5 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Skeleton className="h-5 w-40 rounded-lg mb-2" />
          <Skeleton className="h-3 w-56 rounded-md" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="space-y-3">
        <div className="flex items-end gap-2 h-[180px]">
          {[40, 65, 50, 80, 55, 70].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end">
              <Skeleton className="rounded-t-md" style={{ height: `${h}%` }} />
            </div>
          ))}
        </div>
        <div className="flex gap-4 pt-2">
          <Skeleton className="h-3 w-16 rounded-md" />
          <Skeleton className="h-3 w-16 rounded-md" />
        </div>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RealtimeCharts({ walletTransactions, allOrders, isLoading }: Props) {
  const spendingData = useMemo(
    () => buildMonthlySpending(walletTransactions),
    [walletTransactions]
  );

  const usageData = useMemo(
    () => buildUsageTrend(allOrders),
    [allOrders]
  );

  if (isLoading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  const hasSpendingData = spendingData.some((d) => d.credit > 0 || d.debit > 0);
  const hasUsageData = usageData.some((d) => d.weightKg > 0 || d.orders > 0);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* ── Monthly Spending Chart ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border p-5 md:p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <BarChart3 size={16} className="text-blue-600" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-primary">Monthly Spending</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Wallet top-ups vs spending</p>
            </div>
          </div>
          <span className="text-xs text-muted-foreground font-medium">Last 6 months</span>
        </div>

        {hasSpendingData ? (
          <>
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={spendingData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                <defs>
                  <linearGradient id="creditGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="debitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                  tickFormatter={(v: number) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                />
                <Tooltip content={<SpendingTooltip />} />
                <Area
                  type="monotone"
                  dataKey="credit"
                  stroke="#22c55e"
                  strokeWidth={2.5}
                  fill="url(#creditGradient)"
                  animationDuration={800}
                />
                <Area
                  type="monotone"
                  dataKey="debit"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fill="url(#debitGradient)"
                  strokeDasharray="5 5"
                  animationDuration={800}
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex gap-5 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-3 h-0.5 rounded-full bg-green-500" /> Top-ups (Credit)
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-3 h-0.5 rounded-full bg-red-400 border-dashed" style={{ borderBottom: '2px dashed #ef4444', height: 0 }} /> Spent (Debit)
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
              <BarChart3 size={20} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground/60">No transaction data yet</p>
            <p className="text-xs text-muted-foreground mt-1">Add money or place orders to see your spending trends.</p>
          </div>
        )}
      </div>

      {/* ── Laundry Usage Trend ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border p-5 md:p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
              <Activity size={16} className="text-purple-600" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-primary">Laundry Usage Trend</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Weight processed per week</p>
            </div>
          </div>
          <span className="text-xs text-muted-foreground font-medium">Last 8 weeks</span>
        </div>

        {hasUsageData ? (
          <>
            <ResponsiveContainer width="100%" height={210}>
              <LineChart data={usageData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  width={35}
                  tickFormatter={(v: number) => `${v}kg`}
                />
                <Tooltip content={<UsageTooltip />} />
                <Line
                  type="monotone"
                  dataKey="weightKg"
                  stroke="var(--primary)"
                  strokeWidth={2.5}
                  dot={{ fill: 'var(--primary)', r: 4, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                  animationDuration={800}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="var(--secondary)"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ fill: 'var(--secondary)', r: 3, strokeWidth: 2, stroke: '#fff' }}
                  animationDuration={800}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex gap-5 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-3 h-3 rounded-sm bg-primary" /> Weight (kg)
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-3 h-3 rounded-sm bg-secondary" /> Orders
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
              <Activity size={20} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground/60">No usage data yet</p>
            <p className="text-xs text-muted-foreground mt-1">Place your first order to track laundry trends.</p>
          </div>
        )}
      </div>
    </div>
  );
}
