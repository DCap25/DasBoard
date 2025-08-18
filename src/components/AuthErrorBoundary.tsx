/**
 * AuthErrorBoundary Component for The DAS Board
 * 
 * FEATURES IMPLEMENTED:
 * - Global auth error boundary with session recovery
 * - Specific error types for auth failures (401, 403, session expired, network)
 * - Automatic session refresh attempts with retry logic
 * - User-friendly error messages with recovery actions
 * - Development console warnings and error reporting
 * - Integration with existing error handling infrastructure
 * - Toast notifications for auth errors
 * - Graceful fallback UI with retry mechanisms
 */

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AuthError } from '@supabase/supabase-js';
import { toast } from '../lib/use-toast';
import { AlertTriangle, RefreshCw, LogOut, Home, WifiOff, Shield } from 'lucide-react';
import { Button } from './ui/button';

// =================== TYPES ===================

interface AuthErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<AuthErrorFallbackProps>;
  onError?: (error: AuthErrorInfo) => void;
  maxRetries?: number;
  enableAutoRecovery?: boolean;
}

interface AuthErrorBoundaryState {
  hasError: boolean;
  error: AuthErrorInfo | null;
  retryCount: number;
  isRecovering: boolean;
  lastRecoveryAttempt: number;
}

export interface AuthErrorInfo {
  type: AuthErrorType;
  message: string;
  originalError: Error;
  timestamp: number;
  userAgent?: string;
  sessionInfo?: SessionErrorInfo;
  recoverable: boolean;
}

interface SessionErrorInfo {
  hasSession: boolean;
  sessionExpired: boolean;
  tokenValid: boolean;
  lastRefresh?: number;
}

export type AuthErrorType = 
  | 'SESSION_EXPIRED'
  | 'TOKEN_INVALID' 
  | 'AUTHENTICATION_FAILED'
  | 'PERMISSION_DENIED'
  | 'NETWORK_ERROR'
  | 'SUPABASE_CONNECTION_ERROR'
  | 'RATE_LIMITED'
  | 'EMAIL_NOT_CONFIRMED'
  | 'USER_NOT_FOUND'
  | 'INVALID_CREDENTIALS'
  | 'GENERIC_AUTH_ERROR';

interface AuthErrorFallbackProps {
  error: AuthErrorInfo;
  retryCount: number;
  onRetry: () => void;
  onSignOut: () => void;
  onGoHome: () => void;
  isRecovering: boolean;
}

// =================== ERROR CLASSIFICATION ===================

/**
 * Classify auth errors into specific types for better handling
 */
function classifyAuthError(error: Error): AuthErrorType {
  const message = error.message?.toLowerCase() || '';
  
  // Session and token errors
  if (message.includes('session') && (message.includes('expired') || message.includes('invalid'))) {
    return 'SESSION_EXPIRED';
  }
  
  if (message.includes('token') && (message.includes('invalid') || message.includes('expired'))) {
    return 'TOKEN_INVALID';
  }
  
  // HTTP status-based errors
  if (message.includes('401') || message.includes('unauthorized')) {
    return 'AUTHENTICATION_FAILED';
  }
  
  if (message.includes('403') || message.includes('forbidden')) {
    return 'PERMISSION_DENIED';
  }
  
  if (message.includes('429') || message.includes('rate limit') || message.includes('too many requests')) {
    return 'RATE_LIMITED';
  }
  
  // Specific auth errors
  if (message.includes('email not confirmed') || message.includes('email link is invalid')) {
    return 'EMAIL_NOT_CONFIRMED';
  }
  
  if (message.includes('invalid login credentials') || message.includes('user not found')) {
    return 'INVALID_CREDENTIALS';
  }
  
  if (message.includes('user not found')) {
    return 'USER_NOT_FOUND';
  }
  
  // Network and connection errors
  if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
    return 'NETWORK_ERROR';
  }
  
  if (message.includes('supabase') && (message.includes('connection') || message.includes('client'))) {
    return 'SUPABASE_CONNECTION_ERROR';
  }
  
  return 'GENERIC_AUTH_ERROR';
}

/**
 * Check if error is recoverable through retry
 */
