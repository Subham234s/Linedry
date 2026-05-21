'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/components/AuthProvider'
import { Database } from '@/types/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ─── Types ────────────────────────────────────────────────────────────────────

type Profile = Database['public']['Tables']['profiles']['Row']
type Order = Database['public']['Tables']['orders']['Row']
type Subscription = Database['public']['Tables']['subscriptions']['Row']
type WalletTx = Database['public']['Tables']['wallet_transactions']['Row']

export interface DashboardData {
  profile: Profile | null
  activeOrders: Order[]
  allOrders: Order[]
  subscription: Subscription | null
  walletTransactions: WalletTx[]
  isLoading: boolean
  refetch: () => Promise<void>
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useRealtimeDashboard(): DashboardData {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [activeOrders, setActiveOrders] = useState<Order[]>([])
  const [allOrders, setAllOrders] = useState<Order[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [walletTransactions, setWalletTransactions] = useState<WalletTx[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const { user, isLoading: authLoading } = useAuth()
  const supabase = createClient()
  const channelRef = useRef<RealtimeChannel | null>(null)

  // ── Initial data fetch (parallel queries) ───────────────────────────────

  const fetchDashboardData = useCallback(async () => {
    let currentUserId = user?.id
    if (!currentUserId) {
      const { data: { user: supaUser } } = await supabase.auth.getUser()
      currentUserId = supaUser?.id
    }
    if (!currentUserId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const [profileRes, activeOrdersRes, allOrdersRes, subRes, txRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', currentUserId).single(),
        supabase
          .from('orders')
          .select('*')
          .eq('user_id', currentUserId)
          .not('status', 'in', '("completed","cancelled","delivered")')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('orders')
          .select('*')
          .eq('user_id', currentUserId)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', currentUserId)
          .eq('status', 'active')
          .single(),
        supabase
          .from('wallet_transactions')
          .select('*')
          .eq('user_id', currentUserId)
          .order('created_at', { ascending: false })
          .limit(100),
      ])

      if (profileRes.error && profileRes.error.code !== 'PGRST116') throw profileRes.error
      if (activeOrdersRes.error) throw activeOrdersRes.error
      if (subRes.error && subRes.error.code !== 'PGRST116') throw subRes.error

      setProfile(profileRes.data || null)
      setActiveOrders(activeOrdersRes.data || [])
      setAllOrders(allOrdersRes.data || [])
      setSubscription(subRes.data || null)
      setWalletTransactions(txRes.data || [])
    } catch (error: any) {
      console.error('Dashboard fetch error:', error)
      toast.error(error.message || 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [user, supabase])

  // ── Wait for auth, then fetch ───────────────────────────────────────────

  useEffect(() => {
    if (!authLoading) {
      fetchDashboardData()
    }
  }, [authLoading, fetchDashboardData])

  // ── Supabase Realtime Channel (centralized listener) ────────────────────

  useEffect(() => {
    const userId = user?.id
    if (!userId) return

    // Clean up any prior channel before creating a new one
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }

    const channel = supabase
      .channel(`dashboard-realtime-${userId}`)

      // ── Orders table: INSERT, UPDATE, DELETE ──────────────────────────
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const { eventType, new: newRow, old: oldRow } = payload

          if (eventType === 'INSERT') {
            const newOrder = newRow as Order
            setActiveOrders((prev) => [newOrder, ...prev])
            setAllOrders((prev) => [newOrder, ...prev])
          }

          if (eventType === 'UPDATE') {
            const updated = newRow as Order
            // Update in allOrders
            setAllOrders((prev) =>
              prev.map((o) => (o.id === updated.id ? updated : o))
            )
            // If now completed/cancelled/delivered, remove from active; else update in active
            const completedStatuses = ['completed', 'cancelled', 'delivered']
            if (completedStatuses.includes(updated.status)) {
              setActiveOrders((prev) => prev.filter((o) => o.id !== updated.id))
            } else {
              setActiveOrders((prev) => {
                const exists = prev.find((o) => o.id === updated.id)
                if (exists) {
                  return prev.map((o) => (o.id === updated.id ? updated : o))
                }
                return [updated, ...prev]
              })
            }
          }

          if (eventType === 'DELETE') {
            const deletedId = (oldRow as Order).id
            setActiveOrders((prev) => prev.filter((o) => o.id !== deletedId))
            setAllOrders((prev) => prev.filter((o) => o.id !== deletedId))
          }
        }
      )

      // ── Profiles table: wallet_balance changes ────────────────────────
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          const updated = payload.new as Profile
          setProfile((prev) => (prev ? { ...prev, ...updated } : updated))
        }
      )

      // ── Wallet transactions: new credits/debits ───────────────────────
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'wallet_transactions',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newTx = payload.new as WalletTx
          setWalletTransactions((prev) => [newTx, ...prev])
        }
      )

      // ── Subscriptions table: plan changes ─────────────────────────────
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const sub = payload.new as Subscription
            if (sub.status === 'active') {
              setSubscription(sub)
            } else {
              setSubscription((prev) => (prev?.id === sub.id ? null : prev))
            }
          }
          if (payload.eventType === 'DELETE') {
            setSubscription(null)
          }
        }
      )

      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Dashboard RT] Realtime channel subscribed')
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('[Dashboard RT] Realtime channel error — retrying via refetch')
          // Graceful fallback: just re-poll
          fetchDashboardData()
        }
      })

    channelRef.current = channel

    // ── Cleanup on unmount or user change ──────────────────────────────
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [user?.id, supabase, fetchDashboardData])

  return {
    profile,
    activeOrders,
    allOrders,
    subscription,
    walletTransactions,
    isLoading: isLoading || authLoading,
    refetch: fetchDashboardData,
  }
}
