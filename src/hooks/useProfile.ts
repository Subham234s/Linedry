import { useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/components/AuthProvider'
import { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()

  const fetchProfile = useCallback(async () => {
    let currentUserId = user?.id
    if (!currentUserId) {
      const { data: { user: supaUser } } = await supabase.auth.getUser()
      currentUserId = supaUser?.id
    }
    if (!currentUserId) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone, wallet_balance, avatar_url')
        .eq('id', currentUserId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch profile')
    } finally {
      setIsLoading(false)
    }
  }, [user, supabase])

  const updateProfile = async (updates: ProfileUpdate) => {
    let currentUserId = user?.id
    if (!currentUserId) {
      const { data: { user: supaUser } } = await supabase.auth.getUser()
      currentUserId = supaUser?.id
    }
    if (!currentUserId) {
      toast.error('You must be logged in to update profile')
      return false
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', currentUserId)
        .select()
        .single()

      if (error) throw error
      
      toast.success('Profile updated successfully!')
      setProfile(data)
      return true
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return { profile, isLoading, fetchProfile, updateProfile }
}
