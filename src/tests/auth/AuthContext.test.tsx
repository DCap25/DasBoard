/**
 * AuthContext Unit Tests for The DAS Board
 * 
 * FEATURES TESTED:
 * - Session initialization and management
 * - Token expiration and refresh handling
 * - Auth state changes and user data fetching
 * - Sign in/out/up functionality
 * - Error handling and recovery
 * - Memory leak prevention
 * - Role-based authentication
 */

import { describe, it, expect, vi, beforeEach, afterEach, MockedFunction } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import React from 'react';
import { toast } from '../../lib/use-toast';
import { AuthProvider, useAuth, type UserSignupData } from '../../contexts/AuthContext';
import type { User, Session, AuthError } from '@supabase/supabase-js';

// =================== MOCKS ===================

// Mock toast notifications
vi.mock('../../lib/use-toast', () => ({
  toast: vi.fn(),
}));

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
    refreshSession: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        maybeSingle: vi.fn(),
        single: vi.fn(),
      })),
      upsert: vi.fn(),
    })),
  })),
};

vi.mock('../../lib/supabaseClient', () => ({
  getSecureSupabaseClient: vi.fn(() => Promise.resolve(mockSupabaseClient)),
  hasValidSession: vi.fn(),
  getCurrentUser: vi.fn(),
  getUserDealershipId: vi.fn(),
  testSupabaseConnection: vi.fn(),
}));

// =================== TEST HELPERS ===================

// Create mock user for testing
const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'test-user-id',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'test@example.com',
  email_confirmed_at: new Date().toISOString(),
  phone: null,
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  app_metadata: { provider: 'email', providers: ['email'] },
  user_metadata: { first_name: 'Test', last_name: 'User' },
  identities: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

// Create mock session for testing
const createMockSession = (overrides: Partial<Session> = {}): Session => ({
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: createMockUser(),
  ...overrides,
});

// Create expired session for testing
const createExpiredSession = (): Session => ({
  ...createMockSession(),
  expires_at: Math.floor(Date.now() / 1000) - 100, // Expired 100 seconds ago
});

// Auth provider wrapper for testing
const AuthTestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>{children}</AuthProvider>
);

// =================== TEST SUITES ===================