function isRecoverableError(errorType: AuthErrorType): boolean {
  const recoverableTypes: AuthErrorType[] = [
    'SESSION_EXPIRED',
    'TOKEN_INVALID',
    'NETWORK_ERROR',
    'SUPABASE_CONNECTION_ERROR',
    'RATE_LIMITED'
  ];
  
  return recoverableTypes.includes(errorType);
}

/**
 * Get session error info from Supabase client
 */
async function getSessionErrorInfo(): Promise<SessionErrorInfo | undefined> {
  try {
    const { getSecureSupabaseClient, hasValidSession } = await import('../lib/supabaseClient');
    const client = await getSecureSupabaseClient();
    
    const { data: { session }, error } = await client.auth.getSession();
    
    const sessionInfo: SessionErrorInfo = {
      hasSession: !!session,
      sessionExpired: !session || (session.expires_at && session.expires_at * 1000 < Date.now()),
      tokenValid: !!session?.access_token,
      lastRefresh: session?.refresh_token ? Date.now() : undefined,
    };
    
    return sessionInfo;
  } catch (error) {
    console.warn('[AuthErrorBoundary] Failed to get session info:', error);
    return undefined;
  }
}

/**
 * Create detailed auth error info
 */
async function createAuthErrorInfo(error: Error): Promise<AuthErrorInfo> {
  const errorType = classifyAuthError(error);
  const sessionInfo = await getSessionErrorInfo();
  
  return {
    type: errorType,
    message: error.message || 'Unknown authentication error',
    originalError: error,
    timestamp: Date.now(),
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
    sessionInfo,
    recoverable: isRecoverableError(errorType),
  };
}

// =================== DEVELOPMENT WARNINGS ===================

/**
 * Log development warnings for auth errors
 */
function logDevWarning(errorInfo: AuthErrorInfo): void {
  if (process.env.NODE_ENV !== 'development') return;
  
  const isDev = import.meta.env.DEV;
  if (!isDev) return;
  
  console.group(`🔴 [AUTH ERROR BOUNDARY] ${errorInfo.type}`);
  console.warn('Error Type:', errorInfo.type);
  console.warn('Message:', errorInfo.message);
  console.warn('Recoverable:', errorInfo.recoverable);
  console.warn('Timestamp:', new Date(errorInfo.timestamp).toISOString());
  console.warn('Original Error:', errorInfo.originalError);
  
  if (errorInfo.sessionInfo) {
    console.group('Session Info:');
    console.log('Has Session:', errorInfo.sessionInfo.hasSession);
    console.log('Session Expired:', errorInfo.sessionInfo.sessionExpired);
    console.log('Token Valid:', errorInfo.sessionInfo.tokenValid);
    console.log('Last Refresh:', errorInfo.sessionInfo.lastRefresh ? new Date(errorInfo.sessionInfo.lastRefresh).toISOString() : 'Never');
    console.groupEnd();
  }
  
  // Stack trace for debugging
  if (errorInfo.originalError.stack) {
    console.group('Stack Trace:');
    console.log(errorInfo.originalError.stack);
    console.groupEnd();
  }
  
  // Recovery suggestions
  console.group('Recovery Suggestions:');
  switch (errorInfo.type) {
    case 'SESSION_EXPIRED':
    case 'TOKEN_INVALID':
      console.log('• Try automatic session refresh');
      console.log('• Check token expiration handling');
      break;
    case 'NETWORK_ERROR':
      console.log('• Check network connectivity');
      console.log('• Verify API endpoints');
      break;
    case 'SUPABASE_CONNECTION_ERROR':
      console.log('• Check Supabase client configuration');
      console.log('• Verify environment variables');
      break;
    case 'RATE_LIMITED':
      console.log('• Implement request throttling');
      console.log('• Add exponential backoff');
      break;
    default:
      console.log('• Check authentication flow');
      console.log('• Verify user permissions');
  }
  console.groupEnd();
  
  console.groupEnd();
}

// =================== ERROR BOUNDARY COMPONENT ===================

export class AuthErrorBoundary extends Component<AuthErrorBoundaryProps, AuthErrorBoundaryState> {
  private recoveryTimeoutId: NodeJS.Timeout | null = null;
  
