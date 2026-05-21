import { useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/components/AuthProvider'
import { Database } from '@/types/supabase'

type Subscription = Database['public']['Tables']['subscriptions']['Row']

export function useSubscriptions() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()

  const fetchSubscription = useCallback(async () => {
    let currentUserId = user?.id
    if (!currentUserId) {
      const { data: { user: supaUser } } = await supabase.auth.getUser()
      currentUserId = supaUser?.id
    }
    if (!currentUserId) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', currentUserId)
        .single()

      // It's okay if no rows are returned if the user has no subscription yet.
      if (error && error.code !== 'PGRST116') throw error
      setSubscription(data || null)
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch subscription')
    } finally {
      setIsLoading(false)
    }
  }, [user, supabase])

  const upgradeSubscription = async (planId: string) => {
    let currentUserId = user?.id
    if (!currentUserId) {
      const { data: { user: supaUser } } = await supabase.auth.getUser()
      currentUserId = supaUser?.id
    }
    if (!currentUserId) {
      toast.error('You must be logged in to upgrade')
      return null
    }

    setIsLoading(true)
    try {
      // Check if user already has a subscription
      const { data: existingSub, error: fetchError } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', currentUserId)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError

      let result;
      if (existingSub) {
        // UPDATE
        const { data, error } = await supabase
          .from('subscriptions')
          .update({
            plan_id: planId,
            status: 'active',
          })
          .eq('id', existingSub.id)
          .eq('user_id', currentUserId)
          .select()
          .single()
        
        if (error) throw error
        result = data;
      } else {
        // INSERT if doesn't exist
        const { data, error } = await supabase
          .from('subscriptions')
          .insert({
            user_id: currentUserId,
            plan_id: planId,
            status: 'active',
          })
          .select()
          .single()

        if (error) throw error
        result = data;
      }
      
      toast.success('Subscription upgraded successfully!')
      setSubscription(result)
      return result
    } catch (error: any) {
      toast.error(error.message || 'Failed to upgrade subscription')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return { subscription, isLoading, fetchSubscription, upgradeSubscription }
}
