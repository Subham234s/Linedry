import { useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/components/AuthProvider'
import { Database } from '@/types/supabase'

type WalletTransaction = Database['public']['Tables']['wallet_transactions']['Row']

export function useWallet() {
  const [balance, setBalance] = useState<number>(0)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isTxLoading, setIsTxLoading] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()

  // ── Get the user ID (fallback to supabase.auth if context not ready) ────
  const getUserId = useCallback(async () => {
    if (user?.id) return user.id
    const { data: { user: supaUser } } = await supabase.auth.getUser()
    return supaUser?.id
  }, [user, supabase])

  // ── Fetch the LIVE wallet balance from DB (source of truth) ─────────────
  const fetchBalance = useCallback(async () => {
    const uid = await getUserId()
    if (!uid) return 0

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', uid)
        .single()

      if (error) throw error
      const live = data?.wallet_balance || 0
      setBalance(live)
      return live
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch wallet balance')
      return balance
    } finally {
      setIsLoading(false)
    }
  }, [getUserId, supabase])

  // ── Fetch transaction history ────────────────────────────────────────────
  const fetchTransactions = useCallback(async () => {
    const uid = await getUserId()
    if (!uid) return

    setIsTxLoading(true)
    try {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setTransactions(data || [])
    } catch (error: any) {
      console.warn('Could not fetch transactions:', error.message)
      setTransactions([])
    } finally {
      setIsTxLoading(false)
    }
  }, [getUserId, supabase])

  // ── Add funds (ATOMIC: balance update + transaction record) ─────────────
  //    If the transaction insert fails, we roll back the balance update.
  const addFunds = async (amount: number, description = 'Wallet Top-up via Razorpay') => {
    const uid = await getUserId()
    if (!uid) {
      toast.error('You must be logged in to add funds')
      return false
    }

    try {
      // 1. Fetch the LIVE balance from DB to avoid stale-state bugs
      const { data: freshProfile, error: fetchErr } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', uid)
        .single()

      if (fetchErr) throw fetchErr
      const liveBalance = freshProfile?.wallet_balance || 0
      const newBalance = liveBalance + amount

      // 2. Update wallet balance
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ wallet_balance: newBalance })
        .eq('id', uid)

      if (profileError) throw profileError

      // 3. Record the transaction — MUST succeed, otherwise rollback
      const { error: txError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: uid,
          amount,
          transaction_type: 'credit' as const,
          description,
        })

      if (txError) {
        // ── ROLLBACK: revert the balance update ───────────────────────
        console.error('Transaction record failed, rolling back balance:', txError.message)
        await supabase
          .from('profiles')
          .update({ wallet_balance: liveBalance })
          .eq('id', uid)
        setBalance(liveBalance)
        throw new Error(`Transaction record failed: ${txError.message}`)
      }

      // 4. Update local state
      setBalance(newBalance)
      
      // ── Trigger Notification ─────────────────────────────────────
      import('@/utils/notifications').then(({ notifyUser }) => {
        notifyUser({
          title: 'Money Added',
          message: `₹${amount.toLocaleString('en-IN')} has been added to your Linedry wallet.`,
          type: 'wallet'
        });
      });

      toast.success(`₹${amount.toLocaleString('en-IN')} added to your wallet!`)

      // 5. Refresh the transaction list immediately
      fetchTransactions()
      return true
    } catch (error: any) {
      toast.error(error.message || 'Failed to add funds')
      return false
    }
  }

  // ── Deduct funds (ATOMIC: balance deduction + transaction record) ───────
  const deductFunds = async (amount: number, description = 'Order Payment') => {
    const uid = await getUserId()
    if (!uid) {
      toast.error('You must be logged in')
      return false
    }

    // 1. Fetch LIVE balance
    const { data: freshProfile, error: fetchErr } = await supabase
      .from('profiles')
      .select('wallet_balance')
      .eq('id', uid)
      .single()

    if (fetchErr) {
      toast.error('Could not verify wallet balance')
      return false
    }

    const liveBalance = freshProfile?.wallet_balance || 0
    if (liveBalance < amount) {
      toast.error(`Insufficient balance. You have ₹${liveBalance.toLocaleString('en-IN')} but need ₹${amount.toLocaleString('en-IN')}.`)
      return false
    }

    try {
      const newBalance = liveBalance - amount

      // 2. Deduct from wallet
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ wallet_balance: newBalance })
        .eq('id', uid)

      if (profileError) throw profileError

      // 3. Record the debit transaction
      const { error: txError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: uid,
          amount,
          transaction_type: 'debit' as const,
          description,
        })

      if (txError) {
        // ── ROLLBACK ──────────────────────────────────────────────────
        console.error('Debit record failed, rolling back:', txError.message)
        await supabase
          .from('profiles')
          .update({ wallet_balance: liveBalance })
          .eq('id', uid)
        setBalance(liveBalance)
        throw new Error(`Transaction record failed: ${txError.message}`)
      }

      setBalance(newBalance)
      fetchTransactions()
      return true
    } catch (error: any) {
      toast.error(error.message || 'Failed to deduct funds')
      return false
    }
  }

  return {
    balance,
    transactions,
    isLoading,
    isTxLoading,
    fetchBalance,
    fetchTransactions,
    addFunds,
    deductFunds,
  }
}
