/**
 * Comprehensive Error Boundary Component for The DAS Board
 *
 * SECURITY FEATURES IMPLEMENTED:
 * - Secure error logging without sensitive data exposure
 * - Production-safe error messages
 * - Comprehensive error classification and recovery
 * - User-friendly fallback UI components
 * - Memory leak prevention with proper cleanup
 * - Development vs production error handling
 * - Retry mechanisms for transient errors
 * - Error reporting with sanitized context
 */

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCcw, Home, Bug, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

// =================== ERROR TYPES AND INTERFACES ===================

/**
 * Comprehensive error classification system
 * Helps determine appropriate recovery strategies
 * 
 * FIXED: Moved enum definition to ensure it's available at runtime
 * and prevent ReferenceError: ErrorType is not defined
 */
export enum ErrorType {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  RUNTIME = 'runtime',
  COMPONENT = 'component',
  STATE_MANAGEMENT = 'state_management',
  API = 'api',
  UNKNOWN = 'unknown',
}

// Ensure ErrorType is available immediately by creating a reference
const ErrorTypeRef = ErrorType;

// Runtime verification that ErrorType enum is properly loaded
if (typeof ErrorType === 'undefined' || !ErrorType.NETWORK) {
  console.error('CRITICAL: ErrorType enum failed to load properly in ErrorBoundary.tsx');
  throw new Error('ErrorType enum initialization failed - check for circular dependencies or module loading issues');
}

// RUNTIME SAFETY: Helper function to safely access enum values
const safeGetErrorType = (key: keyof typeof ErrorType): string => {
  try {
    if (typeof ErrorType === 'undefined' || !ErrorType) {
      console.warn(`[RUNTIME_SAFETY] ErrorType undefined, using fallback for ${key}`);
      return key.toLowerCase();
    }
    return ErrorType[key] || key.toLowerCase();
  } catch (error) {
    console.error(`[RUNTIME_SAFETY] Error accessing ErrorType.${key}:`, error);
    return key.toLowerCase();
  }
};

// RUNTIME SAFETY: Helper function to safely access ErrorSeverity values
const safeGetErrorSeverity = (key: keyof typeof ErrorSeverity): string => {
  try {
    if (typeof ErrorSeverity === 'undefined' || !ErrorSeverity) {
      console.warn(`[RUNTIME_SAFETY] ErrorSeverity undefined, using fallback for ${key}`);
      return key.toLowerCase();
    }
    return ErrorSeverity[key] || key.toLowerCase();
  } catch (error) {
    console.error(`[RUNTIME_SAFETY] Error accessing ErrorSeverity.${key}:`, error);
    return key.toLowerCase();
  }
};

/**
 * Error severity levels for appropriate user messaging
 */
export enum ErrorSeverity {
  LOW = 'low', // Minor issues, app continues functioning
  MEDIUM = 'medium', // Noticeable issues, some features affected
  HIGH = 'high', // Major issues, significant functionality lost
  CRITICAL = 'critical', // App-breaking issues, requires immediate attention
}

/**
 * Sanitized error information safe for logging and display
 */
export interface SafeErrorInfo {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  timestamp: string;
  componentStack?: string;
  errorBoundary?: string;
  userAgent?: string;
  url?: string;
  userId?: string; // Only if not sensitive
  sessionId?: string; // Only if not sensitive
  retryable: boolean;
  recoverable: boolean;
}

/**
 * Error boundary state interface
 */
export interface ErrorBoundaryState {
  hasError: boolean;
  error: SafeErrorInfo | null;
  retryCount: number;
  lastRetryTime: number;
  errorId: string | null;
}

/**
 * Error boundary configuration options
 */
export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: SafeErrorInfo, retry: () => void) => ReactNode;
  onError?: (error: SafeErrorInfo) => void;
  enableRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  level?: 'page' | 'section' | 'component';
  identifier?: string;
  isolateErrors?: boolean;
}

