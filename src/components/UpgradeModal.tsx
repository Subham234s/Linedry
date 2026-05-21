'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Crown, ArrowRight, X, Sparkles, TrendingUp } from 'lucide-react'
import { useEntitlements } from '@/components/SubscriptionProvider'

export default function UpgradeModal() {
  const router = useRouter()
  const { showUpgradeModal, upgradeReason, closeUpgradeModal, planName } = useEntitlements()

  const [visible, setVisible] = useState(false)
  const [animating, setAnimating] = useState(false)

  // Animate in/out
  useEffect(() => {
    if (showUpgradeModal) {
      setVisible(true)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimating(true))
      })
    } else {
      setAnimating(false)
      const timer = setTimeout(() => setVisible(false), 250)
      return () => clearTimeout(timer)
    }
  }, [showUpgradeModal])

  if (!visible) return null

  const handleUpgrade = () => {
    closeUpgradeModal()
    router.push('/pricing-page')
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop — frosted blur */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-250 ease-out ${
          animating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={closeUpgradeModal}
      />

      {/* Modal card */}
      <div
        className={`relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ease-out ${
          animating
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4'
        }`}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={closeUpgradeModal}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 transition-colors z-10"
          aria-label="Close"
        >
          <X size={16} className="text-gray-400" />
        </button>

        {/* Top decorative strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />

        {/* Content */}
        <div className="px-7 pt-7 pb-6 text-center">
          {/* Animated icon */}
          <div
            className={`mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center mb-5 transition-all duration-400 delay-75 ${
              animating ? 'scale-100 opacity-100 rotate-0' : 'scale-75 opacity-0 -rotate-6'
            }`}
          >
            <Crown
              size={28}
              className={`text-amber-500 ${animating ? 'animate-[bounceIn_0.5s_ease_0.2s_both]' : ''}`}
            />
          </div>

          {/* Title */}
          <h3
            className={`text-xl font-extrabold text-gray-900 mb-2 transition-all duration-200 delay-100 ${
              animating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            Plan Limit Reached
          </h3>

          {/* Description */}
          <p
            className={`text-sm text-gray-500 leading-relaxed mb-1 transition-all duration-200 delay-150 ${
              animating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            {upgradeReason}
          </p>

          {/* Current plan badge */}
          {planName && (
            <div
              className={`inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-100 rounded-full px-3.5 py-1.5 mt-2 mb-5 transition-all duration-200 delay-200 ${
                animating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}
            >
              <Sparkles size={11} />
              Current: {planName}
            </div>
          )}

          {/* Benefits teaser */}
          <div
            className={`bg-gray-50 rounded-2xl p-4 mb-6 text-left transition-all duration-200 delay-[250ms] ${
              animating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
              Upgrade to unlock
            </p>
            <div className="space-y-2">
              {[
                'Higher laundry capacity',
                'More free pickups & drops',
                'Express & same-day delivery',
                'Priority 24/7 support',
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-2">
                  <TrendingUp size={12} className="text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-7 pb-7">
          <button
            type="button"
            onClick={closeUpgradeModal}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 active:scale-[0.97] transition-all"
          >
            Maybe Later
          </button>
          <button
            type="button"
            onClick={handleUpgrade}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-[0.97] transition-all shadow-md shadow-orange-500/20"
          >
            Upgrade Plan
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Bounce-in keyframe */}
      <style jsx global>{`
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.1); }
          70% { transform: scale(0.95); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
