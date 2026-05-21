import { useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/components/AuthProvider'
import { Database } from '@/types/supabase'

type SavedMethod = Database['public']['Tables']['saved_payment_methods']['Row']
type SavedMethodInsert = Database['public']['Tables']['saved_payment_methods']['Insert']

export function useSavedPaymentMethods() {
  const [methods, setMethods] = useState<SavedMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  const getUserId = useCallback(async () => {
    if (user?.id) return user.id
    const { data: { user: supaUser } } = await supabase.auth.getUser()
    return supaUser?.id
  }, [user, supabase])

  // ── Fetch all saved methods ─────────────────────────────────────────────

  const fetchMethods = useCallback(async () => {
    const uid = await getUserId()
    if (!uid) { setIsLoading(false); return }

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('saved_payment_methods')
        .select('*')
        .eq('user_id', uid)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      setMethods(data || [])
    } catch (error: any) {
      console.warn('Could not fetch payment methods:', error.message)
      setMethods([])
    } finally {
      setIsLoading(false)
    }
  }, [getUserId, supabase])

  // ── Add a new method ────────────────────────────────────────────────────

  const addMethod = async (
    method: Omit<SavedMethodInsert, 'user_id'>
  ): Promise<boolean> => {
    const uid = await getUserId()
    if (!uid) {
      toast.error('You must be logged in')
      return false
    }

    try {
      // If marking as default, reset all existing defaults first
      if (method.is_default) {
        await supabase
          .from('saved_payment_methods')
          .update({ is_default: false })
          .eq('user_id', uid)
      }

      const { error } = await supabase
        .from('saved_payment_methods')
        .insert({ ...method, user_id: uid })

      if (error) throw error

      toast.success('Payment method added!')
      fetchMethods()
      return true
    } catch (error: any) {
      toast.error(error.message || 'Failed to add payment method')
      return false
    }
  }

  // ── Remove a method ─────────────────────────────────────────────────────

  const removeMethod = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('saved_payment_methods')
        .delete()
        .eq('id', id)

      if (error) throw error

      setMethods((prev) => prev.filter((m) => m.id !== id))
      toast.success('Payment method removed')
      return true
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove')
      return false
    }
  }

  // ── Set as default ──────────────────────────────────────────────────────

  const setDefault = async (id: string): Promise<boolean> => {
    const uid = await getUserId()
    if (!uid) return false

    try {
      // Reset all defaults for this user
      await supabase
        .from('saved_payment_methods')
        .update({ is_default: false })
        .eq('user_id', uid)

      // Set the selected one as default
      const { error } = await supabase
        .from('saved_payment_methods')
        .update({ is_default: true })
        .eq('id', id)

      if (error) throw error

      setMethods((prev) =>
        prev.map((m) => ({ ...m, is_default: m.id === id }))
      )
      toast.success('Default payment method updated')
      return true
    } catch (error: any) {
      toast.error(error.message || 'Failed to update default')
      return false
    }
  }

  return {
    methods,
    isLoading,
    fetchMethods,
    addMethod,
    removeMethod,
    setDefault,
  }
}
