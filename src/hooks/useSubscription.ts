import { useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/components/AuthProvider'
import { Database } from '@/types/supabase'

export type Subscription = Database['public']['Tables']['subscriptions']['Row']

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  const fetchSubscription = useCallback(async () => {
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
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }
      setSubscription(data || null)
    } catch (error: any) {
      console.error('Failed to fetch subscription:', error.message)
    } finally {
      setIsLoading(false)
    }
  }, [user, supabase])

  /**
   * Activates or upgrades a subscription.
   * Calculates end_date based on duration in days.
   */
  const activateSubscription = async (payload: {
    plan_id: string
    plan_name: string
    amount: number
    duration_days: number
  }) => {
    let currentUserId = user?.id
    if (!currentUserId) {
      const { data: { user: supaUser } } = await supabase.auth.getUser()
      currentUserId = supaUser?.id
    }
    if (!currentUserId) {
      toast.error('You must be logged in to subscribe')
      return false
    }

    setIsLoading(true)
    try {
      const now = new Date()
      const expiresAt = new Date(now.getTime() + payload.duration_days * 24 * 60 * 60 * 1000)

      const upsertPayload = {
        user_id: currentUserId,
        plan_id: payload.plan_id,
        plan_name: payload.plan_name,
        amount: payload.amount,
        status: 'active',
        start_date: now.toISOString(),
        end_date: expiresAt.toISOString(),
      }

      let result

      if (subscription?.id) {
        // Update existing
        const { data, error } = await supabase
          .from('subscriptions')
          .update(upsertPayload)
          .eq('id', subscription.id)
          .select()
          .single()

        if (error) throw error
        result = data
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('subscriptions')
          .insert(upsertPayload)
          .select()
          .single()

        if (error) throw error
        result = data
      }

      setSubscription(result)
      toast.success(`${payload.plan_name} plan activated!`)
      return true
    } catch (error: any) {
      toast.error(error.message || 'Failed to activate subscription')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const cancelSubscription = async () => {
    if (!subscription?.id) return false

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', subscription.id)
        .select()
        .single()

      if (error) throw error

      toast.success('Subscription cancelled.')
      setSubscription(data)
      return true
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel subscription')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Derived state helpers
  const isActive = subscription?.status === 'active' &&
    (!subscription.end_date || new Date(subscription.end_date) > new Date())

  const isExpired = subscription?.status === 'active' &&
    subscription.end_date != null &&
    new Date(subscription.end_date) <= new Date()

  const isCancelled = subscription?.status === 'cancelled'

  const daysRemaining = subscription?.end_date
    ? Math.max(0, Math.ceil((new Date(subscription.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  return {
    subscription,
    isLoading,
    isActive,
    isExpired,
    isCancelled,
    daysRemaining,
    fetchSubscription,
    activateSubscription,
    cancelSubscription,
  }
}
