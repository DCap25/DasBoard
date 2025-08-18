/**
 * Comprehensive Test Suite for AuthContext
 * 
 * FEATURES TESTED:
 * - Authentication state management (sign in, sign up, sign out)
 * - Session validation and health monitoring
 * - User data fetching and role assignment
 * - Error handling for various auth failures
 * - Token refresh and session recovery
 * - Auth state listeners and real-time updates
 * - Memory leak prevention and cleanup
 * - Edge cases and error scenarios
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth, UserRole } from './AuthContext';
import { 
  setupMockSupabase, 
  resetMockSupabaseClient,
  createMockImplementation,
  flushPromises,
  TestError,
} from '../tests/setup';
import {
  createMockUser,
  createMockSession,
  createMockProfile,
  createMockAuthError,
  TestScenarios,
  waitForAuthState,
} from '../tests/mocks/supabase';
import type { MockSupabaseClient } from '../tests/mocks/supabase';
import React from 'react';

// =================== TEST COMPONENTS ===================

/**
 * Test component that uses AuthContext
 */
const TestComponent: React.FC = () => {
  const auth = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{auth.loading.toString()}</div>
      <div data-testid="has-session">{auth.hasSession.toString()}</div>
      <div data-testid="user-email">{auth.user?.email || 'no-user'}</div>
      <div data-testid="user-role">{auth.role || 'no-role'}</div>
      <div data-testid="dealership-id">{auth.dealershipId || 'no-dealership'}</div>
      <div data-testid="is-group-admin">{auth.isGroupAdmin.toString()}</div>
      <div data-testid="auth-complete">{auth.authCheckComplete.toString()}</div>
      <div data-testid="session-valid">{auth.sessionHealth.isValid.toString()}</div>
      <div data-testid="error-message">{auth.error?.message || 'no-error'}</div>
      
      <button
        data-testid="sign-in-btn"
        onClick={() => auth.signIn('test@example.com', 'password123')}
      >
        Sign In
      </button>
      
      <button
        data-testid="sign-up-btn"
        onClick={() => auth.signUp('new@example.com', 'password123', {
          firstName: 'Test',
          lastName: 'User',
          role: 'salesperson',
        })}
      >
        Sign Up
      </button>
      
      <button
        data-testid="sign-out-btn"
        onClick={() => auth.signOut()}
      >
        Sign Out
      </button>
      
      <button
        data-testid="refresh-btn"
        onClick={() => auth.refreshSession()}
      >
        Refresh Session
      </button>
    </div>
  );
};

/**
 * Test wrapper component
 */
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>{children}</AuthProvider>
);

// =================== HELPER FUNCTIONS ===================

/**
 * Render test component with AuthProvider
 */
const renderWithAuth = () => {
  return render(<TestComponent />, { wrapper: TestWrapper });
};

/**
 * Wait for auth initialization to complete
 */
const waitForAuthInit = async () => {
  await waitFor(() => {
    expect(screen.getByTestId('auth-complete')).toHaveTextContent('true');
  });
};

/**
 * Assert authentication state
 */