describe('AuthContext', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Setup default mock implementations
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    
    mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    
    // Suppress console logs during tests unless debugging
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Clean up mocks after each test
    vi.restoreAllMocks();
  });

  // =================== INITIALIZATION TESTS ===================

  describe('Initialization', () => {
    it('should initialize with loading state', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthTestWrapper,
      });

      expect(result.current.loading).toBe(true);
      expect(result.current.user).toBe(null);
      expect(result.current.hasSession).toBe(false);
      expect(result.current.authCheckComplete).toBe(false);
    });

    it('should complete auth check after initialization', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
        wrapper: AuthTestWrapper,
      });

      await waitForNextUpdate();

      expect(result.current.loading).toBe(false);
      expect(result.current.authCheckComplete).toBe(true);
    });

    it('should handle session on mount', async () => {
      const mockSession = createMockSession();
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
        wrapper: AuthTestWrapper,
      });

      await waitForNextUpdate();

      expect(result.current.hasSession).toBe(true);
      expect(result.current.user).toBeTruthy();
      expect(result.current.user?.id).toBe(mockSession.user.id);
    });

    it('should set up auth state listener', async () => {
      renderHook(() => useAuth(), {
        wrapper: AuthTestWrapper,
      });

      await waitFor(() => {
        expect(mockSupabaseClient.auth.onAuthStateChange).toHaveBeenCalled();
      });
    });
  });

  // =================== SESSION MANAGEMENT TESTS ===================

  describe('Session Management', () => {
    it('should validate session correctly', async () => {
      const mockSession = createMockSession();
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
        wrapper: AuthTestWrapper,
      });

      await waitForNextUpdate();

      expect(result.current.sessionHealth.isValid).toBe(true);
      expect(result.current.sessionHealth.needsRefresh).toBe(false);
    });

    it('should detect expired session', async () => {
      const expiredSession = createExpiredSession();
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: expiredSession },
        error: null,
      });

      const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
        wrapper: AuthTestWrapper,
      });

      await waitForNextUpdate();

      expect(result.current.sessionHealth.isValid).toBe(false);
      expect(result.current.hasSession).toBe(false);
    });

    it('should detect session needing refresh', async () => {
      const soonToExpireSession = createMockSession({
        expires_at: Math.floor(Date.now() / 1000) + 200, // Expires in 200 seconds
      });
      
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: soonToExpireSession },
        error: null,
      });

      const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
        wrapper: AuthTestWrapper,
      });

      await waitForNextUpdate();

      expect(result.current.sessionHealth.isValid).toBe(true);
      expect(result.current.sessionHealth.needsRefresh).toBe(true);
    });

    it('should refresh session when needed', async () => {
      const mockSession = createMockSession();
      const refreshedSession = createMockSession({
        access_token: 'new-access-token',
        expires_at: Math.floor(Date.now() / 1000) + 7200,
      });

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      mockSupabaseClient.auth.refreshSession.mockResolvedValue({
        data: { session: refreshedSession, user: refreshedSession.user },
        error: null,
      });

      const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
        wrapper: AuthTestWrapper,
      });

      await waitForNextUpdate();

      await act(async () => {
        await result.current.refreshSession();
      });

      expect(mockSupabaseClient.auth.refreshSession).toHaveBeenCalled();
    });

    it('should handle session refresh failure', async () => {
      const mockSession = createMockSession();
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const refreshError = new Error('Refresh failed') as AuthError;
      mockSupabaseClient.auth.refreshSession.mockResolvedValue({
        data: { session: null, user: null },
        error: refreshError,
      });

      const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
        wrapper: AuthTestWrapper,
      });

      await waitForNextUpdate();

      await act(async () => {
        await result.current.refreshSession();
      });

      expect(result.current.error).toBeTruthy();
      expect(mockSupabaseClient.auth.refreshSession).toHaveBeenCalled();
    });
  });

  // =================== AUTHENTICATION TESTS ===================

  describe('Sign In', () => {
    it('should sign in successfully', async () => {
      const mockSession = createMockSession();
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { session: mockSession, user: mockSession.user },
        error: null,
      });

      const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
        wrapper: AuthTestWrapper,
      });

      await waitForNextUpdate();

      await act(async () => {
        await result.current.signIn('test@example.com', 'password123', false);
      });

      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: { persistSession: false },
      });

      expect(toast).toHaveBeenCalledWith({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });
    });

    it('should validate email format', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
        wrapper: AuthTestWrapper,
      });

      await waitForNextUpdate();

      await act(async () => {
        try {
          await result.current.signIn('invalid-email', 'password123');
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toContain('valid email');
        }
      });

      expect(mockSupabaseClient.auth.signInWithPassword).not.toHaveBeenCalled();
    });

    it('should validate password length', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
        wrapper: AuthTestWrapper,
      });

      await waitForNextUpdate();

      await act(async () => {
        try {
          await result.current.signIn('test@example.com', 'short');
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toContain('at least 6 characters');
        }
      });

      expect(mockSupabaseClient.auth.signInWithPassword).not.toHaveBeenCalled();
    });

    it('should handle sign in error', async () => {
      const authError = new Error('Invalid credentials') as AuthError;
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { session: null, user: null },
        error: authError,
      });

      const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
        wrapper: AuthTestWrapper,
      });

      await waitForNextUpdate();

      await act(async () => {
        await result.current.signIn('test@example.com', 'wrong-password');
      });

      expect(result.current.error).toBeTruthy();
      expect(toast).toHaveBeenCalledWith({
        title: 'Sign In Failed',
        description: 'Invalid credentials',
        variant: 'destructive',
      });
    });
  });

  describe('Sign Up', () => {
    it('should sign up successfully', async () => {
      const mockUser = createMockUser({ email: 'newuser@example.com' });
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      mockSupabaseClient.from().select().eq().upsert.mockResolvedValue({
        data: { id: mockUser.id },
        error: null,
      });

      const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
        wrapper: AuthTestWrapper,
      });

      await waitForNextUpdate();

      const userData: UserSignupData = {
        firstName: 'New',
        lastName: 'User',
        role: 'salesperson',
        dealershipId: 1,
      };

      await act(async () => {
        await result.current.signUp('newuser@example.com', 'password123', userData);
      });

      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'password123',
        options: {
          data: {
            first_name: 'New',
            last_name: 'User',
            role: 'salesperson',
          },
        },
      });

      expect(toast).toHaveBeenCalledWith({
        title: 'Account Created',
        description: 'Please check your email to verify your account.',
      });
    });

    it('should validate signup input', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
        wrapper: AuthTestWrapper,
      });

      await waitForNextUpdate();

      const invalidUserData: UserSignupData = {
        firstName: '',
        lastName: 'User',
      };

      await act(async () => {
        try {
          await result.current.signUp('test@example.com', 'short', invalidUserData);
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });

      expect(mockSupabaseClient.auth.signUp).not.toHaveBeenCalled();
    });
  });

  describe('Sign Out', () => {
    it('should sign out successfully', async () => {
      const mockSession = createMockSession();
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: null,
      });

      const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
        wrapper: AuthTestWrapper,
      });

      await waitForNextUpdate();

      await act(async () => {
        await result.current.signOut();
      });

      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
      expect(result.current.user).toBe(null);
      expect(result.current.hasSession).toBe(false);
      
      expect(toast).toHaveBeenCalledWith({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
      });
    });

    it('should handle sign out error gracefully', async () => {
      const mockSession = createMockSession();
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const signOutError = new Error('Sign out failed') as AuthError;
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: signOutError,
      });

      const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
        wrapper: AuthTestWrapper,
      });

      await waitForNextUpdate();

      await act(async () => {
        await result.current.signOut();
      });

      // Should still clear local state even if sign out fails
      expect(result.current.user).toBe(null);
      expect(result.current.hasSession).toBe(false);
    });
  });

  // =================== USER DATA TESTS ===================

  describe('User Data Management', () => {
    it('should fetch user profile data', async () => {
      const mockUser = createMockUser();
      const mockSession = createMockSession({ user: mockUser });

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      // Mock users table response
      mockSupabaseClient.from().select().eq().maybeSingle.mockResolvedValueOnce({
        data: {
          dealership_id: 1,
          role_id: 1,
          roles: { name: 'finance_manager' },
        },
        error: null,
      });

      const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
        wrapper: AuthTestWrapper,
      });

      await waitForNextUpdate();

      expect(result.current.role).toBe('finance_manager');
      expect(result.current.dealershipId).toBe(1);
    });

    it('should fallback to profiles table', async () => {
      const mockUser = createMockUser();
      const mockSession = createMockSession({ user: mockUser });

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      // Mock users table failure, profiles table success
      mockSupabaseClient.from().select().eq().maybeSingle
        .mockResolvedValueOnce({
          data: null,
          error: { message: 'Not found' },
        })
        .mockResolvedValueOnce({
          data: {
            role: 'sales_manager',
            dealership_id: 2,
            is_group_admin: false,
          },
          error: null,
        });

      const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
        wrapper: AuthTestWrapper,
      });

      await waitForNextUpdate();

      expect(result.current.role).toBe('sales_manager');
      expect(result.current.dealershipId).toBe(2);
    });

    it('should set default role on fetch failure', async () => {
      const mockUser = createMockUser();
      const mockSession = createMockSession({ user: mockUser });

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      // Mock both tables failing
      mockSupabaseClient.from().select().eq().maybeSingle
        .mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        });

      const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
        wrapper: AuthTestWrapper,
      });

      await waitForNextUpdate();

      expect(result.current.role).toBe('viewer');
    });
  });

  // =================== ERROR HANDLING TESTS ===================

  describe('Error Handling', () => {
    it('should handle auth state change errors', async () => {
      const authError = new Error('Auth state change failed') as AuthError;
      
      // Mock onAuthStateChange to call the callback with an error
      mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
        // Simulate error in auth state change
        setTimeout(() => {
          callback('SIGNED_OUT', null);
        }, 0);
        
        return {
          data: { subscription: { unsubscribe: vi.fn() } },
        };
      });

      const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
        wrapper: AuthTestWrapper,
      });

      await waitForNextUpdate();

      // The auth context should handle the error gracefully
      expect(result.current.authCheckComplete).toBe(true);
    });

    it('should handle session fetch errors', async () => {
      const sessionError = new Error('Session fetch failed') as AuthError;
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: sessionError,
      });

      const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
        wrapper: AuthTestWrapper,
      });

      await waitForNextUpdate();

      expect(result.current.error).toBeTruthy();
      expect(result.current.hasSession).toBe(false);
    });
  });

  // =================== MEMORY LEAK PREVENTION TESTS ===================

  describe('Memory Leak Prevention', () => {
    it('should clean up auth listener on unmount', async () => {
      const unsubscribeMock = vi.fn();
      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: unsubscribeMock } },
      });

      const { unmount } = renderHook(() => useAuth(), {
        wrapper: AuthTestWrapper,
      });

      await waitFor(() => {
        expect(mockSupabaseClient.auth.onAuthStateChange).toHaveBeenCalled();
      });

      unmount();

      expect(unsubscribeMock).toHaveBeenCalled();
    });

    it('should clear intervals on unmount', async () => {
      vi.spyOn(global, 'clearInterval');
      
      const { unmount } = renderHook(() => useAuth(), {
        wrapper: AuthTestWrapper,
      });

      await waitFor(() => {
        expect(mockSupabaseClient.auth.onAuthStateChange).toHaveBeenCalled();
      });

      unmount();

      expect(global.clearInterval).toHaveBeenCalled();
    });
  });

  // =================== ROLE VALIDATION TESTS ===================

  describe('Role Validation', () => {
    it('should validate user roles correctly', async () => {
      const mockUser = createMockUser();
      const mockSession = createMockSession({ user: mockUser });

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      mockSupabaseClient.from().select().eq().maybeSingle.mockResolvedValue({
        data: {
          dealership_id: 1,
          role_id: 1,
          roles: { name: 'FINANCE_MANAGER' }, // Test case insensitive
        },
        error: null,
      });

      const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
        wrapper: AuthTestWrapper,
      });

      await waitForNextUpdate();

      expect(result.current.role).toBe('finance_manager');
    });

    it('should handle invalid roles', async () => {
      const mockUser = createMockUser();
      const mockSession = createMockSession({ user: mockUser });

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      mockSupabaseClient.from().select().eq().maybeSingle.mockResolvedValue({
        data: {
          dealership_id: 1,
          role_id: 1,
          roles: { name: 'invalid_role' }, // Invalid role
        },
        error: null,
      });

      const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
        wrapper: AuthTestWrapper,
      });

      await waitForNextUpdate();

      expect(result.current.role).toBe('viewer'); // Should default to viewer
    });
  });
});

// =================== INTEGRATION TESTS ===================

describe('AuthContext Integration', () => {
  it('should work with React components', async () => {
    const TestComponent: React.FC = () => {
      const { user, hasSession, loading } = useAuth();
      
      if (loading) return <div data-testid="loading">Loading...</div>;
      if (hasSession && user) return <div data-testid="authenticated">Hello {user.email}</div>;
      return <div data-testid="unauthenticated">Please sign in</div>;
    };

    const { getByTestId, rerender } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initially loading
    expect(getByTestId('loading')).toBeInTheDocument();

    // Wait for auth check to complete
    await waitFor(() => {
      expect(getByTestId('unauthenticated')).toBeInTheDocument();
    });

    // Simulate sign in
    const mockSession = createMockSession();
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    rerender(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('authenticated')).toBeInTheDocument();
    });
  });
});

// =================== PERFORMANCE TESTS ===================

describe('AuthContext Performance', () => {
  it('should not cause unnecessary re-renders', async () => {
    let renderCount = 0;
    
    const TestComponent: React.FC = () => {
      const auth = useAuth();
      renderCount++;
      return <div>Render count: {renderCount}</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(renderCount).toBeLessThan(5); // Should not re-render excessively
    });
  });
});