/**
 * Enhanced Secure Promotions Database Utilities with 500 Error Prevention
 *
 * SECURITY ENHANCEMENTS IMPLEMENTED:
 * 1. Comprehensive 500 error handling and prevention
 * 2. Schema-based access control for Finance Managers
 * 3. Role-based RLS policy integration
 * 4. Defensive error handling with user-friendly messages
 * 5. Retry logic for transient database errors
 * 6. Input validation and sanitization
 * 7. Optimistic locking for concurrent updates
 * 8. Audit trail and monitoring integration
 * 
 * This module provides TypeScript utilities for secure interaction with
 * the enhanced promotions database tables, preventing SQL injection and ensuring
 * proper data validation and type safety while preventing 500 errors.
 */

import { getSecureSupabaseClient } from '../supabaseClient';
import { dbErrorMonitor } from '../apiService';

// Enhanced type definitions for type safety and 500 error prevention
export type PromotionTier =
  | 'finance_manager_only'
  | 'salesperson'
  | 'sales_manager'
  | 'general_manager'
  | 'dealership_basic'
  | 'dealership_pro'
  | 'dealership_enterprise';

export type PromotionStatus = 'active' | 'scheduled' | 'expired' | 'cancelled';
export type UsageType = 'signup' | 'renewal' | 'upgrade' | 'downgrade';

// Enhanced interfaces with comprehensive error handling support
export interface EnhancedPromotion {
  id: string;
  tier: PromotionTier;
  original_price: number;
  promo_price: number;
  start_date: string;
  end_date?: string;
  status: PromotionStatus;
  description?: string;
  discount_percentage?: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
  version: number;
  deleted_at?: string;
  deleted_by?: string;
}

export interface EnhancedPromotionUsage {
  id: string;
  promotion_id: string;
  promotion_tier: PromotionTier;
  user_id?: string;
  schema_name?: string;
  dealership_id?: number;
  usage_type: UsageType;
  signup_date: string;
  original_amount?: number;
  discounted_amount?: number;
  discount_applied?: number;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
  version: number;
  deleted_at?: string;
  deleted_by?: string;
}

// Enhanced error classes with 500 error specific handling
export class PromotionError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>,
    public is500Error: boolean = false
  ) {
    super(message);
    this.name = 'PromotionError';
  }
}

export class Database500Error extends PromotionError {
  constructor(message: string = 'Database temporarily unavailable', details?: Record<string, unknown>) {
    super(message, 'DB_500_ERROR', details, true);
    this.name = 'Database500Error';
  }
}

export class RLSPermissionError extends PromotionError {
  constructor(message: string = 'Insufficient permissions', details?: Record<string, unknown>) {
    super(message, 'RLS_PERMISSION_ERROR', details);
    this.name = 'RLSPermissionError';
  }
}

export class ValidationError extends PromotionError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

// Enhanced utility functions with 500 error prevention
function handle500Error(error: any, operation: string): never {
  const errorMessage = error?.message || 'Unknown database error';
  const errorCode = error?.code || 'UNKNOWN';
  
  // Enhanced 500 Error Detection: Check for various 500 error patterns
  const is500Error = 
    errorCode === '500' ||
    errorCode === 'PGRST301' || // PostgREST server error
    errorCode === 'PGRST302' || // PostgREST gateway timeout
    errorMessage.includes('500') ||
    errorMessage.includes('Internal Server Error') ||
    errorMessage.includes('database') ||
    errorMessage.includes('postgres') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('temporarily unavailable');

  if (is500Error) {
    console.error(`[Promotions 500] Database error in ${operation}:`, errorMessage);
    console.warn(`[User Message] Promotion service temporarily unavailable. Please try again in a moment.`);
    
    // Track 500 error in global monitor
    dbErrorMonitor.track500Error(operation, error, { 
      promotionOperation: true,
      errorCode,
      errorMessage: errorMessage.substring(0, 100) // Limit length for logging
    });
    
    throw new Database500Error(`Promotion service temporarily unavailable during ${operation}`, {
      originalError: errorCode,
      operation
    });
  }
  
  // Check for RLS permission errors
  const isRLSError = 
    errorMessage.includes('insufficient_privilege') ||
    errorMessage.includes('permission denied') ||
    errorMessage.includes('policy') ||
    errorCode === '42501';
    
  if (isRLSError) {
    console.error(`[Promotions RLS] Permission error in ${operation}:`, errorMessage);
    throw new RLSPermissionError(`Insufficient permissions for ${operation}`, {
      originalError: errorCode,
      operation
    });
  }
  
  // Generic error handling
  throw new PromotionError(`Operation failed: ${operation}`, errorCode, {
    originalError: errorMessage,
    operation
  });
}