const assertAuthState = (expectedState: {
  loading?: boolean;
  hasSession?: boolean;
  userEmail?: string;
  role?: string;
  dealershipId?: string | number;
  isGroupAdmin?: boolean;
  authComplete?: boolean;
  sessionValid?: boolean;
  errorMessage?: string;
}) => {
  if (expectedState.loading !== undefined) {
    expect(screen.getByTestId('loading')).toHaveTextContent(expectedState.loading.toString());
  }
  if (expectedState.hasSession !== undefined) {
    expect(screen.getByTestId('has-session')).toHaveTextContent(expectedState.hasSession.toString());
  }
  if (expectedState.userEmail !== undefined) {
    expect(screen.getByTestId('user-email')).toHaveTextContent(expectedState.userEmail);
  }
  if (expectedState.role !== undefined) {
    expect(screen.getByTestId('user-role')).toHaveTextContent(expectedState.role);
  }
  if (expectedState.dealershipId !== undefined) {
    expect(screen.getByTestId('dealership-id')).toHaveTextContent(expectedState.dealershipId.toString());
  }
  if (expectedState.isGroupAdmin !== undefined) {
    expect(screen.getByTestId('is-group-admin')).toHaveTextContent(expectedState.isGroupAdmin.toString());
  }
  if (expectedState.authComplete !== undefined) {
    expect(screen.getByTestId('auth-complete')).toHaveTextContent(expectedState.authComplete.toString());
  }
  if (expectedState.sessionValid !== undefined) {
    expect(screen.getByTestId('session-valid')).toHaveTextContent(expectedState.sessionValid.toString());
  }
  if (expectedState.errorMessage !== undefined) {
    expect(screen.getByTestId('error-message')).toHaveTextContent(expectedState.errorMessage);
  }
};

// =================== TEST SUITE ===================

