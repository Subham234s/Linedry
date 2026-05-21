'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useAuth } from '@/components/AuthProvider'
import { Database } from '@/types/supabase'

// ─── Plan limits dictionary ──────────────────────────────────────────────────

export interface PlanLimits {
  maxKg: number
  maxPickups: number
}

const PLAN_LIMITS: Record<string, PlanLimits> = {
  'Essential':    { maxKg: 10, maxPickups: 2 },
  'Premium Care': { maxKg: 20, maxPickups: 4 },
  'Elite Family': { maxKg: 40, maxPickups: 999 }, // 999 = unlimited
}

const DEFAULT_LIMITS: PlanLimits = { maxKg: 0, maxPickups: 0 }

// ─── Types ────────────────────────────────────────────────────────────────────

type Subscription = Database['public']['Tables']['subscriptions']['Row']

interface UsageState {
  kgUsed: number
  pickupsUsed: number
}

interface SubscriptionContextType {
  // Subscription data
  subscription: Subscription | null
  isLoading: boolean
  isActive: boolean
  planName: string | null
  planLimits: PlanLimits

  // Usage tracking
  usage: UsageState
  updateUsage: (updates: Partial<UsageState>) => void
  incrementPickups: () => void

  // Entitlement checks
  canAddLaundry: (kgToAdd: number) => boolean
  canRequestPickup: () => boolean
  getRemainingKg: () => number
  getRemainingPickups: () => number

  // Upgrade modal
  showUpgradeModal: boolean
  upgradeReason: string
  triggerUpgrade: (reason?: string) => void
  closeUpgradeModal: () => void

  // Refresh
  refetch: () => Promise<void>
}

// ─── Context ──────────────────────────────────────────────────────────────────

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscription: null,
  isLoading: true,
  isActive: false,
  planName: null,
  planLimits: DEFAULT_LIMITS,
  usage: { kgUsed: 0, pickupsUsed: 0 },
  updateUsage: () => {},
  incrementPickups: () => {},
  canAddLaundry: () => false,
  canRequestPickup: () => false,
  getRemainingKg: () => 0,
  getRemainingPickups: () => 0,
  showUpgradeModal: false,
  upgradeReason: '',
  triggerUpgrade: () => {},
  closeUpgradeModal: () => {},
  refetch: async () => {},
})

export const useEntitlements = () => useContext(SubscriptionContext)

// ─── Provider ─────────────────────────────────────────────────────────────────

export default function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const supabase = createClient()

  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [usage, setUsage] = useState<UsageState>({ kgUsed: 0, pickupsUsed: 0 })
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState('')

  // ── Fetch subscription from Supabase ──────────────────────────────────────

  const fetchSubscription = useCallback(async () => {
    let userId = user?.id
    if (!userId) {
      const { data: { user: supaUser } } = await supabase.auth.getUser()
      userId = supaUser?.id
    }
    if (!userId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('SubscriptionProvider fetch error:', error.message)
      }

      setSubscription(data || null)
    } catch (err: any) {
      console.error('SubscriptionProvider error:', err.message)
    } finally {
      setIsLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  // ── Derived state ─────────────────────────────────────────────────────────

  const isActive = !!(
    subscription?.status === 'active' &&
    (!subscription.end_date || new Date(subscription.end_date) > new Date())
  )

  const planName = subscription?.plan_name || null
  const planLimits = (planName && PLAN_LIMITS[planName]) || DEFAULT_LIMITS

  // ── Usage management ──────────────────────────────────────────────────────

  const updateUsage = useCallback((updates: Partial<UsageState>) => {
    setUsage(prev => ({ ...prev, ...updates }))
  }, [])

  const incrementPickups = useCallback(() => {
    setUsage(prev => ({ ...prev, pickupsUsed: prev.pickupsUsed + 1 }))
  }, [])

  // ── Entitlement checks ────────────────────────────────────────────────────

  const canAddLaundry = useCallback((kgToAdd: number): boolean => {
    if (!isActive) return false
    return (usage.kgUsed + kgToAdd) <= planLimits.maxKg
  }, [isActive, usage.kgUsed, planLimits.maxKg])

  const canRequestPickup = useCallback((): boolean => {
    if (!isActive) return false
    return usage.pickupsUsed < planLimits.maxPickups
  }, [isActive, usage.pickupsUsed, planLimits.maxPickups])

  const getRemainingKg = useCallback((): number => {
    return Math.max(0, planLimits.maxKg - usage.kgUsed)
  }, [planLimits.maxKg, usage.kgUsed])

  const getRemainingPickups = useCallback((): number => {
    if (planLimits.maxPickups >= 999) return Infinity
    return Math.max(0, planLimits.maxPickups - usage.pickupsUsed)
  }, [planLimits.maxPickups, usage.pickupsUsed])

  // ── Upgrade modal controls ────────────────────────────────────────────────

  const triggerUpgrade = useCallback((reason?: string) => {
    setUpgradeReason(reason || 'You\'ve reached your plan limit.')
    setShowUpgradeModal(true)
  }, [])

  const closeUpgradeModal = useCallback(() => {
    setShowUpgradeModal(false)
    setUpgradeReason('')
  }, [])

  // ── Context value ─────────────────────────────────────────────────────────

  const value: SubscriptionContextType = {
    subscription,
    isLoading,
    isActive,
    planName,
    planLimits,
    usage,
    updateUsage,
    incrementPickups,
    canAddLaundry,
    canRequestPickup,
    getRemainingKg,
    getRemainingPickups,
    showUpgradeModal,
    upgradeReason,
    triggerUpgrade,
    closeUpgradeModal,
    refetch: fetchSubscription,
  }

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  )
}
