export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          wallet_balance: number | null
          avatar_url: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          wallet_balance?: number | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          phone?: string | null
          wallet_balance?: number | null
          avatar_url?: string | null
        }
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          tag: string | null
          full_address: string
          map_coordinates: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          tag?: string | null
          full_address: string
          map_coordinates?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          tag?: string | null
          full_address?: string
          map_coordinates?: Json | null
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          service_type: string
          status: string
          total_amount: number | null
          pickup_date: string | null
          pickup_slot: string | null
          weight_kg: number | null
          address_id: string | null
          created_at?: string
        }
        Insert: {
          id?: string
          user_id: string
          service_type: string
          status: string
          total_amount?: number | null
          pickup_date?: string | null
          pickup_slot?: string | null
          weight_kg?: number | null
          address_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          service_type?: string
          status?: string
          total_amount?: number | null
          pickup_date?: string | null
          pickup_slot?: string | null
          weight_kg?: number | null
          address_id?: string | null
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          plan_name: string | null
          amount: number | null
          status: string
          start_date: string | null
          end_date: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          plan_name?: string | null
          amount?: number | null
          status: string
          start_date?: string | null
          end_date?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          plan_name?: string | null
          amount?: number | null
          status?: string
          start_date?: string | null
          end_date?: string | null
          created_at?: string | null
        }
      }
      support_tickets: {
        Row: {
          id: string
          user_id: string
          order_id: string | null
          category: string
          description: string
          issue: string | null
          image_url: string | null
          status: string
        }
        Insert: {
          id?: string
          user_id: string
          order_id?: string | null
          category: string
          description: string
          issue?: string | null
          image_url?: string | null
          status?: string
        }
        Update: {
          id?: string
          user_id?: string
          order_id?: string | null
          category?: string
          description?: string
          issue?: string | null
          image_url?: string | null
          status?: string
        }
      }
      wallet_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          transaction_type: 'credit' | 'debit'
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          transaction_type: 'credit' | 'debit'
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          transaction_type?: 'credit' | 'debit'
          description?: string | null
          created_at?: string
        }
      }
      saved_payment_methods: {
        Row: {
          id: string
          user_id: string
          method_type: 'UPI' | 'Card'
          provider_name: string
          masked_detail: string
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          method_type: 'UPI' | 'Card'
          provider_name: string
          masked_detail: string
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          method_type?: 'UPI' | 'Card'
          provider_name?: string
          masked_detail?: string
          is_default?: boolean
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'order' | 'subscription' | 'wallet' | 'promo'
          title: string
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'order' | 'subscription' | 'wallet' | 'promo'
          title: string
          message: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'order' | 'subscription' | 'wallet' | 'promo'
          title?: string
          message?: string
          is_read?: boolean
          created_at?: string
        }
      }
    }
  }
}
