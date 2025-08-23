/**
 * TypeScript Query Patches for Profiles Table 500 Error Prevention
 * 
 * These patches handle the differences between production and local environments
 * and provide safer query patterns to prevent 500 errors on profiles table
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from './src/lib/database.types';

// =================== SAFE PROFILE QUERY UTILITIES ===================

/**
 * Safe role values that match the updated database constraint
 * IMPORTANT: Keep this in sync with the SQL constraint in fix_profiles_rls_500_errors.sql
 */
export type SafeProfileRole = 
  | 'viewer'
  | 'salesperson' 
  | 'finance_manager'
  | 'single_finance_manager'
  | 'sales_manager'
  | 'general_manager' 
  | 'admin'
  | 'master_admin'
  | 'dealership_admin'
  | 'dealer_group_admin'
  | 'single_dealer_admin';

/**
 * Profile type that matches the fixed database structure
 */
export interface SafeProfile {
  id: string;
  email: string;
  name?: string;
  role: SafeProfileRole;
  dealership_id?: number;
  phone?: string;
  created_at?: string;
  is_group_admin?: boolean;
}

/**
 * Safe profile query result with error handling
 */
export interface SafeProfileResult {
  profile: SafeProfile | null;
  error: string | null;
  isFromCache?: boolean;
  prodLocalDiff?: string;
}

// =================== ENVIRONMENT DIFFERENCE DETECTION ===================

/**
 * Detect differences between production and local environments
 * This helps identify why queries work locally but fail in production
 */
export function detectProdLocalDiffs(): {
  environment: 'production' | 'development' | 'unknown';
  differences: string[];
  recommendations: string[];
} {
  const differences: string[] = [];
  const recommendations: string[] = [];
  
  // Check environment indicators
  const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV;
  const isProd = typeof import.meta !== 'undefined' && import.meta.env?.PROD;
  const nodeEnv = typeof process !== 'undefined' ? process.env.NODE_ENV : 'unknown';
  
  let environment: 'production' | 'development' | 'unknown' = 'unknown';
  
  if (isProd || nodeEnv === 'production') {
    environment = 'production';
    differences.push('Production environment detected');
    
    // Production-specific checks
    if (typeof window !== 'undefined' && window.location.protocol !== 'https:') {
      differences.push('Production should use HTTPS, but HTTP detected');
      recommendations.push('Ensure production deployment uses HTTPS');
    }
    
    // Check for development URLs in production
    const supabaseUrl = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_URL : '';
    if (supabaseUrl && (supabaseUrl.includes('localhost') || supabaseUrl.includes('127.0.0.1'))) {
      differences.push('Development Supabase URL found in production');
      recommendations.push('Update VITE_SUPABASE_URL to production Supabase project URL');
    }
    
  } else if (isDev || nodeEnv === 'development') {
    environment = 'development';
    differences.push('Development environment detected');
    
    // Development-specific checks
    if (!supabaseUrl || !supabaseUrl.includes('.supabase.co')) {
      differences.push('Development may be using local/mock Supabase');
      recommendations.push('Ensure development uses actual Supabase project for testing');
    }
  }
  
  return { environment, differences, recommendations };
}

// =================== SAFE PROFILE QUERY FUNCTIONS ===================

/**
 * Safe version of getCurrentUser profile fetch with 500 error prevention
 * 
 * PROD-LOCAL DIFFS:
 * - Production: RLS policies are stricter, may cause circular dependency issues
 * - Local: More permissive, RLS might be disabled for development
 * - This function handles both scenarios safely
 */
