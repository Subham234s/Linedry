'use client';
import React, { useState, useEffect } from 'react';
import { Download, Loader2 } from 'lucide-react';
import type { ReceiptOrderData } from '@/components/ReceiptPDF';

interface DownloadReceiptButtonProps {
  order: ReceiptOrderData;
  className?: string;
}

// Inner component that uses @react-pdf/renderer — only rendered client-side
function PDFButton({ order, className = '' }: DownloadReceiptButtonProps) {
  const [PDFDownloadLink, setPDFDownloadLink] = React.useState<React.ComponentType<any> | null>(null);
  const [ReceiptPDF, setReceiptPDF] = React.useState<React.ComponentType<any> | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    Promise.all([
      import('@react-pdf/renderer').then((m) => m.PDFDownloadLink),
      import('@/components/ReceiptPDF').then((m) => m.default),
    ]).then(([Link, PDF]) => {
      if (!cancelled) {
        setPDFDownloadLink(() => Link);
        setReceiptPDF(() => PDF);
        setReady(true);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const fileName = `Linedry-Receipt-${order.orderNo}.pdf`;

  if (!ready || !PDFDownloadLink || !ReceiptPDF) {
    return (
      <button
        disabled
        className={`flex items-center gap-2 px-4 h-10 rounded-xl border-2 border-primary text-primary text-xs font-bold opacity-60 cursor-not-allowed ${className}`}
      >
        <Loader2 size={13} className="animate-spin" />
        Generating PDF...
      </button>
    );
  }

  const Link = PDFDownloadLink as React.ComponentType<any>;
  const PDF = ReceiptPDF as React.ComponentType<any>;

  return (
    <Link document={<PDF order={order} />} fileName={fileName}>
      {({ loading }: { loading: boolean }) => (
        <button
          disabled={loading}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          className={`flex items-center gap-2 px-4 h-10 rounded-xl border-2 border-primary text-primary text-xs font-bold
            hover:bg-primary hover:text-white transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed
            active:scale-95 ${className}`}
        >
          {loading ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download size={13} />
              Download Receipt
            </>
          )}
        </button>
      )}
    </Link>
  );
}

// Client-only wrapper to prevent SSR entirely
export default function DownloadReceiptButton(props: DownloadReceiptButtonProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return <PDFButton {...props} />;
}
