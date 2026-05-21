'use client';
import React from 'react';
import { Shirt, WashingMachine } from 'lucide-react';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200/60 dark:bg-slate-800/40 ${className}`}
      {...props}
    />
  );
}

export function BrandHeroSkeleton() {
  return (
    <div className="relative w-full h-[300px] md:h-[450px] bg-slate-100/50 dark:bg-slate-900/30 rounded-3xl overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
      <div className="relative opacity-20">
        <WashingMachine size={80} className="text-primary animate-pulse" />
      </div>
      <div className="absolute bottom-10 left-10 space-y-3 w-2/3">
        <Skeleton className="h-10 w-3/4 rounded-xl" />
        <Skeleton className="h-6 w-1/2 rounded-lg" />
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-3xl p-6 space-y-6 flex flex-col h-full shadow-sm">
      <div className="space-y-4">
        <Skeleton className="h-12 w-12 rounded-2xl" />
        <Skeleton className="h-8 w-3/4 rounded-lg" />
        <Skeleton className="h-4 w-full rounded-md" />
      </div>
      <div className="space-y-3 flex-grow">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-5/6 rounded-md" />
          </div>
        ))}
      </div>
      <Skeleton className="h-12 w-full rounded-xl mt-4" />
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border border-border rounded-2xl bg-card">
      <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
      <div className="flex-grow space-y-2">
        <Skeleton className="h-5 w-1/3 rounded-md" />
        <Skeleton className="h-4 w-2/3 rounded-md" />
      </div>
      <Skeleton className="h-8 w-20 rounded-lg" />
    </div>
  );
}

export function MetricSkeleton() {
  return (
    <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6 space-y-4">
      <Skeleton className="h-4 w-24 rounded-md" />
      <div className="flex items-end gap-2">
        <Skeleton className="h-12 w-40 rounded-xl" />
        <Skeleton className="h-6 w-12 rounded-md mb-1" />
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-10 w-24 rounded-xl" />
        <Skeleton className="h-10 w-24 rounded-xl" />
        <Skeleton className="h-10 w-24 rounded-xl" />
      </div>
    </div>
  );
}