export async function safeGetCurrentUserProfile(
  client: SupabaseClient<Database>
): Promise<SafeProfileResult> {
  const startTime = Date.now();
  
  try {
    console.log('[SafeProfile] Fetching current user profile...');
    
    // First, ensure we have a valid auth session
    const { data: { user }, error: authError } = await client.auth.getUser();
    
    if (authError || !user) {
      return {
        profile: null,
        error: 'No authenticated user',
        prodLocalDiff: 'Auth check failed - may indicate session issues in production'
      };
    }
    
    // Use safe query pattern with explicit error handling
    const { data: profile, error: profileError } = await client
      .from('profiles')
      .select('id, email, name, role, dealership_id, phone, created_at, is_group_admin')
      .eq('id', user.id)
      .maybeSingle(); // Use maybeSingle to handle missing profiles gracefully
    
    const queryDuration = Date.now() - startTime;
    
    if (profileError) {
      console.error('[SafeProfile] Profile query error:', profileError);
      
      // Analyze error for prod-local differences
      let prodLocalDiff = '';
      if (profileError.code === '42501') {
        prodLocalDiff = 'RLS policy violation - production policies may be stricter than local';
      } else if (profileError.code === '23505') {
        prodLocalDiff = 'Constraint violation - database constraints may differ between environments';
      } else if (profileError.message?.includes('circular')) {
        prodLocalDiff = 'Circular dependency in RLS policies - common in production with complex policies';
      } else if (queryDuration > 10000) {
        prodLocalDiff = 'Query timeout - production database may have performance issues';
      }
      
      return {
        profile: null,
        error: profileError.message,
        prodLocalDiff
      };
    }
    
    if (!profile) {
      // Profile doesn't exist - create one safely
      console.warn('[SafeProfile] No profile found for user, attempting to create...');
      
      const createResult = await safeCreateUserProfile(client, user.id, user.email || '');
      if (createResult.error) {
        return {
          profile: null,
          error: createResult.error,
          prodLocalDiff: 'Profile creation failed - may indicate RLS or trigger issues in production'
        };
      }
      
      return {
        profile: createResult.profile,
        error: null,
        prodLocalDiff: 'Profile was missing and created - indicates auth trigger differences between environments'
      };
    }
    
    // Validate role is safe
    const safeProfile: SafeProfile = {
      ...profile,
      role: validateProfileRole(profile.role)
    };
    
    console.log(`[SafeProfile] Successfully fetched profile in ${queryDuration}ms`);
    
    return {
      profile: safeProfile,
      error: null,
      prodLocalDiff: queryDuration > 5000 ? 'Slow query performance - may indicate production database issues' : undefined
    };
    
  } catch (error: any) {
    const queryDuration = Date.now() - startTime;
    console.error('[SafeProfile] Unexpected error:', error);
    
    let prodLocalDiff = 'Unexpected error - may indicate environment configuration differences';
    if (error.message?.includes('network') || error.message?.includes('connection')) {
      prodLocalDiff = 'Network error - production database connectivity may differ from local';
    } else if (error.message?.includes('timeout')) {
      prodLocalDiff = 'Connection timeout - production database may be under load';
    }
    
    return {
      profile: null,
      error: error.message,
      prodLocalDiff
    };
  }
}

/**
 * Safe profile creation with proper error handling
 * 
 * PROD-LOCAL DIFFS:
 * - Production: Stricter constraints and RLS policies
 * - Local: May allow invalid data that production rejects
 */
export async function safeCreateUserProfile(
  client: SupabaseClient<Database>,
  userId: string,
  email: string,
  name?: string,
  role: SafeProfileRole = 'viewer'
): Promise<SafeProfileResult> {
  
  try {
    console.log(`[SafeProfile] Creating profile for user ${userId}...`);
    
    // Validate inputs to prevent constraint violations
    if (!userId || !email) {
      return {
        profile: null,
        error: 'Invalid user ID or email',
        prodLocalDiff: 'Input validation failed - production may be stricter about required fields'
      };
    }
    
    // Use the safe creation function from SQL
    const { data, error } = await client.rpc('safe_create_profile', {
      p_user_id: userId,
      p_email: email,
      p_name: name || email.split('@')[0],
      p_role: role,
      p_phone: '555-0000'
    });
    
    if (error) {
      console.error('[SafeProfile] Profile creation error:', error);
      return {
        profile: null,
        error: error.message,
        prodLocalDiff: 'Profile creation failed - RLS or constraint differences between environments'
      };
    }
    
    // Fetch the created profile
    const result = await safeGetCurrentUserProfile(client);
    return {
      ...result,
      prodLocalDiff: 'Profile created successfully - auth trigger may be missing in production'
    };
    
  } catch (error: any) {
    console.error('[SafeProfile] Unexpected profile creation error:', error);
    return {
      profile: null,
      error: error.message,
      prodLocalDiff: 'Unexpected creation error - may indicate database function or permission differences'
    };
  }
}

