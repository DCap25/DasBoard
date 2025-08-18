/**
 * Enhanced Error Handling Utilities for The DAS Board
 *
 * FEATURES IMPLEMENTED:
 * - Safe API call wrappers with automatic error handling
 * - State management error boundaries and recovery
 * - TypeScript-safe error types and utilities
 * - Secure error reporting and logging
 * - Retry mechanisms with exponential backoff
 * - Error recovery strategies
 */

import { QueryClient } from '@tanstack/react-query';
import {
  SecureErrorLogger,
  ErrorSeverity,
  type SafeErrorInfo,
  type ErrorType,
} from '../components/ErrorBoundary';

// =================== API ERROR HANDLING ===================

/**
 * Enhanced API error types with security considerations
 */
export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: Record<string, any>;
  retryable?: boolean;
  timestamp?: string;
}

/**
 * API response wrapper with error handling
 */
export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
  success: boolean;
  timestamp: string;
}

/**
 * Retry configuration for API calls
 */
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryableStatuses: number[];
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

/**
 * Safe API call wrapper with comprehensive error handling
 */
async function safeApiCall<T>(
  apiFunction: () => Promise<T>,
  options: {
    retryConfig?: Partial<RetryConfig>;
    timeout?: number;
    onError?: (error: SafeErrorInfo) => void;
    onRetry?: (attempt: number, error: ApiError) => void;
    identifier?: string;
  } = {}
): Promise<ApiResponse<T>> {
  const {
    retryConfig = {},
    timeout = 30000,
    onError,
    onRetry,
    identifier = 'UnknownAPI',
  } = options;

  const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  const timestamp = new Date().toISOString();

  let lastError: ApiError | null = null;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      // Implement timeout wrapper
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`API call timeout after ${timeout}ms`));
        }, timeout);
      });

      const apiPromise = apiFunction();
      const data = await Promise.race([apiPromise, timeoutPromise]);

      // Success case
      return {
        data,
        success: true,
        timestamp,
      };
    } catch (error) {
      const apiError = createApiError(error, attempt, identifier);
      lastError = apiError;

      // Create safe error info for logging
      const safeError = SecureErrorLogger.createSafeErrorInfo(apiError, undefined, {
        attempt,
        maxAttempts: config.maxAttempts,
        identifier,
        apiFunction: apiFunction.name || 'anonymous',
      });

      // Log the error
      SecureErrorLogger.logError(safeError);

      // Call custom error handler
      if (onError) {
        onError(safeError);
      }

      // Check if we should retry
      const shouldRetry =
        attempt < config.maxAttempts && isRetryableError(apiError, config.retryableStatuses);

      if (shouldRetry) {
        // Calculate delay with exponential backoff
        const delay = Math.min(
          config.baseDelay * Math.pow(config.backoffFactor, attempt - 1),
          config.maxDelay
        );

        console.log(
          `API call failed, retrying in ${delay}ms (attempt ${attempt}/${config.maxAttempts})`
        );

        // Call retry handler
        if (onRetry) {
          onRetry(attempt, apiError);
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // No more retries, return error
      break;
    }
  }

  // All retries exhausted, return final error
  return {
    error: lastError || new Error('Unknown API error'),
    success: false,
    timestamp,
  };
}

/**
 * Create standardized API error from any error type
 */
function createApiError(error: any, attempt: number, identifier: string): ApiError {
  let apiError: ApiError;

  if (error instanceof Error) {
    apiError = error as ApiError;
  } else {
    apiError = new Error(String(error)) as ApiError;
  }

  // Enhance error with additional context
  apiError.timestamp = new Date().toISOString();
  apiError.details = {
    attempt,
    identifier,
    originalType: typeof error,
    originalName: error?.name,
    ...apiError.details,
  };

  // Determine if error is retryable
  if (apiError.retryable === undefined) {
    apiError.retryable = isRetryableError(apiError, DEFAULT_RETRY_CONFIG.retryableStatuses);
  }

  return apiError;
}

/**
 * Check if an error is retryable
 */
function isRetryableError(error: ApiError, retryableStatuses: number[]): boolean {
  // Network errors are usually retryable
  if (
    error.message?.toLowerCase().includes('network') ||
    error.message?.toLowerCase().includes('timeout') ||
    error.message?.toLowerCase().includes('connection')
  ) {
    return true;
  }

  // Check HTTP status codes
  if (error.status && retryableStatuses.includes(error.status)) {
    return true;
  }

  // Specific error codes that are retryable
  const retryableCodes = ['NETWORK_ERROR', 'TIMEOUT', 'CONNECTION_ERROR', 'RATE_LIMITED'];
  if (error.code && retryableCodes.includes(error.code)) {
    return true;
  }

  return false;
}

// =================== STATE MANAGEMENT ERROR HANDLING ===================

/**
 * Safe state update wrapper for React components
 */
