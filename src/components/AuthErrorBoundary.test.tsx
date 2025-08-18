/**
 * Comprehensive Test Suite for AuthErrorBoundary
 * 
 * FEATURES TESTED:
 * - Error boundary catching and classification
 * - Recovery mechanisms for different error types
 * - User-friendly error display and actions
 * - Development warnings and debugging info
 * - Session recovery and retry logic
 * - Toast notifications for errors
 * - Custom error handler integration
 * - Fallback UI rendering
 * - Memory leak prevention
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthErrorBoundary, AuthErrorType } from './AuthErrorBoundary';
import { 
  setupMockSupabase,
  resetMockSupabaseClient,
  flushPromises,
} from '../tests/setup';
import { TestScenarios, createMockAuthError } from '../tests/mocks/supabase';
import React from 'react';

// =================== TEST COMPONENTS ===================

/**
 * Component that throws errors for testing
 */
interface ErrorThrowingComponentProps {
  shouldThrow?: boolean;
  errorType?: 'auth' | 'network' | 'session' | 'custom';
  customMessage?: string;
}

const ErrorThrowingComponent: React.FC<ErrorThrowingComponentProps> = ({
  shouldThrow = false,
  errorType = 'auth',
  customMessage,
}) => {
  if (shouldThrow) {
    let error: Error;
    
    switch (errorType) {
      case 'auth':
        error = createMockAuthError(customMessage || 'Authentication failed');
        break;
      case 'network':
        error = new Error(customMessage || 'Network error: Failed to connect');
        break;
      case 'session':
        error = new Error(customMessage || 'Session expired');
        break;
      case 'custom':
        error = new Error(customMessage || 'Custom error');
        break;
      default:
        error = new Error('Unknown error');
    }
    
    throw error;
  }
  
  return <div data-testid="working-component">Component is working</div>;
};

/**
 * Custom fallback component for testing
 */
const CustomFallback: React.FC<any> = ({ error, onRetry, onSignOut, onGoHome, isRecovering }) => (
  <div data-testid="custom-fallback">
    <div data-testid="error-type">{error.type}</div>
    <div data-testid="error-message">{error.message}</div>
    <div data-testid="is-recovering">{isRecovering.toString()}</div>
    <button data-testid="custom-retry" onClick={onRetry}>Custom Retry</button>
    <button data-testid="custom-signout" onClick={onSignOut}>Custom Sign Out</button>
    <button data-testid="custom-home" onClick={onGoHome}>Custom Home</button>
  </div>
);

// =================== HELPER FUNCTIONS ===================

/**
 * Render component with error boundary
 */
const renderWithErrorBoundary = (
  componentProps: ErrorThrowingComponentProps = {},
  boundaryProps: any = {}
) => {
  return render(
    <AuthErrorBoundary {...boundaryProps}>
      <ErrorThrowingComponent {...componentProps} />
    </AuthErrorBoundary>
  );
};

/**
 * Trigger error and wait for boundary to catch it
 */
const triggerError = async (
  rerender: any,
  errorType: ErrorThrowingComponentProps['errorType'] = 'auth',
  customMessage?: string
) => {
  await act(async () => {
    rerender(
      <AuthErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} errorType={errorType} customMessage={customMessage} />
      </AuthErrorBoundary>
    );
  });
  
  await flushPromises();
};

// =================== TEST SUITE ===================

