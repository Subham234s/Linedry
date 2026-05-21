'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle, WashingMachine, Shirt, Wind, Sparkles, ChevronRight, ChevronLeft, Calendar, Clock, MapPin, Check, Loader2, Scale, IndianRupee, BadgePercent } from 'lucide-react';
import Link from 'next/link';
import { useAddresses } from '@/hooks/useAddresses';
import { useOrders } from '@/hooks/useOrders';
import { useEntitlements } from '@/components/SubscriptionProvider';
import { ListItemSkeleton } from '@/components/ui/Skeleton';

// ─── Service definitions with pricing ─────────────────────────────────────────

interface Service {
  id: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  pricePerUnit: number;
  unit: 'kg' | 'piece';
  priceLabel: string;
}

const services: Service[] = [
  { id: 'wash_and_fold', icon: <WashingMachine size={28} />, title: 'Wash & Fold', desc: 'Machine wash, dry & neatly folded', pricePerUnit: 49, unit: 'kg', priceLabel: '₹49/kg' },
  { id: 'wash_and_iron', icon: <Shirt size={28} />, title: 'Wash & Iron', desc: 'Washed, ironed & neatly packed', pricePerUnit: 79, unit: 'kg', priceLabel: '₹79/kg' },
  { id: 'dry_cleaning', icon: <Sparkles size={28} />, title: 'Dry Cleaning', desc: 'Professional solvent-based cleaning', pricePerUnit: 199, unit: 'piece', priceLabel: '₹199/piece' },
  { id: 'express_wash', icon: <Wind size={28} />, title: 'Express Wash', desc: 'Same-day turnaround by 8 PM', pricePerUnit: 120, unit: 'kg', priceLabel: '₹120/kg' },
];

// ─── Date / Time helpers ──────────────────────────────────────────────────────

interface TimeSlot {
  id: string;
  label: string;
  time: string;
}

const generateDates = () => {
  const dates = [];
  const today = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push({
      id: `d${i}`,
      day: days[d.getDay()],
      date: d.getDate(),
      month: months[d.getMonth()],
      dateString: d.toISOString().split('T')[0],
    });
  }
  return dates;
};

const timeSlots: TimeSlot[] = [
  { id: 'morning', label: 'Morning', time: '8:00 AM – 11:00 AM' },
  { id: 'afternoon', label: 'Afternoon', time: '12:00 PM – 3:00 PM' },
  { id: 'evening', label: 'Evening', time: '5:00 PM – 8:00 PM' },
];

const dates = generateDates();
const stepLabels = ['Service & Weight', 'Date & Time', 'Address & Confirm'];

// ─── Component ────────────────────────────────────────────────────────────────

