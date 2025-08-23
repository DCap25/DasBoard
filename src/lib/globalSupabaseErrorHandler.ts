/**
 * Global Supabase Error Handler for Production 500 Error Logging
 * 
 * This module provides comprehensive error handling and logging for persistent
 * 500 errors in 'The DAS Board' production environment. It wraps all Supabase
 * calls with global try-catch blocks and provides detailed error information
 * for debugging RLS, UUID syntax errors, and other database-level issues.
 * 
 * Features:
 * - Global try-catch wrapper for all Supabase operations
 * - Detailed 500 error analysis with error.details extraction
 * - RLS policy violation detection and logging
 * - UUID syntax error identification and correction suggestions
 * - Production-safe error reporting without exposing sensitive data
 * - Prevent redirects on errors with graceful degradation
 */

import { SupabaseClient, PostgrestError, AuthError } from '@supabase/supabase-js';
import { Database } from './database.types';

// =================== ERROR CLASSIFICATION SYSTEM ===================

/**
 * Comprehensive error classification for production debugging
 */
export enum SupabaseErrorType {
  // 500 Server Errors
  INTERNAL_SERVER_ERROR = 'internal_server_error',
  DATABASE_CONNECTION_ERROR = 'database_connection_error',
  RLS_POLICY_VIOLATION = 'rls_policy_violation',
  TRIGGER_FUNCTION_ERROR = 'trigger_function_error',
  
  // UUID and Syntax Errors
  UUID_SYNTAX_ERROR = 'uuid_syntax_error',
  MALFORMED_UUID = 'malformed_uuid',
  UUID_CONSTRAINT_VIOLATION = 'uuid_constraint_violation',
  
  // Authentication Errors
  AUTH_TOKEN_EXPIRED = 'auth_token_expired',
  AUTH_INVALID_JWT = 'auth_invalid_jwt',
  AUTH_PERMISSION_DENIED = 'auth_permission_denied',
  
  // Query Errors
  QUERY_SYNTAX_ERROR = 'query_syntax_error',
  TABLE_NOT_FOUND = 'table_not_found',
  COLUMN_NOT_FOUND = 'column_not_found',
  
  // Network Errors
  NETWORK_TIMEOUT = 'network_timeout',
  CONNECTION_REFUSED = 'connection_refused',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  
  // Unknown Errors
  UNKNOWN_ERROR = 'unknown_error'
}

/**
 * Enhanced error details for comprehensive logging
 */
export interface EnhancedSupabaseError {
  // Core error information
  type: SupabaseErrorType;
  message: string;
  originalError: any;
  timestamp: string;
  
  // HTTP details
  statusCode?: number;
  statusText?: string;
  
  // Supabase specific details
  supabaseCode?: string;
  supabaseDetails?: string;
  supabaseHint?: string;
  
  // Context information
  operation: string;
  table?: string;
  userId?: string;
  userEmail?: string;
  
  // Production debugging information
  isProduction: boolean;
  userAgent?: string;
  url?: string;
  
  // RLS and UUID specific details
  rlsPolicyName?: string;
  uuidField?: string;
  suggestedFix?: string;
  
  // Performance metrics
  operationDuration?: number;
  retryAttempt?: number;
}

// =================== ERROR ANALYSIS FUNCTIONS ===================

/**
 * Analyze a Supabase error to determine its type and extract relevant details
 */