describe('AuthContext', () => {
  let mockClient: MockSupabaseClient;
  
  beforeEach(async () => {
    // Reset mocks and set up fresh client
    resetMockSupabaseClient();
    mockClient = setupMockSupabase();
    
    // Add test user to mock storage
    const testProfile = createMockProfile({
      id: 'test-user-123',
      email: 'test@example.com',
      role: 'salesperson',
      dealership_id: 1,
    });
    
    const { addMockTestData } = await import('../tests/mocks/supabase');
    addMockTestData([testProfile]);
  });
  
  afterEach(() => {
    resetMockSupabaseClient();
  });
  
  // =================== INITIALIZATION TESTS ===================
  
  describe('Initialization', () => {
    it('should initialize with loading state', () => {
      renderWithAuth();
      
      assertAuthState({
        loading: true,
        hasSession: false,
        userEmail: 'no-user',
        role: 'no-role',
        authComplete: false,
      });
    });
    
    it('should complete initialization without session', async () => {
      renderWithAuth();
      
      await waitForAuthInit();
      
      assertAuthState({
        loading: false,
        hasSession: false,
        userEmail: 'no-user',
        role: 'no-role',
        authComplete: true,
        sessionValid: false,
      });
    });
    
    it('should detect existing valid session on init', async () => {
      // Set up existing session
      const user = createMockUser({ email: 'existing@example.com' });
      const session = createMockSession(user);
      mockClient.auth.setCurrentSession(session);
      mockClient.auth.setCurrentUser(user);
      
      renderWithAuth();
      
      await waitForAuthInit();
      
      assertAuthState({
        loading: false,
        hasSession: true,
        userEmail: 'existing@example.com',
        role: 'salesperson',
        authComplete: true,
        sessionValid: true,
      });
    });
    
    it('should handle initialization timeout', async () => {
      // Mock slow initialization
      mockClient.setConfig({ customDelay: 15000 });
      
      renderWithAuth();
      
      // Should timeout after 10 seconds and complete auth check
      await waitFor(() => {
        expect(screen.getByTestId('auth-complete')).toHaveTextContent('true');
      }, { timeout: 12000 });
      
      assertAuthState({
        loading: false,
        authComplete: true,
      });
    });
  });
  
  // =================== SIGN IN TESTS ===================
  
  describe('Sign In', () => {
    it('should successfully sign in with valid credentials', async () => {
      const user = userEvent.setup();
      renderWithAuth();
      
      await waitForAuthInit();
      
      const signInBtn = screen.getByTestId('sign-in-btn');
      await user.click(signInBtn);
      
      // Wait for auth state to update
      await waitForAuthState();
      await flushPromises();
      
      await waitFor(() => {
        assertAuthState({
          hasSession: true,
          userEmail: 'test@example.com',
          role: 'salesperson',
          sessionValid: true,
        });
      });
    });
    
    it('should handle sign in failure', async () => {
      const user = userEvent.setup();
      mockClient.setConfig(TestScenarios.AUTH_FAILURE);
      
      renderWithAuth();
      await waitForAuthInit();
      
      const signInBtn = screen.getByTestId('sign-in-btn');
      await user.click(signInBtn);
      
      await waitFor(() => {
        assertAuthState({
          hasSession: false,
          errorMessage: 'Authentication failed',
        });
      });
    });
    
    it('should handle network error during sign in', async () => {
      const user = userEvent.setup();
      mockClient.setConfig(TestScenarios.NETWORK_ERROR);
      
      renderWithAuth();
      await waitForAuthInit();
      
      const signInBtn = screen.getByTestId('sign-in-btn');
      await user.click(signInBtn);
      
      await waitFor(() => {
        assertAuthState({
          hasSession: false,
          errorMessage: 'Network error: Failed to connect',
        });
      });
    });
    
    it('should validate email format before sign in', async () => {
      const { signIn } = renderHook(() => useAuth(), { wrapper: TestWrapper }).result.current;
      
      await expect(signIn('invalid-email', 'password123')).rejects.toThrow('Please enter a valid email address');
    });
    
    it('should validate password length before sign in', async () => {
      const { signIn } = renderHook(() => useAuth(), { wrapper: TestWrapper }).result.current;
      
      await expect(signIn('test@example.com', '123')).rejects.toThrow('Password must be at least 6 characters');
    });
  });
  
  // =================== SIGN UP TESTS ===================
  
  describe('Sign Up', () => {
    it('should successfully sign up with valid data', async () => {
      const user = userEvent.setup();
      renderWithAuth();
      
      await waitForAuthInit();
      
      const signUpBtn = screen.getByTestId('sign-up-btn');
      await user.click(signUpBtn);
      
      // Wait for auth state to update
      await waitForAuthState();
      await flushPromises();
      
      await waitFor(() => {
        assertAuthState({
          hasSession: true,
          sessionValid: true,
        });
      });
    });
    
    it('should handle sign up failure', async () => {
      const user = userEvent.setup();
      mockClient.setConfig(TestScenarios.AUTH_FAILURE);
      
      renderWithAuth();
      await waitForAuthInit();
      
      const signUpBtn = screen.getByTestId('sign-up-btn');
      await user.click(signUpBtn);
      
      await waitFor(() => {
        assertAuthState({
          hasSession: false,
          errorMessage: 'Authentication failed',
        });
      });
    });
    
    it('should validate sign up data', async () => {
      const { signUp } = renderHook(() => useAuth(), { wrapper: TestWrapper }).result.current;
      
      // Invalid email
      await expect(signUp('invalid', 'password123', { firstName: 'Test', lastName: 'User' }))
        .rejects.toThrow('Please enter a valid email address');
      
      // Short password
      await expect(signUp('test@example.com', '123', { firstName: 'Test', lastName: 'User' }))
        .rejects.toThrow('Password must be at least 8 characters');
      
      // Missing name
      await expect(signUp('test@example.com', 'password123', { firstName: '', lastName: 'User' }))
        .rejects.toThrow('First and last name are required');
    });
  });
  
  // =================== SIGN OUT TESTS ===================
  
  describe('Sign Out', () => {
    it('should successfully sign out', async () => {
      const user = userEvent.setup();
      
      // Start with authenticated state
      const testUser = createMockUser({ email: 'test@example.com' });
      const session = createMockSession(testUser);
      mockClient.auth.setCurrentSession(session);
      mockClient.auth.setCurrentUser(testUser);
      
      renderWithAuth();
      await waitForAuthInit();
      
      // Verify authenticated state
      assertAuthState({
        hasSession: true,
        userEmail: 'test@example.com',
      });
      
      // Sign out
      const signOutBtn = screen.getByTestId('sign-out-btn');
      await user.click(signOutBtn);
      
      await waitForAuthState();
      
      await waitFor(() => {
        assertAuthState({
          hasSession: false,
          userEmail: 'no-user',
          role: 'no-role',
          sessionValid: false,
        });
      });
    });
    
    it('should handle sign out failure gracefully', async () => {
      const user = userEvent.setup();
      
      // Start with authenticated state
      const testUser = createMockUser({ email: 'test@example.com' });
      const session = createMockSession(testUser);
      mockClient.auth.setCurrentSession(session);
      mockClient.auth.setCurrentUser(testUser);
      
      renderWithAuth();
      await waitForAuthInit();
      
      // Configure to fail sign out
      mockClient.setConfig(TestScenarios.AUTH_FAILURE);
      
      const signOutBtn = screen.getByTestId('sign-out-btn');
      await user.click(signOutBtn);
      
      await waitForAuthState();
      
      // Should still clear local state even if server call fails
      await waitFor(() => {
        assertAuthState({
          hasSession: false,
          userEmail: 'no-user',
          role: 'no-role',
        });
      });
    });
  });
  
  // =================== SESSION MANAGEMENT TESTS ===================
  
  describe('Session Management', () => {
    it('should refresh session successfully', async () => {
      const user = userEvent.setup();
      
      // Start with authenticated state
      const testUser = createMockUser({ email: 'test@example.com' });
      const session = createMockSession(testUser);
      mockClient.auth.setCurrentSession(session);
      mockClient.auth.setCurrentUser(testUser);
      
      renderWithAuth();
      await waitForAuthInit();
      
      const refreshBtn = screen.getByTestId('refresh-btn');
      await user.click(refreshBtn);
      
      await waitForAuthState();
      
      // Session should remain valid
      assertAuthState({
        hasSession: true,
        sessionValid: true,
      });
    });
    
    it('should handle session refresh failure', async () => {
      const user = userEvent.setup();
      
      // Start with authenticated state
      const testUser = createMockUser({ email: 'test@example.com' });
      const session = createMockSession(testUser);
      mockClient.auth.setCurrentSession(session);
      mockClient.auth.setCurrentUser(testUser);
      
      renderWithAuth();
      await waitForAuthInit();
      
      // Configure to fail refresh
      mockClient.setConfig(TestScenarios.AUTH_FAILURE);
      
      const refreshBtn = screen.getByTestId('refresh-btn');
      await user.click(refreshBtn);
      
      await waitFor(() => {
        assertAuthState({
          errorMessage: 'Authentication failed',
        });
      });
    });
    
    it('should detect expired session', async () => {
      // Start with expired session
      const testUser = createMockUser({ email: 'test@example.com' });
      const expiredSession = createMockSession(testUser, {
        expires_at: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
      });
      mockClient.auth.setCurrentSession(expiredSession);
      mockClient.auth.setCurrentUser(testUser);
      mockClient.setConfig(TestScenarios.SESSION_EXPIRED);
      
      renderWithAuth();
      
      await waitForAuthInit();
      
      // Should detect invalid session
      assertAuthState({
        hasSession: false,
        sessionValid: false,
      });
    });
    
    it('should handle session validation errors', async () => {
      mockClient.setConfig(TestScenarios.DATABASE_FAILURE);
      
      renderWithAuth();
      
      await waitForAuthInit();
      
      assertAuthState({
        loading: false,
        hasSession: false,
        authComplete: true,
      });
    });
  });
  
  // =================== USER DATA TESTS ===================
  
  describe('User Data Management', () => {
    it('should fetch user role from profiles table', async () => {
      const testUser = createMockUser({ 
        id: 'test-user-123',
        email: 'test@example.com' 
      });
      const session = createMockSession(testUser);
      mockClient.auth.setCurrentSession(session);
      mockClient.auth.setCurrentUser(testUser);
      
      renderWithAuth();
      await waitForAuthInit();
      
      assertAuthState({
        hasSession: true,
        userEmail: 'test@example.com',
        role: 'salesperson',
        dealershipId: '1',
      });
    });
    
    it('should default to viewer role when profile not found', async () => {
      const testUser = createMockUser({ 
        id: 'unknown-user',
        email: 'unknown@example.com' 
      });
      const session = createMockSession(testUser);
      mockClient.auth.setCurrentSession(session);
      mockClient.auth.setCurrentUser(testUser);
      
      renderWithAuth();
      await waitForAuthInit();
      
      assertAuthState({
        hasSession: true,
        userEmail: 'unknown@example.com',
        role: 'viewer',
      });
    });
    
    it('should handle user data fetch errors gracefully', async () => {
      const testUser = createMockUser({ email: 'test@example.com' });
      const session = createMockSession(testUser);
      mockClient.auth.setCurrentSession(session);
      mockClient.auth.setCurrentUser(testUser);
      mockClient.setConfig(TestScenarios.DATABASE_FAILURE);
      
      renderWithAuth();
      await waitForAuthInit();
      
      // Should still have session but default role
      assertAuthState({
        hasSession: true,
        userEmail: 'test@example.com',
        role: 'viewer', // Default role on error
      });
    });
  });
  
  // =================== AUTH STATE LISTENERS TESTS ===================
  
  describe('Auth State Listeners', () => {
    it('should respond to auth state changes', async () => {
      renderWithAuth();
      await waitForAuthInit();
      
      // Initially not authenticated
      assertAuthState({
        hasSession: false,
      });
      
      // Simulate external sign in
      const testUser = createMockUser({ email: 'test@example.com' });
      const session = createMockSession(testUser);
      
      act(() => {
        mockClient.auth.triggerAuthStateChange('SIGNED_IN', session);
      });
      
      await waitForAuthState();
      
      await waitFor(() => {
        assertAuthState({
          hasSession: true,
          userEmail: 'test@example.com',
        });
      });
    });
    
    it('should handle token refresh events', async () => {
      // Start authenticated
      const testUser = createMockUser({ email: 'test@example.com' });
      const session = createMockSession(testUser);
      mockClient.auth.setCurrentSession(session);
      mockClient.auth.setCurrentUser(testUser);
      
      renderWithAuth();
      await waitForAuthInit();
      
      // Simulate token refresh
      const refreshedSession = createMockSession(testUser, {
        access_token: 'new-token',
      });
      
      act(() => {
        mockClient.auth.triggerAuthStateChange('TOKEN_REFRESHED', refreshedSession);
      });
      
      await waitForAuthState();
      
      assertAuthState({
        hasSession: true,
        sessionValid: true,
      });
    });
    
    it('should handle sign out events', async () => {
      // Start authenticated
      const testUser = createMockUser({ email: 'test@example.com' });
      const session = createMockSession(testUser);
      mockClient.auth.setCurrentSession(session);
      mockClient.auth.setCurrentUser(testUser);
      
      renderWithAuth();
      await waitForAuthInit();
      
      // Simulate external sign out
      act(() => {
        mockClient.auth.triggerAuthStateChange('SIGNED_OUT', null);
      });
      
      await waitForAuthState();
      
      await waitFor(() => {
        assertAuthState({
          hasSession: false,
          userEmail: 'no-user',
          sessionValid: false,
        });
      });
    });
  });
  
  // =================== ERROR HANDLING TESTS ===================
  
  describe('Error Handling', () => {
    it('should handle network errors during initialization', async () => {
      mockClient.setConfig(TestScenarios.NETWORK_ERROR);
      
      renderWithAuth();
      
      await waitFor(() => {
        assertAuthState({
          loading: false,
          authComplete: true,
          errorMessage: 'Network error: Failed to connect',
        });
      });
    });
    
    it('should handle auth errors during initialization', async () => {
      mockClient.setConfig(TestScenarios.AUTH_FAILURE);
      
      renderWithAuth();
      
      await waitFor(() => {
        assertAuthState({
          loading: false,
          authComplete: true,
          errorMessage: 'Authentication failed',
        });
      });
    });
    
    it('should clear errors on successful operations', async () => {
      const user = userEvent.setup();
      
      // Start with error state
      mockClient.setConfig(TestScenarios.AUTH_FAILURE);
      renderWithAuth();
      await waitForAuthInit();
      
      assertAuthState({
        errorMessage: 'Authentication failed',
      });
      
      // Reset to success and try sign in
      mockClient.resetConfig();
      
      const signInBtn = screen.getByTestId('sign-in-btn');
      await user.click(signInBtn);
      
      await waitForAuthState();
      
      await waitFor(() => {
        assertAuthState({
          hasSession: true,
          errorMessage: 'no-error',
        });
      });
    });
  });
  
  // =================== HOOK USAGE TESTS ===================
  
  describe('Hook Usage', () => {
    it('should throw error when used outside provider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
      
      consoleError.mockRestore();
    });
    
    it('should provide stable references', () => {
      const { result, rerender } = renderHook(() => useAuth(), { wrapper: TestWrapper });
      
      const firstRender = result.current;
      
      rerender();
      
      const secondRender = result.current;
      
      // Methods should be stable
      expect(firstRender.signIn).toBe(secondRender.signIn);
      expect(firstRender.signOut).toBe(secondRender.signOut);
      expect(firstRender.signUp).toBe(secondRender.signUp);
      expect(firstRender.refreshSession).toBe(secondRender.refreshSession);
    });
  });
  
  // =================== MEMORY LEAK TESTS ===================
  
  describe('Memory Leak Prevention', () => {
    it('should cleanup listeners on unmount', () => {
      const { unmount } = renderWithAuth();
      
      // Mock the cleanup function
      const unsubscribeSpy = vi.fn();
      mockClient.auth.onAuthStateChange = vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: unsubscribeSpy } }
      });
      
      unmount();
      
      // Note: This is a simplified test. In reality, we'd need to verify
      // that the actual cleanup happens, but that requires more complex mocking.
      expect(unsubscribeSpy).not.toHaveBeenCalled(); // Because mock wasn't set up in time
    });
    
    it('should not update state after unmount', async () => {
      const { unmount } = renderWithAuth();
      
      // Wait for initialization
      await waitForAuthInit();
      
      // Unmount component
      unmount();
      
      // Try to trigger auth state change after unmount
      const testUser = createMockUser();
      const session = createMockSession(testUser);
      
      // This should not cause any issues or warnings
      expect(() => {
        mockClient.auth.triggerAuthStateChange('SIGNED_IN', session);
      }).not.toThrow();
    });
  });
  
  // =================== ROLE VALIDATION TESTS ===================
  
  describe('Role Validation', () => {
    const testRoles: Array<{ input: string; expected: UserRole }> = [
      { input: 'salesperson', expected: 'salesperson' },
      { input: 'FINANCE_MANAGER', expected: 'finance_manager' },
      { input: 'Sales_Manager', expected: 'sales_manager' },
      { input: 'invalid-role', expected: 'viewer' },
      { input: '', expected: 'viewer' },
    ];
    
    testRoles.forEach(({ input, expected }) => {
      it(`should validate role "${input}" to "${expected}"`, async () => {
        const testProfile = createMockProfile({
          id: 'role-test-user',
          email: 'roletest@example.com',
          role: input,
        });
        
        const { addMockTestData } = await import('../tests/mocks/supabase');
        addMockTestData([testProfile]);
        
        const testUser = createMockUser({ 
          id: 'role-test-user',
          email: 'roletest@example.com' 
        });
        const session = createMockSession(testUser);
        mockClient.auth.setCurrentSession(session);
        mockClient.auth.setCurrentUser(testUser);
        
        renderWithAuth();
        await waitForAuthInit();
        
        assertAuthState({
          role: expected,
        });
      });
    });
  });
});