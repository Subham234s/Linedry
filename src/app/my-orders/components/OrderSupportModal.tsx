'use client';
import React, { useState } from 'react';
import { X, ChevronRight, ArrowLeft, MessageCircle, Ticket, CheckCircle2, Loader2 } from 'lucide-react';

type OrderStatus = 'Pending' | 'Picked Up' | 'Processing' | 'Out for Delivery' | 'Delivered';

interface IssueOption {
  id: string;
  label: string;
  message: string;
}

interface OrderSupportModalProps {
  orderId: string;
  orderStatus: OrderStatus;
  onClose: () => void;
}

const ISSUE_OPTIONS: Record<string, IssueOption[]> = {
  'Out for Delivery': [
    { id: 'track-rider', label: 'Track Delivery Rider', message: 'Your rider is currently on the way. You can track their live location or contact them directly.' },
    { id: 'delayed', label: 'Delivery is delayed', message: 'We apologize for the delay. Your rider is on the way and should arrive shortly. How would you like to proceed?' },
    { id: 'call-rider', label: 'Call the Rider', message: 'You can reach your delivery rider directly via WhatsApp or raise a ticket for our support team.' },
    { id: 'reschedule', label: 'Reschedule Delivery', message: 'Need to reschedule? Our team can help you pick a new delivery slot. How would you like to proceed?' },
  ],
  'Pending': [
    { id: 'cancel', label: 'Cancel my order', message: 'You can cancel your order before pickup. Our team will process the cancellation and refund if applicable.' },
    { id: 'change-address', label: 'Change pickup address', message: 'Need to update your pickup address? Our team can help you make this change before the rider arrives.' },
    { id: 'change-time', label: 'Change pickup time', message: 'Want to reschedule your pickup? We can help you find a more convenient time slot.' },
  ],
  'Picked Up': [
    { id: 'item-missing', label: 'Item not picked up', message: 'If an item was missed during pickup, our rider can return or we can arrange a separate pickup.' },
    { id: 'special-care', label: 'Special care instructions', message: 'Have specific care instructions for your clothes? Let our team know and we\'ll make a note.' },
  ],
  'Processing': [
    { id: 'status-update', label: 'Get status update', message: 'Your order is currently being processed at our facility. We\'ll keep you updated on progress.' },
    { id: 'special-request', label: 'Add special request', message: 'Need to add a special request for your order? Our team can try to accommodate it.' },
  ],
  'Delivered': [
    { id: 'missing-items', label: 'Missing Items', message: 'We\'re sorry to hear items are missing. Please describe the missing items and we\'ll investigate immediately.' },
    { id: 'damaged', label: 'Damaged Clothes', message: 'We sincerely apologize for any damage. Please share details and photos if possible so we can resolve this for you.' },
    { id: 'wrong-items', label: 'Wrong items received', message: 'Received someone else\'s clothes? We\'ll arrange an immediate swap. Please raise a ticket with details.' },
    { id: 'quality', label: 'Quality not satisfactory', message: 'We\'re sorry the quality didn\'t meet your expectations. Let us know the details and we\'ll make it right.' },
  ],
};

const DEFAULT_OPTIONS: IssueOption[] = [
  { id: 'general', label: 'General enquiry', message: 'How can we help you today? Please describe your issue and our team will assist you.' },
  { id: 'other', label: 'Other issue', message: 'Please describe your issue in detail and our support team will get back to you shortly.' },
];

function getIssueOptions(status: OrderStatus): IssueOption[] {
  return ISSUE_OPTIONS[status] ?? DEFAULT_OPTIONS;
}

// Mock async submit — replace with real API call when ready
async function submitSupportTicket(data: {
  orderId: string;
  issueCategory: string;
  description: string;
}): Promise<void> {
  // Simulates network latency
  await new Promise((resolve) => setTimeout(resolve, 1200));
  // In production, call your API or Supabase here:
  // await supabase.from('support_tickets').insert({
  //   user_id: currentUser.id,
  //   order_id: data.orderId,
  //   issue_category: data.issueCategory,
  //   description: data.description,
  //   status: 'open',
  // });
  console.log('Ticket submitted:', data);
}

