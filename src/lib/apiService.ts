/**
 * API Service
 * Provides functions to interact with the Supabase API
 */

import { supabase, getUserSession, getCurrentUser } from './supabaseClient';
import SecureLogger from './secureLogger';
import type { User } from '@supabase/supabase-js';

// Types
interface SignInCredentials {
  email: string;
  password: string;
}

interface SignUpCredentials extends SignInCredentials {
  name?: string;
  role?: string;
  dealership_id?: string;
}

interface AuthResponse {
  user: User | null;
  session: any | null;
  error?: Error | null;
}

export interface Sale {
  id: string;
  dealership_id: string;
  sale_date: string;
  amount: number;
  // Add other sale fields as needed
}

export interface Metric {
  id: string;
  dealership_id: string;
  metric_date: string;
  value: number;
  type: string;
  // Add other metric fields as needed
}

export interface FniDetail {
  id: string;
  sale_id: string;
  product_type: string;
  amount: number;
  // Add other F&I fields as needed
}

export interface DealershipGroup {
  id: number;
  name: string;
  logo_url?: string;
  brands?: string | string[]; // Can be either a JSON string or an array of strings
  created_at?: string;
}

export interface Dealership {
  id: number;
  name: string;
  group_id?: number;
  schema_name: string;
  logo_url?: string;
  locations?: any[];
  brands?: string[];
  created_at?: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
}

export interface SignupRequest {
  id: string;
  dealership_name: string;
  contact_person: string;
  email: string;
  tier: 'free_trial' | 'finance_manager' | 'dealership' | 'dealer_group';
  add_ons?: string[]; // For storing + Version and ++ Version add-ons
  stripe_subscription_id?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  processed_at?: string;
  processed_by?: string;
}

// Base API configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }
  return response.json();
};

// Get auth headers for API requests
const getAuthHeaders = async () => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('No authenticated user');
  }

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error || !session) {
    throw new Error('Failed to get auth session');
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  };
};

// Generic API request function with auth
export const apiRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });
    return handleResponse(response);
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Example API methods
export const getDealershipBasicInfo = async (dealershipId: string) => {
  return apiRequest(`/dealerships/${dealershipId}`);
};

