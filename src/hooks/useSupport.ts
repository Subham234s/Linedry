import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/components/AuthProvider'
import { Database } from '@/types/supabase'

type SupportTicketInsert = Database['public']['Tables']['support_tickets']['Insert']

export function useSupport() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()

  const submitTicket = async (ticket: Omit<SupportTicketInsert, 'user_id' | 'status'>) => {
    let currentUserId = user?.id
    if (!currentUserId) {
      const { data: { user: supaUser } } = await supabase.auth.getUser()
      currentUserId = supaUser?.id
    }
    if (!currentUserId) {
      toast.error('You must be logged in to submit a ticket')
      return false
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          ...ticket,
          status: 'open'
        })

      if (error) throw error
      
      toast.success('Support ticket submitted successfully!')
      return true
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit support ticket')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return { isSubmitting, submitTicket }
}
