/**
 * Test Setup Configuration for The DAS Board
 * 
 * FEATURES IMPLEMENTED:
 * - React Testing Library configuration
 * - DOM testing environment setup
 * - Supabase client mocking
 * - Global test utilities and matchers
 * - Console warning filtering for tests
 * - Cleanup after each test
 * - Mock implementations for external dependencies
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll, vi } from 'vitest';
import { resetMockSupabase, createMockSupabaseClient } from './mocks/supabase';
import type { MockSupabaseConfig } from './mocks/supabase';

// =================== GLOBAL TEST SETUP ===================

/**
 * Clean up after each test
 */
afterEach(() => {
  cleanup();
  resetMockSupabase();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

/**
 * Setup before all tests
 */
beforeAll(() => {
  // Suppress console warnings during tests (optional)
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    // Filter out known warnings that are expected during testing
    const message = args[0]?.toString() || '';
    
    // Skip React dev warnings that are expected in tests
    if (message.includes('Warning: ReactDOM.render is deprecated')) return;
    if (message.includes('Warning: validateDOMNesting')) return;
    if (message.includes('act(...)')) return;
    
    // Call original warn for other messages
    originalWarn.apply(console, args);
  };
  
  // Mock window.matchMedia for responsive tests
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
  
  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
  
  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
  
  // Mock scrollIntoView
  Element.prototype.scrollIntoView = vi.fn();
  
  // Mock clipboard API
  Object.assign(navigator, {
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue(''),
    },
  });
  
  // Mock crypto.getRandomValues for UUID generation
  Object.defineProperty(global, 'crypto', {
    value: {
      getRandomValues: vi.fn().mockImplementation((arr: any) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 256);
        }
        return arr;
      }),
      randomUUID: vi.fn().mockImplementation(() => 
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        })
      ),
    },
  });
});

/**
 * Cleanup after all tests
 */
afterAll(() => {
  // Restore original console methods
  vi.restoreAllMocks();
});

// =================== SUPABASE MOCKING ===================

/**
 * Mock the Supabase client module
 */
vi.mock('../lib/supabaseClient', () => {
  let mockClient: any = null;
  
  return {
    getSecureSupabaseClient: vi.fn().mockImplementation(async () => {
      if (!mockClient) {
        mockClient = createMockSupabaseClient();
      }
      return mockClient;
    }),
    
    hasValidSession: vi.fn().mockImplementation(async () => {
      if (!mockClient) return false;
      const { data } = await mockClient.auth.getSession();
      return !!data.session;
    }),
    
    getCurrentUser: vi.fn().mockImplementation(async () => {
      if (!mockClient) return null;
      const { data } = await mockClient.auth.getUser();
      return data.user;
    }),
    
    getUserDealershipId: vi.fn().mockImplementation(async (userId: string) => {
      if (!mockClient) return null;
      const { data } = await mockClient.from('profiles').select('dealership_id').eq('id', userId).single();
      return data?.dealership_id || null;
    }),
    
    testSupabaseConnection: vi.fn().mockImplementation(async () => {
      return { success: true, error: null };
    }),
    
    // Utility function for tests to set mock client
    __setMockClient: (client: any) => {
      mockClient = client;
    },
    
    // Utility function for tests to get current mock client
    __getMockClient: () => mockClient,
    
    // Reset mock client
    __resetMockClient: () => {
      mockClient = null;
    },
  };
});

/**
 * Mock DOMPurify for security testing
 */
vi.mock('isomorphic-dompurify', () => ({
  default: {
    sanitize: vi.fn().mockImplementation((dirty: string) => {
      // Simple sanitization for testing
      return dirty
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    }),
    isSupported: true,
  },
}));

/**
 * Mock crypto-js for encryption testing
 */
vi.mock('crypto-js', () => ({
  AES: {
    encrypt: vi.fn().mockImplementation((text: string) => ({
      toString: vi.fn().mockReturnValue('encrypted-' + text),
    })),
    decrypt: vi.fn().mockImplementation((encrypted: string) => ({
      toString: vi.fn().mockImplementation(() => encrypted.replace('encrypted-', '')),
    })),
  },
  enc: {
    Utf8: {
      parse: vi.fn(),
      stringify: vi.fn(),
    },
  },
}));

/**
 * Mock toast notifications
 */
vi.mock('../lib/use-toast', () => ({
  toast: vi.fn(),
  useToast: vi.fn().mockReturnValue({
    toast: vi.fn(),
    dismiss: vi.fn(),
    toasts: [],
  }),
}));

/**
 * Mock React Router
 */
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn().mockReturnValue(vi.fn()),
    useLocation: vi.fn().mockReturnValue({
      pathname: '/',
      search: '',
      hash: '',
      state: null,
    }),
    useParams: vi.fn().mockReturnValue({}),
    useSearchParams: vi.fn().mockReturnValue([new URLSearchParams(), vi.fn()]),
  };
});

// =================== GLOBAL TEST UTILITIES ===================

/**
 * Set up mock Supabase client with specific configuration
 */
export const setupMockSupabase = (config: MockSupabaseConfig = {}) => {
  const mockClient = createMockSupabaseClient(config);
  const { __setMockClient } = vi.mocked(await import('../lib/supabaseClient'));
  __setMockClient(mockClient);
  return mockClient;
};

/**
 * Reset mock Supabase client
 */
export const resetMockSupabaseClient = () => {
  const { __resetMockClient } = vi.mocked(await import('../lib/supabaseClient'));
  __resetMockClient();
  resetMockSupabase();
};

/**
 * Wait for async operations to complete
 */
export const waitFor = (ms = 0): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Flush all pending promises
 */
export const flushPromises = (): Promise<void> => {
  return new Promise(resolve => setImmediate(resolve));
};

/**
 * Mock implementation helper
 */
export const createMockImplementation = <T extends (...args: any[]) => any>(
  implementation: T
): vi.MockedFunction<T> => {
  return vi.fn().mockImplementation(implementation);
};

/**
 * Assert that a mock was called with specific arguments
 */
export const expectMockCalledWith = (
  mockFn: vi.MockedFunction<any>,
  expectedArgs: any[]
): void => {
  expect(mockFn).toHaveBeenCalledWith(...expectedArgs);
};

/**
 * Custom error class for testing
 */
export class TestError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'TestError';
  }
}

// =================== GLOBAL DECLARATIONS ===================

declare global {
  namespace Vi {
    interface Assertion {
      toBeInTheDocument(): void;
      toHaveTextContent(text: string | RegExp): void;
      toHaveClass(className: string): void;
      toHaveStyle(style: Record<string, any>): void;
      toBeVisible(): void;
      toBeDisabled(): void;
      toBeEnabled(): void;
      toBeChecked(): void;
      toHaveValue(value: string | number): void;
      toHaveDisplayValue(value: string | RegExp | Array<string | RegExp>): void;
      toBeEmptyDOMElement(): void;
      toBeInvalid(): void;
      toBeRequired(): void;
      toHaveErrorMessage(text: string | RegExp): void;
    }
  }
}

// =================== EXPORTS ===================

export {
  setupMockSupabase,
  resetMockSupabaseClient,
  waitFor,
  flushPromises,
  createMockImplementation,
  expectMockCalledWith,
  TestError,
};