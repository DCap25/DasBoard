import { masterSupabase, getSupabaseClient } from './supabaseClient';

// Use the master Supabase client for authentication
export const supabase = masterSupabase;

// Export the getter for tenant-specific operations
export { getSupabaseClient };

// User and authentication types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'salesperson' | 'finance_manager' | 'sales_manager' | 'general_manager' | 'admin';
  dealership_id: string;
  created_at: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  name: string;
  role?: string;
  dealership_id?: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
  session?: {
    access_token: string;
    expires_at: string;
  };
}

// Dealership type
export interface Dealership {
  id: string;
  name: string;
  location: string;
  created_at: string;
}

// Sales data types
export interface Sale {
  id: string;
  dealership_id: string;
  salesperson_id: string;
  salesperson_name?: string;
  customer_name: string;
  vehicle_type: string;
  vehicle_vin?: string;
  sale_date: string;
  sale_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

// Metrics types
export interface Metric {
  id: string;
  dealership_id: string;
  sales_count: number;
  total_revenue: number;
  average_sale_amount: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  date: string;
  created_at: string;
}

// F&I (Finance and Insurance) details
export interface FniDetail {
  id: string;
  sale_id: string;
  dealership_id: string;
  finance_manager_id: string;
  finance_manager_name?: string;
  product_type: 'warranty' | 'insurance' | 'protection_plan' | 'service_contract' | 'other';
  amount: number;
  commission_amount: number;
  created_at: string;
  updated_at: string;
}