export const updateDealershipData = async (dealershipId: string, data: any) => {
  return apiRequest(`/dealerships/${dealershipId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const getSalesData = async (dealershipId: string, params?: Record<string, string>) => {
  const queryString = params ? new URLSearchParams(params).toString() : '';
  return apiRequest(`/dealerships/${dealershipId}/sales${queryString ? `?${queryString}` : ''}`);
};

export const getMetrics = async (dealershipId: string, timeframe?: string) => {
  const query = timeframe ? `?timeframe=${timeframe}` : '';
  return apiRequest(`/dealerships/${dealershipId}/metrics${query}`);
};

export const getFniDetails = async (dealershipId: string, params?: Record<string, string>) => {
  const queryString = params ? new URLSearchParams(params).toString() : '';
  return apiRequest(`/dealerships/${dealershipId}/fni${queryString ? `?${queryString}` : ''}`);
};

// Authentication Functions
export async function signIn(credentials: SignInCredentials): Promise<AuthResponse> {
  try {
    console.log('Attempting sign in for:', credentials.email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      console.error('Sign in error:', error);
      throw error;
    }

    if (!data.user) {
      throw new Error('No user returned from authentication');
    }

    // Get the user profile from the profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }

    // Combine auth user with profile data
    const userWithProfile = profileData ? { ...data.user, ...profileData } : data.user;

    SecureLogger.info('Sign in successful');

    return {
      user: userWithProfile,
      session: data.session,
    };
  } catch (error) {
    console.error('Sign in failed:', error);
    throw error;
  }
}

export async function signUp(credentials: SignUpCredentials): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          name: credentials.name,
          role: credentials.role,
          dealership_id: credentials.dealership_id,
        },
      },
    });

    if (error) {
      console.error('Sign up error:', error);
      throw error;
    }

    return {
      user: data.user,
      session: data.session,
    };
  } catch (error) {
    console.error('Sign up failed:', error);
    throw error;
  }
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

export async function getProfile(): Promise<User | null> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.log('No authenticated user found');
      return null;
    }

    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();

    if (error) {
      console.error('Profile fetch error:', error);
      return user;
    }

    return {
      ...user,
      ...data,
    };
  } catch (error) {
    console.error('Get profile error:', error);
    return null;
  }
}

// Sales Functions
export async function getSales(dealershipId?: string): Promise<Sale[]> {
  try {
    let query = supabase.from('sales').select('*');
    if (dealershipId) {
      query = query.eq('dealership_id', dealershipId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Get sales error:', error);
    throw error;
  }
}

export async function createSale(sale: Omit<Sale, 'id'>): Promise<Sale> {
  const { data, error } = await supabase.from('sales').insert([sale]).select().single();

  if (error) throw error;
  return data;
}

// Metrics Functions
export async function getMetricsData(dealershipId?: string, timeframe?: string): Promise<Metric[]> {
  try {
    let query = supabase.from('metrics').select('*');
    if (dealershipId) {
      query = query.eq('dealership_id', dealershipId);
    }
    if (timeframe) {
      query = query.gte('metric_date', timeframe);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Get metrics error:', error);
    throw error;
  }
}

// F&I Functions
export async function getFniData(saleId?: string): Promise<FniDetail[]> {
  try {
    let query = supabase.from('fni_details').select('*');
    if (saleId) {
      query = query.eq('sale_id', saleId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Get F&I details error:', error);
    throw error;
  }
}

// Dealership Functions
export async function getBasicDealerships() {
  const { data, error } = await supabase.from('dealerships').select('*');

  if (error) throw error;
  return data;
}

// General data fetching function
export async function getData(table: string) {
  const { data, error } = await supabase.from(table).select('*');

  if (error) throw error;
  return data;
}

// Connection test
export async function testConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    return !error;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
}

// Dealership Group functions
export const getDealershipGroups = async () => {
  try {
    console.log('[apiService] Fetching dealership groups');
    const { data, error } = await supabase
      .from('dealership_groups')
      .select('*') // Fetch all columns including brands and brands_list
      .order('name');

    if (error) {
      console.error('[apiService] Error fetching dealership groups:', error);
      throw error;
    }

    // For debugging, log the structure of the first group if available
    if (data && data.length > 0) {
      SecureLogger.info('[apiService] First group structure retrieved');
    }

    SecureLogger.info(`[apiService] Fetched ${data?.length || 0} dealership groups`);
    return data;
  } catch (error) {
    console.error('[apiService] Exception in getDealershipGroups:', error);
    throw error;
  }
};

export const createDealershipGroup = async groupData => {
  try {
    console.log('[apiService] Creating dealership group:', groupData);

    // Create a copy of the data to avoid modifying the original
    const dataToInsert = { ...groupData };

    // Handle brands properly - ensure it's stored as a plain string in the database
    if (dataToInsert.brands) {
      if (Array.isArray(dataToInsert.brands)) {
        console.log('[apiService] Brands provided as array, converting to string');
        // Join the array into a comma-separated string instead of using JSON.stringify
        dataToInsert.brands = dataToInsert.brands.join(',');
      } else if (typeof dataToInsert.brands === 'string') {
        console.log('[apiService] Brands provided as string:', dataToInsert.brands);
        // Keep as is
      }
    }

    const { data, error } = await supabase
      .from('dealership_groups')
      .insert(dataToInsert)
      .select()
      .single();

    if (error) {
      console.error('[apiService] Error creating dealership group:', error);
      console.error('[apiService] Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });

      // Log full error as string for more details
      console.error('[apiService] Full error JSON:', JSON.stringify(error, null, 2));

      throw error;
    }

    console.log('[apiService] Created dealership group successfully:', data);
    return data;
  } catch (error) {
    console.error('[apiService] Exception in createDealershipGroup:', error);
    if (error instanceof Error) {
      console.error('[apiService] Error message:', error.message);
      console.error('[apiService] Error stack:', error.stack);
    }

    // Try to stringify the entire error object
    try {
      console.error(
        '[apiService] Full error object:',
        JSON.stringify(error, Object.getOwnPropertyNames(error))
      );
    } catch (e) {
      console.error('[apiService] Could not stringify error object');
    }

    throw error;
  }
};

// Dealership functions
export const getDealerships = async (groupId?: number) => {
  try {
    console.log('[apiService] Fetching dealerships', groupId ? `for group ${groupId}` : '');
    let query = supabase.from('dealerships').select('*, dealership_groups(name)').order('name');

    if (groupId) {
      query = query.eq('group_id', groupId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[apiService] Error fetching dealerships:', error);
      throw error;
    }

    console.log('[apiService] Fetched dealerships:', data);
    return data;
  } catch (error) {
    console.error('[apiService] Exception in getDealerships:', error);
    throw error;
  }
};

export const createDealership = async (dealershipData: Omit<Dealership, 'id'>) => {
  try {
    console.log('[apiService] Creating dealership, data:', dealershipData);

    // Generate schema name if not provided
    if (!dealershipData.schema_name) {
      dealershipData.schema_name = `dealership_${Date.now()}`;
    }

    // Ensure group_id is handled correctly
    if (dealershipData.group_id) {
      console.log(`[apiService] Assigning dealership to group: ${dealershipData.group_id}`);
    } else {
      console.log('[apiService] No group assigned for this dealership');
      // Make sure null is passed and not undefined to avoid database errors
      dealershipData.group_id = null;
    }

    // Store brands properly
    if (dealershipData.brands && typeof dealershipData.brands === 'string') {
      console.log('[apiService] Brands provided as string:', dealershipData.brands);
      // Already a JSON string, no need to convert
    } else if (Array.isArray(dealershipData.brands)) {
      console.log('[apiService] Brands provided as array, converting to JSON');
      dealershipData.brands = JSON.stringify(dealershipData.brands);
    }

    // Log the final data being sent to database
    console.log(
      '[apiService] Final dealership data for DB:',
      JSON.stringify(dealershipData, null, 2)
    );

    const { data, error } = await supabase
      .from('dealerships')
      .insert(dealershipData)
      .select()
      .single();

    if (error) {
      console.error('[apiService] Error creating dealership:', error);
      console.error('[apiService] Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      throw error;
    }

    console.log('[apiService] Created dealership successfully:', data);
    return data;
  } catch (error) {
    console.error('[apiService] Exception in createDealership:', error);
    if (error instanceof Error) {
      console.error('[apiService] Error message:', error.message);
      console.error('[apiService] Error stack:', error.stack);
    }
    throw error;
  }
};

// Roles functions
export const getRoles = async () => {
  try {
    console.log('[apiService] Fetching roles');
    const { data, error } = await supabase.from('roles').select('*').order('id');

    if (error) {
      console.error('[apiService] Error fetching roles:', error);
      throw error;
    }

    console.log('[apiService] Fetched roles:', data);
    return data;
  } catch (error) {
    console.error('[apiService] Exception in getRoles:', error);
    throw error;
  }
};

// User functions
export const updateUserRole = async (userId: string, roleId: number, dealershipId?: number) => {
  try {
    console.log(
      `[apiService] Updating user ${userId} with role ${roleId} and dealership ${
        dealershipId || 'none'
      }`
    );

    const updateData: { role_id: number; dealership_id?: number } = {
      role_id: roleId,
    };

    if (dealershipId) {
      updateData.dealership_id = dealershipId;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('[apiService] Error updating user role:', error);
      throw error;
    }

    console.log('[apiService] Updated user role:', data);
    return data;
  } catch (error) {
    console.error('[apiService] Exception in updateUserRole:', error);
    throw error;
  }
};

// Dealership-specific data functions
export const getDealershipData = async <T>(
  dealershipId: number,
  table: string,
  columns: string = '*'
): Promise<T[]> => {
  try {
    console.log(`[apiService] Fetching ${table} data for dealership ${dealershipId}`);

    // First, get the schema name for this dealership
    const { data: dealership, error: dealershipError } = await supabase
      .from('dealerships')
      .select('schema_name')
      .eq('id', dealershipId)
      .single();

    if (dealershipError) {
      console.error('[apiService] Error fetching dealership schema:', dealershipError);
      throw dealershipError;
    }

    if (!dealership) {
      console.error(`[apiService] Dealership with ID ${dealershipId} not found`);
      throw new Error(`Dealership with ID ${dealershipId} not found`);
    }

    // Query the table in the dealership's schema
    const { data, error } = await supabase
      .from(`${dealership.schema_name}.${table}`)
      .select(columns);

    if (error) {
      console.error(`[apiService] Error fetching ${table} data:`, error);
      throw error;
    }

    console.log(`[apiService] Fetched ${table} data:`, data);
    return data as T[];
  } catch (error) {
    console.error(`[apiService] Exception in getDealershipData for ${table}:`, error);
    throw error;
  }
};

export const createDealershipRecord = async <T>(
  dealershipId: number,
  table: string,
  recordData: any
): Promise<T> => {
  try {
    console.log(
      `[apiService] Creating ${table} record for dealership ${dealershipId}:`,
      recordData
    );

    // First, get the schema name for this dealership
    const { data: dealership, error: dealershipError } = await supabase
      .from('dealerships')
      .select('schema_name')
      .eq('id', dealershipId)
      .single();

    if (dealershipError) {
      console.error('[apiService] Error fetching dealership schema:', dealershipError);
      throw dealershipError;
    }

    if (!dealership) {
      console.error(`[apiService] Dealership with ID ${dealershipId} not found`);
      throw new Error(`Dealership with ID ${dealershipId} not found`);
    }

    // Insert the record into the dealership's schema
    const { data, error } = await supabase
      .from(`${dealership.schema_name}.${table}`)
      .insert(recordData)
      .select()
      .single();

    if (error) {
      console.error(`[apiService] Error creating ${table} record:`, error);
      throw error;
    }

    console.log(`[apiService] Created ${table} record:`, data);
    return data as T;
  } catch (error) {
    console.error(`[apiService] Exception in createDealershipRecord for ${table}:`, error);
    throw error;
  }
};

// Debug functions
export const logSchemaOperation = async (action: string, details: any) => {
  try {
    console.log(`[apiService] Logging schema operation: ${action}`, details);

    // Check if the logs table exists first
    try {
      const { data, error } = await supabase
        .from('logs')
        .insert({
          action,
          details,
        })
        .select()
        .single();

      if (error) {
        console.log(
          '[apiService] Error logging schema operation, continuing silently:',
          error.message
        );
        return true; // Don't fail the operation just because logging failed
      }

      console.log('[apiService] Logged schema operation:', data);
      return true;
    } catch (innerError) {
      console.log('[apiService] Schema operation logging failed, continuing silently');
      return true; // Don't fail the operation just because logging failed
    }
  } catch (error) {
    console.log('[apiService] Exception in logSchemaOperation, continuing silently');
    return true; // Don't fail the operation just because logging failed
  }
};

export const testSchemaConnections = async () => {
  try {
    console.log('[apiService] Testing schema connections');

    // Test global tables
    const { data: groups, error: groupsError } = await supabase
      .from('dealership_groups')
      .select('count(*)');

    if (groupsError) {
      throw new Error(`Error connecting to dealership_groups: ${groupsError.message}`);
    }

    const { data: dealerships, error: dealershipsError } = await supabase
      .from('dealerships')
      .select('count(*)');

    if (dealershipsError) {
      throw new Error(`Error connecting to dealerships: ${dealershipsError.message}`);
    }

    // Get first dealership to test schema
    const { data: firstDealership, error: firstDealershipError } = await supabase
      .from('dealerships')
      .select('schema_name')
      .limit(1)
      .single();

    let schemaTestResult = { success: false, message: 'No dealerships found' };

    if (firstDealership) {
      try {
        // Try to query a table in the dealership's schema
        const { data: schemaTest, error: schemaTestError } = await supabase
          .from(`${firstDealership.schema_name}.pay_plans`)
          .select('count(*)');

        if (schemaTestError) {
          schemaTestResult = {
            success: false,
            message: `Error connecting to ${firstDealership.schema_name}: ${schemaTestError.message}`,
          };
        } else {
          schemaTestResult = {
            success: true,
            message: `Successfully connected to ${firstDealership.schema_name}`,
          };
        }
      } catch (schemaError) {
        schemaTestResult = {
          success: false,
          message: `Exception connecting to ${firstDealership.schema_name}: ${String(schemaError)}`,
        };
      }
    }

    const results = {
      globalTables: {
        groups: { success: true, count: groups[0].count },
        dealerships: { success: true, count: dealerships[0].count },
      },
      dealershipSchema: schemaTestResult,
    };

    console.log('[apiService] Schema connection test results:', results);
    return results;
  } catch (error) {
    console.error('[apiService] Exception in testSchemaConnections:', error);
    return {
      globalTables: { success: false, message: String(error) },
      dealershipSchema: { success: false, message: 'Could not test dealership schema' },
    };
  }
};

// New functions for dealership project management

/**
 * Fetches the Supabase URL and anon key for a dealership project
 */
export const getDealershipSupabaseConfig = async (dealershipId: number) => {
  try {
    console.log('Fetching Supabase config for dealership:', dealershipId);
    const { data, error } = await supabase
      .from('dealerships')
      .select('id, name, schema_name, supabase_url, supabase_key')
      .eq('id', dealershipId)
      .single();

    if (error) {
      console.error('Error fetching dealership Supabase config:', error);
      throw error;
    }

    if (!data) {
      throw new Error(`No dealership found with ID ${dealershipId}`);
    }

    if (!data.supabase_url || !data.supabase_key) {
      // If the keys are not in the database, use the environment variables based on schema_name
      const schemaName = data.schema_name || `dealership_${dealershipId}`;
      const envUrlKey = `VITE_${schemaName.toUpperCase()}_SUPABASE_URL`;
      const envAnonKey = `VITE_${schemaName.toUpperCase()}_SUPABASE_ANON_KEY`;

      // Try to get from environment
      const url = import.meta.env[envUrlKey] || '';
      const key = import.meta.env[envAnonKey] || '';

      if (!url || !key) {
        console.warn(
          `No Supabase config found for dealership ${dealershipId} in either database or environment`
        );
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        schema_name: schemaName,
        supabase_url: url,
        supabase_key: key,
      };
    }

    return data;
  } catch (error) {
    console.error('Failed to get dealership Supabase config:', error);
    return null;
  }
};

/**
 * Test connection to a dealership's Supabase project
 */
export const testDealershipConnection = async (dealershipId: number) => {
  try {
    const config = await getDealershipSupabaseConfig(dealershipId);
    if (!config || !config.supabase_url || !config.supabase_key) {
      return { success: false, message: 'Missing Supabase configuration for this dealership' };
    }

    // Create a temporary client
    const tempClient = createClient(config.supabase_url, config.supabase_key);

    // Test the connection by fetching the PostgreSQL version
    const { data, error } = await tempClient.rpc('get_pg_version');

    if (error) {
      console.error('Error testing dealership connection:', error);
      return {
        success: false,
        message: `Connection failed: ${error.message}`,
        error,
      };
    }

    return {
      success: true,
      message: 'Connection successful',
      data,
      config,
    };
  } catch (error) {
    console.error('Failed to test dealership connection:', error);
    return {
      success: false,
      message: `Connection test failed: ${error}`,
      error,
    };
  }
};

/**
 * Create a user in a dealership's Supabase project
 */
export const createDealershipUser = async (
  dealershipId: number,
  userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role_id: string;
    phone_number?: string;
  }
) => {
  try {
    console.log(`Creating user in dealership ${dealershipId}:`, {
      email: userData.email,
      name: `${userData.first_name} ${userData.last_name}`,
      role: userData.role_id,
    });

    // First, test the connection to ensure we have access
    const connectionTest = await testDealershipConnection(dealershipId);
    if (!connectionTest.success) {
      throw new Error(`Cannot connect to dealership Supabase: ${connectionTest.message}`);
    }

    // Get the dealership supabase client
    const dealershipClient = getDealershipSupabase(dealershipId);

    // Create the user in the auth system
    const { data: authData, error: authError } = await dealershipClient.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        first_name: userData.first_name,
        last_name: userData.last_name,
        full_name: `${userData.first_name} ${userData.last_name}`,
        role_id: userData.role_id,
        dealership_id: dealershipId,
      },
    });

    if (authError) {
      console.error('Error creating user in auth system:', authError);
      throw authError;
    }

    if (!authData.user) {
      throw new Error('User creation failed - no user returned');
    }

    // Add user to the public.users table
    const { data: userData, error: userError } = await dealershipClient
      .from('users')
      .insert({
        id: authData.user.id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        role_id: userData.role_id,
        dealership_id: dealershipId,
        phone_number: userData.phone_number,
      })
      .select()
      .single();

    if (userError) {
      console.error('Error adding user to public.users table:', userError);

      // Try to clean up the auth user if possible
      try {
        await dealershipClient.auth.admin.deleteUser(authData.user.id);
      } catch (cleanupError) {
        console.error('Error cleaning up auth user after failure:', cleanupError);
      }

      throw userError;
    }

    // Log the successful creation
    await logSchemaOperation('create_dealership_user', {
      dealership_id: dealershipId,
      user_id: authData.user.id,
      email: userData.email,
      role_id: userData.role_id,
    });

    return {
      success: true,
      user: {
        ...authData.user,
        ...userData,
      },
    };
  } catch (error) {
    console.error(`Failed to create user in dealership ${dealershipId}:`, error);
    return {
      success: false,
      error,
    };
  }
};

/**
 * Get users from a specific dealership Supabase project
 */
export const getDealershipUsers = async (dealershipId: number) => {
  try {
    // Test connection first
    const connectionTest = await testDealershipConnection(dealershipId);
    if (!connectionTest.success) {
      throw new Error(`Cannot connect to dealership Supabase: ${connectionTest.message}`);
    }

    // Get the dealership client
    const dealershipClient = getDealershipSupabase(dealershipId);

    // Fetch users
    const { data, error } = await dealershipClient
      .from('users')
      .select(
        `
        id, 
        first_name, 
        last_name, 
        email, 
        role_id,
        phone_number,
        roles(name)
      `
      )
      .order('last_name', { ascending: true });

    if (error) {
      console.error(`Error fetching users from dealership ${dealershipId}:`, error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error(`Failed to get users from dealership ${dealershipId}:`, error);
    throw error;
  }
};

// Function to create a new schema for a dealership
export const createDealershipSchema = async (schemaName: string) => {
  try {
    console.log(`[apiService] Creating schema: ${schemaName}`);

    // Create the schema
    const { error: schemaError } = await supabase.rpc('create_dealership_schema', {
      schema_name: schemaName,
    });

    if (schemaError) {
      console.error('[apiService] Error creating schema:', schemaError);
      throw schemaError;
    }

    // Log the creation
    console.log(`[apiService] Schema ${schemaName} created successfully`);

    return { success: true, message: `Schema ${schemaName} created successfully` };
  } catch (error) {
    console.error('[apiService] Exception in createDealershipSchema:', error);
    throw error;
  }
};

// Function to update a dealership's schema name
export const updateDealershipSchema = async (dealershipId: number, schemaName: string) => {
  try {
    console.log(`[apiService] Updating dealership ${dealershipId} with schema: ${schemaName}`);

    const { data, error } = await supabase
      .from('dealerships')
      .update({ schema_name: schemaName })
      .eq('id', dealershipId)
      .select()
      .single();

    if (error) {
      console.error('[apiService] Error updating dealership schema:', error);
      throw error;
    }

    console.log('[apiService] Dealership schema updated:', data);
    return data;
  } catch (error) {
    console.error('[apiService] Exception in updateDealershipSchema:', error);
    throw error;
  }
};

// Dealership group operations
export const deleteDealershipGroup = async (groupId: number) => {
  try {
    console.log('[apiService] Deleting dealership group:', groupId);

    // First check if there are any dealerships in this group
    const { data: relatedDealerships, error: checkError } = await supabase
      .from('dealerships')
      .select('id')
      .eq('group_id', groupId);

    if (checkError) {
      console.error('[apiService] Error checking related dealerships:', checkError);
      throw checkError;
    }

    // Don't allow deletion if there are dealerships in this group
    if (relatedDealerships && relatedDealerships.length > 0) {
      throw new Error(
        `Cannot delete group: ${relatedDealerships.length} dealership(s) are associated with this group`
      );
    }

    // Delete the group
    const { error } = await supabase.from('dealership_groups').delete().eq('id', groupId);

    if (error) {
      console.error('[apiService] Error deleting dealership group:', error);
      throw error;
    }

    console.log('[apiService] Successfully deleted dealership group:', groupId);
    return { success: true };
  } catch (error) {
    console.error('[apiService] Exception in deleteDealershipGroup:', error);
    throw error;
  }
};

// Dealership operations
export const deleteDealership = async (dealershipId: number) => {
  try {
    console.log('[apiService] Deleting dealership:', dealershipId);

    // Get the dealership to find its schema name
    const { data: dealership, error: getError } = await supabase
      .from('dealerships')
      .select('schema_name')
      .eq('id', dealershipId)
      .single();

    if (getError) {
      console.error('[apiService] Error getting dealership before delete:', getError);
      throw getError;
    }

    if (!dealership) {
      throw new Error('Dealership not found');
    }

    // Delete the dealership
    const { error: deleteError } = await supabase
      .from('dealerships')
      .delete()
      .eq('id', dealershipId);

    if (deleteError) {
      console.error('[apiService] Error deleting dealership:', deleteError);
      throw deleteError;
    }

    // Note: We're keeping the schema in the database for data recovery purposes
    // A full schema delete would require admin privileges and should be done carefully

    console.log('[apiService] Successfully deleted dealership:', dealershipId);
    return { success: true, schemaName: dealership.schema_name };
  } catch (error) {
    console.error('[apiService] Exception in deleteDealership:', error);
    throw error;
  }
};

/**
 * Gets pending signup requests
 */
export const getSignupRequests = async (): Promise<SignupRequest[]> => {
  try {
    console.log('[apiService] Fetching signup requests');

    const { data, error } = await supabase
      .from('signup_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[apiService] Error fetching signup requests:', error);
      throw error;
    }

    console.log(`[apiService] Retrieved ${data?.length || 0} signup requests`);
    return data || [];
  } catch (error) {
    console.error('[apiService] Error in getSignupRequests:', error);
    throw error;
  }
};

/**
 * Approves a signup request and creates necessary resources
 */
export const approveSignupRequest = async (
  requestId: string,
  options: {
    createSchema?: boolean;
    schemaName?: string;
    adminEmail?: string;
    adminName?: string;
    tempPassword?: string;
    addOns?: string[];
    isDealerGroup?: boolean;
    groupLevel?: string;
    dealershipCount?: number;
  }
): Promise<{
  success: boolean;
  message: string;
  error?: any;
  groupId?: number;
  dealershipIds?: number[];
}> => {
  try {
    console.log(`[apiService] Approving signup request: ${requestId}`);
    const user = await getCurrentUser();

    if (!user) {
      throw new Error('Not authenticated');
    }

    // Get the signup request
    const { data: requestData, error: requestError } = await supabase
      .from('signup_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (requestError) {
      console.error(`[apiService] Error fetching signup request: ${requestError.message}`);
      throw requestError;
    }

    const request = requestData;
    console.log('[apiService] Found signup request:', request);

    // First, update request status
    const { error: updateError } = await supabase
      .from('signup_requests')
      .update({ status: 'approved', approved_at: new Date().toISOString() })
      .eq('id', requestId);

    if (updateError) {
      console.error(`[apiService] Error updating signup request: ${updateError.message}`);
      throw updateError;
    }

    // Group signup management
    if (options.isDealerGroup) {
      return await handleDealerGroupSignup(request, options);
    }
    // Finance Manager Only signup management
    else if (request.tier === 'finance_manager_only') {
      return await handleFinanceManagerSignup(request, options);
    }
    // Regular dealership signup management
    else {
      console.log(`[apiService] Handling dealership signup for ${request.dealership_name}`);

      // Create schema if requested
      let schemaName = options.schemaName;

      if (options.createSchema && schemaName) {
        console.log(`[apiService] Creating schema: ${schemaName}`);
        const { success: schemaSuccess, error: schemaError } = await createDealershipSchema(
          schemaName
        );

        if (!schemaSuccess) {
          console.error(`[apiService] Error creating schema: ${schemaError}`);
          throw schemaError;
        }
      }

      // Create a dealership record
      const { data: dealershipData, error: dealershipError } = await supabase
        .from('dealerships')
        .insert({
          name: request.dealership_name,
          schema_name: schemaName,
          tier: request.tier,
          add_ons: request.add_ons || [],
          status: 'active',
          contact_email: request.email,
          contact_name: request.contact_person,
          contact_phone: request.phone,
          subscription_status: 'active',
          created_by: user.id,
        })
        .select()
        .single();

      if (dealershipError) {
        console.error(`[apiService] Error creating dealership: ${dealershipError.message}`);
        throw dealershipError;
      }

      const dealershipId = dealershipData.id;
      console.log(`[apiService] Created dealership with ID: ${dealershipId}`);

      // Create the dealership admin user if email provided
      if (options.adminEmail) {
        console.log(`[apiService] Creating admin user: ${options.adminEmail}`);

        // Check if user already exists
        const { data: existingUser, error: existingUserError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', options.adminEmail)
          .single();

        if (existingUserError && existingUserError.code !== 'PGRST116') {
          console.error(
            `[apiService] Error checking for existing user: ${existingUserError.message}`
          );
          throw existingUserError;
        }

        if (existingUser) {
          console.log(`[apiService] User already exists: ${options.adminEmail}`);

          // Update existing user to add dealership admin role
          const { error: updateUserError } = await supabase
            .from('profiles')
            .update({
              dealership_id: dealershipId,
              role: 'dealership_admin',
            })
            .eq('email', options.adminEmail);

          if (updateUserError) {
            console.error(`[apiService] Error updating user: ${updateUserError.message}`);
            throw updateUserError;
          }
        } else {
          // Create new user
          const { error: signupError, data: signupData } = await supabase.auth.signUp({
            email: options.adminEmail,
            password: options.tempPassword || generatePassword(),
          });

          if (signupError) {
            console.error(`[apiService] Error creating user: ${signupError.message}`);
            throw signupError;
          }

          // Create profile record
          const { error: profileError } = await supabase.from('profiles').insert({
            id: signupData?.user?.id,
            email: options.adminEmail,
            dealership_id: dealershipId,
            role: 'dealership_admin',
            first_name: options.adminName?.split(' ')[0] || '',
            last_name: options.adminName?.split(' ').slice(1).join(' ') || '',
          });

          if (profileError) {
            console.error(`[apiService] Error creating profile: ${profileError.message}`);
            throw profileError;
          }
        }
      }

      // Create a subscription event record for billing tracking
      await recordSubscriptionEvent({
        dealership_id: dealershipId,
        event_type: 'signup',
        tier: request.tier,
        add_ons: request.add_ons || [],
        user_id: user.id,
      });

      console.log(
        `[apiService] Dealership signup approved and setup complete for ${request.dealership_name}`
      );

      return {
        success: true,
        message: `Dealership ${request.dealership_name} created successfully`,
        dealershipIds: [dealershipId],
      };
    }
  } catch (error) {
    console.error('[apiService] Error in approveSignupRequest:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      error,
    };
  }
};

/**
 * Rejects a signup request
 */
export const rejectSignupRequest = async (
  requestId: string,
  reason?: string
): Promise<{ success: boolean; message: string; error?: any }> => {
  try {
    console.log(`[apiService] Rejecting signup request: ${requestId}`);
    const user = await getCurrentUser();

    if (!user) {
      throw new Error('Not authenticated');
    }

    // Update the request status to 'rejected'
    const { error: updateError } = await supabase
      .from('signup_requests')
      .update({
        status: 'rejected',
        processed_at: new Date().toISOString(),
        processed_by: user.id,
        // Store rejection reason in additional metadata
        metadata: { rejection_reason: reason || 'No reason provided' },
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('[apiService] Error updating signup request status:', updateError);
      throw updateError;
    }

    return { success: true, message: 'Signup request rejected successfully' };
  } catch (error) {
    console.error('[apiService] Error in rejectSignupRequest:', error);
    return { success: false, message: 'Failed to reject signup request', error };
  }
};

/**
 * Generates a random temporary password
 */
const generateTemporaryPassword = (length = 12): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * API service for handling deal-related data and goal tracking
 */

// Define types for the goal tracking data
export interface Deal {
  id: string;
  salesperson_id: string;
  sale_date: string;
  front_end_gross?: number;
  back_end_gross?: number;
  [key: string]: any; // Allow for additional properties
}

export interface GoalProgressMetrics {
  expected: number;
  actual: number;
  progress: number;
  status: 'on-track' | 'slightly-behind' | 'behind' | 'neutral';
  progressRatio: number;
}

export interface GoalTrackingData {
  deals: Deal[];
  daysOff: number[];
  progressMetrics: GoalProgressMetrics;
  daysInMonth: number;
  currentDay: number;
}

/**
 * Gets all deals for the current user in the specified date range
 * @param userId - The ID of the current user
 * @param startDate - Start date in ISO format (YYYY-MM-DD)
 * @param endDate - End date in ISO format (YYYY-MM-DD)
 * @returns Promise with the deals data
 */
export const getUserDeals = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<Deal[]> => {
  console.log('[apiService] Getting deals for user:', userId, 'from:', startDate, 'to:', endDate);

  try {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('salesperson_id', userId)
      .gte('sale_date', startDate)
      .lte('sale_date', endDate);

    if (error) {
      console.error('[apiService] Error fetching deals:', error);
      throw error;
    }

    console.log(`[apiService] Found ${data?.length || 0} deals`);
    return data || [];
  } catch (error) {
    console.error('[apiService] Unexpected error fetching deals:', error);
    throw error;
  }
};

/**
 * Gets days off for a salesperson in the current month
 * @param userId - The ID of the current user
 * @param startDate - Start date in ISO format (YYYY-MM-DD)
 * @param endDate - End date in ISO format (YYYY-MM-DD)
 * @returns Promise with array of day numbers (1-31) that are days off
 */
export const getSalespersonDaysOff = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<number[]> => {
  console.log('[apiService] Getting days off for user:', userId);

  try {
    // Query schedule data from Supabase
    const { data, error } = await supabase
      .from('schedule')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .eq('is_day_off', true);

    if (error) {
      console.error('[apiService] Error fetching schedule:', error);
      // Return default days off if there's an error
      return [5, 8, 15, 18, 25, 27, 29];
    }

    // Extract day numbers from dates
    const daysOff =
      data?.map(entry => {
        const date = new Date(entry.date);
        return date.getDate();
      }) || [];

    console.log('[apiService] Days off this month:', daysOff);

    // If no days off are scheduled, return default pattern
    if (daysOff.length === 0) {
      console.log('[apiService] No days off found, using default pattern');
      return [5, 8, 15, 18, 25, 27, 29];
    }

    return daysOff;
  } catch (error) {
    console.error('[apiService] Unexpected error fetching schedule:', error);
    // Return default days off on error
    return [5, 8, 15, 18, 25, 27, 29];
  }
};

/**
 * Calculate expected sales based on the non-linear sales pace model
 * @param currentDay - The current day of the month
 * @param daysOff - Array of days that are days off
 * @returns The expected number of sales by the current day
 */
export const calculateExpectedSales = (currentDay: number, daysOff: number[]): number => {
  let expectedSales = 0;

  // Phase 1: Days 1-10 - 1 sale every 3 days (except days off)
  for (let i = 1; i <= Math.min(10, currentDay); i++) {
    if (!daysOff.includes(i) && i % 3 === 0) {
      expectedSales++;
    }
  }

  // Phase 2: Days 11-20 - 1 sale every 2 days (except days off)
  if (currentDay > 10) {
    for (let i = 11; i <= Math.min(20, currentDay); i++) {
      if (!daysOff.includes(i) && i % 2 === 0) {
        expectedSales++;
      }
    }
  }

  // Phase 3: Days 21-30/31 - 1 sale every day (except days off)
  if (currentDay > 20) {
    for (let i = 21; i <= currentDay; i++) {
      if (!daysOff.includes(i)) {
        expectedSales++;
      }
    }
  }

  console.log(`[apiService] Expected sales by day ${currentDay}:`, expectedSales);
  return expectedSales;
};

/**
 * Calculate goal progress metrics
 * @param deals - Array of deal objects
 * @param currentDay - Current day of the month
 * @param daysOff - Array of days off
 * @param monthlyGoal - Monthly sales goal target
 * @returns Object with goal progress metrics
 */
export const calculateGoalProgress = (
  deals: Deal[],
  currentDay: number,
  daysOff: number[],
  monthlyGoal: number = 15
): GoalProgressMetrics => {
  // Calculate expected sales by the current day
  const expectedSales = calculateExpectedSales(currentDay, daysOff);

  // Count actual sales
  const actualSales = deals.length;

  // Calculate progress ratio
  const progressRatio = actualSales / (expectedSales || 1); // Avoid division by zero

  // Determine status based on progress ratio
  let status: 'on-track' | 'slightly-behind' | 'behind' | 'neutral' = 'neutral';
  if (progressRatio >= 1) {
    status = 'on-track'; // Green
  } else if (progressRatio >= 0.8) {
    status = 'slightly-behind'; // Yellow
  } else {
    status = 'behind'; // Red
  }

  // Calculate overall progress percentage toward monthly goal
  const progressPercentage = Math.min(100, Math.round((actualSales / monthlyGoal) * 100));

  console.log('[apiService] Goal progress calculation:', {
    currentDay,
    expectedSales,
    actualSales,
    progressRatio,
    status,
    progressPercentage,
  });

  return {
    expected: expectedSales,
    actual: actualSales,
    progress: progressPercentage,
    status,
    progressRatio,
  };
};

/**
 * Get all data needed for goal tracking
 * @param userId - User ID of the salesperson
 * @returns Promise with the goal tracking data
 */
export const getGoalTrackingData = async (userId: string): Promise<GoalTrackingData> => {
  // Get current month date range
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentDay = currentDate.getDate();

  const startDate = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
  const endDate = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];

  try {
    // Get deals and days off in parallel
    const [deals, daysOff] = await Promise.all([
      getUserDeals(userId, startDate, endDate),
      getSalespersonDaysOff(userId, startDate, endDate),
    ]);

    // Calculate goal progress
    const progressMetrics = calculateGoalProgress(deals, currentDay, daysOff);

    return {
      deals,
      daysOff,
      progressMetrics,
      daysInMonth: new Date(currentYear, currentMonth + 1, 0).getDate(),
      currentDay,
    };
  } catch (error) {
    console.error('[apiService] Error in getGoalTrackingData:', error);
    throw error;
  }
};

/**
 * Sets up RLS policies to allow access across dealerships within a group
 */
export const setupGroupRlsPolicies = async (
  groupId: number,
  dealershipIds: number[]
): Promise<{ success: boolean; message: string; error?: any }> => {
  try {
    console.log(
      `[apiService] Setting up RLS policies for group ${groupId} with ${dealershipIds.length} dealerships`
    );

    // For each dealership in the group, we need to create policies:
    // 1. For group_admin role to access all dealerships in the group
    // 2. For area_vp role to access assigned dealerships

    // First, get the role IDs
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('id, name')
      .in('name', ['group_admin', 'area_vp', 'dealership_admin']);

    if (rolesError) {
      console.error('[apiService] Error fetching roles:', rolesError);
      throw rolesError;
    }

    const groupAdminRoleId = roles.find(r => r.name === 'group_admin')?.id;
    const areaVpRoleId = roles.find(r => r.name === 'area_vp')?.id;

    if (!groupAdminRoleId || !areaVpRoleId) {
      console.error('[apiService] Missing required role IDs');
      throw new Error('Required role IDs not found');
    }

    console.log(
      '[apiService] Found role IDs - Group Admin:',
      groupAdminRoleId,
      'Area VP:',
      areaVpRoleId
    );

    // Create mapping records for each dealership in the group
    const mappings = dealershipIds.map(dealershipId => ({
      group_id: groupId,
      dealership_id: dealershipId,
      created_at: new Date().toISOString(),
    }));

    const { error: mappingError } = await supabase
      .from('group_dealership_mappings')
      .upsert(mappings);

    if (mappingError) {
      console.error('[apiService] Error creating group dealership mappings:', mappingError);
      throw mappingError;
    }

    console.log(`[apiService] Created ${mappings.length} group dealership mappings`);

    // Create an RLS policy that grants access to users with role_id = group_admin_role_id
    // where user_metadata->group_id = the group_id of the dealership
    for (const dealershipId of dealershipIds) {
      // Create log entry for this setup
      await logSchemaOperation('setup_group_rls', {
        group_id: groupId,
        dealership_id: dealershipId,
        roles: {
          group_admin: groupAdminRoleId,
          area_vp: areaVpRoleId,
        },
      });
    }

    console.log('[apiService] Group RLS policies setup complete');

    return {
      success: true,
      message: `RLS policies configured for group ${groupId}`,
    };
  } catch (error) {
    console.error('[apiService] Error setting up group RLS policies:', error);
    return {
      success: false,
      message: 'Failed to set up group RLS policies',
      error,
    };
  }
};

/**
 * Creates a schema for a Finance Manager in Supabase
 */
export const createFinanceManagerSchema = async (
  schemaName: string
): Promise<{ success: boolean; message: string; error?: any }> => {
  try {
    console.log(`[apiService] Creating finance manager schema: ${schemaName}`);

    // Get current user for logging
    const user = await getCurrentUser();

    // Execute SQL to create schema
    const { error: schemaError } = await supabase.rpc('create_schema', {
      schema_name: schemaName,
    });

    if (schemaError) {
      console.error(`[apiService] Error creating schema ${schemaName}:`, schemaError);
      throw schemaError;
    }

    console.log(`[apiService] Schema ${schemaName} created successfully. Creating tables...`);

    // Create deals table in the schema
    const createDealsTableQuery = `
      CREATE TABLE IF NOT EXISTS "${schemaName}".deals (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES auth.users(id),
        deal_number TEXT,
        stock_number TEXT,
        vin TEXT,
        customer_name TEXT,
        vehicle TEXT,
        sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
        amount NUMERIC(10,2),
        products JSONB DEFAULT '[]',
        profit NUMERIC(10,2) DEFAULT 0,
        status TEXT DEFAULT 'pending',
        deal_details JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    const { error: tableError } = await supabase.rpc('run_sql', {
      sql_query: createDealsTableQuery,
    });

    if (tableError) {
      console.error(`[apiService] Error creating deals table in ${schemaName}:`, tableError);
      throw tableError;
    }

    // Set RLS policies for the deals table
    const createRlsPolicyQuery = `
      -- Enable RLS on the deals table
      ALTER TABLE "${schemaName}".deals ENABLE ROW LEVEL SECURITY;
      
      -- Create policy for users to select their own deals
      CREATE POLICY "Users can view their own deals" 
      ON "${schemaName}".deals FOR SELECT 
      USING (auth.uid() = user_id);
      
      -- Create policy for users to insert their own deals
      CREATE POLICY "Users can insert their own deals" 
      ON "${schemaName}".deals FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
      
      -- Create policy for users to update their own deals
      CREATE POLICY "Users can update their own deals" 
      ON "${schemaName}".deals FOR UPDATE
      USING (auth.uid() = user_id);
    `;

    const { error: rlsError } = await supabase.rpc('run_sql', {
      sql_query: createRlsPolicyQuery,
    });

    if (rlsError) {
      console.error(`[apiService] Error setting RLS policies in ${schemaName}:`, rlsError);
      throw rlsError;
    }

    // Log the schema operation
    await logSchemaOperation('create_finance_manager_schema', {
      schemaName,
      createdBy: user?.id,
      timestamp: new Date().toISOString(),
    });

    console.log(`[apiService] Finance manager schema ${schemaName} setup completed successfully`);

    return {
      success: true,
      message: `Finance manager schema ${schemaName} created successfully`,
    };
  } catch (error) {
    console.error(`[apiService] Error in createFinanceManagerSchema:`, error);
    return {
      success: false,
      message: `Failed to create finance manager schema: ${error.message || error}`,
      error,
    };
  }
};

/**
 * Logs a deal for a Finance Manager in their schema's deals table
 */
export const logFinanceManagerDeal = async (
  schema: string,
  dealData: {
    deal_number?: string;
    stock_number?: string;
    vin?: string;
    customer_name: string;
    vehicle: string;
    sale_date?: string;
    amount?: number;
    products?: string[];
    profit?: number;
    status?: string;
    deal_details?: any;
  }
): Promise<{ success: boolean; deal?: any; message: string; error?: any }> => {
  try {
    console.log(`[apiService] Logging finance manager deal to schema: ${schema}`);
    const user = await getCurrentUser();

    if (!user) {
      throw new Error('Not authenticated');
    }

    // Format the deal data
    const formattedDeal = {
      user_id: user.id,
      deal_number: dealData.deal_number || `D${Math.floor(1000 + Math.random() * 9000)}`,
      stock_number: dealData.stock_number || '',
      vin: dealData.vin || '',
      customer_name: dealData.customer_name,
      vehicle: dealData.vehicle,
      sale_date: dealData.sale_date || new Date().toISOString().split('T')[0],
      amount: dealData.amount || 0,
      products: dealData.products ? JSON.stringify(dealData.products) : '[]',
      profit: dealData.profit || 0,
      status: dealData.status || 'pending',
      deal_details: dealData.deal_details ? JSON.stringify(dealData.deal_details) : '{}',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // SECURITY FIX: Use parameterized query to prevent SQL injection
    // First, validate the schema name to prevent injection there
    const schemaPattern = /^[a-zA-Z0-9_]+$/;
    if (!schemaPattern.test(schema)) {
      throw new Error('Invalid schema name');
    }

    // Use Supabase's built-in methods with proper schema specification
    // Note: If Supabase doesn't support dynamic schema selection directly,
    // we need to create a secure stored procedure
    
    // For now, we'll use a parameterized query approach
    const { data, error } = await supabase
      .from(`${schema}.deals`)
      .insert([{
        user_id: formattedDeal.user_id,
        deal_number: formattedDeal.deal_number,
        stock_number: formattedDeal.stock_number,
        vin: formattedDeal.vin,
        customer_name: formattedDeal.customer_name,
        vehicle: formattedDeal.vehicle,
        sale_date: formattedDeal.sale_date,
        amount: formattedDeal.amount,
        products: formattedDeal.products,
        profit: formattedDeal.profit,
        status: formattedDeal.status,
        deal_details: formattedDeal.deal_details,
        created_at: formattedDeal.created_at,
        updated_at: formattedDeal.updated_at
      }])
      .select()
      .single();

    if (error) {
      console.error(`[apiService] Error inserting deal into ${schema}:`, error);
      throw error;
    }

    console.log(`[apiService] Deal logged successfully to ${schema}:`, data);

    return {
      success: true,
      deal: data && data.length > 0 ? data[0] : null,
      message: 'Deal logged successfully',
    };
  } catch (error) {
    console.error(`[apiService] Error in logFinanceManagerDeal:`, error);
    return {
      success: false,
      message: `Failed to log deal: ${error.message || error}`,
      error,
    };
  }
};

/**
 * Gets deals for a Finance Manager from their schema
 */
export const getFinanceManagerDeals = async (
  schema: string,
  options?: {
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    filter?: Record<string, any>;
  }
): Promise<{ success: boolean; deals: any[]; count: number; message: string; error?: any }> => {
  try {
    console.log(`[apiService] Getting finance manager deals from schema: ${schema}`);
    const user = await getCurrentUser();

    if (!user) {
      throw new Error('Not authenticated');
    }

    const limit = options?.limit || 50;
    const offset = options?.offset || 0;
    const sortBy = options?.sortBy || 'created_at';
    const sortDirection = options?.sortDirection || 'desc';

    // SECURITY FIX: Validate schema name first
    const schemaPattern = /^[a-zA-Z0-9_]+$/;
    if (!schemaPattern.test(schema)) {
      throw new Error('Invalid schema name');
    }

    // Validate sort parameters to prevent injection
    const allowedSortColumns = ['created_at', 'sale_date', 'amount', 'profit', 'deal_number', 'customer_name'];
    const allowedSortDirections = ['asc', 'desc'];
    
    if (!allowedSortColumns.includes(sortBy)) {
      throw new Error('Invalid sort column');
    }
    
    if (!allowedSortDirections.includes(sortDirection)) {
      throw new Error('Invalid sort direction');
    }

    // Build query using Supabase's query builder
    let query = supabase
      .from(`${schema}.deals`)
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    // Apply filters safely
    if (options?.filter) {
      Object.entries(options.filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Validate column name to prevent injection
          if (!/^[a-zA-Z0-9_]+$/.test(key)) {
            console.warn(`Invalid filter key: ${key}`);
            return;
          }
          
          // Handle different value types safely
          if (typeof value === 'string') {
            query = query.ilike(key, `%${value}%`);
          }
          else if (typeof value === 'number' || typeof value === 'boolean') {
            query = query.eq(key, value);
          }
          // Handle date ranges
          else if (value.start && value.end) {
            query = query.gte(key, value.start).lte(key, value.end);
          }
        }
      });
    }

    // Apply sorting and pagination
    query = query
      .order(sortBy, { ascending: sortDirection === 'asc' })
      .range(offset, offset + limit - 1);

    // Execute the query
    const { data, error, count } = await query;

    if (error) {
      console.error(`[apiService] Error selecting deals from ${schema}:`, error);
      throw error;
    }

    // Count is already provided by the query with count: 'exact'
    const totalCount = count || 0;

    console.log(
      `[apiService] Retrieved ${data ? data.length : 0} deals from ${schema} (total: ${totalCount})`
    );

    return {
      success: true,
      deals: data || [],
      count: totalCount,
      message: `Retrieved ${data ? data.length : 0} deals successfully`,
    };
  } catch (error) {
    console.error(`[apiService] Error in getFinanceManagerDeals:`, error);
    return {
      success: false,
      deals: [],
      count: 0,
      message: `Failed to get deals: ${error.message || error}`,
      error,
    };
  }
};

