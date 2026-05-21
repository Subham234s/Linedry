import { createClient } from '@/utils/supabase/client'
import { Database } from '@/types/supabase'

type NotificationType = Database['public']['Tables']['notifications']['Row']['type']

/**
 * Insert a notification for the current user.
 * Fire-and-forget — does NOT throw on failure (non-blocking).
 */
export async function notifyUser(params: {
  title: string
  message: string
  type: NotificationType
}) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) return

    await supabase.from('notifications').insert({
      user_id: user.id,
      type: params.type,
      title: params.title,
      message: params.message,
      is_read: false,
    })
  } catch (err) {
    // Non-blocking — never disrupt the caller's flow
    console.warn('[Notify] Failed to insert notification:', err)
  }
}

/**
 * Check for plan expiry and insert a warning notification if within 3 days.
 * Should be called on dashboard load.
 */
export async function checkPlanExpiry() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) return

    // Fetch active subscription
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan_name, end_date')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(1)
      .single()

    if (!sub?.end_date) return

    const endDate = new Date(sub.end_date)
    const now = new Date()
    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysLeft > 3 || daysLeft < 0) return

    // Check if we already sent this alert today
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const { data: existing } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', 'subscription')
      .like('title', '%Expiring%')
      .gte('created_at', todayStart.toISOString())
      .limit(1)

    if (existing && existing.length > 0) return // already alerted today

    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'subscription',
      title: 'Plan Expiring Soon',
      message: `Your ${sub.plan_name} subscription ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}. Renew now to avoid service interruption.`,
      is_read: false,
    })
  } catch (err) {
    console.warn('[Notify] Plan expiry check failed:', err)
  }
}
