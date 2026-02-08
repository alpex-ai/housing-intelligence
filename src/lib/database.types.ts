export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

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
        Insert: {
          id?: string;
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
          created_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          median_home_value?: number;
          median_new_home_sale_price?: number;
          mortgage_rate?: number;
          fed_funds_rate?: number;
          treasury_yield_10y?: number;
          core_inflation?: number;
          affordability_index?: number;
          median_household_income?: number;
          total_inventory?: number;
          new_construction_inventory?: number;
          building_permits?: number;
          created_at?: string;
        };
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
        Insert: {
          id?: string;
          date: string;
          region: string;
          median_home_price: number;
          median_qualifying_income: number;
          median_family_income: number;
          median_mortgage_payment: number;
          affordability_score: number;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};
