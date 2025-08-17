/**
 * Secure Promotions Database Utilities
 * 
 * This module provides TypeScript utilities for secure interaction with
 * the promotions database tables, preventing SQL injection and ensuring
 * proper data validation and type safety.
 * 
 * Security Features:
 * - Parameterized queries only
 * - Input validation and sanitization
 * - Type-safe operations
 * - Error handling with secure logging
 * - Row Level Security compliance
 * - Audit trail support
 */

import { supabase } from '../supabaseClient';
import { sanitizeUserInput, validateFormData, SECURITY_LIMITS } from '../security/inputSanitization';

// Type definitions for type safety
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

export interface Promotion {
  id: string;
  tier: PromotionTier;
  original_price: number;
  promo_price: number;
  start_date: string;
  end_date?: string;
  status: PromotionStatus;
  description?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
  version: number;
  deleted_at?: string;
  deleted_by?: string;
}

export interface PromotionUsage {
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

export interface CreatePromotionRequest {
  tier: PromotionTier;
  original_price: number;
  promo_price: number;
  start_date: string;
  end_date?: string;
  description?: string;
}

export interface UpdatePromotionRequest {
  id: string;
  original_price?: number;
  promo_price?: number;
  start_date?: string;
  end_date?: string;
  description?: string;
  status?: PromotionStatus;
}

export interface CreateUsageRequest {
  promotion_id: string;
  user_id?: string;
  schema_name?: string;
  dealership_id?: number;
  usage_type?: UsageType;
  original_amount?: number;
  discounted_amount?: number;
}

export interface PromotionEligibility {
  promotion_id: string;
  tier: PromotionTier;
  original_price: number;
  promo_price: number;
  discount_percentage: number;
  description?: string;
  start_date: string;
  end_date?: string;
}

// Error types for better error handling
export class PromotionError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'PromotionError';
  }
}

export class ValidationError extends PromotionError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends PromotionError {
  constructor(message: string = 'Unauthorized operation') {
    super(message, 'UNAUTHORIZED', {});
    this.name = 'UnauthorizedError';
  }
}

/**
 * Validates promotion input data
 */
function validatePromotionInput(data: Partial<CreatePromotionRequest>): void {
  const validation = validateFormData(data, {
    tier: {
      required: true,
      type: 'string',
      sanitize: false // Enum validation handled separately
    },
    original_price: {
      required: true,
      type: 'number'
    },
    promo_price: {
      required: true,
      type: 'number'
    },
    start_date: {
      required: true,
      type: 'string'
    },
    end_date: {
      required: false,
      type: 'string'
    },
    description: {
      required: false,
      type: 'string',
      maxLength: 1000,
      sanitize: true
    }
  });

  if (!validation.isValid) {
    throw new ValidationError('Invalid promotion data', validation.errors);
  }

  // Additional business logic validation
  if (data.original_price !== undefined && data.original_price < 0) {
    throw new ValidationError('Original price must be non-negative');
  }

  if (data.promo_price !== undefined && data.promo_price < 0) {
    throw new ValidationError('Promo price must be non-negative');
  }

  if (
    data.original_price !== undefined && 
    data.promo_price !== undefined && 
    data.promo_price > data.original_price
  ) {
    throw new ValidationError('Promo price cannot exceed original price');
  }

  if (data.start_date && data.end_date) {
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    
    if (endDate <= startDate) {
      throw new ValidationError('End date must be after start date');
    }
  }

  // Validate tier enum
  const validTiers: PromotionTier[] = [
    'finance_manager_only',
    'salesperson',
    'sales_manager', 
    'general_manager',
    'dealership_basic',
    'dealership_pro',
    'dealership_enterprise'
  ];

  if (data.tier && !validTiers.includes(data.tier)) {
    throw new ValidationError('Invalid promotion tier');
  }
}

/**
 * Validates promotion usage input data
 */
