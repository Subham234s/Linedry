'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  icon?: React.ReactNode;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  icon,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  // Animate in
  useEffect(() => {
    if (open) {
      setVisible(true);
      // Trigger enter animation on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimating(true));
      });
    } else {
      // Trigger exit animation
      setAnimating(false);
      const timer = setTimeout(() => setVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!visible) return null;

  const isDanger = variant === 'danger';

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-200 ease-out ${
          animating ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={!isLoading ? onCancel : undefined}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-200 ease-out ${
          animating
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-2'
        }`}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 z-10"
          aria-label="Close"
        >
          <X size={16} className="text-gray-400" />
        </button>

        {/* Content */}
        <div className="px-6 pt-6 pb-5 text-center">
          {/* Animated icon */}
          <div
            className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-all duration-300 delay-75 ${
              animating ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
            } ${isDanger ? 'bg-red-50' : 'bg-amber-50'}`}
          >
            {icon || (
              <AlertTriangle
                size={26}
                className={`${isDanger ? 'text-red-500' : 'text-amber-500'} ${
                  animating ? 'animate-[wiggle_0.5s_ease-in-out_0.15s]' : ''
                }`}
              />
            )}
          </div>

          <h3
            className={`text-lg font-extrabold mb-1.5 transition-all duration-200 delay-100 ${
              animating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
            } ${isDanger ? 'text-gray-900' : 'text-gray-900'}`}
          >
            {title}
          </h3>
          <p
            className={`text-sm text-gray-500 leading-relaxed transition-all duration-200 delay-150 ${
              animating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
            }`}
          >
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 active:scale-[0.97] transition-all disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white active:scale-[0.97] transition-all disabled:opacity-60 shadow-sm ${
              isDanger
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-amber-500 hover:bg-amber-600'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Please wait...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>

      {/* Wiggle keyframe — injected once */}
      <style jsx global>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(-12deg); }
          30% { transform: rotate(10deg); }
          45% { transform: rotate(-8deg); }
          60% { transform: rotate(6deg); }
          75% { transform: rotate(-3deg); }
        }
      `}</style>
    </div>
  );
}
