'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard, Smartphone, Plus, Trash2, X, Loader2,
  Shield, Check, Star, MoreVertical, Lock,
} from 'lucide-react';
import { useSavedPaymentMethods } from '@/hooks/useSavedPaymentMethods';
import { ListItemSkeleton } from '@/components/ui/Skeleton';

// ─── Provider icon/color mapping ──────────────────────────────────────────────

const PROVIDER_META: Record<string, { icon: string; color: string; bg: string }> = {
  'Google Pay':  { icon: 'G', color: 'text-blue-600',   bg: 'bg-blue-50' },
  'PhonePe':     { icon: 'P', color: 'text-purple-600', bg: 'bg-purple-50' },
  'Paytm':       { icon: 'P', color: 'text-sky-600',    bg: 'bg-sky-50' },
  'BHIM UPI':    { icon: 'B', color: 'text-green-600',  bg: 'bg-green-50' },
  'Visa':        { icon: 'V', color: 'text-blue-700',   bg: 'bg-blue-50' },
  'Mastercard':  { icon: 'M', color: 'text-orange-600', bg: 'bg-orange-50' },
  'RuPay':       { icon: 'R', color: 'text-emerald-600',bg: 'bg-emerald-50' },
};

const UPI_PROVIDERS = ['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI'];
const CARD_NETWORKS = ['Visa', 'Mastercard', 'RuPay'];