function validateUsageInput(data: CreateUsageRequest): void {
  // Ensure exactly one entity identifier is provided
  const entityCount = [data.user_id, data.schema_name, data.dealership_id]
    .filter(Boolean).length;
    
  if (entityCount !== 1) {
    throw new ValidationError(
      'Exactly one of user_id, schema_name, or dealership_id must be provided'
    );
  }

  // Validate schema name format if provided
  if (data.schema_name) {
    const schemaRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/;
    if (!schemaRegex.test(data.schema_name) || data.schema_name.length > 63) {
      throw new ValidationError('Invalid schema name format');
    }
  }

  // Validate amounts
  if (data.original_amount !== undefined && data.original_amount < 0) {
    throw new ValidationError('Original amount must be non-negative');
  }

  if (data.discounted_amount !== undefined && data.discounted_amount < 0) {
    throw new ValidationError('Discounted amount must be non-negative');
  }

  if (
    data.original_amount !== undefined && 
    data.discounted_amount !== undefined && 
    data.discounted_amount > data.original_amount
  ) {
    throw new ValidationError('Discounted amount cannot exceed original amount');
  }
}

/**
 * Securely creates a new promotion using parameterized function
 */
export async function createPromotion(
  data: CreatePromotionRequest
): Promise<{ promotion_id: string }> {
  try {
    // Validate input data
    validatePromotionInput(data);

    // Sanitize description if provided
    const sanitizedDescription = data.description 
      ? sanitizeUserInput(data.description, {
          allowHtml: false,
          maxLength: 1000,
          trimWhitespace: true
        })
      : null;

    // Call secure database function with parameterized query
    const { data: result, error } = await supabase.rpc('insert_promotion', {
      p_tier: data.tier,
      p_original_price: data.original_price,
      p_promo_price: data.promo_price,
      p_start_date: data.start_date,
      p_end_date: data.end_date || null,
      p_description: sanitizedDescription
    });

    if (error) {
      console.error('[createPromotion] Database error:', error);
      
      // Map database errors to user-friendly messages
      if (error.code === 'P0001') {
        throw new UnauthorizedError('Only admins can create promotions');
      } else if (error.code === '23514') {
        throw new ValidationError('Invalid promotion data: ' + error.message);
      } else if (error.code === '23505') {
        throw new ValidationError('A promotion already exists for this tier and date range');
      } else {
        throw new PromotionError('Failed to create promotion', error.code, error);
      }
    }

    return { promotion_id: result };
  } catch (error) {
    if (error instanceof PromotionError) {
      throw error;
    }
    
    console.error('[createPromotion] Unexpected error:', error);
    throw new PromotionError('Unexpected error creating promotion', 'UNKNOWN_ERROR');
  }
}

/**
 * Securely updates a promotion using parameterized function
 */
export async function updatePromotion(
  data: UpdatePromotionRequest
): Promise<{ success: boolean }> {
  try {
    // Validate input data
    if (data.description !== undefined) {
      validatePromotionInput({ description: data.description });
    }

    // Sanitize description if provided
    const sanitizedDescription = data.description !== undefined
      ? sanitizeUserInput(data.description, {
          allowHtml: false,
          maxLength: 1000,
          trimWhitespace: true
        })
      : undefined;

    // Call secure database function
    const { data: result, error } = await supabase.rpc('update_promotion', {
      p_promotion_id: data.id,
      p_original_price: data.original_price || null,
      p_promo_price: data.promo_price || null,
      p_start_date: data.start_date || null,
      p_end_date: data.end_date || null,
      p_description: sanitizedDescription || null,
      p_status: data.status || null
    });

    if (error) {
      console.error('[updatePromotion] Database error:', error);
      
      if (error.code === 'P0001') {
        throw new UnauthorizedError('Only admins can update promotions');
      } else if (error.code === 'P0002') {
        throw new ValidationError('Promotion not found or deleted');
      } else if (error.code === '40001') {
        throw new ValidationError('Concurrent update detected. Please retry.');
      } else {
        throw new PromotionError('Failed to update promotion', error.code, error);
      }
    }

    return { success: result };
  } catch (error) {
    if (error instanceof PromotionError) {
      throw error;
    }
    
    console.error('[updatePromotion] Unexpected error:', error);
    throw new PromotionError('Unexpected error updating promotion', 'UNKNOWN_ERROR');
  }
}