export default function OrderSupportModal({ orderId, orderStatus, onClose }: OrderSupportModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedIssue, setSelectedIssue] = useState<IssueOption | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const issueOptions = getIssueOptions(orderStatus);
  const whatsappText = encodeURIComponent(`Hi, I need help with Linedry order ${orderId}${selectedIssue ? ` — ${selectedIssue.label}` : ''}`);
  const whatsappHref = `https://wa.me/919800000000?text=${whatsappText}`;

  function handleIssueSelect(issue: IssueOption) {
    setSelectedIssue(issue);
    setStep(2);
  }

  function handleBack() {
    if (step === 2) { setStep(1); setSelectedIssue(null); }
    else if (step === 3) { setStep(2); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    setIsSubmitting(true);
    try {
      await submitSupportTicket({
        orderId,
        issueCategory: selectedIssue?.label ?? 'General',
        description: description.trim(),
      });
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Sheet / Modal */}
      <div className="w-full md:max-w-lg bg-white rounded-t-3xl md:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] md:max-h-[85vh] overflow-hidden transition-all duration-300">

        {/* Sticky Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors duration-150 -ml-1"
                aria-label="Go back"
              >
                <ArrowLeft size={18} className="text-slate-700" />
              </button>
            )}
            <div>
              <p className="text-xs text-muted-foreground font-medium">Help with Order</p>
              <h2 className="text-sm font-extrabold text-slate-900 font-mono leading-tight">{orderId}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-muted transition-colors duration-150"
            aria-label="Close"
          >
            <X size={18} className="text-slate-600" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex gap-1.5 px-5 pt-3 flex-shrink-0">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                s <= step ? 'bg-yellow-400' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">

          {/* ── Step 1: Issue Selection ── */}
          {step === 1 && (
            <div className="space-y-3">
              <div className="mb-4">
                <h3 className="text-base font-bold text-slate-900">What can we help you with?</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Order status: <span className="font-semibold text-slate-700">{orderStatus}</span>
                </p>
              </div>
              {issueOptions.map((issue) => (
                <button
                  key={issue.id}
                  onClick={() => handleIssueSelect(issue)}
                  className="w-full flex items-center justify-between gap-3 px-4 h-14 bg-muted hover:bg-yellow-50 hover:border-yellow-300 border border-transparent rounded-xl text-left transition-all duration-150 group"
                >
                  <span className="text-sm font-semibold text-slate-800 group-hover:text-slate-900">{issue.label}</span>
                  <ChevronRight size={16} className="text-muted-foreground group-hover:text-yellow-500 flex-shrink-0 transition-colors duration-150" />
                </button>
              ))}
            </div>
          )}

          {/* ── Step 2: Resolution Actions ── */}
          {step === 2 && selectedIssue && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">{selectedIssue.label}</h3>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-sm text-slate-700 leading-relaxed">{selectedIssue.message}</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">How would you like to proceed?</p>

                {/* WhatsApp button */}
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 w-full h-12 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm transition-all duration-150 active:scale-95"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MessageCircle size={18} />
                  Chat on WhatsApp
                </a>

                {/* Raise ticket button */}
                <button
                  onClick={() => setStep(3)}
                  className="flex items-center justify-center gap-2.5 w-full h-12 border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white rounded-xl font-bold text-sm transition-all duration-150 active:scale-95"
                >
                  <Ticket size={18} />
                  Raise a Support Ticket
                </button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Our support team typically responds within <span className="font-semibold text-slate-700">2–4 hours</span>
              </p>
            </div>
          )}

          {/* ── Step 3: Ticket Form / Success ── */}
          {step === 3 && (
            <div>
              {isSuccess ? (
                /* Success State */
                <div className="flex flex-col items-center justify-center py-8 text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 size={32} className="text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 mb-1">Ticket Raised!</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Your support ticket has been submitted. Our team will reach out to you within <span className="font-semibold text-slate-700">2–4 hours</span>.
                    </p>
                  </div>
                  <div className="bg-muted rounded-xl px-4 py-3 w-full text-left">
                    <p className="text-xs text-muted-foreground">Issue</p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">{selectedIssue?.label}</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-full h-12 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl text-sm transition-all duration-150 active:scale-95 mt-2"
                  >
                    Done
                  </button>
                </div>
              ) : (
                /* Form State */
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">Describe your issue</h3>
                    <p className="text-xs text-muted-foreground">
                      Issue: <span className="font-semibold text-slate-700">{selectedIssue?.label}</span>
                    </p>
                  </div>

                  <div>
                    <label htmlFor="support-description" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Issue Details <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="support-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your issue in detail... (e.g., which items are missing, what kind of damage, etc.)"
                      rows={5}
                      required
                      className="w-full px-4 py-3 text-sm bg-muted rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 text-slate-800 placeholder:text-muted-foreground resize-none transition-all duration-150"
                    />
                  </div>

                  <div className="bg-muted rounded-xl px-4 py-3 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Order ID</span>
                      <span className="font-semibold text-slate-800 font-mono">{orderId}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Category</span>
                      <span className="font-semibold text-slate-800">{selectedIssue?.label}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !description.trim()}
                    className="w-full h-12 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold rounded-xl text-sm transition-all duration-150 active:scale-95 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Ticket'
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