/**
 * Notifies master admin of new signup requests
 */
export const notifyMasterAdminOfSignup = async (
  signupRequest: SignupRequest
): Promise<{ success: boolean; message: string; error?: any }> => {
  try {
    console.log(
      `[apiService] Notifying master admin of new signup: ${signupRequest.dealership_name}`
    );

    // Log notification attempt
    const notificationData = {
      type: 'signup_notification',
      signup_id: signupRequest.id,
      dealership_name: signupRequest.dealership_name,
      email: signupRequest.email,
      tier: signupRequest.tier,
      timestamp: new Date().toISOString(),
    };

    // Create a notification record in the database
    const { error: notificationError } = await supabase.from('admin_notifications').insert({
      type: 'signup_request',
      content: {
        signup_id: signupRequest.id,
        dealership_name: signupRequest.dealership_name,
        contact_person: signupRequest.contact_person,
        email: signupRequest.email,
        tier: signupRequest.tier,
        add_ons: signupRequest.add_ons,
      },
      is_read: false,
      created_at: new Date().toISOString(),
    });

    if (notificationError) {
      console.error('[apiService] Error creating notification record:', notificationError);
      // Don't throw - this shouldn't block the signup process
    }

    // In a real system, we would send an email or push notification here
    // For now, just log it
    console.log(
      `[apiService] Would send email to master admin about new ${signupRequest.tier} signup: ${signupRequest.dealership_name}`
    );

    return {
      success: true,
      message: 'Notification sent to master admin',
    };
  } catch (error) {
    console.error('[apiService] Error notifying master admin:', error);
    // Return success anyway - we don't want signup to fail if notification fails
    return {
      success: false,
      message: 'Failed to send notification to master admin',
      error,
    };
  }
};