function safeStateUpdate<T>(
  setState: React.Dispatch<React.SetStateAction<T>>,
  newState: T | ((prevState: T) => T),
  componentName?: string
): void {
  try {
    setState(newState);
  } catch (error) {
    const safeError = SecureErrorLogger.createSafeErrorInfo(
      error instanceof Error ? error : new Error(String(error)),
      undefined,
      {
        operation: 'setState',
        component: componentName || 'Unknown',
        stateType: typeof newState,
      }
    );

    SecureErrorLogger.logError(safeError);

    // Don't re-throw to prevent component crash
    console.warn('State update failed, but component will continue functioning');
  }
}

/**
 * Safe effect cleanup wrapper
 */
function safeCleanup(cleanupFunction: () => void, componentName?: string): void {
  try {
    cleanupFunction();
  } catch (error) {
    const safeError = SecureErrorLogger.createSafeErrorInfo(
      error instanceof Error ? error : new Error(String(error)),
      undefined,
      {
        operation: 'cleanup',
        component: componentName || 'Unknown',
      }
    );

    SecureErrorLogger.logError(safeError);
    // Don't re-throw during cleanup
  }
}

/**
 * Safe context value provider wrapper
 */
function safeContextValue<T>(getValue: () => T, fallbackValue: T, contextName?: string): T {
  try {
    return getValue();
  } catch (error) {
    const safeError = SecureErrorLogger.createSafeErrorInfo(
      error instanceof Error ? error : new Error(String(error)),
      undefined,
      {
        operation: 'getContextValue',
        context: contextName || 'Unknown',
      }
    );

    SecureErrorLogger.logError(safeError);

    console.warn(`Context value retrieval failed for ${contextName}, using fallback`);
    return fallbackValue;
  }
}

// =================== REACT QUERY ERROR HANDLING ===================

/**
 * Enhanced error handling for React Query
 */
function createSafeQueryClient(): QueryClient {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          // Don't retry on authentication errors
          if ((error as any)?.status === 401 || (error as any)?.status === 403) {
            return false;
          }

          // Retry up to 3 times for other errors
          return failureCount < 3;
        },
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        networkMode: 'always',
      },
      mutations: {
        retry: (failureCount, error) => {
          // Don't retry mutations that are likely to have side effects
          const nonRetryableStatuses = [400, 401, 403, 409, 422];
          if (nonRetryableStatuses.includes((error as any)?.status)) {
            return false;
          }

          return failureCount < 2;
        },
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
        networkMode: 'always',
      },
    },
    queryCache: {
      onError: (error, query) => {
        const safeError = SecureErrorLogger.createSafeErrorInfo(
          error instanceof Error ? error : new Error(String(error)),
          undefined,
          {
            operation: 'query',
            queryKey: query.queryKey,
            queryHash: query.queryHash,
          }
        );

        SecureErrorLogger.logError(safeError);
      },
    },
    mutationCache: {
      onError: (error, variables, context, mutation) => {
        const safeError = SecureErrorLogger.createSafeErrorInfo(
          error instanceof Error ? error : new Error(String(error)),
          undefined,
          {
            operation: 'mutation',
            mutationKey: mutation.options.mutationKey,
            variablesType: typeof variables,
          }
        );

        SecureErrorLogger.logError(safeError);
      },
    },
  });

  // Override methods that might not exist in all versions
  const clientWithFallbacks = queryClient as any;
  
  if (typeof clientWithFallbacks.resumePausedMutations !== 'function') {
    clientWithFallbacks.resumePausedMutations = () => {
      console.warn('resumePausedMutations not available in this version of React Query');
      return Promise.resolve();
    };
  }
  
  if (typeof clientWithFallbacks.pauseMutations !== 'function') {
    clientWithFallbacks.pauseMutations = () => {
      console.warn('pauseMutations not available in this version of React Query');
    };
  }

  return queryClient;
}

// =================== FORM ERROR HANDLING ===================

/**
 * Form validation error handling
 */
export interface FormError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Safe form submission wrapper
 */
async function safeFormSubmit<T>(
  submitFunction: () => Promise<T>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (errors: FormError[]) => void;
    onValidationError?: (errors: FormError[]) => void;
    formName?: string;
  } = {}
): Promise<{ success: boolean; data?: T; errors?: FormError[] }> {
  const { onSuccess, onError, onValidationError, formName = 'Unknown' } = options;

  try {
    const data = await submitFunction();

    if (onSuccess) {
      onSuccess(data);
    }

    return { success: true, data };
  } catch (error) {
    const formErrors = extractFormErrors(error);

    const safeError = SecureErrorLogger.createSafeErrorInfo(
      error instanceof Error ? error : new Error(String(error)),
      undefined,
      {
        operation: 'formSubmit',
        formName,
        errorCount: formErrors.length,
      }
    );

    SecureErrorLogger.logError(safeError);

    // Check if these are validation errors
    const isValidationError = formErrors.some(
      err =>
        err.code?.includes('validation') ||
        err.message.toLowerCase().includes('required') ||
        err.message.toLowerCase().includes('invalid')
    );

    if (isValidationError && onValidationError) {
      onValidationError(formErrors);
    } else if (onError) {
      onError(formErrors);
    }

    return { success: false, errors: formErrors };
  }
}

