export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      builder_expenses: {
        Row: {
          created_at: string
          current_price: number | null
          date: string
          id: string
          material_name: string
          percent_change: number | null
          start_price: number | null
          status: string | null
          total_change: number | null
        }
        Insert: {
          created_at?: string
          current_price?: number | null
          date: string
          id?: string
          material_name: string
          percent_change?: number | null
          start_price?: number | null
          status?: string | null
          total_change?: number | null
        }
        Update: {
          created_at?: string
          current_price?: number | null
          date?: string
          id?: string
          material_name?: string
          percent_change?: number | null
          start_price?: number | null
          status?: string | null
          total_change?: number | null
        }
        Relationships: []
      }
      crash_indicators: {
        Row: {
          category: string
          created_at: string
          current_value: number | null
          date: string
          id: string
          points: number | null
          risk_tier: string | null
          variable_name: string
        }
        Insert: {
          category: string
          created_at?: string
          current_value?: number | null
          date: string
          id?: string
          points?: number | null
          risk_tier?: string | null
          variable_name: string
        }
        Update: {
          category?: string
          created_at?: string
          current_value?: number | null
          date?: string
          id?: string
          points?: number | null
          risk_tier?: string | null
          variable_name?: string
        }
        Relationships: []
      }
      economic_index: {
        Row: {
          created_at: string
          date: string
          id: string
          index_value: number | null
          mom_change: number | null
          mom_percent: number | null
          yoy_change: number | null
          yoy_percent: number | null
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          index_value?: number | null
          mom_change?: number | null
          mom_percent?: number | null
          yoy_change?: number | null
          yoy_percent?: number | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          index_value?: number | null
          mom_change?: number | null
          mom_percent?: number | null
          yoy_change?: number | null
          yoy_percent?: number | null
        }
        Relationships: []
      }
      home_appraisals: {
        Row: {
          appraisal_date: string
          appraisal_source: string | null
          appraised_value: number
          created_at: string
          home_id: string
          id: string
          notes: string | null
        }
        Insert: {
          appraisal_date: string
          appraisal_source?: string | null
          appraised_value: number
          created_at?: string
          home_id: string
          id?: string
          notes?: string | null
        }
        Update: {
          appraisal_date?: string
          appraisal_source?: string | null
          appraised_value?: number
          created_at?: string
          home_id?: string
          id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "home_appraisals_home_id_fkey"
            columns: ["home_id"]
            isOneToOne: false
            referencedRelation: "user_homes"
            referencedColumns: ["id"]
          },
        ]
      }
      household_expenses: {
        Row: {
          category: string
          created_at: string
          current_price: number | null
          date: string
          id: string
          item_name: string
          percent_change: number | null
          start_price: number | null
        }
        Insert: {
          category: string
          created_at?: string
          current_price?: number | null
          date: string
          id?: string
          item_name: string
          percent_change?: number | null
          start_price?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          current_price?: number | null
          date?: string
          id?: string
          item_name?: string
          percent_change?: number | null
          start_price?: number | null
        }
        Relationships: []
      }
      housing_metrics: {
        Row: {
          affordability_index: number | null
          building_permits: number | null
          core_inflation: number | null
          created_at: string
          date: string
          fed_funds_rate: number | null
          id: string
          median_home_value: number | null
          median_household_income: number | null
          median_new_home_sale_price: number | null
          mortgage_rate: number | null
          new_construction_inventory: number | null
          total_inventory: number | null
          treasury_yield_10y: number | null
        }
        Insert: {
          affordability_index?: number | null
          building_permits?: number | null
          core_inflation?: number | null
          created_at?: string
          date: string
          fed_funds_rate?: number | null
          id?: string
          median_home_value?: number | null
          median_household_income?: number | null
          median_new_home_sale_price?: number | null
          mortgage_rate?: number | null
          new_construction_inventory?: number | null
          total_inventory?: number | null
          treasury_yield_10y?: number | null
        }
        Update: {
          affordability_index?: number | null
          building_permits?: number | null
          core_inflation?: number | null
          created_at?: string
          date?: string
          fed_funds_rate?: number | null
          id?: string
          median_home_value?: number | null
          median_household_income?: number | null
          median_new_home_sale_price?: number | null
          mortgage_rate?: number | null
          new_construction_inventory?: number | null
          total_inventory?: number | null
          treasury_yield_10y?: number | null
        }
        Relationships: []
      }
      metro_zhvi: {
        Row: {
          created_at: string
          date: string
          home_value: number | null
          id: string
          region_id: number
          region_name: string
          region_type: string
          size_rank: number | null
          state_name: string | null
        }
        Insert: {
          created_at?: string
          date: string
          home_value?: number | null
          id?: string
          region_id: number
          region_name: string
          region_type: string
          size_rank?: number | null
          state_name?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          home_value?: number | null
          id?: string
          region_id?: number
          region_name?: string
          region_type?: string
          size_rank?: number | null
          state_name?: string | null
        }
        Relationships: []
      }
      regional_affordability: {
        Row: {
          affordability_score: number | null
          created_at: string
          date: string
          id: string
          median_family_income: number | null
          median_home_price: number | null
          median_mortgage_payment: number | null
          median_qualifying_income: number | null
          region: string
        }
        Insert: {
          affordability_score?: number | null
          created_at?: string
          date: string
          id?: string
          median_family_income?: number | null
          median_home_price?: number | null
          median_mortgage_payment?: number | null
          median_qualifying_income?: number | null
          region: string
        }
        Update: {
          affordability_score?: number | null
          created_at?: string
          date?: string
          id?: string
          median_family_income?: number | null
          median_home_price?: number | null
          median_mortgage_payment?: number | null
          median_qualifying_income?: number | null
          region?: string
        }
        Relationships: []
      }
      user_homes: {
        Row: {
          address: string | null
          city: string
          created_at: string
          current_mortgage_balance: number | null
          id: string
          nickname: string | null
          property_type: string | null
          purchase_date: string | null
          purchase_price: number | null
          region_id: number | null
          state: string
          updated_at: string
          user_id: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city: string
          created_at?: string
          current_mortgage_balance?: number | null
          id?: string
          nickname?: string | null
          property_type?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          region_id?: number | null
          state: string
          updated_at?: string
          user_id: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string
          created_at?: string
          current_mortgage_balance?: number | null
          id?: string
          nickname?: string | null
          property_type?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          region_id?: number | null
          state?: string
          updated_at?: string
          user_id?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          current_city: string | null
          current_city_region_id: number | null
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_city?: string | null
          current_city_region_id?: number | null
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_city?: string | null
          current_city_region_id?: number | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_scenarios: {
        Row: {
          analysis_results: Json | null
          created_at: string
          home_id: string | null
          id: string
          name: string
          scenario_type: string
          target_city: string
          target_region_id: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_results?: Json | null
          created_at?: string
          home_id?: string | null
          id?: string
          name: string
          scenario_type: string
          target_city: string
          target_region_id?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_results?: Json | null
          created_at?: string
          home_id?: string | null
          id?: string
          name?: string
          scenario_type?: string
          target_city?: string
          target_region_id?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_scenarios_home_id_fkey"
            columns: ["home_id"]
            isOneToOne: false
            referencedRelation: "user_homes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      exec_sql: { Args: { query: string }; Returns: Json }
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
