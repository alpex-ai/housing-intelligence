export type Database = {
  public: {
    Tables: {
      housing_metrics: {
        Row: {
          id: string;
          date: string;
          median_home_value: number;
          median_new_home_sale_price: number;
          mortgage_rate: number;
          fed_funds_rate: number;
          treasury_yield_10y: number;
          core_inflation: number;
          affordability_index: number;
          median_household_income: number;
          total_inventory: number;
          new_construction_inventory: number;
          building_permits: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['housing_metrics']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['housing_metrics']['Insert']>;
      };
      regional_affordability: {
        Row: {
          id: string;
          date: string;
          region: string;
          median_home_price: number;
          median_qualifying_income: number;
          median_family_income: number;
          median_mortgage_payment: number;
          affordability_score: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['regional_affordability']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['regional_affordability']['Insert']>;
      };
      builder_expenses: {
        Row: {
          id: string;
          date: string;
          material_name: string;
          current_price: number;
          start_price: number;
          percent_change: number;
          total_change: number;
          status: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['builder_expenses']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['builder_expenses']['Insert']>;
      };
      household_expenses: {
        Row: {
          id: string;
          date: string;
          category: string;
          item_name: string;
          current_price: number;
          start_price: number;
          percent_change: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['household_expenses']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['household_expenses']['Insert']>;
      };
      crash_indicators: {
        Row: {
          id: string;
          date: string;
          variable_name: string;
          category: string;
          current_value: number;
          points: number;
          risk_tier: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['crash_indicators']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['crash_indicators']['Insert']>;
      };
      economic_index: {
        Row: {
          id: string;
          date: string;
          index_value: number;
          mom_change: number;
          mom_percent: number;
          yoy_change: number;
          yoy_percent: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['economic_index']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['economic_index']['Insert']>;
      };
      // New tables for Personal Advisor
      metro_zhvi: {
        Row: {
          id: string;
          region_id: number;
          size_rank: number | null;
          region_name: string;
          region_type: string;
          state_name: string | null;
          date: string;
          home_value: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['metro_zhvi']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['metro_zhvi']['Insert']>;
      };
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          current_city: string | null;
          current_city_region_id: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>;
      };
      user_homes: {
        Row: {
          id: string;
          user_id: string;
          nickname: string | null;
          address: string | null;
          city: string;
          state: string;
          zip_code: string | null;
          region_id: number | null;
          purchase_price: number | null;
          purchase_date: string | null;
          current_mortgage_balance: number | null;
          property_type: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_homes']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_homes']['Insert']>;
      };
      home_appraisals: {
        Row: {
          id: string;
          home_id: string;
          appraisal_date: string;
          appraised_value: number;
          appraisal_source: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['home_appraisals']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['home_appraisals']['Insert']>;
      };
      user_scenarios: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          home_id: string | null;
          target_city: string;
          target_region_id: number | null;
          scenario_type: string;
          analysis_results: any | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_scenarios']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_scenarios']['Insert']>;
      };
    };
  };
};
