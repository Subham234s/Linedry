'use client';
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { month: 'Dec', orders: 3, kg: 11.2 },
  { month: 'Jan', orders: 5, kg: 18.5 },
  { month: 'Feb', orders: 4, kg: 14.0 },
  { month: 'Mar', orders: 6, kg: 22.3 },
  { month: 'Apr', orders: 4, kg: 15.8 },
  { month: 'May', orders: 2, kg: 8.1 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-border rounded-xl p-3 shadow-lg text-xs">
        <p className="font-bold text-primary mb-1">{label}</p>
        <p className="text-foreground/70">Orders: <span className="font-bold text-primary">{payload[0]?.value}</span></p>
        <p className="text-foreground/70">Weight: <span className="font-bold text-primary">{payload[1]?.value} kg</span></p>
      </div>
    );
  }
  return null;
};

export default function OrderChart() {
  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-extrabold text-base text-primary">Monthly Order History</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Orders placed and total weight per month</p>
        </div>
        <span className="text-xs text-muted-foreground">Dec 2025 – May 2026</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={30} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="orders" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={24} />
          <Bar dataKey="kg" fill="var(--secondary)" radius={[4, 4, 0, 0]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-3 h-3 rounded-sm bg-primary"></div> Orders
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-3 h-3 rounded-sm bg-secondary"></div> Weight (kg)
        </div>
      </div>
    </div>
  );
}
