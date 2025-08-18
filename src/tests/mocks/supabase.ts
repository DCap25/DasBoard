/**
 * Supabase Mock Implementation for Testing
 * 
 * FEATURES IMPLEMENTED:
 * - Mock Supabase client with auth, database operations
 * - Session simulation with configurable states
 * - User authentication flow mocking
 * - Database query mocking with realistic responses
 * - Error simulation for testing error handling
 * - Real-time subscription mocking
 * - File storage mocking
 * - Mock data generators for consistent testing
 */

import { User, Session, AuthError, AuthResponse, UserResponse } from '@supabase/supabase-js';
import { Database } from '../../lib/database.types';

// =================== TYPES ===================

export interface MockSession extends Session {
  expires_at: number;
}

export interface MockSupabaseConfig {
  shouldFailAuth?: boolean;
  shouldFailDatabase?: boolean;
  sessionExpired?: boolean;
  networkError?: boolean;
  customError?: string;
  customDelay?: number;
}

export interface MockUserProfile {
  id: string;
  email: string;
  role: string;
  dealership_id: number;
  is_group_admin?: boolean;
  first_name?: string;
  last_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MockDealership {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  active: boolean;
}

// =================== MOCK DATA GENERATORS ===================

/**
 * Generate mock user data
 */
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'test-user-123',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {
    first_name: 'Test',
    last_name: 'User',
  },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  role: 'authenticated',
  updated_at: new Date().toISOString(),
  email_confirmed_at: new Date().toISOString(),
  phone_confirmed_at: null,
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  ...overrides,
});

/**
 * Generate mock session data
 */
export const createMockSession = (user?: User, overrides: Partial<MockSession> = {}): MockSession => {
  const now = Math.floor(Date.now() / 1000);
  const mockUser = user || createMockUser();
  
  return {
    user: mockUser,
    access_token: 'mock-access-token-123',
    refresh_token: 'mock-refresh-token-456',
    expires_in: 3600,
    expires_at: now + 3600,
    token_type: 'bearer',
    ...overrides,
  };
};

/**
 * Generate mock user profile
 */
