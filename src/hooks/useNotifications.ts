import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useAuth } from '@/components/AuthProvider'
import { Database } from '@/types/supabase'

type Notification = Database['public']['Tables']['notifications']['Row']

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()

  const unreadCount = notifications.filter(n => !n.is_read).length

  // ── Fetch all notifications ─────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    let uid = user?.id
    if (!uid) {
      const { data: { user: supaUser } } = await supabase.auth.getUser()
      uid = supaUser?.id
    }
    if (!uid) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(30)

      if (error) throw error
      setNotifications(data || [])
    } catch (err: any) {
      console.warn('[Notifications] Fetch failed:', err.message)
      setNotifications([])
    } finally {
      setIsLoading(false)
    }
  }, [user, supabase])

  // ── Mark single as read ─────────────────────────────────────────────────
  const markAsRead = async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)

      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      )
    } catch (err) {
      console.warn('[Notifications] Mark-read failed:', err)
    }
  }

  // ── Mark all as read ────────────────────────────────────────────────────
  const markAllAsRead = async () => {
    let uid = user?.id
    if (!uid) {
      const { data: { user: supaUser } } = await supabase.auth.getUser()
      uid = supaUser?.id
    }
    if (!uid) return

    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', uid)
        .eq('is_read', false)

      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      )
    } catch (err) {
      console.warn('[Notifications] Mark-all-read failed:', err)
    }
  }

  // ── Real-time subscription ──────────────────────────────────────────────
  useEffect(() => {
    fetchNotifications()

    let uid = user?.id
    if (!uid) return

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${uid}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification
          setNotifications(prev => {
            // Avoid duplicates
            if (prev.some(n => n.id === newNotif.id)) return prev
            return [newNotif, ...prev]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase, fetchNotifications])

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  }
}
