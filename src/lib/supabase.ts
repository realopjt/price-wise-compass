import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://your-project.supabase.co'
const supabaseKey = 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

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