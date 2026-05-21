import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/components/AuthProvider'
import { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']
type Order = Database['public']['Tables']['orders']['Row']
type Subscription = Database['public']['Tables']['subscriptions']['Row']

export function useDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [activeOrders, setActiveOrders] = useState<Order[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const { user, isLoading: authLoading } = useAuth()
  const supabase = createClient()

  const fetchDashboardData = useCallback(async () => {
    // Use context user first, fallback to direct auth check
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
      // Run queries in parallel
      const [profileRes, ordersRes, subRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', currentUserId).single(),
        supabase.from('orders').select('*').eq('user_id', currentUserId).neq('status', 'completed').neq('status', 'cancelled').order('created_at', { ascending: false }).limit(3),
        supabase.from('subscriptions').select('*').eq('user_id', currentUserId).eq('status', 'active').single()
      ])

      // Ignore 406/PGRST116 (No rows found) for subscription and profile
      if (profileRes.error && profileRes.error.code !== 'PGRST116') throw profileRes.error
      if (ordersRes.error) throw ordersRes.error
      if (subRes.error && subRes.error.code !== 'PGRST116') throw subRes.error

      setProfile(profileRes.data || null)
      setActiveOrders(ordersRes.data || [])
      setSubscription(subRes.data || null)
    } catch (error: any) {
      toast.error(error.message || 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [user, supabase])

  // Wait for auth to finish loading before fetching
  useEffect(() => {
    if (!authLoading) {
      fetchDashboardData()
    }
  }, [authLoading, fetchDashboardData])

  return { profile, activeOrders, subscription, isLoading: isLoading || authLoading, refetch: fetchDashboardData }
}