// =================== SECURE ERROR LOGGING ===================

/**
 * Secure logger that sanitizes sensitive information
 * Ensures no secrets, tokens, or personal data are exposed
 */
class SecureErrorLogger {
  private static readonly SENSITIVE_PATTERNS = [
    /password/i,
    /token/i,
    /secret/i,
    /key/i,
    /auth/i,
    /session/i,
    /cookie/i,
    /email/i,
    /phone/i,
    /ssn/i,
    /credit/i,
    /card/i,
    /account/i,
    /api[_-]?key/i,
    /bearer/i,
    /jwt/i,
    /refresh/i,
    /access[_-]?token/i,
  ];

  /**
   * Sanitize object by removing sensitive fields and truncating large values
   */
  private static sanitizeObject(obj: any, maxDepth: number = 3, currentDepth: number = 0): any {
    if (currentDepth >= maxDepth) {
      return '[Max Depth Reached]';
    }

    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      // Truncate very long strings
      if (obj.length > 1000) {
        return obj.substring(0, 1000) + '... [Truncated]';
      }

      // Check for sensitive patterns
      for (const pattern of this.SENSITIVE_PATTERNS) {
        if (pattern.test(obj)) {
          return '[REDACTED]';
        }
      }

      return obj;
    }

    if (typeof obj === 'number' || typeof obj === 'boolean') {
      return obj;
    }

    if (Array.isArray(obj)) {
      // Limit array size
      const maxArraySize = 10;
      const sanitizedArray = obj
        .slice(0, maxArraySize)
        .map(item => this.sanitizeObject(item, maxDepth, currentDepth + 1));

      if (obj.length > maxArraySize) {
        sanitizedArray.push(`... [${obj.length - maxArraySize} more items]`);
      }

      return sanitizedArray;
    }

    if (typeof obj === 'object') {
      const sanitized: any = {};
      const keys = Object.keys(obj);

      // Limit object size
      const maxKeys = 20;
      const keysToProcess = keys.slice(0, maxKeys);

      for (const key of keysToProcess) {
        // Check if key contains sensitive information
        const isSensitiveKey = this.SENSITIVE_PATTERNS.some(pattern => pattern.test(key));

        if (isSensitiveKey) {
          sanitized[key] = '[REDACTED]';
        } else {
          try {
            sanitized[key] = this.sanitizeObject(obj[key], maxDepth, currentDepth + 1);
          } catch (error) {
            sanitized[key] = '[Sanitization Error]';
          }
        }
      }

      if (keys.length > maxKeys) {
        sanitized['...'] = `[${keys.length - maxKeys} more properties]`;
      }

      return sanitized;
    }