  constructor(props: AuthErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
      isRecovering: false,
      lastRecoveryAttempt: 0,
    };
  }
  
  static getDerivedStateFromError(error: Error): Partial<AuthErrorBoundaryState> {
    return {
      hasError: true,
    };
  }
  
  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Create detailed auth error info
    const authErrorInfo = await createAuthErrorInfo(error);
    
    // Log development warnings
    logDevWarning(authErrorInfo);
    
    // Update state with error info
    this.setState({
      error: authErrorInfo,
      retryCount: 0,
      isRecovering: false,
      lastRecoveryAttempt: 0,
    });
    
    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(authErrorInfo);
    }
    
    // Show toast notification
    this.showErrorToast(authErrorInfo);
    
    // Attempt automatic recovery for recoverable errors
    if (this.props.enableAutoRecovery && authErrorInfo.recoverable) {
      this.attemptRecovery(authErrorInfo);
    }
    
    // Report to error tracking service
    this.reportError(authErrorInfo, errorInfo);
  }
  
  /**
   * Show user-friendly toast notification
   */
  private showErrorToast(errorInfo: AuthErrorInfo): void {
    const { type, message } = errorInfo;
    
    let title = 'Authentication Error';
    let description = message;
    
    switch (type) {
      case 'SESSION_EXPIRED':
        title = 'Session Expired';
        description = 'Your session has expired. Please sign in again.';
        break;
      case 'TOKEN_INVALID':
        title = 'Authentication Issue';
        description = 'Your authentication token is invalid. Refreshing...';
        break;
      case 'NETWORK_ERROR':
        title = 'Connection Error';
        description = 'Unable to connect to the server. Please check your internet connection.';
        break;
      case 'RATE_LIMITED':
        title = 'Too Many Requests';
        description = 'Please wait a moment before trying again.';
        break;
      case 'EMAIL_NOT_CONFIRMED':
        title = 'Email Verification Required';
        description = 'Please check your email and verify your account.';
        break;
    }
    
    toast({
      title,
      description,
      variant: 'destructive',
      duration: 5000,
    });
  }
  
  /**
   * Attempt automatic error recovery
   */
  private async attemptRecovery(errorInfo: AuthErrorInfo): Promise<void> {
    const { maxRetries = 3 } = this.props;
    
    if (this.state.retryCount >= maxRetries) {
      console.warn('[AuthErrorBoundary] Max retry attempts reached');
      return;
    }
    
    this.setState({
      isRecovering: true,
      lastRecoveryAttempt: Date.now(),
    });
    
    try {
      let recoverySuccess = false;
      
      switch (errorInfo.type) {
        case 'SESSION_EXPIRED':
        case 'TOKEN_INVALID':
          recoverySuccess = await this.attemptSessionRecovery();
          break;
        case 'NETWORK_ERROR':
        case 'SUPABASE_CONNECTION_ERROR':
          recoverySuccess = await this.attemptConnectionRecovery();
          break;
        case 'RATE_LIMITED':
          recoverySuccess = await this.attemptRateLimitRecovery();
          break;
      }
      
      if (recoverySuccess) {
        console.log('[AuthErrorBoundary] Recovery successful, resetting error state');
        this.resetErrorState();
        
        toast({
          title: 'Recovered',
          description: 'Connection has been restored.',
          variant: 'default',
        });
      } else {
        this.setState({
          retryCount: this.state.retryCount + 1,
          isRecovering: false,
        });
      }
    } catch (recoveryError) {
      console.error('[AuthErrorBoundary] Recovery failed:', recoveryError);
      this.setState({
        retryCount: this.state.retryCount + 1,
        isRecovering: false,
      });
    }
  }
  
  /**
   * Attempt to recover from session errors
   */
  private async attemptSessionRecovery(): Promise<boolean> {
    try {
      const { getSecureSupabaseClient } = await import('../lib/supabaseClient');
      const client = await getSecureSupabaseClient();
      
      // Try to refresh the session
      const { data, error } = await client.auth.refreshSession();
      
      if (error) {
        console.warn('[AuthErrorBoundary] Session refresh failed:', error.message);
        return false;
      }
      
      if (data.session) {
        console.log('[AuthErrorBoundary] Session refreshed successfully');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[AuthErrorBoundary] Session recovery error:', error);
      return false;
    }
  }
  
  /**
   * Attempt to recover from connection errors
   */
  private async attemptConnectionRecovery(): Promise<boolean> {
    try {
      const { testSupabaseConnection } = await import('../lib/supabaseClient');
      const result = await testSupabaseConnection();
      
      return result.success;
    } catch (error) {
      console.error('[AuthErrorBoundary] Connection recovery error:', error);
      return false;
    }
  }
  
  /**
   * Attempt to recover from rate limit errors
   */
  private async attemptRateLimitRecovery(): Promise<boolean> {
    // Wait for rate limit to reset (exponential backoff)
    const delay = Math.pow(2, this.state.retryCount) * 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return true; // Rate limit recovery is just waiting
  }
  
  /**
   * Report error to external service
   */
  private reportError(authErrorInfo: AuthErrorInfo, errorInfo: ErrorInfo): void {
    // In development, just log to console
    if (process.env.NODE_ENV === 'development') {
      console.error('[AuthErrorBoundary] Error reported:', {
        authErrorInfo,
        errorInfo,
      });
      return;
    }
    
    // In production, you would send to your error tracking service
    // Examples: Sentry, Bugsnag, LogRocket, etc.
    try {
      // Example: Sentry.captureException(authErrorInfo.originalError, {
      //   tags: {
      //     errorType: authErrorInfo.type,
      //     recoverable: authErrorInfo.recoverable,
      //   },
      //   extra: {
      //     authErrorInfo,
      //     errorInfo,
      //   },
      // });
    } catch (reportingError) {
      console.error('[AuthErrorBoundary] Failed to report error:', reportingError);
    }
  }
  
  /**
   * Reset error state and retry
   */
  private handleRetry = (): void => {
    const { maxRetries = 3 } = this.props;
    
    if (this.state.retryCount >= maxRetries) {
      toast({
        title: 'Max Retries Reached',
        description: 'Please refresh the page or sign out and try again.',
        variant: 'destructive',
      });
      return;
    }
    
    console.log(`[AuthErrorBoundary] Manual retry attempt ${this.state.retryCount + 1}/${maxRetries}`);
    
    this.setState({
      retryCount: this.state.retryCount + 1,
      isRecovering: true,
    });
    
    // Attempt recovery
    if (this.state.error && this.state.error.recoverable) {
      this.attemptRecovery(this.state.error);
    } else {
      // For non-recoverable errors, just reset the boundary
      setTimeout(() => {
        this.resetErrorState();
      }, 1000);
    }
  };
  
  /**
   * Handle sign out action
   */
  private handleSignOut = async (): Promise<void> => {
    try {
      const { getSecureSupabaseClient } = await import('../lib/supabaseClient');
      const client = await getSecureSupabaseClient();
      
      await client.auth.signOut();
      
      // Redirect to home page
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('[AuthErrorBoundary] Sign out failed:', error);
      
      // Force redirect even if sign out fails
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  };
  
  /**
   * Handle go home action
   */
  private handleGoHome = (): void => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };
  
  /**
   * Reset error boundary state
   */
  private resetErrorState(): void {
    this.setState({
      hasError: false,
      error: null,
      retryCount: 0,
      isRecovering: false,
      lastRecoveryAttempt: 0,
    });
  }
  
  componentWillUnmount() {
    if (this.recoveryTimeoutId) {
      clearTimeout(this.recoveryTimeoutId);
    }
  }
  
  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultAuthErrorFallback;
      
      return (
        <FallbackComponent
          error={this.state.error}
          retryCount={this.state.retryCount}
          onRetry={this.handleRetry}
          onSignOut={this.handleSignOut}
          onGoHome={this.handleGoHome}
          isRecovering={this.state.isRecovering}
        />
      );
    }
    
    return this.props.children;
  }
}

