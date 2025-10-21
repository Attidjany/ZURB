export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: string | null;
          created_at?: string;
        };
        Update: {
          email?: string;
          role?: string | null;
        };
      };
      project_members: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          role?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          description?: string | null;
        };
        Update: {
          name?: string;
          description?: string | null;
        };
      };
      sites: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          geom: unknown;
          area_ha: number | null;
          bbox: unknown;
          centroid: unknown;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          geom?: unknown;
        };
        Update: {
          name?: string;
          geom?: unknown;
          area_ha?: number | null;
          bbox?: unknown;
          centroid?: unknown;
        };
      };
      scenarios: {
        Row: {
          id: string;
          site_id: string;
          name: string;
          notes: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          site_id: string;
          name: string;
          notes?: string | null;
          created_by: string;
        };
        Update: {
          name?: string;
          notes?: string | null;
        };
      };
      scenario_items: {
        Row: {
          id: string;
          scenario_id: string;
          block_id: string | null;
          parcel_id: string | null;
          typology_code: string;
          units: number;
          gfa_m2: number;
          overrides: Json | null;
        };
        Insert: {
          id?: string;
          scenario_id: string;
          block_id?: string | null;
          parcel_id?: string | null;
          typology_code: string;
          units: number;
          gfa_m2: number;
          overrides?: Json | null;
        };
        Update: {
          block_id?: string | null;
          parcel_id?: string | null;
          typology_code?: string;
          units?: number;
          gfa_m2?: number;
          overrides?: Json | null;
        };
      };
      cost_params: {
        Row: {
          id: string;
          gold_usd_per_oz: number;
          grams_mid_end: number;
          grams_high_end: number;
          grams_outstanding: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gold_usd_per_oz: number;
          grams_mid_end: number;
          grams_high_end: number;
          grams_outstanding: number;
          updated_at?: string;
        };
        Update: {
          gold_usd_per_oz?: number;
          grams_mid_end?: number;
          grams_high_end?: number;
          grams_outstanding?: number;
        };
      };
      mix_rules: {
        Row: {
          id: string;
          category: string;
          mid_end_pct: number;
          high_end_pct: number;
          outstanding_pct: number;
        };
        Insert: {
          id?: string;
          category: string;
          mid_end_pct: number;
          high_end_pct: number;
          outstanding_pct: number;
        };
        Update: {
          mid_end_pct?: number;
          high_end_pct?: number;
          outstanding_pct?: number;
        };
      };
      rents: {
        Row: {
          id: string;
          code: string;
          monthly_usd: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          monthly_usd: number;
          updated_at?: string;
        };
        Update: {
          monthly_usd?: number;
        };
      };
      overheads: {
        Row: {
          id: string;
          dev_monthly_usd: number;
          maint_monthly_usd: number;
          lease_years: number;
          infra_subsidy_pct: number;
        };
        Insert: {
          id?: string;
          dev_monthly_usd?: number;
          maint_monthly_usd?: number;
          lease_years?: number;
          infra_subsidy_pct?: number;
        };
        Update: {
          dev_monthly_usd?: number;
          maint_monthly_usd?: number;
          lease_years?: number;
          infra_subsidy_pct?: number;
        };
      };
    };
    Functions: {
      fn_geom_stats: {
        Args: {
          multi_geom: unknown;
        };
        Returns: {
          area_ha: number;
          bbox: unknown;
          centroid: unknown;
        };
      };
      fn_construction_cost_per_m2: {
        Args: {
          category: string;
        };
        Returns: number;
      };
      fn_unit_cost: {
        Args: {
          category: string;
          gfa_m2: number;
        };
        Returns: number;
      };
      fn_max_capex: {
        Args: {
          monthly_rent: number;
          lease_years: number;
          dev_monthly: number;
          maint_monthly: number;
          non_construction_capex: number;
        };
        Returns: number;
      };
      fn_margin: {
        Args: {
          category: string;
          gfa_m2: number;
          monthly_rent: number;
          lease_years: number;
          dev_monthly: number;
          maint_monthly: number;
          non_construction_capex: number;
        };
        Returns: number;
      };
      fn_upsert_site_geometry: {
        Args: {
          p_site_id: string;
          p_geojson: Json;
        };
        Returns: {
          area_ha: number;
          bbox: unknown;
          centroid: unknown;
        };
      };
    };
  };
}