function analyzeSupabaseError(error: any, context: {
  operation: string;
  table?: string;
  userId?: string;
  userEmail?: string;
  operationStartTime?: number;
  retryAttempt?: number;
}): EnhancedSupabaseError {
  const timestamp = new Date().toISOString();
  const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production';
  const operationDuration = context.operationStartTime 
    ? Date.now() - context.operationStartTime 
    : undefined;

  // Base error information
  const enhancedError: EnhancedSupabaseError = {
    type: SupabaseErrorType.UNKNOWN_ERROR,
    message: error?.message || 'Unknown error occurred',
    originalError: error,
    timestamp,
    operation: context.operation,
    table: context.table,
    userId: context.userId,
    userEmail: context.userEmail,
    isProduction,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    operationDuration,
    retryAttempt: context.retryAttempt
  };

  // Extract HTTP status information
  if (error?.status || error?.code) {
    enhancedError.statusCode = error.status || parseInt(error.code) || undefined;
    enhancedError.statusText = error.statusText || undefined;
  }

  // Extract Supabase-specific error details
  if (error?.code) {
    enhancedError.supabaseCode = error.code;
  }
  if (error?.details) {
    enhancedError.supabaseDetails = error.details;
  }
  if (error?.hint) {
    enhancedError.supabaseHint = error.hint;
  }

  // Analyze error type and provide specific insights
  const errorMessage = (error?.message || '').toLowerCase();
  const errorDetails = (error?.details || '').toLowerCase();
  const errorCode = error?.code || '';

  // 500 Internal Server Errors
  if (error?.status === 500 || errorMessage.includes('internal server error') || errorCode === 'PGRST301') {
    enhancedError.type = SupabaseErrorType.INTERNAL_SERVER_ERROR;
    enhancedError.suggestedFix = 'Check server logs and database connectivity. May be temporary - retry with exponential backoff.';
    
    // Check for specific 500 error patterns
    if (errorDetails.includes('rls') || errorDetails.includes('policy')) {
      enhancedError.type = SupabaseErrorType.RLS_POLICY_VIOLATION;
      enhancedError.rlsPolicyName = extractRLSPolicyName(errorDetails);
      enhancedError.suggestedFix = 'RLS policy violation detected. Check Row Level Security policies for the target table. Run: SELECT * FROM pg_policies WHERE tablename = \'your_table\';';
    } else if (errorDetails.includes('trigger') || errorDetails.includes('function')) {
      enhancedError.type = SupabaseErrorType.TRIGGER_FUNCTION_ERROR;
      enhancedError.suggestedFix = 'Database trigger function error. Check trigger functions and their dependencies.';
    } else if (errorDetails.includes('connection') || errorDetails.includes('timeout')) {
      enhancedError.type = SupabaseErrorType.DATABASE_CONNECTION_ERROR;
      enhancedError.suggestedFix = 'Database connection issue. Check network connectivity and Supabase service status.';
    }
  }

  // UUID Syntax Errors
  if (errorMessage.includes('uuid') || errorMessage.includes('invalid input syntax')) {
    enhancedError.type = SupabaseErrorType.UUID_SYNTAX_ERROR;
    enhancedError.uuidField = extractUUIDField(errorMessage, errorDetails);
    
    // Check for malformed UUID with :1 suffix (common issue)
    if (errorMessage.includes(':') || errorDetails.includes(':1')) {
      enhancedError.type = SupabaseErrorType.MALFORMED_UUID;
      enhancedError.suggestedFix = 'UUID contains invalid characters like \":1\" suffix. Clean UUID by removing everything after colon: userId.split(\":\")[0]';
    } else {
      enhancedError.suggestedFix = 'Invalid UUID format. Ensure UUID matches pattern: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
    }
  }

  // Authentication Errors
  if (error instanceof AuthError || errorCode.startsWith('AUTH_')) {
    if (errorMessage.includes('jwt') || errorMessage.includes('token')) {
      if (errorMessage.includes('expired')) {
        enhancedError.type = SupabaseErrorType.AUTH_TOKEN_EXPIRED;
        enhancedError.suggestedFix = 'Authentication token has expired. Refresh the session or redirect to login.';
      } else {
        enhancedError.type = SupabaseErrorType.AUTH_INVALID_JWT;
        enhancedError.suggestedFix = 'Invalid JWT token format or signature. Check authentication flow.';
      }
    } else if (errorMessage.includes('permission') || error?.status === 401) {
      enhancedError.type = SupabaseErrorType.AUTH_PERMISSION_DENIED;
      enhancedError.suggestedFix = 'Authentication required or insufficient permissions. Check user role and table RLS policies.';
    }
  }

  // Query Syntax Errors
  if (errorMessage.includes('syntax error') && !errorMessage.includes('uuid')) {
    enhancedError.type = SupabaseErrorType.QUERY_SYNTAX_ERROR;
    enhancedError.suggestedFix = 'SQL query syntax error. Review query structure and parameters.';
  }

  // Table/Column Not Found
  if (errorMessage.includes('does not exist') || errorCode === '42P01') {
    if (errorMessage.includes('table')) {
      enhancedError.type = SupabaseErrorType.TABLE_NOT_FOUND;
      enhancedError.suggestedFix = 'Table does not exist. Check table name spelling and database schema.';
    } else if (errorMessage.includes('column')) {
      enhancedError.type = SupabaseErrorType.COLUMN_NOT_FOUND;
      enhancedError.suggestedFix = 'Column does not exist. Check column name spelling and table schema.';
    }
  }

  // Network Errors
  if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
    enhancedError.type = SupabaseErrorType.NETWORK_TIMEOUT;
    enhancedError.suggestedFix = 'Network timeout or connectivity issue. Check internet connection and retry with exponential backoff.';
  } else if (errorMessage.includes('connection refused') || errorMessage.includes('econnrefused')) {
    enhancedError.type = SupabaseErrorType.CONNECTION_REFUSED;
    enhancedError.suggestedFix = 'Connection refused by server. Check Supabase service status and network configuration.';
  } else if (error?.status === 429 || errorMessage.includes('rate limit')) {
    enhancedError.type = SupabaseErrorType.RATE_LIMIT_EXCEEDED;
    enhancedError.suggestedFix = 'Rate limit exceeded. Implement exponential backoff and reduce request frequency.';
  }

  return enhancedError;
}