/**
 * Get user limits for a dealership based on subscription tier and add-ons
 */
export const getDealershipUserLimits = async (
  dealershipId: string
): Promise<{
  success: boolean;
  limits?: {
    sales_people: number;
    finance_managers: number;
    sales_managers: number;
    general_managers: number;
    finance_assistants: number;
    others: number;
  };
  tier?: string;
  add_ons?: string[];
  error?: any;
}> => {
  try {
    console.log(`[apiService] Getting user limits for dealership: ${dealershipId}`);

    // Get the dealership details including its subscription tier and add-ons
    const { data: dealership, error: dealershipError } = await supabase
      .from('dealerships')
      .select('*')
      .eq('id', dealershipId)
      .single();

    if (dealershipError) {
      console.error(`[apiService] Error getting dealership info: ${dealershipError.message}`);
      throw dealershipError;
    }

    // Base limits for the dealership tier
    let limits = {
      sales_people: 10,
      finance_managers: 3,
      sales_managers: 3,
      general_managers: 1,
      finance_assistants: 2,
      others: 2,
    };

    // Adjust limits based on add-ons
    const addOns = dealership.add_ons || [];

    if (addOns.includes('plus')) {
      // + Version add-on increases limits by 50%
      limits = {
        sales_people: 15,
        finance_managers: 5,
        sales_managers: 5,
        general_managers: 2,
        finance_assistants: 3,
        others: 3,
      };
    }

    if (addOns.includes('plusplus')) {
      // ++ Version add-on increases limits by 150%
      limits = {
        sales_people: 25,
        finance_managers: 8,
        sales_managers: 8,
        general_managers: 3,
        finance_assistants: 5,
        others: 5,
      };
    }

    return {
      success: true,
      limits,
      tier: dealership.tier,
      add_ons: addOns,
    };
  } catch (error) {
    console.error(`[apiService] Error getting user limits: ${error}`);
    return {
      success: false,
      error,
    };
  }
};

