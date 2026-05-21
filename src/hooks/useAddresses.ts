import { useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/components/AuthProvider'
import { Database } from '@/types/supabase'

type Address = Database['public']['Tables']['addresses']['Row']
type AddressInsert = Database['public']['Tables']['addresses']['Insert']
type AddressUpdate = Database['public']['Tables']['addresses']['Update']

export function useAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()

  const fetchAddresses = useCallback(async () => {
    let currentUserId = user?.id
    if (!currentUserId) {
      const { data: { user: supaUser } } = await supabase.auth.getUser()
      currentUserId = supaUser?.id
    }
    if (!currentUserId) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', currentUserId)
        .order('id', { ascending: false })

      if (error) throw error
      setAddresses(data || [])
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch addresses')
    } finally {
      setIsLoading(false)
    }
  }, [user, supabase])

  const addAddress = async (address: Omit<AddressInsert, 'user_id'>) => {
    let currentUserId = user?.id
    if (!currentUserId) {
      const { data: { user: supaUser } } = await supabase.auth.getUser()
      currentUserId = supaUser?.id
    }
    if (!currentUserId) {
      toast.error('You must be logged in to add an address')
      return null
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('addresses')
        .insert({ ...address, user_id: currentUserId })
        .select()
        .single()

      if (error) throw error
      
      toast.success('Address added successfully!')
      setAddresses((prev) => [data, ...prev])
      return data
    } catch (error: any) {
      toast.error(error.message || 'Failed to add address')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const updateAddress = async (id: string, addressUpdates: AddressUpdate) => {
    let currentUserId = user?.id
    if (!currentUserId) {
      const { data: { user: supaUser } } = await supabase.auth.getUser()
      currentUserId = supaUser?.id
    }
    if (!currentUserId) {
      toast.error('You must be logged in to update an address')
      return null
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('addresses')
        .update(addressUpdates)
        .eq('id', id)
        .eq('user_id', currentUserId)
        .select()
        .single()

      if (error) throw error
      
      toast.success('Address updated successfully!')
      setAddresses((prev) => prev.map((addr) => addr.id === id ? data : addr))
      return data
    } catch (error: any) {
      toast.error(error.message || 'Failed to update address')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const deleteAddress = async (id: string) => {
    let currentUserId = user?.id
    if (!currentUserId) {
      const { data: { user: supaUser } } = await supabase.auth.getUser()
      currentUserId = supaUser?.id
    }
    if (!currentUserId) {
      toast.error('You must be logged in to delete an address')
      return false
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUserId)

      if (error) throw error
      
      toast.success('Address deleted successfully!')
      setAddresses((prev) => prev.filter((addr) => addr.id !== id))
      return true
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete address')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return { addresses, isLoading, fetchAddresses, addAddress, updateAddress, deleteAddress }
}