/**
 * Extract RLS policy name from error details
 */
function extractRLSPolicyName(errorDetails: string): string | undefined {
  const policyMatch = errorDetails.match(/policy["\s]*([a-zA-Z0-9_-]+)/i);
  return policyMatch?.[1];
}

/**
 * Extract UUID field name from error message
 */
function extractUUIDField(message: string, details: string): string | undefined {
  // Look for field names in error messages
  const fieldMatch = (message + ' ' + details).match(/(?:column|field)["\s]*([a-zA-Z0-9_]+)/i);
  return fieldMatch?.[1];
}

// =================== GLOBAL ERROR HANDLER ===================

/**
 * Global error handler that wraps all Supabase operations
 */
export class GlobalSupabaseErrorHandler {
  private static instance: GlobalSupabaseErrorHandler | null = null;
  private errorCount = 0;
  private lastErrorTime = 0;
  private errorRateLimit = 10; // Max 10 errors per minute
  
  private constructor() {}
  
  static getInstance(): GlobalSupabaseErrorHandler {
    if (!this.instance) {
      this.instance = new GlobalSupabaseErrorHandler();
    }
    return this.instance;
  }

  /**
   * Enhanced error logging with 500 error details extraction
   */
  private logError(enhancedError: EnhancedSupabaseError): void {
    const now = Date.now();
    
    // Rate limiting to prevent log spam
    if (now - this.lastErrorTime < 60000) { // Within 1 minute
      this.errorCount++;
      if (this.errorCount > this.errorRateLimit) {
        return; // Skip logging if rate limit exceeded
      }
    } else {
      this.errorCount = 1;
      this.lastErrorTime = now;
    }

    // Production-safe error logging
    if (enhancedError.isProduction) {
      // Production logging - sanitized for security
      console.error(`🚨 [SUPABASE ${enhancedError.type.toUpperCase()}] ${enhancedError.message}`);
      
      if (enhancedError.statusCode === 500) {
        console.error(`💥 [500 ERROR DETAILS] Operation: ${enhancedError.operation}`);
        
        if (enhancedError.supabaseDetails) {
          // Log error.details for 500 errors (key for debugging)
          console.error(`🔍 [500 ERROR DETAILS] ${enhancedError.supabaseDetails}`);
          
          // Check for specific patterns in details
          if (enhancedError.supabaseDetails.toLowerCase().includes('uuid')) {
            console.error(`🆔 [UUID SYNTAX ERROR] Check RLS policies and UUID format. ${enhancedError.suggestedFix || ''}`);
          }
          
          if (enhancedError.supabaseDetails.toLowerCase().includes('rls') || 
              enhancedError.supabaseDetails.toLowerCase().includes('policy')) {
            console.error(`🔒 [RLS POLICY ERROR] Row Level Security issue detected. ${enhancedError.suggestedFix || ''}`);
          }
        }
        
        if (enhancedError.supabaseHint) {
          console.error(`💡 [500 ERROR HINT] ${enhancedError.supabaseHint}`);
        }
        
        // Log performance metrics for 500 errors
        if (enhancedError.operationDuration) {
          console.error(`⏱️ [500 ERROR PERFORMANCE] Operation took ${enhancedError.operationDuration}ms`);
        }
        
        if (enhancedError.retryAttempt) {
          console.error(`🔄 [500 ERROR RETRY] Attempt ${enhancedError.retryAttempt}`);
        }
      }
      
      // Log suggested fix for production debugging
      if (enhancedError.suggestedFix) {
        console.error(`🔧 [SUGGESTED FIX] ${enhancedError.suggestedFix}`);
      }
      
    } else {
      // Development logging - full details
      console.group(`🚨 [SUPABASE ERROR] ${enhancedError.type}`);
      console.error('Message:', enhancedError.message);
      console.error('Operation:', enhancedError.operation);
      if (enhancedError.table) console.error('Table:', enhancedError.table);
      if (enhancedError.statusCode) console.error('Status Code:', enhancedError.statusCode);
      if (enhancedError.supabaseCode) console.error('Supabase Code:', enhancedError.supabaseCode);
      if (enhancedError.supabaseDetails) console.error('Details:', enhancedError.supabaseDetails);
      if (enhancedError.supabaseHint) console.error('Hint:', enhancedError.supabaseHint);
      if (enhancedError.suggestedFix) console.error('Suggested Fix:', enhancedError.suggestedFix);
      if (enhancedError.operationDuration) console.error('Duration:', enhancedError.operationDuration + 'ms');
      console.error('Full Error:', enhancedError.originalError);
      console.groupEnd();
    }

    // Send to external error tracking service in production
    if (enhancedError.isProduction) {
      this.reportToErrorTracking(enhancedError);
    }
  }

  /**
   * Report error to external tracking service (placeholder for Sentry, etc.)
   */
  private reportToErrorTracking(enhancedError: EnhancedSupabaseError): void {
    // This would integrate with your error tracking service
    // Example: Sentry, LogRocket, Bugsnag, etc.
    
    // For now, just store in sessionStorage for debugging
    try {
      const errorLog = JSON.parse(sessionStorage.getItem('supabase_errors') || '[]');
      errorLog.push({
        type: enhancedError.type,
        message: enhancedError.message,
        timestamp: enhancedError.timestamp,
        operation: enhancedError.operation,
        statusCode: enhancedError.statusCode,
        table: enhancedError.table,
        userAgent: enhancedError.userAgent,
        url: enhancedError.url
      });
      
      // Keep only last 50 errors
      if (errorLog.length > 50) {
        errorLog.shift();
      }
      
      sessionStorage.setItem('supabase_errors', JSON.stringify(errorLog));
    } catch (error) {
      console.warn('Failed to store error log:', error);
    }
  }

  /**
   * Global try-catch wrapper for Supabase operations
   */
  async wrapSupabaseOperation<T>(
    operation: () => Promise<T>,
    context: {
      operation: string;
      table?: string;
      userId?: string;
      userEmail?: string;
    },
    options: {
      preventRedirect?: boolean;
      fallbackValue?: T;
      maxRetries?: number;
      retryDelay?: number;
    } = {}
  ): Promise<T> {
    const {
      preventRedirect = true,
      fallbackValue,
      maxRetries = 3,
      retryDelay = 1000
    } = options;
    
    let lastError: any = null;
    const operationStartTime = Date.now();
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        
        // Log successful recovery after retries
        if (attempt > 1) {
          console.log(`✅ [SUPABASE RECOVERY] Operation "${context.operation}" succeeded on attempt ${attempt}`);
        }
        
        return result;
        
      } catch (error) {
        lastError = error;
        
        const enhancedError = analyzeSupabaseError(error, {
          ...context,
          operationStartTime,
          retryAttempt: attempt
        });
        
        // Log the error
        this.logError(enhancedError);
        
        // Check if we should retry
        const shouldRetry = attempt < maxRetries && this.shouldRetryError(enhancedError);
        
        if (shouldRetry) {
          const delay = retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
          console.log(`🔄 [SUPABASE RETRY] Retrying in ${delay}ms... (attempt ${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // If we reach here, all retries failed
        break;
      }
    }
    
    // All retries failed - handle gracefully
    const finalError = analyzeSupabaseError(lastError, {
      ...context,
      operationStartTime,
      retryAttempt: maxRetries
    });
    
    console.error(`❌ [SUPABASE FINAL FAILURE] Operation "${context.operation}" failed after ${maxRetries} attempts`);
    
    // Prevent redirects on error if requested
    if (preventRedirect) {
      console.warn('🚫 [NO REDIRECT] Preventing redirect due to Supabase error');
      
      if (fallbackValue !== undefined) {
        console.log('🔄 [FALLBACK VALUE] Using fallback value due to persistent error');
        return fallbackValue;
      }
    }
    
    // Re-throw the error if no fallback provided
    throw finalError;
  }

  /**
   * Determine if an error should be retried
   */
  private shouldRetryError(enhancedError: EnhancedSupabaseError): boolean {
    // Retry 500 errors, timeouts, and connection issues
    const retryableTypes = [
      SupabaseErrorType.INTERNAL_SERVER_ERROR,
      SupabaseErrorType.DATABASE_CONNECTION_ERROR,
      SupabaseErrorType.NETWORK_TIMEOUT,
      SupabaseErrorType.CONNECTION_REFUSED
    ];
    
    return retryableTypes.includes(enhancedError.type);
  }

  /**
   * Get error statistics for debugging
   */
  getErrorStats(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    recentErrors: any[];
  } {
    try {
      const errorLog = JSON.parse(sessionStorage.getItem('supabase_errors') || '[]');
      const errorsByType: Record<string, number> = {};
      
      errorLog.forEach((error: any) => {
        errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
      });
      
      return {
        totalErrors: errorLog.length,
        errorsByType,
        recentErrors: errorLog.slice(-10) // Last 10 errors
      };
    } catch (error) {
      return {
        totalErrors: 0,
        errorsByType: {},
        recentErrors: []
      };
    }
  }
}

// =================== GLOBAL ERROR HANDLER INSTANCE ===================

export const globalSupabaseErrorHandler = GlobalSupabaseErrorHandler.getInstance();

// =================== CONVENIENCE FUNCTIONS ===================

/**
 * Wrap any Supabase operation with global error handling
 */
export async function withSupabaseErrorHandling<T>(
  operation: () => Promise<T>,
  context: {
    operation: string;
    table?: string;
    userId?: string;
    userEmail?: string;
  },
  options?: {
    preventRedirect?: boolean;
    fallbackValue?: T;
    maxRetries?: number;
    retryDelay?: number;
  }
): Promise<T> {
  return globalSupabaseErrorHandler.wrapSupabaseOperation(operation, context, options);
}

/**
 * Get current error statistics
 */
export function getSupabaseErrorStats() {
  return globalSupabaseErrorHandler.getErrorStats();
}

// =================== BROWSER CONSOLE HELPERS ===================

// Add global debugging functions to window in development
if (typeof window !== 'undefined' && !import.meta.env.PROD) {
  (window as any).getSupabaseErrorStats = getSupabaseErrorStats;
  (window as any).clearSupabaseErrors = () => {
    sessionStorage.removeItem('supabase_errors');
    console.log('✅ Supabase error log cleared');
  };
  
  console.log('🔧 [DEBUG] Supabase error debugging functions available:');
  console.log('  - getSupabaseErrorStats() - View error statistics');
  console.log('  - clearSupabaseErrors() - Clear error log');
}