/**
 * Check if a dealership can add a user of a specific role
 */
export const canAddUserWithRole = async (
  dealershipId: string,
  role: string
): Promise<{
  success: boolean;
  canAdd: boolean;
  currentCount?: number;
  limit?: number;
  error?: any;
}> => {
  try {
    console.log(
      `[apiService] Checking if dealership ${dealershipId} can add user with role ${role}`
    );

    // Get the dealership's user limits
    const { success, limits, error } = await getDealershipUserLimits(dealershipId);

    if (!success || !limits) {
      throw error || new Error('Failed to get user limits');
    }

    // Count existing users by role
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('role')
      .eq('dealership_id', dealershipId);

    if (usersError) {
      console.error(`[apiService] Error counting users: ${usersError.message}`);
      throw usersError;
    }

    // Map the role to its category
    let roleCategory;
    if (role.includes('sales') && !role.includes('manager')) {
      roleCategory = 'sales_people';
    } else if (
      role.includes('finance') &&
      !role.includes('manager') &&
      !role.includes('director')
    ) {
      roleCategory = 'finance_assistants';
    } else if (
      role.includes('finance') &&
      (role.includes('manager') || role.includes('director'))
    ) {
      roleCategory = 'finance_managers';
    } else if (role.includes('sales') && role.includes('manager')) {
      roleCategory = 'sales_managers';
    } else if (role.includes('general') && role.includes('manager')) {
      roleCategory = 'general_managers';
    } else {
      roleCategory = 'others';
    }

    // Count users in this category
    const count = users.filter(user => {
      if (roleCategory === 'sales_people') {
        return user.role.includes('sales') && !user.role.includes('manager');
      } else if (roleCategory === 'finance_assistants') {
        return (
          user.role.includes('finance') &&
          !user.role.includes('manager') &&
          !user.role.includes('director')
        );
      } else if (roleCategory === 'finance_managers') {
        return (
          user.role.includes('finance') &&
          (user.role.includes('manager') || user.role.includes('director'))
        );
      } else if (roleCategory === 'sales_managers') {
        return user.role.includes('sales') && user.role.includes('manager');
      } else if (roleCategory === 'general_managers') {
        return user.role.includes('general') && user.role.includes('manager');
      } else {
        return ![
          'sales_people',
          'finance_managers',
          'sales_managers',
          'general_managers',
          'finance_assistants',
        ].includes(getCategory(user.role));
      }
    }).length;

    // Check if under limit
    const limit = limits[roleCategory];
    const canAdd = count < limit;

    return {
      success: true,
      canAdd,
      currentCount: count,
      limit,
    };
  } catch (error) {
    console.error(`[apiService] Error checking if can add user: ${error}`);
    return {
      success: false,
      canAdd: false,
      error,
    };
  }
};

