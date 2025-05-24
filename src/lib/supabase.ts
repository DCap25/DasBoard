import { supabase, getDealershipSupabase, getUserDealershipId } from './supabaseClient';

export * from './supabaseClient';

// Export the supabase client
export default supabase;

// User and authentication types
export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'salesperson' | 'finance_manager' | 'sales_manager' | 'general_manager' | 'admin';
  dealership_id: number | string; // Accept both for compatibility
  created_at?: string;
}

// Additional type for detailed user profile
export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  name?: string;
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
  name?: string;
  role?: 'salesperson' | 'finance_manager' | 'sales_manager' | 'general_manager' | 'admin';
  dealership_id?: number | string; // Accept both for compatibility
}

export interface AuthResponse {
  user: User | null;
  token?: string;
  session?: {
    access_token: string;
    expires_at?: number | string;
    refresh_token?: string;
  } | null;
  error?: {
    message: string;
  };
}

// Dealership type
export interface Dealership {
  id: number | string; // Accept both for compatibility
  name: string;
  group_id?: number | string;
  schema_name?: string;
  logo_url?: string;
  locations?: any[];
  brands?: string[];
  supabase_url?: string;
  supabase_key?: string;
  created_at?: string;
}

// Dealership Group type
export interface DealershipGroup {
  id: number | string;
  name: string;
  logo_url?: string;
  brands?: string[];
  created_at?: string;
}

// Sales data types
export interface Sale {
  id: number | string; // Accept both for compatibility
  dealership_id: number | string;
  salesperson_id: string;
  salesperson_name?: string; // Not in the DB - joined from profiles
  customer_name: string;
  vehicle_type: string;
  vehicle_vin?: string;
  sale_date: string;
  sale_amount: number;
  status: 'pending' | 'completed' | 'cancelled' | string;
  created_at?: string;
  updated_at?: string;
}

// Metrics types
export interface Metric {
  id: number | string; // Accept both for compatibility
  dealership_id: number | string;
  sales_count: number;
  total_revenue: number;
  avg_vehicle_price?: number;
  average_sale_amount?: number; // Support both field names
  period: string;
  date?: string;
  created_at?: string;
}

// F&I (Finance and Insurance) details
export interface FniDetail {
  id: number | string; // Accept both for compatibility
  sale_id: number | string;
  dealership_id?: number | string;
  finance_manager_id?: string;
  finance_manager_name?: string; // Not in the DB - joined from profiles
  product_type: string;
  amount: number;
  commission_amount: number;
  created_at?: string;
  updated_at?: string;
}

// Authentication helper functions
export const getCurrentSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

// Get supabase client for the current user's dealership
export const getDealershipClient = async () => {
  try {
    // Get the current user's dealership ID
    const dealershipId = await getUserDealershipId();
    if (!dealershipId) {
      console.log('No dealership ID found for current user, using master project');
      return supabase;
    }

    // Get the appropriate Supabase client for this dealership
    console.log(`Using Supabase client for dealership ${dealershipId}`);
    return getDealershipSupabase(dealershipId);
  } catch (error) {
    console.error('Error getting dealership client:', error);
    return supabase; // Fall back to master project
  }
};

// Use the appropriate client based on dealership context
export const useSupabaseClient = async (dealershipId?: number | string) => {
  if (dealershipId) {
    return getDealershipSupabase(dealershipId);
  }

  return getDealershipClient();
};

// Export types from database.types
export type { Database } from './database.types';
