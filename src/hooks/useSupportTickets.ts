import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/components/AuthProvider'
import { Database } from '@/types/supabase'

type SupportTicketInsert = Database['public']['Tables']['support_tickets']['Insert']

export function useSupportTickets() {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const { user } = useAuth()

  const submitTicket = async (
    orderId: string | null,
    issue: string,
    imageFile?: File | null
  ) => {
    let currentUserId = user?.id
    if (!currentUserId) {
      const { data: { user: supaUser } } = await supabase.auth.getUser()
      currentUserId = supaUser?.id
    }
    if (!currentUserId) {
      toast.error('You must be logged in to submit a ticket.')
      return null
    }

    setIsLoading(true)
    let publicImageUrl: string | null = null

    try {
      // 1. Upload image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        // Generate a unique file name
        const fileName = `${currentUserId}-${Math.random()}.${fileExt}`
        const filePath = `tickets/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('support_images')
          .upload(filePath, imageFile, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) throw uploadError

        // Get the public URL for the uploaded image
        const { data: publicUrlData } = supabase.storage
          .from('support_images')
          .getPublicUrl(filePath)

        publicImageUrl = publicUrlData.publicUrl
      }

      // 2. Insert into support_tickets table
      const ticketData: SupportTicketInsert = {
        user_id: currentUserId,
        order_id: orderId,
        category: 'General',
        description: issue,
        issue,
        image_url: publicImageUrl,
        status: 'open',
      }

      const { data, error: insertError } = await supabase
        .from('support_tickets')
        .insert(ticketData)
        .select()
        .single()

      if (insertError) throw insertError

      toast.success('Support ticket submitted successfully. We will get back to you soon.')
      return data
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit support ticket.')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return { submitTicket, isLoading }
}