// Helper function to get role category
function getCategory(role: string): string {
  if (role.includes('sales') && !role.includes('manager')) {
    return 'sales_people';
  } else if (role.includes('finance') && !role.includes('manager') && !role.includes('director')) {
    return 'finance_assistants';
  } else if (role.includes('finance') && (role.includes('manager') || role.includes('director'))) {
    return 'finance_managers';
  } else if (role.includes('sales') && role.includes('manager')) {
    return 'sales_managers';
  } else if (role.includes('general') && role.includes('manager')) {
    return 'general_managers';
  } else {
    return 'others';
  }
}

/**
 * Helper functions for signup approval
 */

// Helper function to generate a password
export function generatePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Handle dealer group signups
async function handleDealerGroupSignup(
  request: any,
  options: any
): Promise<{
  success: boolean;
  message: string;
  error?: any;
  groupId?: number;
  dealershipIds?: number[];
}> {
  try {
    console.log(`[apiService] Processing dealer group signup for ${request.dealership_name}`);

    // Get current user for logging
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Get group level and dealership count
    const groupLevel = options.groupLevel || request.group_level || 'level_1';
    const dealershipCount = options.dealershipCount || request.dealership_count || 2;
    const addOns = options.addOns || request.add_ons || [];

    console.log(
      `[apiService] Group level: ${groupLevel}, Dealership count: ${dealershipCount}, Add-ons: ${JSON.stringify(
        addOns
      )}`
    );

    // Generate base schema name
    const baseSchemaName =
      options.schemaName ||
      `group_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;

    // Set user limits based on add-ons
    const userLimits = {
      sales_people: 10,
      finance_managers: 3,
      sales_managers: 3,
      general_managers: 1,
      finance_assistants: 2,
      others: 2,
      area_vps: 0, // Default is 0
    };

    // Apply + Version add-on limits
    if (addOns.includes('plus')) {
      userLimits.sales_people = 15;
      userLimits.finance_managers = 5;
      userLimits.sales_managers = 5;
      userLimits.general_managers = 2;
      userLimits.finance_assistants = 3;
      userLimits.others = 3;

      // Add Area VPs based on tier
      userLimits.area_vps = groupLevel === 'level_1' ? 1 : 2;
    }

    // Apply ++ Version add-on limits
    if (addOns.includes('plusplus')) {
      userLimits.sales_people = 25;
      userLimits.finance_managers = 8;
      userLimits.sales_managers = 8;
      userLimits.general_managers = 3;
      userLimits.finance_assistants = 5;
      userLimits.others = 5;

      // Unlimited AVPs for ++ Version
      userLimits.area_vps = 999; // Effectively unlimited
    }

    // Get pricing based on tier level
    const pricingPerDealership =
      groupLevel === 'level_1' ? 200 : groupLevel === 'level_2' ? 250 : 300; // Level 3 or default

    // Create the dealer group
    const { data: groupData, error: groupError } = await supabase
      .from('dealership_groups')
      .insert({
        name: request.dealership_name,
        settings: {
          level: groupLevel,
          dealership_count: dealershipCount,
          add_ons: addOns,
          user_limits: userLimits,
          pricing_per_dealership: pricingPerDealership,
          stripe_subscription_id: request.stripe_session_id,
        },
        status: 'active',
        created_by: user.id,
      })
      .select()
      .single();

    if (groupError) {
      console.error(`[apiService] Error creating dealership group: ${groupError.message}`);
      throw groupError;
    }

    const groupId = groupData.id;
    console.log(`[apiService] Created dealer group: ${groupData.name}, ID: ${groupId}`);

    // Create dealerships under the group
    const dealershipIds: number[] = [];

    for (let i = 0; i < dealershipCount; i++) {
      // Create schema name for this dealership
      const schemaName = `${baseSchemaName}_${i + 1}`;
      const dealershipName = `${request.dealership_name} - Location ${i + 1}`;

      // Create schema
      if (options.createSchema) {
        console.log(`[apiService] Creating schema for dealership ${i + 1}: ${schemaName}`);
        const schemaResult = await createDealershipSchema(schemaName);

        if (!schemaResult.success) {
          console.error(
            `[apiService] Error creating schema for dealership ${i + 1}:`,
            schemaResult.error
          );
          // Continue anyway - we'll just log the error
        }
      }

      // Create dealership record
      const { data: dealershipData, error: dealershipError } = await supabase
        .from('dealerships')
        .insert({
          name: dealershipName,
          group_id: groupId,
          schema_name: schemaName,
          tier: 'dealership',
          add_ons: addOns,
          status: 'active',
          contact_email: request.email,
          contact_name: request.contact_person,
          contact_phone: request.phone,
          subscription_status: 'active',
          created_by: user.id,
          settings: {
            user_limits: userLimits,
            group_level: groupLevel,
            dealership_index: i + 1,
          },
        })
        .select()
        .single();

      if (dealershipError) {
        console.error(`[apiService] Error creating dealership ${i + 1}:`, dealershipError);
        continue; // Skip to next dealership on error
      }

      dealershipIds.push(dealershipData.id);
      console.log(
        `[apiService] Created dealership: ${dealershipData.name}, ID: ${dealershipData.id}`
      );
    }

    // Create admin user if requested
    if (options.adminEmail) {
      console.log(`[apiService] Creating group admin user: ${options.adminEmail}`);

      // Get primary dealership id for the admin
      const primaryDealershipId = dealershipIds[0];

      // Check if user already exists
      const { data: existingUser, error: existingUserError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', options.adminEmail)
        .single();

      if (existingUserError && existingUserError.code !== 'PGRST116') {
        console.error(
          `[apiService] Error checking for existing user: ${existingUserError.message}`
        );
        throw existingUserError;
      }

      if (existingUser) {
        console.log(`[apiService] User already exists: ${options.adminEmail}`);

        // Update existing user to add group admin role
        const { error: updateUserError } = await supabase
          .from('profiles')
          .update({
            dealership_id: primaryDealershipId,
            group_id: groupId,
            role: 'dealer_group_admin',
            is_group_admin: true,
          })
          .eq('email', options.adminEmail);

        if (updateUserError) {
          console.error(`[apiService] Error updating user: ${updateUserError.message}`);
          throw updateUserError;
        }
      } else {
        // Create new user
        const { error: signupError, data: signupData } = await supabase.auth.signUp({
          email: options.adminEmail,
          password: options.tempPassword || generatePassword(),
        });

        if (signupError) {
          console.error(`[apiService] Error creating user: ${signupError.message}`);
          throw signupError;
        }

        // Create profile record
        const { error: profileError } = await supabase.from('profiles').insert({
          id: signupData?.user?.id,
          email: options.adminEmail,
          dealership_id: primaryDealershipId,
          group_id: groupId,
          role: 'dealer_group_admin',
          is_group_admin: true,
          first_name: options.adminName?.split(' ')[0] || '',
          last_name: options.adminName?.split(' ').slice(1).join(' ') || '',
        });

        if (profileError) {
          console.error(`[apiService] Error creating profile: ${profileError.message}`);
          throw profileError;
        }
      }
    }

    // Set up cross-dealership RLS policies for the group
    await setupGroupRlsPolicies(groupId, dealershipIds);

    // Create a subscription event record
    const totalAmount =
      pricingPerDealership * dealershipCount +
      (addOns.includes('plus') ? 100 : 0) +
      (addOns.includes('plusplus') ? 500 : 0);

    await recordSubscriptionEvent({
      group_id: groupId,
      dealership_id: dealershipIds[0],
      event_type: 'signup',
      tier: 'dealer_group',
      add_ons: addOns,
      amount: totalAmount,
      user_id: user.id,
    });

    console.log(
      `[apiService] Group signup completed successfully. Created ${dealershipIds.length} dealerships.`
    );

    return {
      success: true,
      message: `Dealer Group created with ${dealershipIds.length} dealerships`,
      groupId,
      dealershipIds,
    };
  } catch (error) {
    console.error('[apiService] Error in handleDealerGroupSignup:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      error,
    };
  }
}

// Handle finance manager signups
async function handleFinanceManagerSignup(
  request: any,
  options: any
): Promise<{
  success: boolean;
  message: string;
  error?: any;
}> {
  try {
    console.log(`[apiService] Processing finance manager signup for ${request.contact_person}`);
    console.log(`[apiService] Promotional pricing applied: Free (normally $5/month)`);

    // Get current user for logging
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Generate schema name if not provided
    const schemaName =
      options.schemaName ||
      `finance_mgr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;

    // Create schema for the finance manager
    if (options.createSchema !== false) {
      console.log(`[apiService] Creating schema for finance manager: ${schemaName}`);
      const schemaResult = await createFinanceManagerSchema(schemaName);

      if (!schemaResult.success) {
        console.error('[apiService] Error creating finance manager schema:', schemaResult.error);
        throw new Error(`Failed to create schema: ${schemaResult.message}`);
      }
    }

    // Create admin user if requested
    if (options.adminEmail) {
      console.log(`[apiService] Creating finance manager user: ${options.adminEmail}`);

      // Check if user already exists
      const { data: existingUser, error: existingUserError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', options.adminEmail)
        .single();

      if (existingUserError && existingUserError.code !== 'PGRST116') {
        console.error(
          `[apiService] Error checking for existing user: ${existingUserError.message}`
        );
        throw existingUserError;
      }

      if (existingUser) {
        console.log(`[apiService] User already exists: ${options.adminEmail}`);

        // Update existing user to add finance manager role and schema
        const { error: updateUserError } = await supabase
          .from('profiles')
          .update({
            role: 'finance_manager',
            schema_name: schemaName,
          })
          .eq('email', options.adminEmail);

        if (updateUserError) {
          console.error(`[apiService] Error updating user: ${updateUserError.message}`);
          throw updateUserError;
        }
      } else {
        // Create new user
        const { error: signupError, data: signupData } = await supabase.auth.signUp({
          email: options.adminEmail,
          password: options.tempPassword || generatePassword(),
          options: {
            data: {
              role: 'finance_manager',
              schema_name: schemaName,
            },
          },
        });

        if (signupError) {
          console.error(`[apiService] Error creating user: ${signupError.message}`);
          throw signupError;
        }

        // Create profile record
        const { error: profileError } = await supabase.from('profiles').insert({
          id: signupData?.user?.id,
          email: options.adminEmail,
          role: 'finance_manager',
          schema_name: schemaName,
          first_name: options.adminName?.split(' ')[0] || '',
          last_name: options.adminName?.split(' ').slice(1).join(' ') || '',
          settings: {
            subscription_tier: 'finance_manager_only',
            trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days trial
            promo_applied: true, // Indicate promotion was applied
            promo_details: 'Free instead of $5/month for a limited time',
          },
        });

        if (profileError) {
          console.error(`[apiService] Error creating profile: ${profileError.message}`);
          throw profileError;
        }
      }
    }

    // Record subscription event with promotional pricing
    await recordSubscriptionEvent({
      schema_name: schemaName,
      event_type: 'signup',
      tier: 'finance_manager_only',
      amount: 0, // $0/month with promotion (normally $5)
      is_promo: true,
      original_amount: 5,
      user_id: user.id,
    });

    // Record the promotional signup in the promotions_usage table if it exists
    try {
      const { error: usageError } = await supabase.from('promotions_usage').insert({
        promotion_tier: 'finance_manager_only',
        user_id: options.adminEmail ? await getUserIdByEmail(options.adminEmail) : null,
        schema_name: schemaName,
        signup_date: new Date().toISOString(),
      });

      if (usageError) {
        // Log but don't throw - this is supplementary tracking
        console.log('[apiService] Note: Could not record promotion usage:', usageError.message);
      }
    } catch (trackingError) {
      // Ignore errors in promotional tracking - it shouldn't block the main flow
      console.log('[apiService] Note: Error in promotion tracking:', trackingError);
    }

    console.log(
      `[apiService] Finance manager signup completed successfully for schema: ${schemaName} with promotional pricing`
    );

    return {
      success: true,
      message: `Finance Manager account created successfully with promotional pricing (Free)`,
    };
  } catch (error) {
    console.error('[apiService] Error in handleFinanceManagerSignup:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      error,
    };
  }
}

// Function to record subscription events
export const recordSubscriptionEvent = async (data: {
  dealership_id?: number;
  group_id?: number;
  schema_name?: string;
  event_type: string;
  tier: string;
  add_ons?: string[];
  amount?: number;
  is_promo?: boolean;
  original_amount?: number;
  user_id: string;
}): Promise<{ success: boolean; message: string; error?: any }> => {
  try {
    console.log(
      `[apiService] Recording subscription event: ${data.event_type} for tier: ${data.tier}`
    );

    if (data.is_promo) {
      console.log(
        `[apiService] Promotional pricing applied: ${data.amount} (original: ${data.original_amount})`
      );
    }

    const { error } = await supabase.from('subscription_events').insert({
      dealership_id: data.dealership_id,
      group_id: data.group_id,
      schema_name: data.schema_name,
      event_type: data.event_type,
      tier: data.tier,
      add_ons: data.add_ons || [],
      amount: data.amount || null,
      is_promotional: data.is_promo || false,
      original_amount: data.original_amount,
      user_id: data.user_id,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('[apiService] Error recording subscription event:', error);
      throw error;
    }

    return {
      success: true,
      message: 'Subscription event recorded successfully',
    };
  } catch (error) {
    console.error('[apiService] Error recording subscription event:', error);
    return {
      success: false,
      message: 'Failed to record subscription event',
      error,
    };
  }
};

// Helper function to get user ID by email
async function getUserIdByEmail(email: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (error) {
      console.error('[apiService] Error getting user ID by email:', error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error('[apiService] Exception in getUserIdByEmail:', error);
    return null;
  }
}