/**
 * Securely deletes (soft delete) a promotion
 */
export async function deletePromotion(promotionId: string): Promise<{ success: boolean }> {
  try {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(promotionId)) {
      throw new ValidationError('Invalid promotion ID format');
    }

    // Call secure database function
    const { data: result, error } = await supabase.rpc('delete_promotion', {
      p_promotion_id: promotionId
    });

    if (error) {
      console.error('[deletePromotion] Database error:', error);
      
      if (error.code === 'P0001') {
        throw new UnauthorizedError('Only admins can delete promotions');
      } else if (error.code === 'P0002') {
        throw new ValidationError('Promotion not found or already deleted');
      } else {
        throw new PromotionError('Failed to delete promotion', error.code, error);
      }
    }

    return { success: result };
  } catch (error) {
    if (error instanceof PromotionError) {
      throw error;
    }
    
    console.error('[deletePromotion] Unexpected error:', error);
    throw new PromotionError('Unexpected error deleting promotion', 'UNKNOWN_ERROR');
  }
}

/**
 * Securely retrieves active promotions (uses view with RLS)
 */
export async function getActivePromotions(): Promise<Promotion[]> {
  try {
    const { data, error } = await supabase
      .from('active_promotions')
      .select('*')
      .order('promo_price', { ascending: true });

    if (error) {
      console.error('[getActivePromotions] Database error:', error);
      throw new PromotionError('Failed to retrieve active promotions', error.code, error);
    }

    return data || [];
  } catch (error) {
    if (error instanceof PromotionError) {
      throw error;
    }
    
    console.error('[getActivePromotions] Unexpected error:', error);
    throw new PromotionError('Unexpected error retrieving promotions', 'UNKNOWN_ERROR');
  }
}

/**
 * Securely records promotion usage
 */
export async function recordPromotionUsage(
  data: CreateUsageRequest
): Promise<{ usage_id: string }> {
  try {
    // Validate input data
    validateUsageInput(data);

    // Call secure database function
    const { data: result, error } = await supabase.rpc('record_promotion_usage', {
      p_promotion_id: data.promotion_id,
      p_user_id: data.user_id || null,
      p_schema_name: data.schema_name || null,
      p_dealership_id: data.dealership_id || null,
      p_usage_type: data.usage_type || 'signup',
      p_original_amount: data.original_amount || null,
      p_discounted_amount: data.discounted_amount || null
    });

    if (error) {
      console.error('[recordPromotionUsage] Database error:', error);
      
      if (error.code === 'P0001') {
        throw new ValidationError('Promotion not found');
      } else if (error.code === 'P0002') {
        throw new ValidationError('Promotion is not active');
      } else if (error.code === '23505') {
        throw new ValidationError('Promotion usage already exists for this entity');
      } else if (error.code === '23514') {
        throw new ValidationError('Invalid usage data: ' + error.message);
      } else {
        throw new PromotionError('Failed to record promotion usage', error.code, error);
      }
    }

    return { usage_id: result };
  } catch (error) {
    if (error instanceof PromotionError) {
      throw error;
    }
    
    console.error('[recordPromotionUsage] Unexpected error:', error);
    throw new PromotionError('Unexpected error recording usage', 'UNKNOWN_ERROR');
  }
}

/**
 * Checks promotion eligibility for an entity
 */
