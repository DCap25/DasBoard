/**
 * Test Setup for The DAS Board ReferenceError Prevention Tests
 * 
 * This setup file configures the testing environment to properly
 * test runtime safety mechanisms and ReferenceError prevention.
 */

import { expect, afterEach, beforeAll, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with testing-library matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables for testing
beforeAll(() => {
  // Mock import.meta.env
  Object.defineProperty(import.meta, 'env', {
    value: {
      VITE_SUPABASE_URL: 'https://test-project.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'test-anon-key',
      MODE: 'test',
      NODE_ENV: 'test'
    },
    writable: true
  });

  // Mock window.appEvents for testing app initialization tracking
  Object.defineProperty(window, 'appEvents', {
    value: [],
    writable: true
  });
  
  // Mock window.performance for timing tests
  Object.defineProperty(window, 'performance', {
    value: {
      now: vi.fn(() => Date.now()),
      timeOrigin: Date.now()
    },
    writable: true
  });
  
  // Mock localStorage and sessionStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  
  const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
  });
  
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
    writable: true
  });
  
  // Mock navigator for user agent tests
  Object.defineProperty(window, 'navigator', {
    value: {
      userAgent: 'test-user-agent',
      language: 'en-US',
      onLine: true
    },
    writable: true
  });
  
  // Mock location for URL-dependent tests
  Object.defineProperty(window, 'location', {
    value: {
      pathname: '/test',
      search: '',
      hash: '',
      hostname: 'localhost',
      protocol: 'https:'
    },
    writable: true
  });
});

afterAll(() => {
  // Clean up any global mocks
  vi.restoreAllMocks();
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Mock React's error boundary functionality for testing
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    // Suppress React error boundary warnings during tests
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: React.createElement') ||
       args[0].includes('The above error occurred'))
    ) {
      return;
    }
    originalConsoleError(...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
});

// Helper function to wait for error boundaries to settle
export const waitForErrorBoundary = () => {
  return new Promise(resolve => setTimeout(resolve, 0));
};

// Helper function to trigger ReferenceError scenarios
export const simulateReferenceError = (varName: string) => {
  const error = new ReferenceError(`${varName} is not defined`);
  error.name = 'ReferenceError';
  return error;
};

// Helper function to mock enum unavailability
export const mockEnumUnavailable = (enumName: string) => {
  const originalEnum = (global as any)[enumName];
  delete (global as any)[enumName];
  
  return () => {
    (global as any)[enumName] = originalEnum;
  };
};

// Helper function to create safe test environment
export const createSafeTestEnvironment = () => {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  const mockConsoleWarn = vi.fn((message: string) => {
    warnings.push(message);
  });
  
  const mockConsoleError = vi.fn((message: string) => {
    errors.push(message);
  });
  
  const originalWarn = console.warn;
  const originalError = console.error;
  
  console.warn = mockConsoleWarn;
  console.error = mockConsoleError;
  
  return {
    warnings,
    errors,
    restore: () => {
      console.warn = originalWarn;
      console.error = originalError;
    }
  };
};

// Global test utilities
declare global {
  interface Window {
    appEvents: Array<{
      event: string;
      details: Record<string, unknown>;
    }>;
  }
}

// Type definitions for test matchers
declare module 'vitest' {
  interface Assertion<T = any> {
    toBeInTheDocument(): T;
    toHaveTextContent(text: string | RegExp): T;
    toHaveClass(className: string): T;
    toBeVisible(): T;
    toBeDisabled(): T;
    toHaveValue(value: string | number): T;
  }
}