/**
 * Extract form errors from various error formats
 */
function extractFormErrors(error: any): FormError[] {
  const errors: FormError[] = [];

  // Handle Supabase errors
  if (error?.details) {
    errors.push({
      field: 'general',
      message: error.message || 'Submission failed',
      code: error.code,
    });
  }
  // Handle validation library errors (e.g., Zod)
  else if (error?.issues && Array.isArray(error.issues)) {
    error.issues.forEach((issue: any) => {
      errors.push({
        field: issue.path?.join('.') || 'unknown',
        message: issue.message || 'Validation failed',
        code: issue.code,
      });
    });
  }
  // Handle form library errors (e.g., React Hook Form)
  else if (error?.inner && Array.isArray(error.inner)) {
    error.inner.forEach((inner: any) => {
      errors.push({
        field: inner.path || 'unknown',
        message: inner.message || 'Validation failed',
        code: inner.type,
      });
    });
  }
  // Handle generic errors
  else {
    errors.push({
      field: 'general',
      message: error?.message || 'An unexpected error occurred',
      code: error?.code || 'UNKNOWN',
    });
  }

  return errors;
}

// =================== UTILITY FUNCTIONS ===================

/**
 * Debounced error reporter to prevent spam
 */
class DebouncedErrorReporter {
  private static instance: DebouncedErrorReporter;
  private reportQueue = new Map<string, SafeErrorInfo>();
  private timeoutId: NodeJS.Timeout | null = null;
  private readonly debounceDelay = 2000; // 2 seconds

  static getInstance(): DebouncedErrorReporter {
    if (!DebouncedErrorReporter.instance) {
      DebouncedErrorReporter.instance = new DebouncedErrorReporter();
    }
    return DebouncedErrorReporter.instance;
  }

  reportError(error: SafeErrorInfo): void {
    // Use error type + message as key to deduplicate similar errors
    const key = `${error.type}_${error.message.substring(0, 100)}`;

    this.reportQueue.set(key, error);

    // Clear existing timeout
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    // Set new timeout to batch report errors
    this.timeoutId = setTimeout(() => {
      this.flushQueue();
    }, this.debounceDelay);
  }

  private flushQueue(): void {
    if (this.reportQueue.size === 0) return;

    console.log(`Reporting ${this.reportQueue.size} unique errors`);

    // Process each unique error
    this.reportQueue.forEach(error => {
      SecureErrorLogger.logError(error);
    });

    // Clear the queue
    this.reportQueue.clear();
    this.timeoutId = null;
  }
}

/**
 * Report error with debouncing to prevent spam
 */
function reportError(error: Error | SafeErrorInfo, context?: any): void {
  const safeError =
    error instanceof Error
      ? SecureErrorLogger.createSafeErrorInfo(error, undefined, context)
      : error;

  DebouncedErrorReporter.getInstance().reportError(safeError);
}

/**
 * Create error boundary for specific use cases
 */
function createSpecializedErrorBoundary(type: 'auth' | 'api' | 'form' | 'navigation' | 'data') {
  const config = {
    auth: {
      identifier: 'AuthBoundary',
      level: 'section' as const,
      maxRetries: 1,
      onError: (error: SafeErrorInfo) => {
        if (error.type === ErrorType.AUTHENTICATION) {
          // Clear auth state and redirect to login
          localStorage.removeItem('supabase.auth.token');
          window.location.href = '/auth';
        }
      },
    },
    api: {
      identifier: 'ApiBoundary',
      level: 'component' as const,
      maxRetries: 3,
      retryDelay: 2000,
      onError: (error: SafeErrorInfo) => {
        if (error.type === ErrorType.NETWORK) {
          // Show network status indicator
          console.log('Network error detected, showing indicator');
        }
      },
    },
    form: {
      identifier: 'FormBoundary',
      level: 'component' as const,
      maxRetries: 0, // Don't auto-retry form submissions
      onError: (error: SafeErrorInfo) => {
        // Reset form state on critical errors
        console.log('Form error detected, may need to reset form');
      },
    },
    navigation: {
      identifier: 'NavigationBoundary',
      level: 'section' as const,
      maxRetries: 2,
      onError: (error: SafeErrorInfo) => {
        // Fallback to home page on navigation errors
        if (error.severity === ErrorSeverity.CRITICAL) {
          window.location.href = '/';
        }
      },
    },
    data: {
      identifier: 'DataBoundary',
      level: 'component' as const,
      maxRetries: 3,
      retryDelay: 1000,
      onError: (error: SafeErrorInfo) => {
        // Clear stale cache on data errors
        console.log('Data error detected, may need to clear cache');
      },
    },
  };

  return config[type];
}

// =================== EXPORTS ===================

export {
  DebouncedErrorReporter,
  safeApiCall,
  safeStateUpdate,
  safeCleanup,
  safeContextValue,
  createSafeQueryClient,
  safeFormSubmit,
  reportError,
  createSpecializedErrorBoundary,
};

export type { ApiError, ApiResponse, RetryConfig, FormError };
