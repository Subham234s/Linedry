import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Database } from '@/types/supabase'
import { toast } from 'react-hot-toast'

type Order = Database['public']['Tables']['orders']['Row']

export function useLiveTracking(orderId: string | null) {
  const [orderState, setOrderState] = useState<Partial<Order> | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!orderId) return

    // Listen to updates on the orders table
    const channel = supabase
      .channel('custom-all-channel')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`, // Only listen to this specific order
        },
        (payload) => {
          const updatedOrder = payload.new as Order
          
          setOrderState((prevState) => ({
            ...prevState,
            ...updatedOrder,
          }))

          toast.success(`Order update: Status changed to "${updatedOrder.status}"`, {
            icon: '🚚',
          })
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.error('Real-time subscription error:', err)
        }
      })

    const fetchInitialData = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()
        
      if (data && !error) {
        setOrderState(data)
      }
    }

    fetchInitialData()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orderId, supabase])

  return { orderState }
}