export default function SchedulePickup() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string>('');
  const [weightKg, setWeightKg] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addresses, fetchAddresses, isLoading: isAddressesLoading } = useAddresses();
  const { createOrder } = useOrders();
  const {
    isActive,
    canRequestPickup,
    canAddLaundry,
    incrementPickups,
    triggerUpgrade,
    planName,
    getRemainingKg,
  } = useEntitlements();

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // ── Price calculation ─────────────────────────────────────────────────────

  const activeService = useMemo(
    () => services.find((s) => s.id === selectedService),
    [selectedService]
  );

  const calculatedAmount = useMemo(() => {
    if (!activeService || weightKg <= 0) return 0;
    return Math.round(activeService.pricePerUnit * weightKg);
  }, [activeService, weightKg]);

  // Check if the order is covered by subscription
  const isCoveredByPlan = useMemo(() => {
    if (!isActive || !activeService || activeService.unit !== 'kg') return false;
    return canAddLaundry(weightKg);
  }, [isActive, activeService, weightKg, canAddLaundry]);

  const finalAmount = isCoveredByPlan ? 0 : calculatedAmount;

  // ── Step validation ───────────────────────────────────────────────────────

  const canNext = () => {
    if (step === 1) {
      if (!selectedService) return false;
      if (activeService?.unit === 'kg') return weightKg > 0;
      return true;
    }
    if (step === 2) return !!selectedDate && !!selectedSlot;
    if (step === 3) return !!selectedAddress && !isSubmitting;
    return false;
  };

  // ── Submit handler ────────────────────────────────────────────────────────

  const handleConfirm = async () => {
    // Feature gate: subscription check
    if (!isActive) {
      triggerUpgrade('You need an active subscription to schedule pickups. Subscribe now to get started!');
      return;
    }

    if (!canRequestPickup()) {
      triggerUpgrade(
        `You've used all your free pickups this month on the ${planName} plan. Upgrade to get more pickups & drops!`
      );
      return;
    }

    setIsSubmitting(true);

    const targetDate = dates.find((d) => d.id === selectedDate)?.dateString;
    const targetSlot = timeSlots.find((t) => t.id === selectedSlot)?.time;

    const result = await createOrder({
      service_type: selectedService,
      pickup_date: targetDate,
      pickup_slot: targetSlot,
      address_id: selectedAddress,
      weight_kg: weightKg > 0 ? weightKg : null,
      total_amount: finalAmount,
    });

    setIsSubmitting(false);

    if (result) {
      incrementPickups();
      setConfirmed(true);
    }
  };

  // ── Confirmation screen ───────────────────────────────────────────────────

  if (confirmed) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <CheckCircle size={44} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-extrabold text-primary mb-2">Pickup Scheduled!</h2>
        <p className="text-muted-foreground mb-1">Your laundry pickup has been confirmed.</p>
        {isCoveredByPlan ? (
          <p className="text-sm text-green-600 font-semibold mb-8">
            ✨ Covered by your {planName} plan — ₹0 due
          </p>
        ) : (
          <p className="text-sm text-muted-foreground mb-8">
            Estimated total: <span className="font-bold text-foreground">₹{finalAmount}</span>
          </p>
        )}
        <Link
          href="/my-orders"
          className="bg-secondary text-secondary-foreground px-8 py-3 rounded-full font-bold text-sm hover:opacity-90 transition-all inline-block"
        >
          View My Orders
        </Link>
      </div>
    );
  }

  // ── Main wizard ───────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-extrabold text-primary mb-1">Schedule a Pickup</h1>
        <p className="text-muted-foreground text-sm">Book your laundry pickup in 3 easy steps.</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-0 mb-8 md:mb-10">
        {stepLabels.map((label, idx) => {
          const num = idx + 1;
          const isStepActive = step === num;
          const isDone = step > num;
          return (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${isDone ? 'bg-green-500 text-white' : isStepActive ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {isDone ? <Check size={16} /> : num}
                </div>
                <span className={`text-xs font-semibold hidden sm:block ${isStepActive ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
              </div>
              {idx < stepLabels.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all duration-300 ${step > num ? 'bg-green-400' : 'bg-border'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── Step 1: Service & Weight ────────────────────────────────────────── */}
      {step === 1 && (
        <div className="animate-fade-in space-y-6">
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">Choose a Service</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {services.map((svc) => (
                <button
                  key={svc.id}
                  onClick={() => { setSelectedService(svc.id); setWeightKg(0); }}
                  className={`text-left p-4 md:p-5 rounded-2xl border-2 transition-all duration-150 min-h-[80px] ${selectedService === svc.id ? 'border-secondary bg-secondary/10' : 'border-border bg-card hover:border-secondary/50'}`}
                >
                  <div className={`mb-2 md:mb-3 ${selectedService === svc.id ? 'text-secondary' : 'text-muted-foreground'}`}>{svc.icon}</div>
                  <div className="font-bold text-foreground text-sm">{svc.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 mb-2">{svc.desc}</div>
                  <div className="text-sm font-extrabold text-secondary">{svc.priceLabel}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Weight input — only for kg-based services */}
          {activeService?.unit === 'kg' && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-2 mb-3">
                <Scale size={16} className="text-secondary" />
                <h2 className="text-lg font-bold text-foreground">Estimated Weight</h2>
              </div>
              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setWeightKg((w) => Math.max(0, +(w - 1).toFixed(1)))}
                    disabled={weightKg <= 0}
                    className="w-10 h-10 rounded-xl bg-muted text-foreground font-bold text-xl flex items-center justify-center hover:bg-secondary/20 transition-colors disabled:opacity-30"
                  >
                    −
                  </button>
                  <div className="flex-1 text-center">
                    <input
                      type="number"
                      min="0"
                      max="50"
                      step="0.5"
                      value={weightKg || ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setWeightKg(isNaN(val) ? 0 : Math.min(50, Math.max(0, val)));
                      }}
                      placeholder="0"
                      className="text-3xl font-extrabold text-center text-foreground bg-transparent w-20 outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <div className="text-xs text-muted-foreground mt-0.5">Kilograms (approx.)</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWeightKg((w) => Math.min(50, +(w + 1).toFixed(1)))}
                    disabled={weightKg >= 50}
                    className="w-10 h-10 rounded-xl bg-muted text-foreground font-bold text-xl flex items-center justify-center hover:bg-secondary/20 transition-colors disabled:opacity-30"
                  >
                    +
                  </button>
                </div>

                {/* Live price preview */}
                {weightKg > 0 && (
                  <div className="mt-4 pt-4 border-t border-border animate-fade-in">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {weightKg} kg × ₹{activeService.pricePerUnit}
                      </span>
                      <span className="font-bold text-foreground">₹{calculatedAmount}</span>
                    </div>
                    {isCoveredByPlan && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                        <BadgePercent size={13} />
                        Covered by your {planName} plan — ₹0 due!
                      </div>
                    )}
                    {isActive && !isCoveredByPlan && weightKg > 0 && (
                      <div className="text-xs text-amber-600 mt-2">
                        Exceeds plan limit ({getRemainingKg()} kg remaining). Standard pricing applies.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Step 2: Date & Time ─────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="animate-fade-in space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={16} className="text-secondary" />
              <h2 className="text-lg font-bold text-foreground">Select Pickup Date</h2>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
              {dates.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDate(d.id)}
                  className={`flex-shrink-0 snap-start flex flex-col items-center px-4 py-3 rounded-xl border-2 transition-all duration-150 min-w-[64px] min-h-[80px] ${selectedDate === d.id ? 'border-secondary bg-secondary text-secondary-foreground' : 'border-border bg-card hover:border-secondary/50'}`}
                >
                  <span className="text-xs font-semibold">{d.day}</span>
                  <span className="text-xl font-extrabold leading-tight">{d.date}</span>
                  <span className="text-xs">{d.month}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} className="text-secondary" />
              <h2 className="text-lg font-bold text-foreground">Select Time Slot</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {timeSlots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-150 min-h-[64px] ${selectedSlot === slot.id ? 'border-secondary bg-secondary/10' : 'border-border bg-card hover:border-secondary/50'}`}
                >
                  <div className="font-bold text-sm text-foreground">{slot.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{slot.time}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3: Address & Confirm ───────────────────────────────────────── */}
      {step === 3 && (
        <div className="animate-fade-in space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={16} className="text-secondary" />
            <h2 className="text-lg font-bold text-foreground">Select Pickup Address</h2>
          </div>

          {isAddressesLoading ? (
            <div className="space-y-3">
              <ListItemSkeleton />
              <ListItemSkeleton />
            </div>
          ) : addresses.length === 0 ? (
            <div className="bg-muted p-6 rounded-2xl text-center border border-border">
              <MapPin size={24} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground mb-1">No addresses saved</p>
              <p className="text-xs text-muted-foreground mb-4">Please add a pickup address first.</p>
              <Link href="/manage-addresses" className="text-xs font-bold bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:opacity-90 inline-block transition-opacity">
                Add New Address
              </Link>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x md:flex-col md:overflow-x-visible md:pb-0">
              {addresses.map((addr) => {
                const colors = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-green-100 text-green-700', 'bg-orange-100 text-orange-700'];
                const colorTag = colors[(addr.tag?.length || 0) % colors.length];
                return (
                  <button
                    key={addr.id}
                    onClick={() => setSelectedAddress(addr.id)}
                    className={`flex-shrink-0 snap-start w-64 md:w-full text-left p-4 rounded-2xl border-2 transition-all duration-150 ${selectedAddress === addr.id ? 'border-secondary bg-secondary/10' : 'border-border bg-card hover:border-secondary/50'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colorTag}`}>{addr.tag || 'Saved Address'}</span>
                      {selectedAddress === addr.id && <Check size={14} className="text-secondary ml-auto" />}
                    </div>
                    <div className="text-sm font-semibold text-foreground truncate">{addr.full_address}</div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Booking Summary with price */}
          {selectedAddress && (
            <div className="mt-4 p-4 rounded-2xl bg-muted border border-border animate-fade-in">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Booking Summary</div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Service</span><span className="font-semibold text-foreground capitalize">{activeService?.title}</span></div>
                {weightKg > 0 && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Weight</span><span className="font-semibold text-foreground">{weightKg} kg</span></div>
                )}
                <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-semibold text-foreground">{dates.find(d => d.id === selectedDate)?.day}, {dates.find(d => d.id === selectedDate)?.date} {dates.find(d => d.id === selectedDate)?.month}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Time Slot</span><span className="font-semibold text-foreground">{timeSlots.find(t => t.id === selectedSlot)?.time}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Address</span><span className="font-semibold text-foreground">{addresses.find(a => a.id === selectedAddress)?.tag || 'Saved Address'}</span></div>
                <div className="flex justify-between pt-2 mt-2 border-t border-border">
                  <span className="text-muted-foreground font-semibold flex items-center gap-1"><IndianRupee size={13} /> Estimated Total</span>
                  {isCoveredByPlan ? (
                    <span className="font-extrabold text-green-600 flex items-center gap-1">
                      <BadgePercent size={13} /> ₹0 <span className="text-xs font-normal text-muted-foreground line-through ml-1">₹{calculatedAmount}</span>
                    </span>
                  ) : (
                    <span className="font-extrabold text-foreground">₹{finalAmount}</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Navigation ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mt-6 md:mt-8 pt-6 border-t border-border">
        <button
          onClick={() => setStep(s => s - 1)}
          disabled={step === 1 || isSubmitting}
          className="flex items-center gap-2 px-5 h-12 rounded-full border border-border text-sm font-semibold text-foreground hover:bg-muted transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} /> Back
        </button>
        {step < 3 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!canNext()}
            className="flex items-center gap-2 bg-secondary text-secondary-foreground px-6 h-12 rounded-full text-sm font-bold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleConfirm}
            disabled={!canNext() || isSubmitting}
            className="flex items-center gap-2 bg-secondary text-secondary-foreground px-8 h-12 rounded-full text-sm font-bold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <><Loader2 size={16} className="animate-spin" /> Confirming...</>
            ) : (
              <>Confirm Pickup <Check size={16} /></>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