export async function checkPromotionEligibility(
  entity: {
    user_id?: string;
    schema_name?: string;
    dealership_id?: number;
  },
  tier?: PromotionTier
): Promise<PromotionEligibility[]> {
  try {
    // Validate entity parameters
    const entityCount = [entity.user_id, entity.schema_name, entity.dealership_id]
      .filter(Boolean).length;
      
    if (entityCount !== 1) {
      throw new ValidationError(
        'Exactly one of user_id, schema_name, or dealership_id must be provided'
      );
    }

    // Call secure database function
    const { data, error } = await supabase.rpc('check_promotion_eligibility', {
      p_user_id: entity.user_id || null,
      p_schema_name: entity.schema_name || null,
      p_dealership_id: entity.dealership_id || null,
      p_tier: tier || null
    });

    if (error) {
      console.error('[checkPromotionEligibility] Database error:', error);
      throw new PromotionError('Failed to check promotion eligibility', error.code, error);
    }

    return data || [];
  } catch (error) {
    if (error instanceof PromotionError) {
      throw error;
    }
    
    console.error('[checkPromotionEligibility] Unexpected error:', error);
    throw new PromotionError('Unexpected error checking eligibility', 'UNKNOWN_ERROR');
  }
}

/**
 * Retrieves user's promotion usage history (RLS protected)
 */
export async function getUserPromotionUsage(
  entity: {
    user_id?: string;
    schema_name?: string;
    dealership_id?: number;
  }
): Promise<PromotionUsage[]> {
  try {
    // Build query based on entity type
    let query = supabase
      .from('promotions_usage')
      .select(`
        *,
        promotions!inner(tier, description, status)
      `)
      .eq('deleted_at', null)
      .order('created_at', { ascending: false });

    if (entity.user_id) {
      query = query.eq('user_id', entity.user_id);
    } else if (entity.schema_name) {
      query = query.eq('schema_name', entity.schema_name);
    } else if (entity.dealership_id) {
      query = query.eq('dealership_id', entity.dealership_id);
    } else {
      throw new ValidationError('Entity identifier required');
    }

    const { data, error } = await query;

    if (error) {
      console.error('[getUserPromotionUsage] Database error:', error);
      throw new PromotionError('Failed to retrieve usage history', error.code, error);
    }

    return data || [];
  } catch (error) {
    if (error instanceof PromotionError) {
      throw error;
    }
    
    console.error('[getUserPromotionUsage] Unexpected error:', error);
    throw new PromotionError('Unexpected error retrieving usage history', 'UNKNOWN_ERROR');
  }
}

/**
 * Validates migration status (admin only)
 */
export async function validatePromotionMigrations(): Promise<Record<string, unknown>> {
  try {
    const { data, error } = await supabase.rpc('validate_promotion_migrations');

    if (error) {
      console.error('[validatePromotionMigrations] Database error:', error);
      throw new PromotionError('Failed to validate migrations', error.code, error);
    }

    return data || {};
  } catch (error) {
    if (error instanceof PromotionError) {
      throw error;
    }
    
    console.error('[validatePromotionMigrations] Unexpected error:', error);
    throw new PromotionError('Unexpected error validating migrations', 'UNKNOWN_ERROR');
  }
}

/**
 * Utility function to safely handle database operations with retries
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry validation errors or unauthorized errors
      if (error instanceof ValidationError || error instanceof UnauthorizedError) {
        throw error;
      }
      
      if (attempt === maxAttempts) {
        break;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError!;
}

// Export utility functions
export const promotionUtils = {
  validateTier: (tier: string): tier is PromotionTier => {
    const validTiers: PromotionTier[] = [
      'finance_manager_only',
      'salesperson',
      'sales_manager', 
      'general_manager',
      'dealership_basic',
      'dealership_pro',
      'dealership_enterprise'
    ];
    return validTiers.includes(tier as PromotionTier);
  },

  calculateDiscount: (originalPrice: number, promoPrice: number): number => {
    if (originalPrice <= 0) return 0;
    return Math.round(((originalPrice - promoPrice) / originalPrice * 100) * 100) / 100;
  },

  formatCurrency: (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  },

  isPromotionActive: (promotion: Promotion): boolean => {
    const now = new Date();
    const startDate = new Date(promotion.start_date);
    const endDate = promotion.end_date ? new Date(promotion.end_date) : null;
    
    return (
      promotion.status === 'active' &&
      !promotion.deleted_at &&
      startDate <= now &&
      (endDate === null || endDate >= now)
    );
  }
};