/**
 * Safe role validation with fallback to prevent constraint violations
 */
export function validateProfileRole(role: any): SafeProfileRole {
  const validRoles: SafeProfileRole[] = [
    'viewer', 'salesperson', 'finance_manager', 'single_finance_manager',
    'sales_manager', 'general_manager', 'admin', 'master_admin',
    'dealership_admin', 'dealer_group_admin', 'single_dealer_admin'
  ];
  
  if (typeof role === 'string' && validRoles.includes(role as SafeProfileRole)) {
    return role as SafeProfileRole;
  }
  
  // Log invalid roles for debugging prod-local differences
  if (role && role !== 'viewer') {
    console.warn(`[SafeProfile] Invalid role "${role}" detected, defaulting to viewer`);
    console.warn('[SafeProfile] This may indicate role constraint differences between environments');
  }
  
  return 'viewer'; // Safe default
}

/**
 * Safe role-based query with Finance Manager access
 * 
 * PROD-LOCAL DIFFS:
 * - Production: Complex RLS policies may cause 500 errors
 * - Local: Simplified or disabled RLS may allow broader access
 */
export async function safeGetProfilesByRole(
  client: SupabaseClient<Database>,
  allowedRoles: SafeProfileRole[]
): Promise<{
  profiles: SafeProfile[];
  error: string | null;
  prodLocalDiff?: string;
}> {
  
  try {
    console.log(`[SafeProfile] Fetching profiles for roles: ${allowedRoles.join(', ')}`);
    
    // First check current user's permissions
    const currentUserResult = await safeGetCurrentUserProfile(client);
    if (currentUserResult.error || !currentUserResult.profile) {
      return {
        profiles: [],
        error: 'Cannot verify user permissions',
        prodLocalDiff: 'Permission check failed - RLS policies may differ between environments'
      };
    }
    
    const currentRole = currentUserResult.profile.role;
    
    // Check if user has permission to query other profiles
    const canQueryProfiles = [
      'finance_manager', 'single_finance_manager', 'sales_manager', 
      'general_manager', 'admin', 'master_admin', 'dealership_admin', 
      'dealer_group_admin'
    ].includes(currentRole);
    
    if (!canQueryProfiles) {
      return {
        profiles: [currentUserResult.profile], // Can only see own profile
        error: null,
        prodLocalDiff: 'Limited access due to role - production RLS may be more restrictive'
      };
    }
    
    // Safe query with proper error handling
    const { data: profiles, error } = await client
      .from('profiles')
      .select('id, email, name, role, dealership_id, phone, created_at, is_group_admin')
      .in('role', allowedRoles)
      .order('created_at', { ascending: false })
      .limit(100); // Prevent large queries that might timeout
    
    if (error) {
      console.error('[SafeProfile] Profiles query error:', error);
      
      let prodLocalDiff = '';
      if (error.code === '42501') {
        prodLocalDiff = 'RLS policy violation - production may have stricter role-based access';
      } else if (error.message?.includes('timeout')) {
        prodLocalDiff = 'Query timeout - production database may need performance optimization';
      }
      
      return {
        profiles: [],
        error: error.message,
        prodLocalDiff
      };
    }
    
    const safeProfiles: SafeProfile[] = (profiles || []).map(profile => ({
      ...profile,
      role: validateProfileRole(profile.role)
    }));
    
    console.log(`[SafeProfile] Successfully fetched ${safeProfiles.length} profiles`);
    
    return {
      profiles: safeProfiles,
      error: null,
      prodLocalDiff: safeProfiles.length === 0 ? 'No profiles found - may indicate RLS filtering differences' : undefined
    };
    
  } catch (error: any) {
    console.error('[SafeProfile] Unexpected profiles query error:', error);
    
    return {
      profiles: [],
      error: error.message,
      prodLocalDiff: 'Unexpected query error - may indicate database configuration differences between environments'
    };
  }
}

// =================== PATCH FUNCTIONS FOR EXISTING CODE ===================

/**
 * Patch for AuthContext.tsx fetchUserData function
 * Replace the existing profiles query with this safe version
 */
