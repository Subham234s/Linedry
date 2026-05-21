import { create } from 'zustand'
import { User } from '@supabase/supabase-js'

interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  wallet_balance: number | null
}

interface AuthState {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setIsLoading: (isLoading: boolean) => void
  signOut: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setIsLoading: (isLoading) => set({ isLoading }),
  signOut: () => set({ user: null, profile: null }),
}))