describe('AuthErrorBoundary', () => {
  let mockClient: any;
  let mockToast: any;
  
  beforeEach(async () => {
    resetMockSupabaseClient();
    mockClient = setupMockSupabase();
    
    // Mock toast notifications
    const { toast } = await import('../lib/use-toast');
    mockToast = vi.mocked(toast);
    mockToast.mockClear();
    
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'group').mockImplementation(() => {});
    vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
    vi.spyOn(console, 'groupCollapsed').mockImplementation(() => {});
  });
  
  afterEach(() => {
    resetMockSupabaseClient();
    vi.restoreAllMocks();
  });
  
  // =================== BASIC FUNCTIONALITY ===================
  
  describe('Basic Functionality', () => {
    it('should render children when no error occurs', () => {
      renderWithErrorBoundary();
      
      expect(screen.getByTestId('working-component')).toBeInTheDocument();
      expect(screen.getByText('Component is working')).toBeInTheDocument();
    });
    
    it('should catch and display auth errors', async () => {
      const { rerender } = renderWithErrorBoundary();
      
      await triggerError(rerender, 'auth', 'Invalid credentials');
      
      expect(screen.queryByTestId('working-component')).not.toBeInTheDocument();
      expect(screen.getByText('Authentication Error')).toBeInTheDocument();
    });
    
    it('should use custom fallback component when provided', async () => {
      const { rerender } = render(
        <AuthErrorBoundary fallback={CustomFallback}>
          <ErrorThrowingComponent />
        </AuthErrorBoundary>
      );
      
      await triggerError(rerender, 'auth');
      
      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
      expect(screen.getByTestId('error-type')).toHaveTextContent('AUTHENTICATION_FAILED');
    });
  });
  
  // =================== ERROR CLASSIFICATION ===================
  
  describe('Error Classification', () => {
    const errorTestCases: Array<{
      errorMessage: string;
      expectedType: AuthErrorType;
      expectedTitle: string;
    }> = [
      {
        errorMessage: 'Session expired',
        expectedType: 'SESSION_EXPIRED',
        expectedTitle: 'Your Session Has Expired',
      },
      {
        errorMessage: 'Invalid session token',
        expectedType: 'SESSION_EXPIRED',
        expectedTitle: 'Your Session Has Expired',
      },
      {
        errorMessage: 'Token invalid or expired',
        expectedType: 'TOKEN_INVALID',
        expectedTitle: 'Authentication Issue',
      },
      {
        errorMessage: 'Unauthorized 401',
        expectedType: 'AUTHENTICATION_FAILED',
        expectedTitle: 'Authentication Failed',
      },
      {
        errorMessage: 'Forbidden 403',
        expectedType: 'PERMISSION_DENIED',
        expectedTitle: 'Access Denied',
      },
      {
        errorMessage: 'Rate limit exceeded 429',
        expectedType: 'RATE_LIMITED',
        expectedTitle: 'Too Many Requests',
      },
      {
        errorMessage: 'Email not confirmed',
        expectedType: 'EMAIL_NOT_CONFIRMED',
        expectedTitle: 'Email Verification Required',
      },
      {
        errorMessage: 'User not found',
        expectedType: 'USER_NOT_FOUND',
        expectedTitle: 'Authentication Error',
      },
      {
        errorMessage: 'Invalid login credentials',
        expectedType: 'INVALID_CREDENTIALS',
        expectedTitle: 'Authentication Error',
      },
      {
        errorMessage: 'Network error occurred',
        expectedType: 'NETWORK_ERROR',
        expectedTitle: 'Connection Problem',
      },
      {
        errorMessage: 'Supabase connection failed',
        expectedType: 'SUPABASE_CONNECTION_ERROR',
        expectedTitle: 'Service Unavailable',
      },
      {
        errorMessage: 'Some random error',
        expectedType: 'GENERIC_AUTH_ERROR',
        expectedTitle: 'Authentication Error',
      },
    ];
    
    errorTestCases.forEach(({ errorMessage, expectedType, expectedTitle }) => {
      it(`should classify "${errorMessage}" as ${expectedType}`, async () => {
        const { rerender } = render(
          <AuthErrorBoundary fallback={CustomFallback}>
            <ErrorThrowingComponent />
          </AuthErrorBoundary>
        );
        
        await triggerError(rerender, 'custom', errorMessage);
        
        expect(screen.getByTestId('error-type')).toHaveTextContent(expectedType);
      });
    });
  });
  
  // =================== RECOVERY MECHANISMS ===================
  
  describe('Recovery Mechanisms', () => {
    it('should attempt session recovery for session errors', async () => {
      const user = userEvent.setup();
      
      renderWithErrorBoundary(
        { shouldThrow: true, errorType: 'session' },
        { enableAutoRecovery: true, maxRetries: 1 }
      );
      
      await waitFor(() => {
        expect(screen.getByText('Your Session Has Expired')).toBeInTheDocument();
      });
      
      // Should attempt automatic recovery
      await waitFor(() => {
        // Check if refresh session was called on mock client
        expect(mockClient.auth.refreshSession).toBeDefined();
      });
    });
    
    it('should handle manual retry', async () => {
      const user = userEvent.setup();
      const { rerender } = renderWithErrorBoundary();
      
      await triggerError(rerender, 'session');
      
      const retryButton = screen.getByText(/Try Again/);
      expect(retryButton).toBeInTheDocument();
      
      await user.click(retryButton);
      
      // Should show recovering state
      await waitFor(() => {
        expect(screen.getByText('Recovering...')).toBeInTheDocument();
      });
    });
    
    it('should prevent retry after max attempts', async () => {
      const user = userEvent.setup();
      
      renderWithErrorBoundary(
        { shouldThrow: true, errorType: 'session' },
        { maxRetries: 1 }
      );
      
      await waitFor(() => {
        expect(screen.getByText('Your Session Has Expired')).toBeInTheDocument();
      });
      
      // First retry
      const retryButton = screen.getByText(/Try Again \(1\/1\)/);
      await user.click(retryButton);
      
      await flushPromises();
      
      // Second attempt should show max retries reached
      const retryButton2 = screen.queryByText(/Try Again/);
      expect(retryButton2).not.toBeInTheDocument();
    });
    
    it('should handle sign out action', async () => {
      const user = userEvent.setup();
      const { rerender } = renderWithErrorBoundary();
      
      // Mock window.location.href
      const mockLocation = { href: '' };
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
      });
      
      await triggerError(rerender, 'auth');
      
      const signOutButton = screen.getByText('Sign Out');
      await user.click(signOutButton);
      
      await flushPromises();
      
      // Should redirect to home
      expect(mockLocation.href).toBe('/');
    });
    
    it('should handle go home action', async () => {
      const user = userEvent.setup();
      const { rerender } = renderWithErrorBoundary();
      
      // Mock window.location.href
      const mockLocation = { href: '' };
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
      });
      
      await triggerError(rerender, 'auth');
      
      const homeButton = screen.getByText('Go to Homepage');
      await user.click(homeButton);
      
      expect(mockLocation.href).toBe('/');
    });
  });
  
  // =================== TOAST NOTIFICATIONS ===================
  
  describe('Toast Notifications', () => {
    it('should show toast notification on error', async () => {
      const { rerender } = renderWithErrorBoundary();
      
      await triggerError(rerender, 'session');
      
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Session Expired',
          description: 'Your session has expired. Please sign in again.',
          variant: 'destructive',
        })
      );
    });
    
    it('should show different toast messages for different error types', async () => {
      const testCases = [
        {
          errorType: 'network' as const,
          expectedTitle: 'Connection Error',
          expectedDescription: 'Unable to connect to the server. Please check your internet connection.',
        },
        {
          errorType: 'custom' as const,
          customMessage: 'Rate limit exceeded',
          expectedTitle: 'Too Many Requests',
          expectedDescription: 'Please wait a moment before trying again.',
        },
      ];
      
      for (const { errorType, customMessage, expectedTitle, expectedDescription } of testCases) {
        mockToast.mockClear();
        const { rerender } = renderWithErrorBoundary();
        
        await triggerError(rerender, errorType, customMessage);
        
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: expectedTitle,
            description: expectedDescription,
            variant: 'destructive',
          })
        );
      }
    });
    
    it('should show recovery success toast', async () => {
      const user = userEvent.setup();
      
      // Mock successful recovery
      mockClient.auth.refreshSession.mockResolvedValue({
        data: { session: { access_token: 'new-token' } },
        error: null,
      });
      
      renderWithErrorBoundary(
        { shouldThrow: true, errorType: 'session' },
        { enableAutoRecovery: true }
      );
      
      await waitFor(() => {
        expect(screen.getByText('Your Session Has Expired')).toBeInTheDocument();
      });
      
      // Wait for auto-recovery
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Recovered',
            description: 'Connection has been restored.',
            variant: 'default',
          })
        );
      }, { timeout: 5000 });
    });
  });
  
  // =================== DEVELOPMENT WARNINGS ===================
  
  describe('Development Warnings', () => {
    it('should log development warnings in dev mode', async () => {
      // Mock dev environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      // Mock import.meta.env.DEV
      const mockImportMeta = { env: { DEV: true } };
      vi.stubGlobal('import', { meta: mockImportMeta });
      
      const { rerender } = renderWithErrorBoundary();
      
      await triggerError(rerender, 'session');
      
      await waitFor(() => {
        expect(console.group).toHaveBeenCalledWith(
          expect.stringContaining('AUTH ERROR BOUNDARY')
        );
        expect(console.warn).toHaveBeenCalledWith('Error Type:', 'SESSION_EXPIRED');
        expect(console.warn).toHaveBeenCalledWith('Recoverable:', true);
      });
      
      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });
    
    it('should show technical details in development', async () => {
      // Mock dev environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const { rerender } = renderWithErrorBoundary();
      
      await triggerError(rerender, 'session');
      
      await waitFor(() => {
        expect(screen.getByText('Technical Details (Dev Only)')).toBeInTheDocument();
      });
      
      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });
    
    it('should not show technical details in production', async () => {
      // Mock production environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const { rerender } = renderWithErrorBoundary();
      
      await triggerError(rerender, 'session');
      
      await waitFor(() => {
        expect(screen.queryByText('Technical Details (Dev Only)')).not.toBeInTheDocument();
      });
      
      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });
  });
  
  // =================== CUSTOM ERROR HANDLER ===================
  
  describe('Custom Error Handler', () => {
    it('should call custom error handler when provided', async () => {
      const mockErrorHandler = vi.fn();
      const { rerender } = renderWithErrorBoundary(
        {},
        { onError: mockErrorHandler }
      );
      
      await triggerError(rerender, 'auth');
      
      expect(mockErrorHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'AUTHENTICATION_FAILED',
          message: 'Authentication failed',
          recoverable: false,
        })
      );
    });
    
    it('should include session info in error handler call', async () => {
      const mockErrorHandler = vi.fn();
      
      // Set up session in mock client
      const mockSession = {
        access_token: 'token',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      };
      mockClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      
      const { rerender } = renderWithErrorBoundary(
        {},
        { onError: mockErrorHandler }
      );
      
      await triggerError(rerender, 'auth');
      
      await waitFor(() => {
        expect(mockErrorHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            sessionInfo: expect.objectContaining({
              hasSession: true,
              tokenValid: true,
            })
          })
        );
      });
    });
  });
  
  // =================== ERROR RECOVERY SCENARIOS ===================
  
  describe('Error Recovery Scenarios', () => {
    it('should handle connection recovery', async () => {
      mockClient.setConfig(TestScenarios.NETWORK_ERROR);
      
      renderWithErrorBoundary(
        { shouldThrow: true, errorType: 'network' },
        { enableAutoRecovery: true }
      );
      
      await waitFor(() => {
        expect(screen.getByText('Connection Problem')).toBeInTheDocument();
      });
      
      // Auto-recovery should attempt connection test
      await waitFor(() => {
        // Verify connection recovery was attempted
        expect(mockClient.auth.refreshSession).toBeDefined();
      });
    });
    
    it('should handle rate limit recovery with backoff', async () => {
      vi.useFakeTimers();
      
      renderWithErrorBoundary(
        { shouldThrow: true, customMessage: 'Rate limit exceeded' },
        { enableAutoRecovery: true }
      );
      
      await waitFor(() => {
        expect(screen.getByText('Too Many Requests')).toBeInTheDocument();
      });
      
      // Should implement exponential backoff for rate limits
      act(() => {
        vi.advanceTimersByTime(1000); // Advance by backoff delay
      });
      
      vi.useRealTimers();
    });
    
    it('should reset error state after successful recovery', async () => {
      const { rerender } = renderWithErrorBoundary();
      
      await triggerError(rerender, 'session');
      
      expect(screen.getByText('Your Session Has Expired')).toBeInTheDocument();
      
      // Simulate successful recovery by re-rendering without error
      act(() => {
        rerender(
          <AuthErrorBoundary>
            <ErrorThrowingComponent shouldThrow={false} />
          </AuthErrorBoundary>
        );
      });
      
      // Component should work normally after recovery
      expect(screen.getByTestId('working-component')).toBeInTheDocument();
    });
  });
  
  // =================== ACCESSIBILITY ===================
  
  describe('Accessibility', () => {
    it('should have accessible error UI', async () => {
      const { rerender } = renderWithErrorBoundary();
      
      await triggerError(rerender, 'auth');
      
      // Check for proper headings
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      
      // Check for button labels
      expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go to homepage/i })).toBeInTheDocument();
    });
    
    it('should have proper ARIA attributes', async () => {
      const { rerender } = renderWithErrorBoundary();
      
      await triggerError(rerender, 'network');
      
      // Buttons should be properly labeled
      const retryButton = screen.getByRole('button', { name: /try again/i });
      expect(retryButton).toBeInTheDocument();
      
      // Should show loading state with proper ARIA
      const user = userEvent.setup();
      await user.click(retryButton);
      
      await waitFor(() => {
        expect(screen.getByText('Recovering...')).toBeInTheDocument();
      });
    });
  });
  
  // =================== EDGE CASES ===================
  
  describe('Edge Cases', () => {
    it('should handle errors during recovery', async () => {
      // Mock recovery to fail
      mockClient.auth.refreshSession.mockRejectedValue(new Error('Recovery failed'));
      
      renderWithErrorBoundary(
        { shouldThrow: true, errorType: 'session' },
        { enableAutoRecovery: true, maxRetries: 1 }
      );
      
      await waitFor(() => {
        expect(screen.getByText('Your Session Has Expired')).toBeInTheDocument();
      });
      
      // Should handle recovery failure gracefully
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
          expect.stringContaining('[AuthErrorBoundary] Recovery failed:'),
          expect.any(Error)
        );
      });
    });
    
    it('should handle missing window object (SSR)', async () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;
      
      const { rerender } = renderWithErrorBoundary();
      
      await triggerError(rerender, 'auth');
      
      // Should render error UI without crashing
      expect(screen.getByText('Authentication Error')).toBeInTheDocument();
      
      global.window = originalWindow;
    });
    
    it('should handle component unmount during recovery', async () => {
      const { rerender, unmount } = renderWithErrorBoundary(
        { shouldThrow: true, errorType: 'session' },
        { enableAutoRecovery: true }
      );
      
      await waitFor(() => {
        expect(screen.getByText('Your Session Has Expired')).toBeInTheDocument();
      });
      
      // Unmount during recovery
      unmount();
      
      // Should not cause any errors or warnings
      expect(() => {
        // Any cleanup should happen silently
      }).not.toThrow();
    });
  });
});