    // For functions, symbols, etc.
    return '[Non-serializable]';
  }

  /**
   * Create safe error information from raw error
   * RUNTIME SAFETY: All variables checked for undefined before usage
   */
  static createSafeErrorInfo(error: Error, errorInfo?: ErrorInfo, context?: any): SafeErrorInfo {
    // RUNTIME SAFETY: Ensure error object is valid
    const safeError = error || new Error('Unknown error occurred');
    
    // RUNTIME SAFETY: Generate error ID with fallback
    let errorId: string;
    try {
      errorId = `error_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    } catch (idError) {
      console.warn('[RUNTIME_SAFETY] Error generating error ID, using fallback');
      errorId = `error_fallback_${Date.now()}`;
    }
    
    // RUNTIME SAFETY: Generate timestamp with fallback
    let timestamp: string;
    try {
      timestamp = new Date().toISOString();
    } catch (timeError) {
      console.warn('[RUNTIME_SAFETY] Error generating timestamp, using fallback');
      timestamp = new Date(Date.now()).toString();
    }

    // RUNTIME SAFETY: Classify error type with fallback
    let errorType: ErrorType;
    try {
      errorType = this.classifyError(safeError);
    } catch (classifyError) {
      console.warn('[RUNTIME_SAFETY] Error classifying error type, using fallback');
      errorType = safeGetErrorType('UNKNOWN') as ErrorType;
    }
    
    // RUNTIME SAFETY: Determine severity with fallback
    let severity: ErrorSeverity;
    try {
      severity = this.determineSeverity(safeError, errorType);
    } catch (severityError) {
      console.warn('[RUNTIME_SAFETY] Error determining severity, using fallback');
      severity = safeGetErrorSeverity('HIGH') as ErrorSeverity;
    }

    // RUNTIME SAFETY: Create user-friendly message with fallback
    let userMessage: string;
    try {
      userMessage = this.generateUserMessage(errorType, severity);
    } catch (messageError) {
      console.warn('[RUNTIME_SAFETY] Error generating user message, using fallback');
      userMessage = 'An unexpected error occurred. Please try again or contact support.';
    }

    // RUNTIME SAFETY: Sanitize error message with fallback
    let sanitizedMessage: string;
    try {
      sanitizedMessage = this.sanitizeString(safeError.message || 'Unknown error');
    } catch (sanitizeError) {
      console.warn('[RUNTIME_SAFETY] Error sanitizing message, using fallback');
      sanitizedMessage = 'Error message sanitization failed';
    }

    // RUNTIME SAFETY: Sanitize component stack with fallback
    let sanitizedComponentStack: string | undefined;
    try {
      sanitizedComponentStack = errorInfo?.componentStack
        ? this.sanitizeString(errorInfo.componentStack)
        : undefined;
    } catch (stackError) {
      console.warn('[RUNTIME_SAFETY] Error sanitizing component stack');
      sanitizedComponentStack = undefined;
    }

    // RUNTIME SAFETY: Get safe context information with fallback
    let safeContext: any;
    try {
      safeContext = context ? this.sanitizeObject(context) : undefined;
    } catch (contextError) {
      console.warn('[RUNTIME_SAFETY] Error sanitizing context');
      safeContext = undefined;
    }

    // RUNTIME SAFETY: Get safe user and session IDs with fallbacks
    let userId: string | undefined;
    let sessionId: string | undefined;
    try {
      userId = this.getSafeUserId();
      sessionId = this.getSafeSessionId();
    } catch (idError) {
      console.warn('[RUNTIME_SAFETY] Error getting user/session IDs');
      userId = undefined;
      sessionId = undefined;
    }

    // RUNTIME SAFETY: Determine retryable and recoverable status with fallbacks
    let retryable: boolean;
    let recoverable: boolean;
    try {
      retryable = this.isRetryable(errorType);
      recoverable = this.isRecoverable(errorType, severity);
    } catch (statusError) {
      console.warn('[RUNTIME_SAFETY] Error determining retry/recovery status, using defaults');
      retryable = false;
      recoverable = true;
    }

    return {
      id: errorId,
      type: errorType,
      severity,
      message: sanitizedMessage,
      userMessage,
      timestamp,
      componentStack: sanitizedComponentStack,
      errorBoundary: context?.boundaryName || 'Unknown',
      userAgent:
        typeof window !== 'undefined' ? window.navigator?.userAgent?.substring(0, 200) : undefined,
      url: typeof window !== 'undefined' ? window.location?.pathname : undefined,
      userId,
      sessionId,
      retryable,
      recoverable,
      ...safeContext,
    };
  }

  /**
   * Sanitize string content
   */
  private static sanitizeString(str: string): string {
    if (!str || typeof str !== 'string') {
      return 'Invalid string';
    }

    // Truncate very long strings
    let sanitized = str.length > 2000 ? str.substring(0, 2000) + '... [Truncated]' : str;

    // Remove potential sensitive information using patterns
    for (const pattern of this.SENSITIVE_PATTERNS) {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    }

    return sanitized;
  }

  /**
   * Classify error type based on error characteristics
   * FIXED: Added safety check to ensure ErrorType enum is available
   */
  private static classifyError(error: Error): ErrorType {
    // Safety check: Ensure ErrorType is available
    if (typeof ErrorType === 'undefined' || !ErrorType) {
      console.error('ErrorType enum is not available, using fallback');
      return 'unknown' as ErrorType;
    }

    const message = error.message?.toLowerCase() || '';
    const stack = error.stack?.toLowerCase() || '';
    const name = error.name?.toLowerCase() || '';

    // Network-related errors
    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('connection') ||
      name.includes('network')
    ) {
      return ErrorType.NETWORK;
    }

    // Authentication errors
    if (
      message.includes('auth') ||
      message.includes('login') ||
      message.includes('unauthorized') ||
      message.includes('token')
    ) {
      return ErrorType.AUTHENTICATION;
    }

    // Authorization errors
    if (
      message.includes('permission') ||
      message.includes('forbidden') ||
      message.includes('access denied') ||
      message.includes('not allowed')
    ) {
      return ErrorType.AUTHORIZATION;
    }

    // Validation errors
    if (
      message.includes('validation') ||
      message.includes('invalid') ||
      message.includes('required') ||
      message.includes('format')
    ) {
      return ErrorType.VALIDATION;
    }

    // API errors
    if (
      message.includes('api') ||
      message.includes('supabase') ||
      message.includes('database') ||
      stack.includes('apiservice')
    ) {
      return ErrorType.API;
    }

    // State management errors
    if (
      stack.includes('context') ||
      stack.includes('provider') ||
      stack.includes('reducer') ||
      message.includes('state')
    ) {
      return ErrorType.STATE_MANAGEMENT;
    }

    // Component errors
    if (
      stack.includes('component') ||
      message.includes('render') ||
      message.includes('hook') ||
      name.includes('react')
    ) {
      return ErrorType.COMPONENT;
    }

    // Runtime errors
    if (
      name.includes('reference') ||
      name.includes('type') ||
      name.includes('syntax') ||
      name.includes('range')
    ) {
      return ErrorType.RUNTIME;
    }

    return ErrorType.UNKNOWN;
  }

  /**
   * Determine error severity
   */
  private static determineSeverity(error: Error, type: ErrorType): ErrorSeverity {
    const message = error.message?.toLowerCase() || '';

    // Critical errors that break the app
    if (
      message.includes('chunk load') ||
      message.includes('script error') ||
      message.includes('loading css') ||
      type === ErrorType.AUTHENTICATION
    ) {
      return ErrorSeverity.CRITICAL;
    }

    // High severity errors
    if (
      type === ErrorType.NETWORK ||
      type === ErrorType.API ||
      type === ErrorType.STATE_MANAGEMENT
    ) {
      return ErrorSeverity.HIGH;
    }

    // Medium severity errors
    if (type === ErrorType.VALIDATION || type === ErrorType.AUTHORIZATION) {
      return ErrorSeverity.MEDIUM;
    }

    // Low severity for component-level issues
    return ErrorSeverity.LOW;
  }

  /**
   * Generate user-friendly error message
   */
  private static generateUserMessage(type: ErrorType, severity: ErrorSeverity): string {
    const messages = {
      [ErrorType.NETWORK]: {
        [ErrorSeverity.CRITICAL]:
          'Unable to connect to our servers. Please check your internet connection and try again.',
        [ErrorSeverity.HIGH]:
          'Network connection issues detected. Some features may not work properly.',
        [ErrorSeverity.MEDIUM]:
          'Slow network connection detected. Loading may take longer than usual.',
        [ErrorSeverity.LOW]: 'Minor network hiccup detected. Most features should work normally.',
      },
      [ErrorType.AUTHENTICATION]: {
        [ErrorSeverity.CRITICAL]: 'Authentication session has expired. Please log in again.',
        [ErrorSeverity.HIGH]:
          'Authentication issues detected. Please refresh the page or log in again.',
        [ErrorSeverity.MEDIUM]: 'Session verification required. Please confirm your credentials.',
        [ErrorSeverity.LOW]: 'Authentication check in progress. Please wait a moment.',
      },
      [ErrorType.AUTHORIZATION]: {
        [ErrorSeverity.CRITICAL]:
          'You do not have permission to access this area. Please contact your administrator.',
        [ErrorSeverity.HIGH]: 'Access restricted for this feature. Please check your permissions.',
        [ErrorSeverity.MEDIUM]: 'Limited access detected. Some features may be unavailable.',
        [ErrorSeverity.LOW]: 'Permission verification in progress.',
      },
      [ErrorType.VALIDATION]: {
        [ErrorSeverity.CRITICAL]:
          'Critical validation error. Please refresh the page and try again.',
        [ErrorSeverity.HIGH]: 'Data validation failed. Please check your input and try again.',
        [ErrorSeverity.MEDIUM]: 'Some information needs to be corrected before proceeding.',
        [ErrorSeverity.LOW]: 'Minor validation issue detected.',
      },
      [ErrorType.API]: {
        [ErrorSeverity.CRITICAL]:
          'Server connection lost. Please refresh the page or try again later.',
        [ErrorSeverity.HIGH]:
          'Server communication error. Some features may be temporarily unavailable.',
        [ErrorSeverity.MEDIUM]: 'Data synchronization issue. Changes may not be saved immediately.',
        [ErrorSeverity.LOW]: 'Minor server communication delay detected.',
      },
      [ErrorType.COMPONENT]: {
        [ErrorSeverity.CRITICAL]: 'Application component failed to load. Please refresh the page.',
        [ErrorSeverity.HIGH]: 'Feature temporarily unavailable due to technical issues.',
        [ErrorSeverity.MEDIUM]: 'Display issue detected. Some elements may not appear correctly.',
        [ErrorSeverity.LOW]: 'Minor display glitch detected.',
      },
      [ErrorType.STATE_MANAGEMENT]: {
        [ErrorSeverity.CRITICAL]: 'Application state corrupted. Please refresh the page.',
        [ErrorSeverity.HIGH]: 'Data synchronization error. Please refresh to restore proper state.',
        [ErrorSeverity.MEDIUM]: 'Temporary state inconsistency. Some data may appear outdated.',
        [ErrorSeverity.LOW]: 'Minor state update delay.',
      },
      [ErrorType.RUNTIME]: {
        [ErrorSeverity.CRITICAL]: 'Critical application error. Please refresh the page.',
        [ErrorSeverity.HIGH]: 'Runtime error detected. Some features may not work properly.',
        [ErrorSeverity.MEDIUM]: 'Processing error occurred. Please try the action again.',
        [ErrorSeverity.LOW]: 'Minor processing delay detected.',
      },
      [ErrorType.UNKNOWN]: {
        [ErrorSeverity.CRITICAL]:
          'Unexpected error occurred. Please refresh the page or contact support.',
        [ErrorSeverity.HIGH]:
          'Technical issue detected. Please try again or contact support if the problem persists.',
        [ErrorSeverity.MEDIUM]: 'Unexpected issue occurred. Please try the action again.',
        [ErrorSeverity.LOW]: 'Minor technical hiccup detected.',
      },
    };

    return messages[type]?.[severity] || 'An unexpected issue occurred. Please try again.';
  }

  /**
   * Determine if error is retryable
   */
  private static isRetryable(type: ErrorType): boolean {
    return [ErrorType.NETWORK, ErrorType.API, ErrorType.COMPONENT].includes(type);
  }

  /**
   * Determine if error is recoverable
   */
  private static isRecoverable(type: ErrorType, severity: ErrorSeverity): boolean {
    if (severity === ErrorSeverity.CRITICAL) {
      return type === ErrorType.NETWORK || type === ErrorType.API;
    }
    return true;
  }

  /**
   * Get safe user ID (non-sensitive identifier)
   */
  private static getSafeUserId(): string | undefined {
    try {
      // Only return a non-sensitive user identifier
      const userId = localStorage.getItem('user_id');
      return userId ? `user_${userId.substring(0, 8)}` : undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Get safe session ID (non-sensitive identifier)
   */
  private static getSafeSessionId(): string | undefined {
    try {
      // Only return a non-sensitive session identifier
      const sessionId = sessionStorage.getItem('session_id');
      return sessionId ? `session_${sessionId.substring(0, 8)}` : undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Log error securely to console and external services
   */
  static logError(safeError: SafeErrorInfo): void {
    // Always log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error Boundary - ${safeError.type.toUpperCase()}`);
      console.error('Error ID:', safeError.id);
      console.error('Severity:', safeError.severity);
      console.error('Message:', safeError.message);
      console.error('User Message:', safeError.userMessage);
      console.error('Timestamp:', safeError.timestamp);

      if (safeError.componentStack) {
        console.error('Component Stack:', safeError.componentStack);
      }

      console.error('Context:', {
        url: safeError.url,
        userAgent: safeError.userAgent,
        userId: safeError.userId,
        sessionId: safeError.sessionId,
        retryable: safeError.retryable,
        recoverable: safeError.recoverable,
      });
      console.groupEnd();
    }

    // In production, log to external service (if available)
    if (process.env.NODE_ENV === 'production') {
      try {
        // Log only essential information in production
        console.error(`[${safeError.id}] ${safeError.type}: ${safeError.userMessage}`);

        // Send to external error tracking service if configured
        if (typeof window !== 'undefined' && (window as any).errorTracker) {
          (window as any).errorTracker.captureError({
            id: safeError.id,
            type: safeError.type,
            severity: safeError.severity,
            message: safeError.userMessage, // Only user-safe message
            timestamp: safeError.timestamp,
            url: safeError.url,
            retryable: safeError.retryable,
          });
        }
      } catch (loggingError) {
        // Don't let logging errors break the app
        console.error('Error logging failed:', loggingError);
      }
    }

    // Store error in session for debugging (limited storage)
    try {
      const errorHistory = JSON.parse(sessionStorage.getItem('error_history') || '[]');
      errorHistory.push({
        id: safeError.id,
        type: safeError.type,
        severity: safeError.severity,
        userMessage: safeError.userMessage,
        timestamp: safeError.timestamp,
        url: safeError.url,
      });

      // Keep only last 10 errors
      if (errorHistory.length > 10) {
        errorHistory.shift();
      }

      sessionStorage.setItem('error_history', JSON.stringify(errorHistory));
    } catch {
      // Storage might be full or unavailable
    }
  }
}

