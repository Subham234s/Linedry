'use client';
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, MessageCircle, Ticket, Send, Loader2, Info } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'react-hot-toast';
import { ListItemSkeleton } from '@/components/ui/Skeleton';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  { id: 'f1', question: 'What are the delivery timelines?', answer: 'Standard orders are delivered within 48 hours of pickup. Express Wash orders are returned the same day by 8 PM if picked up before 10 AM.' },
  { id: 'f2', question: 'What is your damage policy?', answer: 'We take utmost care of your garments. In the rare event of damage, we offer full compensation up to ₹2,000 per item after a quality review. Please report within 24 hours of delivery.' },
  { id: 'f3', question: 'How do I reschedule or cancel a pickup?', answer: 'You can reschedule or cancel a pickup up to 2 hours before the scheduled time from the "My Orders" section. Cancellations after that may incur a ₹30 convenience fee.' },
  { id: 'f4', question: 'What items are NOT accepted for cleaning?', answer: 'We do not accept leather goods, fur, heavily embellished garments, or items with severe mold/pest infestation. Our team will notify you if any item is rejected during pickup.' },
  { id: 'f5', question: 'How is the pricing calculated?', answer: 'Pricing is per kg for Wash & Fold (₹80–120/kg) and per piece for Dry Cleaning (₹199+). Subscription plans offer flat weekly rates. Final pricing is shown before you confirm booking.' },
  { id: 'f6', question: 'Is my payment information secure?', answer: 'Yes. We use industry-standard encryption for all transactions. We do not store your full card details on our servers. All payments are processed via PCI-DSS compliant gateways.' },
];

const issueTypes = ['Item Missing', 'Damage to Garment', 'Late Delivery', 'Wrong Item Returned', 'Billing Issue', 'Other'];

export default function HelpSupport() {
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [ticketOrderId, setTicketOrderId] = useState('');
  const [ticketCategory, setTicketCategory] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    async function fetchRecentOrders() {
      if (!user) return;
      setIsLoadingOrders(true);
      try {
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const { data, error } = await supabase
          .from('orders')
          .select('id, service_type, total_amount, created_at')
          .eq('user_id', user.id)
          .gte('created_at', sixtyDaysAgo.toISOString())
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setIsLoadingOrders(false);
      }
    }
    fetchRecentOrders();
  }, [user, supabase]);

  const toggleFaq = (id: string) => setOpenFaq(prev => prev === id ? null : id);

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to raise a ticket.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('support_tickets').insert({
        user_id: user.id,
        order_id: ticketOrderId || null,
        category: ticketCategory,
        description: ticketDesc,
        status: 'Open'
      });
      
      if (error) throw error;
      
      toast.success('Ticket Raised Successfully. Our team will contact you within 24 hours.');
      setTicketOrderId('');
      setTicketCategory('');
      setTicketDesc('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to raise ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const showPhotoWarning = ticketCategory === 'Damage to Garment' || ticketCategory === 'Wrong Item Returned';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-extrabold text-primary mb-1">Help & Support</h1>
        <p className="text-muted-foreground text-sm">Find answers, chat with us, or raise a support ticket.</p>
      </div>

      {/* WhatsApp Support */}
      <a
        href="https://wa.me/919876543210"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-3 w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl font-bold text-base transition-all duration-150 shadow-sm"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={22} />
        Chat on WhatsApp
      </a>

      {/* FAQs */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-base font-extrabold text-foreground">Frequently Asked Questions</h2>
        </div>
        <div className="divide-y divide-border">
          {faqs.map((faq) => (
            <div key={faq.id}>
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/50 transition-colors"
                aria-expanded={openFaq === faq.id}
              >
                <span className="text-sm font-semibold text-foreground pr-4">{faq.question}</span>
                {openFaq === faq.id
                  ? <ChevronUp size={16} className="text-secondary flex-shrink-0" />
                  : <ChevronDown size={16} className="text-muted-foreground flex-shrink-0" />
                }
              </button>
              {openFaq === faq.id && (
                <div className="px-5 pb-4 animate-fade-in">
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Raise a Ticket */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Ticket size={16} className="text-secondary" />
          <h2 className="text-base font-extrabold text-foreground">Raise a Support Ticket</h2>
        </div>

        <form onSubmit={handleTicketSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block" htmlFor="orderId">Select Order ID (Optional)</label>
            <div className="relative">
              <select
                id="orderId"
                value={ticketOrderId}
                onChange={e => setTicketOrderId(e.target.value)}
                disabled={isLoadingOrders || orders.length === 0}
                className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 bg-background appearance-none disabled:opacity-50 disabled:cursor-not-allowed pr-10"
              >
                {isLoadingOrders ? (
                  <option value="">Loading orders...</option>
                ) : orders.length === 0 ? (
                  <option value="">No recent orders found</option>
                ) : (
                  <>
                    <option value="">-- Select an order --</option>
                    {orders.map(order => (
                      <option key={order.id} value={order.id}>
                        Order on {formatDate(order.created_at)} - {order.service_type} (₹{order.total_amount || 0})
                      </option>
                    ))}
                  </>
                )}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block" htmlFor="issueType">Issue Category</label>
            <div className="relative">
              <select
                id="issueType"
                required
                value={ticketCategory}
                onChange={e => setTicketCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 bg-background appearance-none pr-10"
              >
                <option value="">-- Select issue category --</option>
                {issueTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
            
            {showPhotoWarning && (
              <div className="mt-2 flex items-start gap-1.5 text-amber-600 bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                <Info size={14} className="mt-0.5 flex-shrink-0" />
                <p className="text-xs font-medium">Our executive may contact you to request photos of the item.</p>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block" htmlFor="ticketDesc">Describe Your Issue</label>
            <textarea
              id="ticketDesc"
              required
              rows={4}
              value={ticketDesc}
              onChange={e => setTicketDesc(e.target.value)}
              placeholder="Please describe your issue in detail so we can help you faster..."
              className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 bg-background resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 w-full bg-secondary text-secondary-foreground py-3.5 rounded-xl font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </form>
      </div>
    </div>
  );
}
