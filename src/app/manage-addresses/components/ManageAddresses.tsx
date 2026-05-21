'use client';
import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Pencil, Trash2, X, Home, Briefcase, Building2, Loader2 } from 'lucide-react';
import { useAddresses } from '@/hooks/useAddresses';
import { Database } from '@/types/supabase';

type Address = Database['public']['Tables']['addresses']['Row'];

const tagStyles: Record<string, string> = {
  Home: 'bg-blue-100 text-blue-700',
  'PG/Hostel': 'bg-purple-100 text-purple-700',
  Office: 'bg-green-100 text-green-700',
  Other: 'bg-gray-100 text-gray-600',
};

const tagIcons: Record<string, React.ReactNode> = {
  Home: <Home size={12} />,
  'PG/Hostel': <Building2 size={12} />,
  Office: <Briefcase size={12} />,
  Other: <MapPin size={12} />,
};

const tagOptions = ['Home', 'PG/Hostel', 'Office', 'Other'];

export default function ManageAddresses() {
  const { addresses, isLoading, fetchAddresses, addAddress, updateAddress, deleteAddress } = useAddresses();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ tag: 'Home', full_address: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const openAdd = () => { 
    setForm({ tag: 'Home', full_address: '' }); 
    setEditId(null); 
    setShowForm(true); 
  };
  
  const openEdit = (addr: Address) => { 
    setForm({ tag: addr.tag || 'Other', full_address: addr.full_address }); 
    setEditId(addr.id); 
    setShowForm(true); 
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      await deleteAddress(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (editId) {
      const success = await updateAddress(editId, { ...form });
      if (success) setShowForm(false);
    } else {
      const success = await addAddress({ ...form, map_coordinates: null });
      if (success) setShowForm(false);
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-primary mb-1">Manage Addresses</h1>
          <p className="text-muted-foreground text-sm">Save and manage your pickup locations.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 md:px-5 h-12 rounded-full text-sm font-bold hover:opacity-90 transition-all flex-shrink-0"
        >
          <Plus size={16} /> Add New
        </button>
      </div>

      {/* Address Cards — horizontal scroll on mobile */}
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x md:flex-col md:overflow-x-visible md:pb-0 md:space-y-4 md:gap-0">
        {isLoading && addresses.length === 0 ? (
          // Skeleton Loaders
          [1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 snap-start w-72 md:w-full bg-card border border-border rounded-2xl p-4 md:p-5 flex items-start justify-between gap-4 animate-pulse">
              <div className="flex items-start gap-3 w-full">
                <div className="w-10 h-10 rounded-xl bg-muted flex-shrink-0 mt-0.5"></div>
                <div className="w-full">
                   <div className="h-5 w-16 bg-muted rounded-full mb-2"></div>
                   <div className="h-4 w-3/4 bg-muted rounded mb-1"></div>
                   <div className="h-3 w-1/2 bg-muted rounded"></div>
                </div>
              </div>
            </div>
          ))
        ) : addresses.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground w-full bg-white rounded-2xl border border-border">
            <MapPin size={40} className="mx-auto mb-3 opacity-30 text-primary" />
            <p className="font-semibold text-primary">No saved addresses yet.</p>
            <p className="text-sm mt-1 mb-4">Add your first address to get started.</p>
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 h-10 rounded-full text-sm font-bold hover:opacity-90 transition-all"
            >
              <Plus size={16} /> Add Address
            </button>
          </div>
        ) : (
          addresses.map((addr) => {
            const tag = addr.tag || 'Other';
            const tagStyle = tagStyles[tag] || tagStyles['Other'];
            const tagIcon = tagIcons[tag] || tagIcons['Other'];

            return (
              <div key={addr.id} className="flex-shrink-0 snap-start w-72 md:w-full bg-card border border-border rounded-2xl p-4 md:p-5 flex items-start justify-between gap-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin size={18} className="text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${tagStyle}`}>
                        {tagIcon} {tag}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-foreground break-words">{addr.full_address}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(addr)} disabled={isSubmitting} className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground min-w-[36px] min-h-[36px] flex items-center justify-center disabled:opacity-50" aria-label="Edit address">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => handleDelete(addr.id)} disabled={isSubmitting} className="p-2 rounded-xl hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-500 min-w-[36px] min-h-[36px] flex items-center justify-center disabled:opacity-50" aria-label="Delete address">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Form Modal — full-screen on mobile */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-3xl sm:m-4 rounded-t-3xl shadow-2xl p-5 md:p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5 md:mb-6">
              <h2 className="text-lg font-extrabold text-primary">{editId ? 'Edit Address' : 'Add New Address'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-muted transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center" aria-label="Close form">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tag Selector */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2 block">Address Type</label>
                <div className="flex gap-2 flex-wrap">
                  {tagOptions.map(t => (
                    <button type="button" key={t} onClick={() => setForm(f => ({ ...f, tag: t }))}
                      className={`flex items-center gap-1.5 px-3 h-9 rounded-full text-xs font-bold border-2 transition-all ${form.tag === t ? 'border-secondary bg-secondary/10 text-secondary' : 'border-border text-muted-foreground hover:border-secondary/40'}`}>
                      {tagIcons[t]} {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Full Address</label>
                <textarea required value={form.full_address} onChange={e => setForm(f => ({ ...f, full_address: e.target.value }))}
                  placeholder="e.g. Flat 4B, Sunrise Apartments, AE Block, Salt Lake Sector V, Kolkata, 700091"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 bg-background resize-none" />
              </div>

              {/* Maps placeholder */}
              <div className="rounded-xl border-2 border-dashed border-border bg-muted/50 p-4 text-center">
                <MapPin size={24} className="mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs font-bold text-muted-foreground">Google Maps Pin Drop</p>
                <p className="text-xs text-muted-foreground mt-0.5">Google Maps API integration — drop a pin to capture exact coordinates</p>
              </div>

              <button type="submit"
                disabled={isSubmitting || !form.full_address.trim()}
                className="w-full bg-secondary text-secondary-foreground h-12 rounded-xl font-bold text-sm hover:opacity-90 transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <><Loader2 size={16} className="animate-spin" /> Saving...</>
                ) : (
                  editId ? 'Save Changes' : 'Add Address'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