export async function patchedFetchUserData(
  client: SupabaseClient<Database>,
  userId: string
): Promise<{
  role: SafeProfileRole;
  dealership_id?: number;
  is_group_admin?: boolean;
  error?: string;
  prodLocalDiff?: string;
}> {
  
  const result = await safeGetCurrentUserProfile(client);
  
  if (result.error || !result.profile) {
    // Return safe defaults instead of throwing errors
    return {
      role: 'viewer',
      error: result.error || 'Profile not found',
      prodLocalDiff: result.prodLocalDiff
    };
  }
  
  return {
    role: result.profile.role,
    dealership_id: result.profile.dealership_id,
    is_group_admin: result.profile.is_group_admin || false,
    prodLocalDiff: result.prodLocalDiff
  };
}

/**
 * Patch for App.tsx role checking
 * Replace the existing query with this safe version
 */
export async function patchedAppRoleCheck(
  client: SupabaseClient<Database>,
  userId: string
): Promise<{
  is_group_admin: boolean;
  role: SafeProfileRole;
  error?: string;
  prodLocalDiff?: string;
}> {
  
  const result = await safeGetCurrentUserProfile(client);
  
  return {
    is_group_admin: result.profile?.is_group_admin || false,
    role: result.profile?.role || 'viewer',
    error: result.error || undefined,
    prodLocalDiff: result.prodLocalDiff
  };
}

// =================== MIGRATION HELPER FUNCTIONS ===================

/**
 * Helper to gradually migrate existing queries to safe versions
 */
export function wrapProfileQuery<T>(
  queryFn: () => Promise<T>,
  fallbackValue: T,
  operationName: string
): Promise<T> {
  
  return new Promise(async (resolve) => {
    const startTime = Date.now();
    
    try {
      const result = await queryFn();
      const duration = Date.now() - startTime;
      
      if (duration > 5000) {
        console.warn(`[ProfileQueryWrapper] Slow query ${operationName}: ${duration}ms`);
        console.warn('[ProfileQueryWrapper] Consider optimizing query or checking production database performance');
      }
      
      resolve(result);
      
    } catch (error: any) {
      console.error(`[ProfileQueryWrapper] ${operationName} failed:`, error);
      
      // Log prod-local difference insights
      if (error.code === '42501') {
        console.error('[ProfileQueryWrapper] RLS policy violation - production policies may be stricter');
      } else if (error.message?.includes('500')) {
        console.error('[ProfileQueryWrapper] 500 error - likely RLS or trigger issue in production');
      } else if (error.message?.includes('timeout')) {
        console.error('[ProfileQueryWrapper] Query timeout - production database performance issue');
      }
      
      console.log(`[ProfileQueryWrapper] Using fallback value for ${operationName}`);
      resolve(fallbackValue);
    }
  });
}

// =================== USAGE EXAMPLES ===================

/**
 * Example: How to use in AuthContext.tsx
 * 
 * // OLD (causes 500 errors):
 * const { data: profile, error } = await client
 *   .from('profiles')
 *   .select('role, dealership_id, is_group_admin')
 *   .eq('id', userId)
 *   .maybeSingle();
 * 
 * // NEW (safe):
 * const result = await patchedFetchUserData(client, userId);
 * if (result.error) {
 *   console.error('Profile fetch failed:', result.error);
 *   if (result.prodLocalDiff) {
 *     console.error('Prod-Local Diff:', result.prodLocalDiff);
 *   }
 * }
 */

/**
 * Example: How to use for Finance Manager queries
 * 
 * // OLD (may cause RLS violations):
 * const { data: profiles } = await client
 *   .from('profiles')
 *   .select('*')
 *   .in('role', ['finance_manager', 'admin']);
 * 
 * // NEW (safe with proper error handling):
 * const result = await safeGetProfilesByRole(client, ['finance_manager', 'admin']);
 * if (result.error) {
 *   console.error('Profiles query failed:', result.error);
 *   if (result.prodLocalDiff) {
 *     console.error('Prod-Local Diff:', result.prodLocalDiff);
 *   }
 * }
 * const profiles = result.profiles;
 */

export default {
  safeGetCurrentUserProfile,
  safeCreateUserProfile,
  safeGetProfilesByRole,
  patchedFetchUserData,
  patchedAppRoleCheck,
  wrapProfileQuery,
  validateProfileRole,
  detectProdLocalDiffs
};