// =================== ERROR BOUNDARY COMPONENT ===================

/**
 * Main Error Boundary Component
 * Catches unhandled React errors and provides recovery mechanisms
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
      lastRetryTime: 0,
      errorId: null,
    };
  }

  /**
   * Static method to capture errors during render
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const safeError = SecureErrorLogger.createSafeErrorInfo(error);

    return {
      hasError: true,
      error: safeError,
      errorId: safeError.id,
    };
  }

  /**
   * Component lifecycle method to handle errors
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const context = {
      boundaryName: this.props.identifier || 'UnknownBoundary',
      boundaryLevel: this.props.level || 'component',
      retryCount: this.state.retryCount,
      isolateErrors: this.props.isolateErrors,
    };

    const safeError = SecureErrorLogger.createSafeErrorInfo(error, errorInfo, context);

    // Log the error securely
    SecureErrorLogger.logError(safeError);

    // Update state with error information
    this.setState({
      error: safeError,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      try {
        // RUNTIME SAFETY: Ensure onError is actually a function before calling
        if (typeof this.props.onError === 'function') {
          this.props.onError(safeError);
        } else {
          console.warn('[RUNTIME_SAFETY] onError prop is not a function, skipping');
        }
      } catch (handlerError) {
        // FIXED: Enhanced error handling to prevent ErrorType reference issues
        console.error('Error handler itself threw an error:', handlerError);
        
        // RUNTIME SAFETY: Ensure ErrorType is available for logging
        try {
          if (typeof ErrorType !== 'undefined' && ErrorType) {
            console.error('Error classification available for debugging');
          } else {
            console.error('ErrorType enum not available - potential module loading issue');
          }
        } catch (enumCheckError) {
          console.error('[RUNTIME_SAFETY] Error checking ErrorType availability:', enumCheckError);
        }
      }
    }

    // In development, also log the original error for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('Original Error:', error);
      console.error('Error Info:', errorInfo);
    }
  }

  /**
   * Cleanup method
   */
  componentWillUnmount(): void {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  /**
   * Retry mechanism with delay and limits
   */
  private handleRetry = (): void => {
    const { maxRetries = 3, retryDelay = 1000 } = this.props;
    const now = Date.now();

    // Check retry limits
    if (this.state.retryCount >= maxRetries) {
      console.warn(`Max retries (${maxRetries}) exceeded for error boundary`);
      return;
    }

    // Prevent rapid retries
    if (now - this.state.lastRetryTime < retryDelay) {
      console.warn('Retry attempted too soon, please wait');
      return;
    }

    console.log(`Retrying error boundary (attempt ${this.state.retryCount + 1}/${maxRetries})`);

    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      retryCount: this.state.retryCount + 1,
      lastRetryTime: now,
      errorId: null,
    });
  };

  /**
   * Reset error boundary state
   */
  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      retryCount: 0,
      lastRetryTime: 0,
      errorId: null,
    });
  };

  /**
   * Navigate to home page
   */
  private handleGoHome = (): void => {
    try {
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to navigate home:', error);
      // Fallback: reload the page
      window.location.reload();
    }
  };

  /**
   * Reload the entire page
   */
  private handleReload = (): void => {
    try {
      window.location.reload();
    } catch (error) {
      console.error('Failed to reload page:', error);
    }
  };

  /**
   * Render error fallback UI
   */
  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        try {
          return this.props.fallback(this.state.error, this.handleRetry);
        } catch (fallbackError) {
          console.error('Custom fallback component threw an error:', fallbackError);
          // Fall through to default fallback
        }
      }

      // Default fallback UI based on error severity and type
      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={this.props.enableRetry !== false ? this.handleRetry : undefined}
          onReset={this.handleReset}
          onGoHome={this.handleGoHome}
          onReload={this.handleReload}
          retryCount={this.state.retryCount}
          maxRetries={this.props.maxRetries || 3}
          level={this.props.level || 'component'}
        />
      );
    }

    return this.props.children;
  }
}