function ProviderIcon({ name }: { name: string }) {
  const meta = PROVIDER_META[name];
  if (meta) {
    return (
      <div className={`w-10 h-10 rounded-xl ${meta.bg} flex items-center justify-center flex-shrink-0`}>
        <span className={`text-sm font-extrabold ${meta.color}`}>{meta.icon}</span>
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
      <CreditCard size={16} className="text-muted-foreground" />
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SavedPaymentMethods() {
  const { methods, isLoading, fetchMethods, addMethod, removeMethod, setDefault } = useSavedPaymentMethods();

  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'UPI' | 'Card'>('UPI');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // UPI form
  const [upiId, setUpiId] = useState('');
  const [upiProvider, setUpiProvider] = useState(UPI_PROVIDERS[0]);

  // Card form
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [cardNetwork, setCardNetwork] = useState(CARD_NETWORKS[0]);

  useEffect(() => { fetchMethods(); }, [fetchMethods]);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpenId) return;
    const close = () => setMenuOpenId(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [menuOpenId]);

  const resetForm = () => {
    setUpiId(''); setUpiProvider(UPI_PROVIDERS[0]);
    setCardName(''); setCardNumber(''); setBankName(''); setCardNetwork(CARD_NETWORKS[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let success = false;
    if (activeTab === 'UPI') {
      if (!upiId.trim()) { setIsSubmitting(false); return; }
      success = await addMethod({
        method_type: 'UPI',
        provider_name: upiProvider,
        masked_detail: upiId.trim(),
        is_default: methods.length === 0,
      });
    } else {
      if (!cardNumber.trim() || !cardName.trim()) { setIsSubmitting(false); return; }
      const last4 = cardNumber.replace(/\s/g, '').slice(-4);
      const label = bankName.trim() ? `${bankName.trim()} ${cardNetwork}` : `${cardNetwork} Card`;
      success = await addMethod({
        method_type: 'Card',
        provider_name: label,
        masked_detail: `•••• •••• •••• ${last4}`,
        is_default: methods.length === 0,
      });
    }

    setIsSubmitting(false);
    if (success) { resetForm(); setShowModal(false); }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await removeMethod(id);
    setDeletingId(null);
    setMenuOpenId(null);
  };

  const handleSetDefault = async (id: string) => {
    await setDefault(id);
    setMenuOpenId(null);
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="bg-card border border-border rounded-2xl p-4 md:p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CreditCard size={14} className="text-secondary" />
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
            Saved Payment Methods
          </span>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 text-xs font-bold text-secondary bg-secondary/10 hover:bg-secondary/20 px-3 h-8 rounded-lg transition-all"
        >
          <Plus size={13} /> Add New
        </button>
      </div>

      {/* Methods List */}
      {isLoading ? (
        <div className="space-y-3">
          <ListItemSkeleton />
          <ListItemSkeleton />
        </div>
      ) : methods.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
            <CreditCard size={22} className="text-muted-foreground" />
          </div>
          <p className="font-bold text-primary text-sm mb-1">No saved methods</p>
          <p className="text-xs text-muted-foreground mb-4">Add a UPI ID or card for faster checkouts.</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 bg-secondary text-secondary-foreground px-5 py-2 rounded-full text-xs font-bold hover:opacity-90 transition-all"
          >
            <Plus size={12} /> Add Method
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {methods.map((m) => (
            <div
              key={m.id}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 group ${
                m.is_default
                  ? 'border-secondary/40 bg-secondary/5 shadow-sm'
                  : 'border-border bg-muted/30 hover:border-secondary/20'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <ProviderIcon name={m.provider_name} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground truncate">{m.provider_name}</span>
                    {m.is_default && (
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-secondary bg-secondary/10 px-1.5 py-0.5 rounded-full">
                        <Star size={8} className="fill-secondary" /> Default
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground font-mono tracking-wider">{m.masked_detail}</span>
                </div>
              </div>

              {/* 3-dot menu */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === m.id ? null : m.id); }}
                  className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  aria-label="Options"
                >
                  <MoreVertical size={16} />
                </button>

                {menuOpenId === m.id && (
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-border rounded-xl shadow-xl z-20 animate-fade-in overflow-hidden">
                    {!m.is_default && (
                      <button
                        onClick={() => handleSetDefault(m.id)}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                      >
                        <Star size={14} className="text-secondary" /> Set as Default
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(m.id)}
                      disabled={deletingId === m.id}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                    >
                      {deletingId === m.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add Method Modal ──────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full sm:max-w-md sm:rounded-3xl sm:m-4 rounded-t-3xl shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="p-5 md:p-6">
              {/* Modal header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-extrabold text-primary">Add Payment Method</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Save for faster payments</p>
                </div>
                <button
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-5">
                <button
                  type="button"
                  onClick={() => setActiveTab('UPI')}
                  className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-xl border-2 text-sm font-bold transition-all ${
                    activeTab === 'UPI'
                      ? 'border-secondary bg-secondary/10 text-secondary'
                      : 'border-border text-muted-foreground hover:border-secondary/30'
                  }`}
                >
                  <Smartphone size={16} /> Add UPI
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('Card')}
                  className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-xl border-2 text-sm font-bold transition-all ${
                    activeTab === 'Card'
                      ? 'border-secondary bg-secondary/10 text-secondary'
                      : 'border-border text-muted-foreground hover:border-secondary/30'
                  }`}
                >
                  <CreditCard size={16} /> Add Card
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === 'UPI' ? (
                  <>
                    {/* UPI Provider dropdown */}
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                        UPI Provider
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {UPI_PROVIDERS.map((p) => {
                          const meta = PROVIDER_META[p];
                          return (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setUpiProvider(p)}
                              className={`flex items-center gap-2 px-3.5 h-10 rounded-xl border-2 text-xs font-bold transition-all ${
                                upiProvider === p
                                  ? 'border-secondary bg-secondary/10 text-secondary'
                                  : 'border-border hover:border-secondary/30'
                              }`}
                            >
                              <span className={`font-extrabold text-sm ${meta?.color || ''}`}>{meta?.icon || p[0]}</span>
                              {p}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* UPI ID input */}
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                        UPI ID
                      </label>
                      <input
                        required
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g. yourname@okicici"
                        className="w-full px-4 h-12 rounded-xl border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Card Network */}
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                        Card Network
                      </label>
                      <div className="flex gap-2">
                        {CARD_NETWORKS.map((n) => {
                          const meta = PROVIDER_META[n];
                          return (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setCardNetwork(n)}
                              className={`flex items-center gap-2 px-4 h-10 rounded-xl border-2 text-xs font-bold transition-all ${
                                cardNetwork === n
                                  ? 'border-secondary bg-secondary/10 text-secondary'
                                  : 'border-border hover:border-secondary/30'
                              }`}
                            >
                              <span className={`font-extrabold text-sm ${meta?.color || ''}`}>{meta?.icon}</span>
                              {n}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Cardholder name */}
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                        Cardholder Name
                      </label>
                      <input
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-4 h-12 rounded-xl border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all"
                      />
                    </div>

                    {/* Card number */}
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                        Card Number
                      </label>
                      <input
                        required
                        value={cardNumber}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                          setCardNumber(v.replace(/(.{4})/g, '$1 ').trim());
                        }}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="w-full px-4 h-12 rounded-xl border border-border text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all"
                      />
                      <p className="text-[11px] text-muted-foreground mt-1">Only last 4 digits will be stored</p>
                    </div>

                    {/* Bank name */}
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                        Bank Name <span className="text-muted-foreground font-normal normal-case">(optional)</span>
                      </label>
                      <input
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="e.g. HDFC, ICICI, SBI"
                        className="w-full px-4 h-12 rounded-xl border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all"
                      />
                    </div>
                  </>
                )}

                {/* RBI compliance notice */}
                <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <Lock size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-green-700 leading-relaxed">
                    Your card details are encrypted and securely vaulted as per RBI guidelines. We never store your full card number.
                  </p>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-secondary text-secondary-foreground h-12 rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <><Loader2 size={16} className="animate-spin" /> Saving...</>
                  ) : (
                    <><Shield size={14} /> Save Payment Method</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