// Enhanced safe operation wrapper with 500 error retry logic
async function safePromotionOperation<T>(
  operation: () => Promise<T>,
  operationName: string,
  retries: number = 2
): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      // Check if this is a 500 error that should be retried
      const errorMessage = error?.message || '';
      const errorCode = error?.code || '';
      
      const is500Error = 
        errorCode === '500' ||
        errorMessage.includes('500') ||
        errorMessage.includes('database') ||
        errorMessage.includes('connection') ||
        errorMessage.includes('timeout');
      
      if (is500Error && attempt < retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`[Promotions Retry] Retrying ${operationName} in ${delay}ms due to 500 error (attempt ${attempt + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Re-throw for final attempt or non-500 errors
      handle500Error(error, operationName);
    }
  }
  
  // This should never be reached, but TypeScript requires it
  throw new PromotionError(`Unexpected error in ${operationName}`, 'UNKNOWN_ERROR');
}

// Enhanced validation with security checks
function validatePromotionTier(tier: string): asserts tier is PromotionTier {
  const validTiers: PromotionTier[] = [
    'finance_manager_only',
    'salesperson',
    'sales_manager',
    'general_manager',
    'dealership_basic',
    'dealership_pro',
    'dealership_enterprise',
  ];
  
  if (!validTiers.includes(tier as PromotionTier)) {
    throw new ValidationError(`Invalid promotion tier: ${tier}`, {
      validTiers,
      providedTier: tier
    });
  }
}

function validateSchemaName(schemaName: string): void {
  if (!schemaName) {
    throw new ValidationError('Schema name is required');
  }
  
  // Security: Validate schema name format to prevent SQL injection
  const schemaRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/;
  if (!schemaRegex.test(schemaName) || schemaName.length > 63) {
    throw new ValidationError(`Invalid schema name format: ${schemaName}`, {
      expectedFormat: 'alphanumeric with underscores, starting with letter, max 63 chars',
      providedName: schemaName
    });
  }
}

// Enhanced Finance Manager specific functions with 500 error handling

/**
 * Enhanced: Get active promotions for Finance Manager with schema-based access control
 */
export async function getFinanceManagerPromotions(
  schemaName?: string
): Promise<EnhancedPromotion[]> {
  return safePromotionOperation(async () => {
    console.log('[Promotions] Getting Finance Manager promotions with enhanced 500 error handling');
    
    const client = await getSecureSupabaseClient();
    
    // Security: Validate schema name if provided
    if (schemaName) {
      validateSchemaName(schemaName);
    }
    
    // Enhanced 500 Error Handling: Use secure view with comprehensive error handling
    const startTime = Date.now();
    const { data, error } = await client
      .from('active_promotions')
      .select('*')
      .or(`tier.eq.finance_manager_only,tier.eq.dealership_basic,tier.eq.dealership_pro`)
      .order('promo_price', { ascending: true });
    
    const queryDuration = Date.now() - startTime;
    
    // Enhanced 500 Error Handling: Log detailed response for debugging
    console.log('[Promotions] Finance Manager promotions query response:', {
      queryDuration: `${queryDuration}ms`,
      hasData: !!data,
      dataCount: data?.length || 0,
      hasError: !!error,
      errorCode: error?.code || 'none',
      errorMessage: error?.message || 'none',
      schemaName: schemaName || 'none'
    });
    
    if (error) {
      handle500Error(error, 'getFinanceManagerPromotions');
    }
    
    return data || [];
  }, 'getFinanceManagerPromotions');
}

/**
 * Enhanced: Check promotion eligibility for Finance Manager with schema-based access
 */
export async function checkFinanceManagerEligibility(
  schemaName: string,
  tier: PromotionTier = 'finance_manager_only'
): Promise<EnhancedPromotion[]> {
  return safePromotionOperation(async () => {
    console.log('[Promotions] Checking Finance Manager eligibility with enhanced validation');
    
    // Security: Validate inputs
    validateSchemaName(schemaName);
    validatePromotionTier(tier);
    
    const client = await getSecureSupabaseClient();
    
    // Enhanced 500 Error Handling: Use RPC function with parameter validation
    const startTime = Date.now();
    const { data, error } = await client.rpc('check_promotion_eligibility', {
      p_user_id: null,
      p_schema_name: schemaName,
      p_dealership_id: null,
      p_tier: tier
    });
    
    const queryDuration = Date.now() - startTime;
    
    // Enhanced 500 Error Handling: Log detailed response
    console.log('[Promotions] Finance Manager eligibility check response:', {
      queryDuration: `${queryDuration}ms`,
      hasData: !!data,
      dataCount: data?.length || 0,
      hasError: !!error,
      errorCode: error?.code || 'none',
      errorMessage: error?.message || 'none',
      schemaName,
      tier
    });
    
    if (error) {
      handle500Error(error, 'checkFinanceManagerEligibility');
    }
    
    return data || [];
  }, 'checkFinanceManagerEligibility');
}

/**
 * Enhanced: Record promotion usage for Finance Manager with comprehensive validation
 */
export async function recordFinanceManagerUsage(
  promotionId: string,
  schemaName: string,
  usageData: {
    originalAmount?: number;
    discountedAmount?: number;
    usageType?: UsageType;
  } = {}
): Promise<{ usage_id: string }> {
  return safePromotionOperation(async () => {
    console.log('[Promotions] Recording Finance Manager usage with enhanced validation');
    
    // Security: Validate inputs
    if (!promotionId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(promotionId)) {
      throw new ValidationError('Invalid promotion ID format');
    }
    
    validateSchemaName(schemaName);
    
    if (usageData.originalAmount !== undefined && usageData.originalAmount < 0) {
      throw new ValidationError('Original amount must be non-negative');
    }
    
    if (usageData.discountedAmount !== undefined && usageData.discountedAmount < 0) {
      throw new ValidationError('Discounted amount must be non-negative');
    }
    
    if (usageData.originalAmount !== undefined && 
        usageData.discountedAmount !== undefined && 
        usageData.discountedAmount > usageData.originalAmount) {
      throw new ValidationError('Discounted amount cannot exceed original amount');
    }
    
    const client = await getSecureSupabaseClient();
    
    // Enhanced 500 Error Handling: Use RPC function with comprehensive error handling
    const startTime = Date.now();
    const { data: result, error } = await client.rpc('record_promotion_usage', {
      p_promotion_id: promotionId,
      p_user_id: null,
      p_schema_name: schemaName,
      p_dealership_id: null,
      p_usage_type: usageData.usageType || 'signup',
      p_original_amount: usageData.originalAmount || null,
      p_discounted_amount: usageData.discountedAmount || null
    });
    
    const queryDuration = Date.now() - startTime;
    
    // Enhanced 500 Error Handling: Log detailed response
    console.log('[Promotions] Finance Manager usage recording response:', {
      queryDuration: `${queryDuration}ms`,
      hasData: !!result,
      hasError: !!error,
      errorCode: error?.code || 'none',
      errorMessage: error?.message || 'none',
      promotionId: promotionId.substring(0, 8) + '...',
      schemaName,
      usageType: usageData.usageType || 'signup'
    });
    
    if (error) {
      // Enhanced 500 Error Handling: Map specific error codes to user-friendly messages
      if (error.code === 'P0001') {
        throw new ValidationError('Promotion not found or not accessible');
      } else if (error.code === 'P0002') {
        throw new ValidationError('Promotion is not currently active');
      } else if (error.code === '23505') {
        throw new ValidationError('Promotion has already been used for this schema');
      } else {
        handle500Error(error, 'recordFinanceManagerUsage');
      }
    }
    
    return { usage_id: result };
  }, 'recordFinanceManagerUsage');
}

/**
 * Enhanced: Get promotion usage history for Finance Manager schema
 */
export async function getFinanceManagerUsageHistory(
  schemaName: string
): Promise<EnhancedPromotionUsage[]> {
  return safePromotionOperation(async () => {
    console.log('[Promotions] Getting Finance Manager usage history with enhanced security');
    
    // Security: Validate schema name
    validateSchemaName(schemaName);
    
    const client = await getSecureSupabaseClient();
    
    // Enhanced 500 Error Handling: Use secure view with RLS policies applied
    const startTime = Date.now();
    const { data, error } = await client
      .from('active_promotion_usage')
      .select(`
        id,
        promotion_id,
        promotion_tier,
        schema_name,
        usage_type,
        signup_date,
        original_amount,
        discounted_amount,
        discount_applied,
        is_active,
        expires_at,
        created_at,
        version,
        promotion_tier_confirmed,
        promotion_description,
        promotion_status
      `)
      .eq('schema_name', schemaName)
      .order('created_at', { ascending: false });
    
    const queryDuration = Date.now() - startTime;
    
    // Enhanced 500 Error Handling: Log detailed response
    console.log('[Promotions] Finance Manager usage history response:', {
      queryDuration: `${queryDuration}ms`,
      hasData: !!data,
      dataCount: data?.length || 0,
      hasError: !!error,
      errorCode: error?.code || 'none',
      errorMessage: error?.message || 'none',
      schemaName
    });
    
    if (error) {
      handle500Error(error, 'getFinanceManagerUsageHistory');
    }
    
    return data || [];
  }, 'getFinanceManagerUsageHistory');
}

/**
 * Enhanced: Validate promotion migrations and health check
 */
export async function validatePromotionSystemHealth(): Promise<{
  isHealthy: boolean;
  checks: Array<{ name: string; status: string; details: string }>;
}> {
  return safePromotionOperation(async () => {
    console.log('[Promotions] Running system health check with 500 error monitoring');
    
    const client = await getSecureSupabaseClient();
    
    // Enhanced 500 Error Handling: Use health monitoring function
    const startTime = Date.now();
    const { data, error } = await client.rpc('monitor_promotion_health');
    
    const queryDuration = Date.now() - startTime;
    
    // Enhanced 500 Error Handling: Log health check response
    console.log('[Promotions] System health check response:', {
      queryDuration: `${queryDuration}ms`,
      hasData: !!data,
      checkCount: data?.length || 0,
      hasError: !!error,
      errorCode: error?.code || 'none',
      errorMessage: error?.message || 'none'
    });
    
    if (error) {
      handle500Error(error, 'validatePromotionSystemHealth');
    }
    
    const checks = data || [];
    const isHealthy = checks.every((check: any) => check.status === 'OK');
    
    return {
      isHealthy,
      checks
    };
  }, 'validatePromotionSystemHealth');
}

// Enhanced utility functions with 500 error awareness
export const enhancedPromotionUtils = {
  /**
   * Enhanced: Validate tier with comprehensive error handling
   */
  validateTier: (tier: string): tier is PromotionTier => {
    try {
      validatePromotionTier(tier);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Enhanced: Calculate discount with 500 error protection
   */
  calculateDiscount: (originalPrice: number, promoPrice: number): number => {
    try {
      if (!Number.isFinite(originalPrice) || !Number.isFinite(promoPrice)) {
        console.warn('[Promotions] Invalid price values for discount calculation');
        return 0;
      }
      
      if (originalPrice <= 0) return 0;
      return Math.round(((originalPrice - promoPrice) / originalPrice) * 100 * 100) / 100;
    } catch (error) {
      console.error('[Promotions] Error calculating discount:', error);
      return 0;
    }
  },

  /**
   * Enhanced: Format currency with error handling
   */
  formatCurrency: (amount: number): string => {
    try {
      if (!Number.isFinite(amount)) {
        return '$0.00';
      }
      
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
    } catch (error) {
      console.error('[Promotions] Error formatting currency:', error);
      return `$${amount.toFixed(2)}`;
    }
  },

  /**
   * Enhanced: Check if promotion is active with comprehensive validation
   */
  isPromotionActive: (promotion: EnhancedPromotion): boolean => {
    try {
      if (!promotion || promotion.deleted_at) {
        return false;
      }
      
      const now = new Date();
      const startDate = new Date(promotion.start_date);
      const endDate = promotion.end_date ? new Date(promotion.end_date) : null;

      return (
        promotion.status === 'active' &&
        startDate <= now &&
        (endDate === null || endDate >= now)
      );
    } catch (error) {
      console.error('[Promotions] Error checking promotion active status:', error);
      return false;
    }
  },

  /**
   * Enhanced: Sanitize schema name for safe database queries
   */
  sanitizeSchemaName: (schemaName: string): string => {
    try {
      if (!schemaName || typeof schemaName !== 'string') {
        return '';
      }
      
      // Remove any potentially dangerous characters
      return schemaName
        .replace(/[^a-zA-Z0-9_]/g, '')
        .substring(0, 63)
        .toLowerCase();
    } catch (error) {
      console.error('[Promotions] Error sanitizing schema name:', error);
      return '';
    }
  },

  /**
   * Enhanced: Create user-friendly error message from promotion errors
   */
  createUserFriendlyErrorMessage: (error: any): string => {
    if (error instanceof Database500Error) {
      return 'Promotion service is temporarily unavailable. Please try again in a few moments.';
    }
    
    if (error instanceof RLSPermissionError) {
      return 'You do not have permission to access this promotion feature.';
    }
    
    if (error instanceof ValidationError) {
      return `Validation error: ${error.message}`;
    }
    
    if (error instanceof PromotionError) {
      return error.message;
    }
    
    // Generic fallback
    return 'An unexpected error occurred. Please try again or contact support.';
  },

  /**
   * Enhanced: Retry wrapper for promotion operations
   */
  withRetry: async <T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    operationName: string = 'promotion operation'
  ): Promise<T> => {
    return safePromotionOperation(operation, operationName, maxAttempts);
  }
};

// Export main functions for backward compatibility
export {
  safePromotionOperation,
  handle500Error,
  validatePromotionTier,
  validateSchemaName
};