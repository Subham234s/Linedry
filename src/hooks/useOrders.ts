import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/components/AuthProvider'
import { Database } from '@/types/supabase'

type Order = Database['public']['Tables']['orders']['Row']
type OrderInsert = Database['public']['Tables']['orders']['Insert']

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user, isLoading: authLoading } = useAuth()
  const supabase = createClient()

  const fetchOrders = useCallback(async () => {
    let currentUserId = user?.id
    if (!currentUserId) {
      const { data: { user: supaUser } } = await supabase.auth.getUser()
      currentUserId = supaUser?.id
    }
    if (!currentUserId) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch orders')
    } finally {
      setIsLoading(false)
    }
  }, [user, supabase])

  // Real-time subscription for all user orders
  useEffect(() => {
    if (authLoading) return

    let channel: ReturnType<typeof supabase.channel> | null = null;
    
    const setupRealtime = async () => {
      let currentUserId = user?.id
      if (!currentUserId) {
        const { data: { user: supaUser } } = await supabase.auth.getUser()
        currentUserId = supaUser?.id
      }
      if (!currentUserId) return

      // Use a unique channel name to prevent "cannot add ... after subscribe" errors
      const uniqueChannelName = `user-orders-${currentUserId}-${Math.random().toString(36).substring(7)}`;

      channel = supabase
        .channel(uniqueChannelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `user_id=eq.${currentUserId}`,
          },
          (payload) => {
            if (payload.eventType === 'UPDATE') {
              setOrders((prev) => 
                prev.map(o => o.id === payload.new.id ? (payload.new as Order) : o)
              )
              toast.success(`Order update: Status changed to "${(payload.new as Order).status.replace('_', ' ')}"`, {
                icon: '🚚',
              })
            } else if (payload.eventType === 'INSERT') {
              setOrders((prev) => [payload.new as Order, ...prev])
            } else if (payload.eventType === 'DELETE') {
              setOrders((prev) => prev.filter(o => o.id !== payload.old.id))
            }
          }
        )
        .subscribe()
    }
    
    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [user, authLoading, supabase])

  const createOrder = async (orderData: Omit<OrderInsert, 'user_id' | 'status'>) => {
    let currentUserId = user?.id
    if (!currentUserId) {
      const { data: { user: supaUser } } = await supabase.auth.getUser()
      currentUserId = supaUser?.id
    }

    if (!currentUserId) {
      toast.error('You must be logged in to schedule a pickup')
      return null
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          ...orderData,
          user_id: currentUserId,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error
      
      // ── Trigger Notification ─────────────────────────────────────
      import('@/utils/notifications').then(({ notifyUser }) => {
        notifyUser({
          title: 'Order Confirmed',
          message: `Your ${data.service_type} order #${data.id.substring(0, 8)} has been scheduled successfully.`,
          type: 'order'
        });
      });

      toast.success('Pickup scheduled successfully!')
      setOrders((prev) => {
        if (!prev.some(o => o.id === data.id)) {
          return [data, ...prev]
        }
        return prev;
      });
      return data
    } catch (error: any) {
      toast.error(error.message || 'Failed to schedule pickup')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return { orders, isLoading, fetchOrders, createOrder }
}