// =================== ERROR FALLBACK COMPONENTS ===================

/**
 * Props for error fallback component
 */
interface ErrorFallbackProps {
  error: SafeErrorInfo;
  onRetry?: () => void;
  onReset: () => void;
  onGoHome: () => void;
  onReload: () => void;
  retryCount: number;
  maxRetries: number;
  level: 'page' | 'section' | 'component';
}

/**
 * Default error fallback component with user-friendly UI
 */
function ErrorFallback({
  error,
  onRetry,
  onReset,
  onGoHome,
  onReload,
  retryCount,
  maxRetries,
  level,
}: ErrorFallbackProps): JSX.Element {
  const canRetry = onRetry && error.retryable && retryCount < maxRetries;
  const isPageLevel = level === 'page';
  const isCritical = error.severity === ErrorSeverity.CRITICAL;

  // Different layouts based on error level
  if (isPageLevel || isCritical) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-6">{error.userMessage}</p>
          </div>

          <div className="space-y-3">
            {canRetry && (
              <Button onClick={onRetry} className="w-full" variant="default">
                <RefreshCcw className="h-4 w-4 mr-2" />
                Try Again ({maxRetries - retryCount} attempts left)
              </Button>
            )}

            <Button onClick={onReload} className="w-full" variant="outline">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Reload Page
            </Button>

            <Button onClick={onGoHome} className="w-full" variant="outline">
              <Home className="h-4 w-4 mr-2" />
              Go to Home
            </Button>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                <Bug className="h-4 w-4 inline mr-1" />
                Debug Information
              </summary>
              <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                {JSON.stringify(
                  {
                    id: error.id,
                    type: error.type,
                    severity: error.severity,
                    timestamp: error.timestamp,
                    retryable: error.retryable,
                    recoverable: error.recoverable,
                  },
                  null,
                  2
                )}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }

  // Component or section level error
  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader className="text-center">
        <div className="mb-4">
          {error.severity === ErrorSeverity.HIGH ? (
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
          ) : (
            <Shield className="h-12 w-12 text-yellow-500 mx-auto" />
          )}
        </div>
        <CardTitle className="text-lg">
          {error.severity === ErrorSeverity.HIGH ? 'Feature Unavailable' : 'Minor Issue Detected'}
        </CardTitle>
        <CardDescription>{error.userMessage}</CardDescription>
      </CardHeader>

      <CardContent className="text-center space-y-3">
        {canRetry && (
          <Button onClick={onRetry} className="w-full" size="sm">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Retry ({maxRetries - retryCount} left)
          </Button>
        )}

        <div className="flex gap-2">
          <Button onClick={onReset} className="flex-1" variant="outline" size="sm">
            Reset
          </Button>

          <Button onClick={onGoHome} className="flex-1" variant="outline" size="sm">
            <Home className="h-4 w-4 mr-1" />
            Home
          </Button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4">
            <summary className="cursor-pointer text-xs text-gray-500">Debug Info</summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-24">
              Error ID: {error.id}
              Type: {error.type}
              Severity: {error.severity}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
}

