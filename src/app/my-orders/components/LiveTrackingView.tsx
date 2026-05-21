'use client';
import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle, Star, MapPin, Home, Navigation, ArrowLeft, CheckCircle, Clock, Package } from 'lucide-react';

interface RiderLocation {
  latitude: number;
  longitude: number;
}

interface LiveTrackingViewProps {
  orderId?: string;
  onBack?: () => void;
}

const timelineSteps = [
  {
    id: 'picked-up',
    label: 'Picked Up',
    subLabel: 'Your clothes have been collected',
    status: 'completed' as const,
  },
  {
    id: 'out-for-delivery',
    label: 'Out for Delivery',
    subLabel: 'Rider is heading your way',
    status: 'active' as const,
  },
  {
    id: 'delivered',
    label: 'Delivered',
    subLabel: 'Estimated: Today, 3:30 PM',
    status: 'pending' as const,
  },
];

export default function LiveTrackingView({ orderId = 'LD-2026-0847', onBack }: LiveTrackingViewProps) {
  // Mock initial rider location (Kolkata coordinates)
  const [riderLocation, setRiderLocation] = useState<RiderLocation>({
    latitude: 22.5726,
    longitude: 88.3639,
  });

  useEffect(() => {
    /*
     * ─────────────────────────────────────────────────────────────────────────
     * SUPABASE REALTIME SUBSCRIPTION — PLACEHOLDER FOR FUTURE BACKEND WIRING
     * ─────────────────────────────────────────────────────────────────────────
     *
     * STEP 1: Import the Supabase client (once backend is connected)
     *   import { createClient } from '@supabase/supabase-js';
     *   const supabase = createClient(
     *     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     *     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
     *   );
     *
     * STEP 2: Subscribe to the Realtime channel.
     *   Supabase Realtime listens to Postgres changes via websockets.
     *   We subscribe to UPDATE events on the `live_tracking` table,
     *   filtered by the current order's ID using a Postgres filter.
     *
     *   const channel = supabase
     *     .channel(`order-tracking-${orderId}`)   // unique channel name per order
     *     .on(
     *       'postgres_changes',
     *       {
     *         event: 'UPDATE',                     // only listen to row updates
     *         schema: 'public',
     *         table: 'live_tracking',
     *         filter: `order_id=eq.${orderId}`,    // filter by this specific order
     *       },
     *       (payload) => {
     *         // STEP 3: When the rider's GPS updates in the DB, this fires.
     *         // payload.new contains the updated row from `live_tracking`.
     *         const { latitude, longitude } = payload.new as RiderLocation;
     *         setRiderLocation({ latitude, longitude });
     *       }
     *     )
     *     .subscribe();
     *
     * STEP 4: Cleanup — always unsubscribe when the component unmounts
     *   to prevent memory leaks and dangling websocket connections.
     *
     *   return () => {
     *     supabase.removeChannel(channel);
     *   };
     *
     * ─────────────────────────────────────────────────────────────────────────
     * MOCK SIMULATION (remove once Supabase is connected):
     * Simulates the rider moving slightly every 5 seconds.
     * ─────────────────────────────────────────────────────────────────────────
     */
    const mockInterval = setInterval(() => {
      setRiderLocation((prev) => ({
        latitude: prev.latitude + (Math.random() - 0.5) * 0.001,
        longitude: prev.longitude + (Math.random() - 0.5) * 0.001,
      }));
    }, 5000);

    return () => clearInterval(mockInterval);
  }, [orderId]);

  return (
    <div className="relative w-full h-screen bg-slate-100 overflow-hidden flex flex-col">

      {/* ── MAP PLACEHOLDER AREA (60vh) ─────────────────────────────────── */}
      <div className="relative w-full h-[60vh] flex-shrink-0 overflow-hidden bg-slate-200">

        {/* Map grid pattern background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(148,163,184,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(148,163,184,0.3) 1px, transparent 1px),
              linear-gradient(rgba(148,163,184,0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(148,163,184,0.15) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px, 60px 60px, 20px 20px, 20px 20px',
            backgroundColor: '#e2e8f0',
          }}
        />

        {/* Road-like decorative lines */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-0 right-0 h-6 bg-white/50 rounded-full blur-sm" />
          <div className="absolute top-0 bottom-0 left-1/3 w-6 bg-white/50 rounded-full blur-sm" />
          <div className="absolute top-2/3 left-0 right-0 h-4 bg-white/40 rounded-full blur-sm" />
          <div className="absolute top-0 bottom-0 left-2/3 w-4 bg-white/40 rounded-full blur-sm" />
        </div>

        {/* Map label */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-slate-500 shadow-sm">
          Live Map View
        </div>

        {/* Back button */}
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-4 left-4 z-10 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={18} className="text-slate-700" />
          </button>
        )}

        {/* Order ID badge */}
        <div className="absolute top-4 right-4 bg-slate-900 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md">
          {orderId}
        </div>

        {/* ── MOCK RIDER ICON (animated pulse) ──────────────────────────── */}
        <div
          className="absolute"
          style={{ top: '42%', left: '48%', transform: 'translate(-50%, -50%)' }}
        >
          {/* Pulse ring */}
          <div className="absolute inset-0 -m-3 rounded-full bg-yellow-400/30 animate-ping" />
          <div className="relative w-12 h-12 bg-yellow-400 rounded-full shadow-lg flex items-center justify-center border-2 border-white">
            <Navigation size={20} className="text-slate-900 fill-slate-900" />
          </div>
          {/* Rider label */}
          <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow">
            Rahul • Rider
          </div>
        </div>

        {/* ── CUSTOMER HOME ICON ─────────────────────────────────────────── */}
        <div
          className="absolute"
          style={{ top: '65%', left: '68%', transform: 'translate(-50%, -50%)' }}
        >
          <div className="relative w-11 h-11 bg-slate-900 rounded-full shadow-lg flex items-center justify-center border-2 border-white">
            <Home size={18} className="text-yellow-400" />
          </div>
          <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow border border-slate-200">
            Your Home
          </div>
        </div>

        {/* Dashed route line (decorative) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ overflow: 'visible' }}
        >
          <line
            x1="48%" y1="42%"
            x2="68%" y2="65%"
            stroke="#facc15"
            strokeWidth="2.5"
            strokeDasharray="8 5"
            strokeLinecap="round"
          />
        </svg>

        {/* GPS coordinates badge (mock) */}
        <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-500 shadow-sm">
          {riderLocation.latitude.toFixed(4)}°N, {riderLocation.longitude.toFixed(4)}°E
        </div>
      </div>

      {/* ── BOTTOM SHEET ────────────────────────────────────────────────── */}
      <div className="relative flex-1 bg-white rounded-t-3xl shadow-[0_-8px_32px_rgba(0,0,0,0.12)] -mt-5 z-10 overflow-y-auto">

        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        <div className="px-5 pb-8 pt-3 space-y-5">

          {/* ── ETA & STATUS ──────────────────────────────────────────────── */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">
                Arriving in <span className="text-yellow-500">15 mins</span>
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">Your clean clothes are on the way!</p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center border border-yellow-200">
              <MapPin size={22} className="text-yellow-500" />
            </div>
          </div>

          {/* ── RIDER PROFILE CARD ────────────────────────────────────────── */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-md">
                  <span className="text-xl font-extrabold text-yellow-400">R</span>
                </div>
                {/* Online indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
              </div>

              {/* Rider info */}
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-slate-900 text-base leading-tight">Rahul Kumar</p>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">WB 02 AB 1234</p>
                {/* Star rating */}
                <div className="flex items-center gap-0.5 mt-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={12}
                      className={star <= 5 ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}
                    />
                  ))}
                  <span className="text-xs text-slate-500 ml-1 font-semibold">5.0</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href="tel:+919830012345"
                  className="w-11 h-11 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm hover:bg-yellow-500 active:scale-95 transition-all duration-150"
                  aria-label="Call rider"
                >
                  <Phone size={18} className="text-slate-900" />
                </a>
                <a
                  href="https://wa.me/919830012345"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 bg-slate-900 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-800 active:scale-95 transition-all duration-150"
                  aria-label="Message rider"
                >
                  <MessageCircle size={18} className="text-yellow-400" />
                </a>
              </div>
            </div>
          </div>

          {/* ── ORDER TIMELINE STEPPER ────────────────────────────────────── */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4">Order Progress</h3>
            <div className="relative">
              {timelineSteps.map((step, index) => {
                const isLast = index === timelineSteps.length - 1;
                return (
                  <div key={step.id} className="flex gap-4">
                    {/* Left: dot + connector line */}
                    <div className="flex flex-col items-center">
                      {/* Status dot */}
                      <div className="relative flex-shrink-0">
                        {step.status === 'completed' && (
                          <div className="w-9 h-9 rounded-full bg-yellow-400 flex items-center justify-center shadow-sm">
                            <CheckCircle size={18} className="text-slate-900" />
                          </div>
                        )}
                        {step.status === 'active' && (
                          <div className="relative w-9 h-9 rounded-full bg-yellow-400 flex items-center justify-center shadow-md">
                            {/* Pulsing ring */}
                            <div className="absolute inset-0 rounded-full bg-yellow-400 animate-ping opacity-50" />
                            <Navigation size={16} className="relative text-slate-900 fill-slate-900" />
                          </div>
                        )}
                        {step.status === 'pending' && (
                          <div className="w-9 h-9 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center">
                            <Clock size={16} className="text-slate-400" />
                          </div>
                        )}
                      </div>
                      {/* Connector line */}
                      {!isLast && (
                        <div
                          className={`w-0.5 flex-1 my-1 min-h-[28px] rounded-full ${
                            step.status === 'completed' ? 'bg-yellow-400' : 'bg-slate-200'
                          }`}
                        />
                      )}
                    </div>

                    {/* Right: text content */}
                    <div className={`pb-5 ${isLast ? 'pb-0' : ''}`}>
                      <p
                        className={`font-bold text-sm leading-tight ${
                          step.status === 'pending' ? 'text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {step.label}
                        {step.status === 'active' && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">
                            LIVE
                          </span>
                        )}
                      </p>
                      <p
                        className={`text-xs mt-0.5 ${
                          step.status === 'pending' ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {step.subLabel}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── PACKAGE SUMMARY ───────────────────────────────────────────── */}
          <div className="flex items-center gap-3 bg-yellow-50 rounded-2xl p-4 border border-yellow-100">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0">
              <Package size={18} className="text-slate-900" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Weekly Saver — 4.8 kg</p>
              <p className="text-xs text-slate-500 mt-0.5">12 pieces • Wash &amp; Fold</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm font-extrabold text-slate-900">₹499</p>
              <p className="text-[10px] text-slate-400">Paid</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
