import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gwgnygxddaxpfkmlyrqd.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3Z255Z3hkZGF4cGZrbWx5cnFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MTQ4OTgsImV4cCI6MjA2ODQ5MDg5OH0.2PuRCYlFYqW1nkRBjnEJrmda8DYvt9UL1Y1cdYzYX1k'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
})

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          updated_at?: string
        }
      }
      bills: {
        Row: {
          id: string
          user_id: string
          company_name: string
          service_type: string
          amount: number
          bill_date: string
          file_url: string
          analysis_status: 'pending' | 'completed' | 'failed'
          savings_found: number
          alternative_providers: any
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_name: string
          service_type: string
          amount: number
          bill_date: string
          file_url: string
          analysis_status?: 'pending' | 'completed' | 'failed'
          savings_found?: number
          alternative_providers?: any
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string
          service_type?: string
          amount?: number
          bill_date?: string
          file_url?: string
          analysis_status?: 'pending' | 'completed' | 'failed'
          savings_found?: number
          alternative_providers?: any
        }
      }
      recommendations: {
        Row: {
          id: string
          user_id: string
          type: 'expense' | 'location'
          title: string
          description: string
          potential_savings: number
          status: 'active' | 'dismissed' | 'acted_upon'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'expense' | 'location'
          title: string
          description: string
          potential_savings?: number
          status?: 'active' | 'dismissed' | 'acted_upon'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'expense' | 'location'
          title?: string
          description?: string
          potential_savings?: number
          status?: 'active' | 'dismissed' | 'acted_upon'
        }
      }
    }
  }
}