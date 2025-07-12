/**
 * Centralized Supabase Error Handler
 *
 * This module provides comprehensive error handling for Supabase operations,
 * with specific detection and user-friendly messages for common issues like
 * CORS problems, RLS policy violations, authentication errors, and network issues.
 */

import { PostgrestError, AuthError } from '@supabase/supabase-js';
import { toast } from '../components/ui/use-toast';

// Error types for better categorization
export enum SupabaseErrorType {
  CORS = 'CORS',
  RLS = 'RLS',
  AUTH = 'AUTH',
  NETWORK = 'NETWORK',
  PERMISSION = 'PERMISSION',
  VALIDATION = 'VALIDATION',
  RATE_LIMIT = 'RATE_LIMIT',
  DATABASE = 'DATABASE',
  UNKNOWN = 'UNKNOWN',
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Enhanced error information interface
export interface EnhancedError {
  type: SupabaseErrorType;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  suggestions: string[];
  technicalDetails?: any;
  shouldRetry: boolean;
  retryDelay?: number;
  logToConsole: boolean;
  showToast: boolean;
  context?: string;
}

// CORS-specific error patterns
const CORS_PATTERNS = [
  /blocked by CORS policy/i,
  /access-control-allow-origin/i,
  /cors/i,
  /cross-origin/i,
  /preflight/i,
  /network error/i,
  /failed to fetch/i,
];

// RLS-specific error patterns
const RLS_PATTERNS = [
  /row level security/i,
  /rls/i,
  /policy/i,
  /insufficient privilege/i,
  /permission denied/i,
  /not allowed/i,
  /access denied/i,
  /violates row-level security/i,
];

// Authentication error patterns
const AUTH_PATTERNS = [
  /invalid.*credentials/i,
  /authentication.*failed/i,
  /invalid.*token/i,
  /token.*expired/i,
  /session.*expired/i,
  /unauthorized/i,
  /invalid.*refresh.*token/i,
  /email.*not.*confirmed/i,
  /user.*not.*found/i,
  /invalid.*email/i,
  /password.*too.*weak/i,
  /signup.*disabled/i,
];

// Rate limiting error patterns
const RATE_LIMIT_PATTERNS = [
  /rate.*limit/i,
  /too.*many.*requests/i,
  /quota.*exceeded/i,
  /throttled/i,
  /429/i,
];

// Network error patterns
const NETWORK_PATTERNS = [
  /network.*error/i,
  /connection.*failed/i,
  /timeout/i,
  /unreachable/i,
  /offline/i,
  /no.*internet/i,
  /dns.*error/i,
];

// Database error patterns
const DATABASE_PATTERNS = [
  /database.*error/i,
  /connection.*pool/i,
  /deadlock/i,
  /constraint.*violation/i,
  /foreign.*key/i,
  /unique.*constraint/i,
  /check.*constraint/i,
  /not.*null.*violation/i,
];

/**
 * Determine error type based on error message and code
 */
function determineErrorType(error: any): SupabaseErrorType {
  const message = error?.message || error?.details || String(error);
  const code = error?.code || error?.status;

  // Check for CORS errors first (most common deployment issue)
  if (CORS_PATTERNS.some(pattern => pattern.test(message))) {
    return SupabaseErrorType.CORS;
  }

  // Check for RLS policy violations
  if (RLS_PATTERNS.some(pattern => pattern.test(message))) {
    return SupabaseErrorType.RLS;
  }

  // Check for authentication errors
  if (AUTH_PATTERNS.some(pattern => pattern.test(message))) {
    return SupabaseErrorType.AUTH;
  }

  // Check for rate limiting
  if (RATE_LIMIT_PATTERNS.some(pattern => pattern.test(message)) || code === 429) {
    return SupabaseErrorType.RATE_LIMIT;
  }

  // Check for network errors
  if (NETWORK_PATTERNS.some(pattern => pattern.test(message))) {
    return SupabaseErrorType.NETWORK;
  }

  // Check for database errors
  if (DATABASE_PATTERNS.some(pattern => pattern.test(message))) {
    return SupabaseErrorType.DATABASE;
  }

  // Check for permission errors
  if (code === 403 || message.includes('permission') || message.includes('forbidden')) {
    return SupabaseErrorType.PERMISSION;
  }

  // Check for validation errors
  if (code === 400 || message.includes('validation') || message.includes('invalid')) {
    return SupabaseErrorType.VALIDATION;
  }

  return SupabaseErrorType.UNKNOWN;
}

/**
 * Get error severity based on type and context
 */
function getErrorSeverity(type: SupabaseErrorType, context?: string): ErrorSeverity {
  switch (type) {
    case SupabaseErrorType.CORS:
      return ErrorSeverity.CRITICAL; // Blocks all functionality
    case SupabaseErrorType.AUTH:
      return context === 'login' ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM;
    case SupabaseErrorType.RLS:
      return ErrorSeverity.HIGH; // Security-related
    case SupabaseErrorType.NETWORK:
      return ErrorSeverity.MEDIUM;
    case SupabaseErrorType.RATE_LIMIT:
      return ErrorSeverity.MEDIUM;
    case SupabaseErrorType.DATABASE:
      return ErrorSeverity.HIGH;
    case SupabaseErrorType.PERMISSION:
      return ErrorSeverity.HIGH;
    case SupabaseErrorType.VALIDATION:
      return ErrorSeverity.LOW;
    default:
      return ErrorSeverity.MEDIUM;
  }
}

/**
 * Get user-friendly error message and suggestions
 */
function getErrorDetails(
  type: SupabaseErrorType,
  originalError: any
): {
  message: string;
  suggestions: string[];
  shouldRetry: boolean;
  retryDelay?: number;
} {
  switch (type) {
    case SupabaseErrorType.CORS:
      return {
        message: 'Connection blocked by browser security policy',
        suggestions: [
          'Check if your Supabase URL is correct in environment variables',
          'Verify your domain is added to Supabase allowed origins',
          'Try refreshing the page or clearing browser cache',
          'Contact support if this persists',
        ],
        shouldRetry: true,
        retryDelay: 2000,
      };

    case SupabaseErrorType.RLS:
      return {
        message: 'Access denied due to security policies',
        suggestions: [
          'You may not have permission to access this data',
          'Try logging out and logging back in',
          'Contact your administrator if you should have access',
          'Check if your user role is configured correctly',
        ],
        shouldRetry: false,
      };

    case SupabaseErrorType.AUTH:
      const authMessage = originalError?.message || '';
      if (authMessage.includes('Invalid login credentials')) {
        return {
          message: 'Invalid email or password',
          suggestions: [
            'Double-check your email address and password',
            'Make sure Caps Lock is not enabled',
            'Try the "Forgot Password" link if needed',
            'Contact support if you continue having issues',
          ],
          shouldRetry: false,
        };
      }
      if (authMessage.includes('Email not confirmed')) {
        return {
          message: 'Please confirm your email address',
          suggestions: [
            'Check your email for a confirmation link',
            'Check your spam/junk folder',
            'Request a new confirmation email',
            "Contact support if you didn't receive the email",
          ],
          shouldRetry: false,
        };
      }
      return {
        message: 'Authentication failed',
        suggestions: [
          'Try logging out and logging back in',
          'Clear your browser cache and cookies',
          'Check your internet connection',
          'Contact support if the issue persists',
        ],
        shouldRetry: true,
        retryDelay: 1000,
      };

    case SupabaseErrorType.NETWORK:
      return {
        message: 'Network connection problem',
        suggestions: [
          'Check your internet connection',
          'Try refreshing the page',
          "Disable VPN if you're using one",
          'Try again in a few moments',
        ],
        shouldRetry: true,
        retryDelay: 3000,
      };

    case SupabaseErrorType.RATE_LIMIT:
      return {
        message: 'Too many requests - please wait',
        suggestions: [
          'Please wait a moment before trying again',
          'Avoid rapid clicking or refreshing',
          'Try again in a few minutes',
          'Contact support if this happens frequently',
        ],
        shouldRetry: true,
        retryDelay: 5000,
      };

    case SupabaseErrorType.DATABASE:
      return {
        message: 'Database error occurred',
        suggestions: [
          'Try the action again in a moment',
          'Check if all required fields are filled',
          'Contact support if the error persists',
          'Save your work before retrying',
        ],
        shouldRetry: true,
        retryDelay: 2000,
      };

    case SupabaseErrorType.PERMISSION:
      return {
        message: 'Insufficient permissions',
        suggestions: [
          "You don't have permission for this action",
          'Contact your administrator',
          "Check if you're logged in with the correct account",
          'Try logging out and back in',
        ],
        shouldRetry: false,
      };

    case SupabaseErrorType.VALIDATION:
      return {
        message: 'Invalid data provided',
        suggestions: [
          'Check all required fields are filled correctly',
          'Verify email addresses are valid',
          'Check for any formatting requirements',
          'Try again with corrected information',
        ],
        shouldRetry: false,
      };

    default:
      return {
        message: 'An unexpected error occurred',
        suggestions: [
          'Try refreshing the page',
          'Check your internet connection',
          'Try again in a few moments',
          'Contact support if the issue persists',
        ],
        shouldRetry: true,
        retryDelay: 2000,
      };
  }
}

/**
 * Main error handler function
 */
export function handleSupabaseError(
  error: any,
  context?: string,
  options?: {
    showToast?: boolean;
    logToConsole?: boolean;
    customMessage?: string;
  }
): EnhancedError {
  const { showToast = true, logToConsole = true, customMessage } = options || {};

  // Determine error type and severity
  const errorType = determineErrorType(error);
  const severity = getErrorSeverity(errorType, context);
  const details = getErrorDetails(errorType, error);

  // Create enhanced error object
  const enhancedError: EnhancedError = {
    type: errorType,
    severity,
    message: details.message,
    userMessage: customMessage || details.message,
    suggestions: details.suggestions,
    technicalDetails: {
      originalError: error,
      code: error?.code || error?.status,
      message: error?.message || error?.details,
      context,
    },
    shouldRetry: details.shouldRetry,
    retryDelay: details.retryDelay,
    logToConsole,
    showToast,
    context,
  };

  // Log to console if enabled
  if (logToConsole) {
    const logLevel =
      severity === ErrorSeverity.CRITICAL
        ? 'error'
        : severity === ErrorSeverity.HIGH
        ? 'error'
        : 'warn';

    console[logLevel](`[Supabase Error - ${errorType}]`, {
      message: enhancedError.message,
      context,
      severity,
      originalError: error,
      suggestions: enhancedError.suggestions,
      timestamp: new Date().toISOString(),
    });
  }

  // Show toast notification if enabled
  if (showToast) {
    const toastVariant =
      severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.HIGH
        ? 'destructive'
        : 'default';

    toast({
      title: `${errorType} Error`,
      description: enhancedError.userMessage,
      variant: toastVariant,
      duration: severity === ErrorSeverity.CRITICAL ? 10000 : 5000,
    });
  }

  return enhancedError;
}

/**
 * Wrapper for Supabase operations with automatic error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: string,
  options?: {
    showToast?: boolean;
    logToConsole?: boolean;
    customMessage?: string;
    maxRetries?: number;
  }
): Promise<{ data: T | null; error: EnhancedError | null }> {
  const { maxRetries = 1 } = options || {};
  let lastError: EnhancedError | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation();
      return { data: result, error: null };
    } catch (error) {
      const enhancedError = handleSupabaseError(error, context, {
        ...options,
        // Only show toast on final attempt
        showToast: attempt === maxRetries ? options?.showToast : false,
      });

      lastError = enhancedError;

      // Only retry if the error suggests it and we haven't exceeded max retries
      if (enhancedError.shouldRetry && attempt < maxRetries) {
        if (enhancedError.retryDelay) {
          await new Promise(resolve => setTimeout(resolve, enhancedError.retryDelay));
        }
        continue;
      }

      break;
    }
  }

  return { data: null, error: lastError };
}

/**
 * Quick error detection utilities
 */
export const isSupabaseError = (error: any): error is PostgrestError | AuthError => {
  return error && (error.code !== undefined || error.message !== undefined);
};

export const isCORSError = (error: any): boolean => {
  return determineErrorType(error) === SupabaseErrorType.CORS;
};

export const isRLSError = (error: any): boolean => {
  return determineErrorType(error) === SupabaseErrorType.RLS;
};

export const isAuthError = (error: any): boolean => {
  return determineErrorType(error) === SupabaseErrorType.AUTH;
};

export const isNetworkError = (error: any): boolean => {
  return determineErrorType(error) === SupabaseErrorType.NETWORK;
};

/**
 * Debug helper to test error handling
 */
export const debugErrorHandling = () => {
  console.log('🔍 Testing Supabase Error Handler...');

  // Test different error types
  const testErrors = [
    { message: 'blocked by CORS policy', context: 'CORS test' },
    { message: 'violates row-level security policy', context: 'RLS test' },
    { message: 'Invalid login credentials', context: 'Auth test' },
    { message: 'network error', context: 'Network test' },
    { message: 'too many requests', context: 'Rate limit test' },
  ];

  testErrors.forEach(({ message, context }) => {
    const error = new Error(message);
    handleSupabaseError(error, context, { showToast: false });
  });

  console.log('✅ Error handling tests completed');
};

// Export error type constants for use in other modules
export { SupabaseErrorType, ErrorSeverity };
