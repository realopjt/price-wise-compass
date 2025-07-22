export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      bill_templates: {
        Row: {
          average_amount: number
          company_name: string
          created_at: string
          frequency: string | null
          id: string
          name: string
          service_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          average_amount?: number
          company_name: string
          created_at?: string
          frequency?: string | null
          id?: string
          name: string
          service_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          average_amount?: number
          company_name?: string
          created_at?: string
          frequency?: string | null
          id?: string
          name?: string
          service_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bills: {
        Row: {
          account_number: string | null
          amount: number
          analysis_status: string | null
          bill_date: string
          company_name: string
          contact_info: Json | null
          created_at: string
          current_charges: number | null
          due_date: string | null
          file_url: string | null
          id: string
          ocr_confidence: number | null
          previous_balance: number | null
          savings_found: number | null
          service_details: Json | null
          service_type: string
          tax_amount: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number?: string | null
          amount: number
          analysis_status?: string | null
          bill_date: string
          company_name: string
          contact_info?: Json | null
          created_at?: string
          current_charges?: number | null
          due_date?: string | null
          file_url?: string | null
          id?: string
          ocr_confidence?: number | null
          previous_balance?: number | null
          savings_found?: number | null
          service_details?: Json | null
          service_type: string
          tax_amount?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string | null
          amount?: number
          analysis_status?: string | null
          bill_date?: string
          company_name?: string
          contact_info?: Json | null
          created_at?: string
          current_charges?: number | null
          due_date?: string | null
          file_url?: string | null
          id?: string
          ocr_confidence?: number | null
          previous_balance?: number | null
          savings_found?: number | null
          service_details?: Json | null
          service_type?: string
          tax_amount?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pricing_data: {
        Row: {
          availability: string | null
          country: string | null
          created_at: string
          currency: string
          id: string
          image_url: string | null
          last_updated: string
          location: string | null
          price: number
          product_name: string
          product_url: string | null
          rating: number | null
          retailer_name: string
        }
        Insert: {
          availability?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          id?: string
          image_url?: string | null
          last_updated?: string
          location?: string | null
          price: number
          product_name: string
          product_url?: string | null
          rating?: number | null
          retailer_name: string
        }
        Update: {
          availability?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          id?: string
          image_url?: string | null
          last_updated?: string
          location?: string | null
          price?: number
          product_name?: string
          product_url?: string | null
          rating?: number | null
          retailer_name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          subscription_type: string | null
          updated_at: string
          usage_count: number | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          subscription_type?: string | null
          updated_at?: string
          usage_count?: number | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          subscription_type?: string | null
          updated_at?: string
          usage_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          bill_id: string | null
          created_at: string
          id: string
          original_price: number
          rating: number | null
          recommended_price: number
          savings_amount: number
          service_description: string
          status: string | null
          updated_at: string
          user_id: string
          vendor_name: string
          vendor_url: string | null
        }
        Insert: {
          bill_id?: string | null
          created_at?: string
          id?: string
          original_price: number
          rating?: number | null
          recommended_price: number
          savings_amount: number
          service_description: string
          status?: string | null
          updated_at?: string
          user_id: string
          vendor_name: string
          vendor_url?: string | null
        }
        Update: {
          bill_id?: string | null
          created_at?: string
          id?: string
          original_price?: number
          rating?: number | null
          recommended_price?: number
          savings_amount?: number
          service_description?: string
          status?: string | null
          updated_at?: string
          user_id?: string
          vendor_name?: string
          vendor_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          country: string | null
          created_at: string
          global_search_enabled: boolean | null
          id: string
          location: string | null
          preferred_retailers: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          global_search_enabled?: boolean | null
          id?: string
          location?: string | null
          preferred_retailers?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          country?: string | null
          created_at?: string
          global_search_enabled?: boolean | null
          id?: string
          location?: string | null
          preferred_retailers?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