// =================== DEFAULT FALLBACK COMPONENT ===================

const DefaultAuthErrorFallback: React.FC<AuthErrorFallbackProps> = ({
  error,
  retryCount,
  onRetry,
  onSignOut,
  onGoHome,
  isRecovering,
}) => {
  const { type, message, timestamp, recoverable } = error;
  const maxRetries = 3;
  
  // Get error icon and styling
  const getErrorIcon = () => {
    switch (type) {
      case 'NETWORK_ERROR':
      case 'SUPABASE_CONNECTION_ERROR':
        return <WifiOff className="h-16 w-16 text-red-500" />;
      case 'SESSION_EXPIRED':
      case 'TOKEN_INVALID':
        return <Shield className="h-16 w-16 text-orange-500" />;
      default:
        return <AlertTriangle className="h-16 w-16 text-red-500" />;
    }
  };
  
  // Get user-friendly error title
  const getErrorTitle = () => {
    switch (type) {
      case 'SESSION_EXPIRED':
        return 'Your Session Has Expired';
      case 'TOKEN_INVALID':
        return 'Authentication Issue';
      case 'AUTHENTICATION_FAILED':
        return 'Authentication Failed';
      case 'PERMISSION_DENIED':
        return 'Access Denied';
      case 'NETWORK_ERROR':
        return 'Connection Problem';
      case 'SUPABASE_CONNECTION_ERROR':
        return 'Service Unavailable';
      case 'RATE_LIMITED':
        return 'Too Many Requests';
      case 'EMAIL_NOT_CONFIRMED':
        return 'Email Verification Required';
      default:
        return 'Authentication Error';
    }
  };
  
  // Get user-friendly error description
  const getErrorDescription = () => {
    switch (type) {
      case 'SESSION_EXPIRED':
        return 'Your login session has expired. Please sign in again to continue.';
      case 'TOKEN_INVALID':
        return 'There was an issue with your authentication. We\'ll try to fix this automatically.';
      case 'NETWORK_ERROR':
        return 'We\'re having trouble connecting to our servers. Please check your internet connection.';
      case 'SUPABASE_CONNECTION_ERROR':
        return 'Our authentication service is temporarily unavailable. Please try again in a moment.';
      case 'RATE_LIMITED':
        return 'You\'ve made too many requests. Please wait a moment before trying again.';
      case 'EMAIL_NOT_CONFIRMED':
        return 'Please check your email and click the verification link before proceeding.';
      default:
        return 'An authentication error occurred. Please try again or contact support if the problem persists.';
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {getErrorIcon()}
            
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              {getErrorTitle()}
            </h2>
            
            <p className="mt-4 text-sm text-gray-600">
              {getErrorDescription()}
            </p>
            
            {/* Error details for development */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-left">
                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                  Technical Details (Dev Only)
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-700">
                  <p><strong>Type:</strong> {type}</p>
                  <p><strong>Message:</strong> {message}</p>
                  <p><strong>Recoverable:</strong> {recoverable ? 'Yes' : 'No'}</p>
                  <p><strong>Retry Count:</strong> {retryCount}/{maxRetries}</p>
                  <p><strong>Timestamp:</strong> {new Date(timestamp).toISOString()}</p>
                </div>
              </details>
            )}
            
            {/* Action buttons */}
            <div className="mt-8 space-y-3">
              {/* Retry button for recoverable errors */}
              {recoverable && retryCount < maxRetries && (
                <Button
                  onClick={onRetry}
                  disabled={isRecovering}
                  className="w-full flex justify-center items-center"
                  variant="default"
                >
                  {isRecovering ? (
                    <>
                      <RefreshCw className="animate-spin -ml-1 mr-3 h-5 w-5" />
                      Recovering...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="-ml-1 mr-3 h-5 w-5" />
                      Try Again ({retryCount + 1}/{maxRetries})
                    </>
                  )}
                </Button>
              )}
              
              {/* Sign out button */}
              <Button
                onClick={onSignOut}
                variant="outline"
                className="w-full flex justify-center items-center"
              >
                <LogOut className="-ml-1 mr-3 h-5 w-5" />
                Sign Out
              </Button>
              
              {/* Go home button */}
              <Button
                onClick={onGoHome}
                variant="ghost"
                className="w-full flex justify-center items-center"
              >
                <Home className="-ml-1 mr-3 h-5 w-5" />
                Go to Homepage
              </Button>
            </div>
            
            {/* Help text */}
            <p className="mt-6 text-xs text-gray-500">
              If this problem continues, please contact our support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// =================== EXPORTS ===================

export default AuthErrorBoundary;
export { DefaultAuthErrorFallback };
export type { AuthErrorBoundaryProps, AuthErrorInfo, AuthErrorType, AuthErrorFallbackProps };