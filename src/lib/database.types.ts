export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole =
  | 'admin'
  | 'dealership_admin'
  | 'sales_manager'
  | 'salesperson'
  | 'finance_manager'
  | 'viewer';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: string;
          dealership_id: number;
          is_group_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role: string;
          dealership_id: number;
          is_group_admin?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: string;
          dealership_id?: number;
          is_group_admin?: boolean;
        };
      };
      deals: {
        Row: {
          id: string;
          customer_name: string;
          vehicle: string;
          sale_date: string;
          front_end_gross: number;
          back_end_gross: number;
          salesperson_id: string;
          status: 'pending' | 'funded' | 'unwound';
          created_at: string;
        };
        Insert: {
          customer_name: string;
          vehicle: string;
          sale_date: string;
          front_end_gross: number;
          back_end_gross: number;
          salesperson_id: string;
          status: 'pending' | 'funded' | 'unwound';
        };
        Update: {
          customer_name?: string;
          vehicle?: string;
          sale_date?: string;
          front_end_gross?: number;
          back_end_gross?: number;
          salesperson_id?: string;
          status?: 'pending' | 'funded' | 'unwound';
        };
      };
      users: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          role_id: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          email: string;
          role_id: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          role_id?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      roles: {
        Row: {
          id: string;
          name: UserRole;
          description: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: UserRole;
          description: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: UserRole;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      pay_plans: {
        Row: {
          id: string;
          role_id: string;
          front_end_percent: number;
          back_end_percent: number;
          csi_bonus: number;
          demo_allowance: number;
          vsc_bonus: number;
          ppm_bonus: number;
          volume_bonus: Json;
          updated_by: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          role_id: string;
          front_end_percent: number;
          back_end_percent: number;
          csi_bonus: number;
          demo_allowance: number;
          vsc_bonus: number;
          ppm_bonus: number;
          volume_bonus?: Json;
          updated_by: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role_id?: string;
          front_end_percent?: number;
          back_end_percent?: number;
          csi_bonus?: number;
          demo_allowance?: number;
          vsc_bonus?: number;
          ppm_bonus?: number;
          volume_bonus?: Json;
          updated_by?: string;
          updated_at?: string;
        };
      };
      dealership_groups: {
        Row: {
          id: number;
          name: string;
          logo_url: string | null;
          brands: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          logo_url?: string | null;
          brands?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          logo_url?: string | null;
          brands?: string[] | null;
          created_at?: string;
        };
        Relationships: [];
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
}
