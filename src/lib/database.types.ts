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
        };
        Insert: Omit<Database['public']['Tables']['housing_metrics']['Row'], 'id'>;
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
        };
        Insert: Omit<Database['public']['Tables']['regional_affordability']['Row'], 'id'>;
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
        };
        Insert: Omit<Database['public']['Tables']['builder_expenses']['Row'], 'id'>;
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
        };
        Insert: Omit<Database['public']['Tables']['household_expenses']['Row'], 'id'>;
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
        };
        Insert: Omit<Database['public']['Tables']['crash_indicators']['Row'], 'id'>;
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
        };
        Insert: Omit<Database['public']['Tables']['economic_index']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['economic_index']['Insert']>;
      };
    };
  };
};