// =================== SPECIALIZED ERROR BOUNDARIES ===================

/**
 * Page-level error boundary for entire routes
 */
export function PageErrorBoundary({ children, ...props }: Omit<ErrorBoundaryProps, 'level'>) {
  return (
    <ErrorBoundary
      level="page"
      identifier="PageBoundary"
      enableRetry={true}
      maxRetries={3}
      {...props}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Section-level error boundary for major UI sections
 */
export function SectionErrorBoundary({ children, ...props }: Omit<ErrorBoundaryProps, 'level'>) {
  return (
    <ErrorBoundary
      level="section"
      identifier="SectionBoundary"
      enableRetry={true}
      maxRetries={2}
      isolateErrors={true}
      {...props}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Component-level error boundary for individual components
 */
export function ComponentErrorBoundary({ children, ...props }: Omit<ErrorBoundaryProps, 'level'>) {
  return (
    <ErrorBoundary
      level="component"
      identifier="ComponentBoundary"
      enableRetry={true}
      maxRetries={1}
      isolateErrors={true}
      {...props}
    >
      {children}
    </ErrorBoundary>
  );
}

// =================== ASYNC ERROR HANDLING UTILITIES ===================

/**
 * Wrap async functions with error handling
 */
export function withAsyncErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  errorHandler?: (error: SafeErrorInfo) => void
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      const safeError = SecureErrorLogger.createSafeErrorInfo(
        error instanceof Error ? error : new Error(String(error)),
        undefined,
        { functionName: fn.name, arguments: args?.length || 0 }
      );

      SecureErrorLogger.logError(safeError);

      if (errorHandler) {
        errorHandler(safeError);
      }

      throw error;
    }
  }) as T;
}

/**
 * Higher-order component for automatic error boundary wrapping
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<ErrorBoundaryProps>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary
      identifier={Component.displayName || Component.name}
      level="component"
      {...errorBoundaryProps}
    >
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// =================== EXPORTS ===================

export default ErrorBoundary;
export { SecureErrorLogger };
export type { SafeErrorInfo, ErrorBoundaryProps, ErrorBoundaryState, ErrorType, ErrorSeverity };