export const createMockProfile = (overrides: Partial<MockUserProfile> = {}): MockUserProfile => ({
  id: 'test-user-123',
  email: 'test@example.com',
  role: 'salesperson',
  dealership_id: 1,
  is_group_admin: false,
  first_name: 'Test',
  last_name: 'User',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

/**
 * Generate mock dealership data
 */
export const createMockDealership = (overrides: Partial<MockDealership> = {}): MockDealership => ({
  id: 1,
  name: 'Test Dealership',
  address: '123 Test Street, Test City, TS 12345',
  phone: '(555) 123-4567',
  active: true,
  ...overrides,
});

/**
 * Generate mock auth error
 */
export const createMockAuthError = (message: string = 'Authentication failed'): AuthError => ({
  name: 'AuthError',
  message,
  status: 401,
});

// =================== MOCK STORAGE ===================

/**
 * In-memory storage for mock data persistence during tests
 */
class MockStorage {
  private users = new Map<string, MockUserProfile>();
  private dealerships = new Map<number, MockDealership>();
  private sessions = new Map<string, MockSession>();
  
  // User operations
  addUser(user: MockUserProfile): void {
    this.users.set(user.id, user);
  }
  
  getUser(id: string): MockUserProfile | null {
    return this.users.get(id) || null;
  }
  
  getUserByEmail(email: string): MockUserProfile | null {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }
  
  updateUser(id: string, updates: Partial<MockUserProfile>): MockUserProfile | null {
    const user = this.users.get(id);
    if (!user) return null;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  deleteUser(id: string): boolean {
    return this.users.delete(id);
  }
  
  // Dealership operations
  addDealership(dealership: MockDealership): void {
    this.dealerships.set(dealership.id, dealership);
  }
  
  getDealership(id: number): MockDealership | null {
    return this.dealerships.get(id) || null;
  }
  
  // Session operations
  addSession(userId: string, session: MockSession): void {
    this.sessions.set(userId, session);
  }
  
  getSession(userId: string): MockSession | null {
    return this.sessions.get(userId) || null;
  }
  
  deleteSession(userId: string): boolean {
    return this.sessions.delete(userId);
  }
  
  // Utility
  clear(): void {
    this.users.clear();
    this.dealerships.clear();
    this.sessions.clear();
  }
  
  reset(): void {
    this.clear();
    // Add default test data
    this.addUser(createMockProfile());
    this.addDealership(createMockDealership());
  }
}

const mockStorage = new MockStorage();

// =================== MOCK QUERY BUILDER ===================

/**
 * Mock query builder for database operations
 */
class MockQueryBuilder {
  private tableName: string;
  private selectColumns: string = '*';
  private whereConditions: Array<{ column: string; value: any; operator: string }> = [];
  private config: MockSupabaseConfig;
  
  constructor(tableName: string, config: MockSupabaseConfig = {}) {
    this.tableName = tableName;
    this.config = config;
  }
  
  select(columns: string = '*'): MockQueryBuilder {
    this.selectColumns = columns;
    return this;
  }
  
  eq(column: string, value: any): MockQueryBuilder {
    this.whereConditions.push({ column, value, operator: 'eq' });
    return this;
  }
  
  neq(column: string, value: any): MockQueryBuilder {
    this.whereConditions.push({ column, value, operator: 'neq' });
    return this;
  }
  
  gt(column: string, value: any): MockQueryBuilder {
    this.whereConditions.push({ column, value, operator: 'gt' });
    return this;
  }
  
  gte(column: string, value: any): MockQueryBuilder {
    this.whereConditions.push({ column, value, operator: 'gte' });
    return this;
  }
  
  lt(column: string, value: any): MockQueryBuilder {
    this.whereConditions.push({ column, value, operator: 'lt' });
    return this;
  }
  
  lte(column: string, value: any): MockQueryBuilder {
    this.whereConditions.push({ column, value, operator: 'lte' });
    return this;
  }
  
  like(column: string, value: string): MockQueryBuilder {
    this.whereConditions.push({ column, value, operator: 'like' });
    return this;
  }
  
  in(column: string, values: any[]): MockQueryBuilder {
    this.whereConditions.push({ column, value: values, operator: 'in' });
    return this;
  }
  
  is(column: string, value: any): MockQueryBuilder {
    this.whereConditions.push({ column, value, operator: 'is' });
    return this;
  }
  
  order(column: string, ascending = true): MockQueryBuilder {
    // Mock implementation - could be extended
    return this;
  }
  
  limit(count: number): MockQueryBuilder {
    // Mock implementation - could be extended
    return this;
  }
  
  single(): MockQueryBuilder {
    // Mock implementation - returns single result
    return this;
  }
  
  maybeSingle(): MockQueryBuilder {
    // Mock implementation - returns single result or null
    return this;
  }
  
  async then<T>(onFulfilled?: (value: any) => T, onRejected?: (reason: any) => T): Promise<T> {
    if (this.config.customDelay) {
      await new Promise(resolve => setTimeout(resolve, this.config.customDelay));
    }
    
    if (this.config.shouldFailDatabase) {
      const error = this.config.customError || 'Database operation failed';
      if (onRejected) return onRejected(new Error(error));
      throw new Error(error);
    }
    
    if (this.config.networkError) {
      const error = new Error('Network error: Failed to connect');
      if (onRejected) return onRejected(error);
      throw error;
    }
    
    const result = await this.executeQuery();
    return onFulfilled ? onFulfilled(result) : result;
  }
  
  private async executeQuery(): Promise<{ data: any; error: null } | { data: null; error: any }> {
    try {
      let data: any = null;
      
      switch (this.tableName) {
        case 'profiles':
        case 'users':
          data = this.queryUsers();
          break;
        case 'dealerships':
          data = this.queryDealerships();
          break;
        case 'roles':
          data = this.queryRoles();
          break;
        default:
          data = []; // Empty result for unknown tables
      }
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
  
  private queryUsers(): any {
    if (this.whereConditions.length === 0) {
      return Array.from(mockStorage['users'].values());
    }
    
    // Simple filtering logic
    for (const condition of this.whereConditions) {
      if (condition.column === 'id' && condition.operator === 'eq') {
        const user = mockStorage.getUser(condition.value);
        return user ? [user] : [];
      }
      if (condition.column === 'email' && condition.operator === 'eq') {
        const user = mockStorage.getUserByEmail(condition.value);
        return user ? [user] : [];
      }
    }
    
    return [];
  }
  
  private queryDealerships(): any {
    if (this.whereConditions.length === 0) {
      return Array.from(mockStorage['dealerships'].values());
    }
    
    for (const condition of this.whereConditions) {
      if (condition.column === 'id' && condition.operator === 'eq') {
        const dealership = mockStorage.getDealership(condition.value);
        return dealership ? [dealership] : [];
      }
    }
    
    return [];
  }
  
  private queryRoles(): any {
    // Mock roles data
    const roles = [
      { id: 1, name: 'salesperson' },
      { id: 2, name: 'finance_manager' },
      { id: 3, name: 'sales_manager' },
      { id: 4, name: 'general_manager' },
      { id: 5, name: 'admin' },
    ];
    
    if (this.whereConditions.length === 0) {
      return roles;
    }
    
    return roles.filter(role => {
      return this.whereConditions.every(condition => {
        const value = (role as any)[condition.column];
        switch (condition.operator) {
          case 'eq': return value === condition.value;
          case 'neq': return value !== condition.value;
          default: return true;
        }
      });
    });
  }
}

// =================== MOCK AUTH CLIENT ===================

/**
 * Mock authentication client
 */
class MockAuthClient {
  private config: MockSupabaseConfig;
  private currentSession: MockSession | null = null;
  private currentUser: User | null = null;
  private listeners: Array<(event: string, session: Session | null) => void> = [];
  
  constructor(config: MockSupabaseConfig = {}) {
    this.config = config;
  }
  
  async getSession(): Promise<{ data: { session: MockSession | null }; error: AuthError | null }> {
    if (this.config.customDelay) {
      await new Promise(resolve => setTimeout(resolve, this.config.customDelay));
    }
    
    if (this.config.shouldFailAuth) {
      return { 
        data: { session: null }, 
        error: createMockAuthError(this.config.customError || 'Failed to get session') 
      };
    }
    
    if (this.config.networkError) {
      return { 
        data: { session: null }, 
        error: createMockAuthError('Network error: Failed to connect') 
      };
    }
    
    if (this.config.sessionExpired && this.currentSession) {
      const expiredSession = {
        ...this.currentSession,
        expires_at: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
      };
      return { data: { session: expiredSession }, error: null };
    }
    
    return { data: { session: this.currentSession }, error: null };
  }
  
  async getUser(): Promise<UserResponse> {
    if (this.config.customDelay) {
      await new Promise(resolve => setTimeout(resolve, this.config.customDelay));
    }
    
    if (this.config.shouldFailAuth) {
      return { 
        data: { user: null }, 
        error: createMockAuthError(this.config.customError || 'Failed to get user') 
      };
    }
    
    return { data: { user: this.currentUser }, error: null };
  }
  
  async signInWithPassword({ email, password, options }: {
    email: string;
    password: string;
    options?: { persistSession?: boolean };
  }): Promise<AuthResponse> {
    if (this.config.customDelay) {
      await new Promise(resolve => setTimeout(resolve, this.config.customDelay));
    }
    
    if (this.config.shouldFailAuth) {
      const error = createMockAuthError(this.config.customError || 'Invalid login credentials');
      return { data: { user: null, session: null }, error };
    }
    
    if (this.config.networkError) {
      const error = createMockAuthError('Network error: Failed to connect');
      return { data: { user: null, session: null }, error };
    }
    
    // Check if user exists in mock storage
    const profile = mockStorage.getUserByEmail(email);
    if (!profile) {
      const error = createMockAuthError('Invalid login credentials');
      return { data: { user: null, session: null }, error };
    }
    
    // Create mock user and session
    const user = createMockUser({
      id: profile.id,
      email: profile.email,
      user_metadata: {
        first_name: profile.first_name,
        last_name: profile.last_name,
      },
    });
    
    const session = createMockSession(user);
    
    this.currentUser = user;
    this.currentSession = session;
    
    // Store session in mock storage
    mockStorage.addSession(user.id, session);
    
    // Trigger auth state change
    setTimeout(() => {
      this.notifyListeners('SIGNED_IN', session);
    }, 10);
    
    return { data: { user, session }, error: null };
  }
  
  async signUp({ email, password, options }: {
    email: string;
    password: string;
    options?: { data?: any };
  }): Promise<AuthResponse> {
    if (this.config.customDelay) {
      await new Promise(resolve => setTimeout(resolve, this.config.customDelay));
    }
    
    if (this.config.shouldFailAuth) {
      const error = createMockAuthError(this.config.customError || 'Sign up failed');
      return { data: { user: null, session: null }, error };
    }
    
    if (this.config.networkError) {
      const error = createMockAuthError('Network error: Failed to connect');
      return { data: { user: null, session: null }, error };
    }
    
    // Check if user already exists
    if (mockStorage.getUserByEmail(email)) {
      const error = createMockAuthError('User already registered');
      return { data: { user: null, session: null }, error };
    }
    
    // Create new user
    const userId = `user-${Date.now()}`;
    const user = createMockUser({
      id: userId,
      email,
      user_metadata: options?.data || {},
    });
    
    // Create profile in mock storage
    const profile = createMockProfile({
      id: userId,
      email,
      first_name: options?.data?.first_name || 'Test',
      last_name: options?.data?.last_name || 'User',
      role: options?.data?.role || 'viewer',
    });
    
    mockStorage.addUser(profile);
    
    // Create session
    const session = createMockSession(user);
    this.currentUser = user;
    this.currentSession = session;
    
    mockStorage.addSession(userId, session);
    
    // Trigger auth state change
    setTimeout(() => {
      this.notifyListeners('SIGNED_IN', session);
    }, 10);
    
    return { data: { user, session }, error: null };
  }
  
  async signOut(): Promise<{ error: AuthError | null }> {
    if (this.config.customDelay) {
      await new Promise(resolve => setTimeout(resolve, this.config.customDelay));
    }
    
    if (this.config.shouldFailAuth) {
      return { error: createMockAuthError(this.config.customError || 'Sign out failed') };
    }
    
    // Clear current session
    if (this.currentUser) {
      mockStorage.deleteSession(this.currentUser.id);
    }
    
    this.currentUser = null;
    this.currentSession = null;
    
    // Trigger auth state change
    setTimeout(() => {
      this.notifyListeners('SIGNED_OUT', null);
    }, 10);
    
    return { error: null };
  }
  
  async refreshSession(): Promise<AuthResponse> {
    if (this.config.customDelay) {
      await new Promise(resolve => setTimeout(resolve, this.config.customDelay));
    }
    
    if (this.config.shouldFailAuth) {
      const error = createMockAuthError(this.config.customError || 'Token refresh failed');
      return { data: { user: null, session: null }, error };
    }
    
    if (!this.currentSession || !this.currentUser) {
      const error = createMockAuthError('No session to refresh');
      return { data: { user: null, session: null }, error };
    }
    
    // Create new refreshed session
    const refreshedSession = createMockSession(this.currentUser, {
      access_token: `refreshed-token-${Date.now()}`,
      refresh_token: this.currentSession.refresh_token,
    });
    
    this.currentSession = refreshedSession;
    mockStorage.addSession(this.currentUser.id, refreshedSession);
    
    // Trigger auth state change
    setTimeout(() => {
      this.notifyListeners('TOKEN_REFRESHED', refreshedSession);
    }, 10);
    
    return { data: { user: this.currentUser, session: refreshedSession }, error: null };
  }
  
  onAuthStateChange(callback: (event: string, session: Session | null) => void): { 
    data: { subscription: { unsubscribe: () => void } } 
  } {
    this.listeners.push(callback);
    
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            const index = this.listeners.indexOf(callback);
            if (index > -1) {
              this.listeners.splice(index, 1);
            }
          }
        }
      }
    };
  }
  
  private notifyListeners(event: string, session: Session | null): void {
    this.listeners.forEach(listener => {
      try {
        listener(event, session);
      } catch (error) {
        console.error('Error in auth state listener:', error);
      }
    });
  }
  
  // Test utilities
  setCurrentUser(user: User | null): void {
    this.currentUser = user;
  }
  
  setCurrentSession(session: MockSession | null): void {
    this.currentSession = session;
  }
  
  triggerAuthStateChange(event: string, session: Session | null): void {
    this.notifyListeners(event, session);
  }
}

// =================== MOCK SUPABASE CLIENT ===================

/**
 * Main mock Supabase client
 */
export class MockSupabaseClient {
  public auth: MockAuthClient;
  private config: MockSupabaseConfig;
  
  constructor(config: MockSupabaseConfig = {}) {
    this.config = config;
    this.auth = new MockAuthClient(config);
  }
  
  from(table: string): MockQueryBuilder {
    return new MockQueryBuilder(table, this.config);
  }
  
  // Storage mock (basic implementation)
  get storage() {
    return {
      from: (bucket: string) => ({
        upload: async (path: string, file: any) => {
          if (this.config.shouldFailDatabase) {
            return { data: null, error: new Error('Upload failed') };
          }
          return { data: { path, Key: path }, error: null };
        },
        download: async (path: string) => {
          if (this.config.shouldFailDatabase) {
            return { data: null, error: new Error('Download failed') };
          }
          return { data: new Blob(['mock file content']), error: null };
        },
        remove: async (paths: string[]) => {
          if (this.config.shouldFailDatabase) {
            return { data: null, error: new Error('Remove failed') };
          }
          return { data: paths.map(path => ({ name: path })), error: null };
        },
      })
    };
  }
  
  // Real-time subscriptions mock
  channel(name: string) {
    return {
      on: (event: string, filter: any, callback: Function) => {
        // Mock subscription - could be enhanced for testing real-time features
        return this;
      },
      subscribe: () => {
        return { status: 'SUBSCRIBED' };
      },
      unsubscribe: () => {
        return { status: 'CLOSED' };
      }
    };
  }
  
  // Configuration methods for tests
  setConfig(newConfig: Partial<MockSupabaseConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.auth = new MockAuthClient(this.config);
  }
  
  resetConfig(): void {
    this.config = {};
    this.auth = new MockAuthClient({});
  }
}

// =================== MOCK FACTORY FUNCTIONS ===================

/**
 * Create a mock Supabase client with optional configuration
 */
export const createMockSupabaseClient = (config: MockSupabaseConfig = {}): MockSupabaseClient => {
  return new MockSupabaseClient(config);
};

/**
 * Create a pre-configured mock client with authenticated user
 */
export const createAuthenticatedMockClient = (
  userOverrides: Partial<User> = {},
  profileOverrides: Partial<MockUserProfile> = {}
): MockSupabaseClient => {
  const client = createMockSupabaseClient();
  
  // Create user and profile
  const user = createMockUser(userOverrides);
  const profile = createMockProfile({ id: user.id, email: user.email, ...profileOverrides });
  const session = createMockSession(user);
  
  // Set up mock storage
  mockStorage.addUser(profile);
  mockStorage.addSession(user.id, session);
  
  // Set authenticated state
  client.auth.setCurrentUser(user);
  client.auth.setCurrentSession(session);
  
  return client;
};

/**
 * Reset all mock data and state
 */
export const resetMockSupabase = (): void => {
  mockStorage.reset();
};

/**
 * Add test data to mock storage
 */
export const addMockTestData = (
  users: MockUserProfile[] = [],
  dealerships: MockDealership[] = []
): void => {
  users.forEach(user => mockStorage.addUser(user));
  dealerships.forEach(dealership => mockStorage.addDealership(dealership));
};

// =================== TEST UTILITIES ===================

/**
 * Wait for auth state changes to propagate
 */
export const waitForAuthState = (ms = 50): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Simulate network delay
 */
export const simulateNetworkDelay = (ms = 100): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Common test scenarios
 */
export const TestScenarios = {
  SUCCESS: {},
  AUTH_FAILURE: { shouldFailAuth: true, customError: 'Authentication failed' },
  DATABASE_FAILURE: { shouldFailDatabase: true, customError: 'Database error' },
  NETWORK_ERROR: { networkError: true },
  SESSION_EXPIRED: { sessionExpired: true },
  SLOW_CONNECTION: { customDelay: 1000 },
  RATE_LIMITED: { shouldFailAuth: true, customError: 'Too many requests' },
};

// =================== EXPORTS ===================

export {
  mockStorage,
  MockSupabaseClient,
  MockAuthClient,
  MockQueryBuilder,
};

export type {
  MockSupabaseConfig,
  MockUserProfile,
  MockDealership,
  MockSession,
};

// Default export for easy importing
export default {
  createMockSupabaseClient,
  createAuthenticatedMockClient,
  resetMockSupabase,
  addMockTestData,
  waitForAuthState,
  simulateNetworkDelay,
  TestScenarios,
  createMockUser,
  createMockSession,
  createMockProfile,
  createMockDealership,
  createMockAuthError,
};