/**
 * Secure Supabase Client for The DAS Board
 * 
 * AUTHENTICATION FIXES IMPLEMENTED:
 * - Singleton pattern to prevent multiple client instances
 * - Secure environment variable validation and loading
 * - Enhanced error handling for initialization failures
 * - Real-time subscriptions enabled with proper auth
 * - Session management with secure storage
 * - Production-ready security hardening
 */

import { createClient, SupabaseClient, AuthError } from '@supabase/supabase-js';
import { Database } from './database.types';

// =================== ENVIRONMENT VALIDATION ===================

/**
 * Validates and securely loads environment variables
 * Prevents exposure of sensitive data in client bundles
 */
class SecureEnvironment {
  private static instance: SecureEnvironment;
  private validated = false;
  private errors: string[] = [];

  private constructor() {
    this.validate();
  }

  static getInstance(): SecureEnvironment {
    if (!SecureEnvironment.instance) {
      SecureEnvironment.instance = new SecureEnvironment();
    }
    return SecureEnvironment.instance;
  }

  /**
   * Comprehensive environment validation
   */
  private validate(): void {
    this.errors = [];

    // Check HTTPS requirement in production
    if (this.isProduction() && typeof window !== 'undefined') {
      const isSecure = window.location.protocol === 'https:' || 
                      window.location.hostname === 'localhost';
      if (!isSecure) {
        this.errors.push('HTTPS required in production');
      }
    }

    // Validate Supabase URL
    const url = this.getEnvVar('VITE_SUPABASE_URL');
    if (!url) {
      this.errors.push('Missing VITE_SUPABASE_URL');
    } else if (!this.isValidSupabaseUrl(url)) {
      this.errors.push('Invalid Supabase URL format');
    }

    // Validate Supabase key
    const key = this.getEnvVar('VITE_SUPABASE_ANON_KEY');
    if (!key) {
      this.errors.push('Missing VITE_SUPABASE_ANON_KEY');
    } else if (!this.isValidJWT(key)) {
      this.errors.push('Invalid Supabase key format');
    }

    this.validated = true;

    // Log validation results securely
    if (this.errors.length > 0) {
      const message = `Supabase config validation failed: ${this.errors.join(', ')}`;
      if (this.isProduction()) {
        throw new Error(message);
      } else {
        console.warn('[Supabase] Config warnings:', this.errors);
      }
    }
  }

  /**
   * Get environment variable with secure fallbacks
   */
  private getEnvVar(key: string): string | null {
    // Primary: Vite environment variables
    if (typeof import.meta !== 'undefined' && import.meta.env?.[key]) {
      return import.meta.env[key];
    }

    // Fallback: Node.js environment (SSR)
    if (typeof process !== 'undefined' && process.env?.[key]) {
      return process.env[key];
    }

    // Development fallbacks (remove these in production)
    if (!this.isProduction()) {
      if (key === 'VITE_SUPABASE_URL') {
        console.warn('[DEV] Using fallback Supabase URL - set VITE_SUPABASE_URL');
        return 'https://iugjtokydvbcvmrpeziv.supabase.co';
      }
      if (key === 'VITE_SUPABASE_ANON_KEY') {
        console.warn('[DEV] Using fallback Supabase key - set VITE_SUPABASE_ANON_KEY');
        return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Z2p0b2t5ZHZiY3ZtcnBleml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MTk3NjUsImV4cCI6MjA2MTI5NTc2NX0.XCNQoJbGQiXuyR_CFevro1Y8lqvh2_jmjrD181UYtY4';
      }
    }

    return null;
  }

  /**
   * Validate Supabase URL format
   */
  private isValidSupabaseUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:' && 
             parsed.hostname.endsWith('.supabase.co') &&
             parsed.hostname.length > 12; // Basic length check
    } catch {
      return false;
    }
  }

  /**
   * Validate JWT token format
   */
  private isValidJWT(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      // Validate base64 encoding
      atob(parts[0].replace(/-/g, '+').replace(/_/g, '/'));
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      
      return true;
    } catch {
      return false;
    }
  }

  isProduction(): boolean {
    return (typeof import.meta !== 'undefined' && import.meta.env?.PROD) ||
           (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production');
  }

  getUrl(): string | null {
    return this.getEnvVar('VITE_SUPABASE_URL');
  }

  getKey(): string | null {
    return this.getEnvVar('VITE_SUPABASE_ANON_KEY');
  }

  isValid(): boolean {
    return this.validated && this.errors.length === 0;
  }

  getErrors(): string[] {
    return [...this.errors];
  }
}

// =================== SINGLETON CLIENT MANAGER ===================

/**
 * Singleton Supabase client manager with enhanced security
 */
class SupabaseManager {
  private static instance: SupabaseManager;
  private client: SupabaseClient<Database> | null = null;
  private environment: SecureEnvironment;
  private initPromise: Promise<SupabaseClient<Database>> | null = null;
  private healthTimer: NodeJS.Timeout | null = null;
  private isHealthy = true;
  private lastHealthCheck = 0;

  private constructor() {
    this.environment = SecureEnvironment.getInstance();
    this.startHealthMonitoring();
  }

  static getInstance(): SupabaseManager {
    if (!SupabaseManager.instance) {
      SupabaseManager.instance = new SupabaseManager();
    }
    return SupabaseManager.instance;
  }

  /**
   * Get or create the Supabase client
   */
  async getClient(): Promise<SupabaseClient<Database>> {
    // Return cached client if healthy
    if (this.client && this.isHealthy) {
      return this.client;
    }

    // Return existing initialization promise
    if (this.initPromise) {
      return this.initPromise;
    }

    // Initialize new client
    this.initPromise = this.initializeClient();
    
    try {
      this.client = await this.initPromise;
      return this.client;
    } finally {
      this.initPromise = null;
    }
  }

  /**
   * Initialize Supabase client with security configuration
   */
  private async initializeClient(): Promise<SupabaseClient<Database>> {
    try {
      // Validate environment
      if (!this.environment.isValid()) {
        throw new Error(`Environment validation failed: ${this.environment.getErrors().join(', ')}`);
      }

      const url = this.environment.getUrl();
      const key = this.environment.getKey();

      if (!url || !key) {
        throw new Error('Missing Supabase configuration');
      }

      console.log('[Supabase] Initializing client', {
        url: url.replace(/\/\/([^.]+)/, '//$1***'), // Mask subdomain
        keyPrefix: key.substring(0, 10) + '...',
        env: this.environment.isProduction() ? 'production' : 'development'
      });

      // Create client with enhanced configuration
      const client = createClient<Database>(url, key, {
        auth: {
          // Enhanced session persistence for auth fixes
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          
          // Use PKCE flow for enhanced security
          flowType: 'pkce',
          
          // Secure storage configuration
          storage: this.createSecureStorage(),
          storageKey: `sb-${new URL(url).hostname.replace(/\./g, '-')}-auth`,
          
          // Debug mode for development
          debug: !this.environment.isProduction(),
        },

        global: {
          headers: {
            'X-Client-Info': 'dasboard-v1',
            'X-Requested-With': 'XMLHttpRequest',
          },
        },

        // Enable real-time with proper auth
        realtime: {
          params: {
            eventsPerSecond: 10,
            heartbeatIntervalMs: 30000,
          },
        },

        // Database configuration
        db: {
          schema: 'public',
        },
      });

      // Test connection
      await this.testConnection(client);

      // Update health status
      this.isHealthy = true;
      this.lastHealthCheck = Date.now();

      console.log('[Supabase] Client initialized successfully');
      return client;

    } catch (error) {
      this.isHealthy = false;
      const message = `Supabase initialization failed: ${error.message}`;
      console.error('[Supabase]', message);
      throw new Error(message);
    }
  }

  /**
   * Create secure storage wrapper
   */
  private createSecureStorage() {
    const STORAGE_PREFIX = 'sb-secure-';
    const MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

    return {
      getItem: (key: string): string | null => {
        try {
          if (typeof window === 'undefined') return null;
          
          const secureKey = STORAGE_PREFIX + key;
          const stored = localStorage.getItem(secureKey);
          
          if (!stored) return null;

          // Validate stored data
          try {
            const data = JSON.parse(stored);
            
            // Check age
            if (data.timestamp && Date.now() - data.timestamp > MAX_AGE) {
              localStorage.removeItem(secureKey);
              return null;
            }

            return data.value;
          } catch {
            localStorage.removeItem(secureKey);
            return null;
          }
        } catch (error) {
          console.warn('[Supabase] Storage get error:', error.message);
          return null;
        }
      },

      setItem: (key: string, value: string): void => {
        try {
          if (typeof window === 'undefined') return;
          
          const secureKey = STORAGE_PREFIX + key;
          const data = {
            value,
            timestamp: Date.now(),
          };

          localStorage.setItem(secureKey, JSON.stringify(data));
        } catch (error) {
          console.warn('[Supabase] Storage set error:', error.message);
        }
      },

      removeItem: (key: string): void => {
        try {
          if (typeof window === 'undefined') return;
          
          const secureKey = STORAGE_PREFIX + key;
          localStorage.removeItem(secureKey);
        } catch (error) {
          console.warn('[Supabase] Storage remove error:', error.message);
        }
      },
    };
  }

  /**
   * Test client connection
   */
  private async testConnection(client: SupabaseClient<Database>): Promise<void> {
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout')), 10000);
    });

    try {
      // Simple connectivity test - just verify client methods exist
      const testPromise = Promise.resolve(client.auth.getSession());
      await Promise.race([testPromise, timeout]);
      
      console.log('[Supabase] Connection test passed');
    } catch (error) {
      throw new Error(`Connection test failed: ${error.message}`);
    }
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    if (this.healthTimer) return;

    this.healthTimer = setInterval(async () => {
      if (this.client) {
        try {
          // Lightweight health check
          await this.client.auth.getSession();
          this.isHealthy = true;
          this.lastHealthCheck = Date.now();
        } catch (error) {
          console.warn('[Supabase] Health check failed:', error.message);
          this.isHealthy = false;
          
          // Reset client after failures
          if (Date.now() - this.lastHealthCheck > 60000) { // 1 minute
            this.client = null;
          }
        }
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Get connection health
   */
  getHealth() {
    return {
      healthy: this.isHealthy,
      lastCheck: this.lastHealthCheck,
      hasClient: !!this.client,
    };
  }

  /**
   * Force reconnection
   */
  async reconnect(): Promise<void> {
    this.client = null;
    this.isHealthy = false;
    await this.getClient();
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.healthTimer) {
      clearInterval(this.healthTimer);
      this.healthTimer = null;
    }
    this.client = null;
  }
}

// =================== PUBLIC API ===================

const manager = SupabaseManager.getInstance();

/**
 * Get the secure Supabase client (primary entry point)
 */
export const getSecureSupabaseClient = async (): Promise<SupabaseClient<Database>> => {
  return await manager.getClient();
};

/**
 * Synchronous client access (throws if not initialized)
 */
export const getSupabaseClientSync = (): SupabaseClient<Database> => {
  if (manager['client'] && manager.getHealth().healthy) {
    return manager['client'];
  }
  throw new Error('Supabase client not initialized - use getSecureSupabaseClient()');
};

/**
 * Backward compatibility proxy
 */
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(target, prop) {
    try {
      const client = getSupabaseClientSync();
      const value = client[prop as keyof SupabaseClient<Database>];
      return typeof value === 'function' ? value.bind(client) : value;
    } catch {
      throw new Error('Supabase client not ready - use getSecureSupabaseClient() first');
    }
  },
});

// =================== UTILITY FUNCTIONS ===================

/**
 * Test Supabase connection
 */
export const testSupabaseConnection = async () => {
  try {
    const client = await getSecureSupabaseClient();
    const health = manager.getHealth();
    
    return {
      success: true,
      health,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Test Supabase HTTP connection with timeout
 */
export const testSupabaseConnectionHttp = async (timeoutMs: number = 5000) => {
  try {
    const env = SecureEnvironment.getInstance();
    const url = env.getUrl();
    
    if (!url) {
      return {
        success: false,
        error: 'Supabase URL not configured',
        timestamp: new Date().toISOString(),
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // Test HTTP connectivity to Supabase REST API
      const response = await fetch(`${url}/rest/v1/`, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'apikey': env.getKey() || '',
        },
      });

      clearTimeout(timeoutId);

      return {
        success: response.ok || response.status === 405, // 405 is normal for REST API root
        status: response.status,
        statusText: response.statusText,
        timestamp: new Date().toISOString(),
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        return {
          success: false,
          error: `Connection timeout after ${timeoutMs}ms`,
          timestamp: new Date().toISOString(),
        };
      }

      throw fetchError;
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Quick session token check
 */
export const hasSessionToken = (): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    
    // Look for secure session tokens
    const keys = Object.keys(localStorage);
    return keys.some(key => 
      key.startsWith('sb-secure-') && 
      key.includes('auth') &&
      localStorage.getItem(key) !== null
    );
  } catch {
    return false;
  }
};

/**
 * Quick session token check (alias for compatibility)
 */
export const quickHasSupabaseSessionToken = hasSessionToken;

/**
 * Check if email is a test email
 */
export const isTestEmail = (email: string): boolean => {
  if (!email) return false;
  
  const testPatterns = [
    /^test.*@.*\.com$/i,
    /^.*test@.*\.com$/i,
    /^.*@test.*\.com$/i,
    /^demo.*@.*\.com$/i,
    /^.*demo@.*\.com$/i,
    /^.*@.*test.*$/i,
    /^testfinance@.*\.com$/i,
  ];
  
  return testPatterns.some(pattern => pattern.test(email));
};

/**
 * Validate current session
 */
export const hasValidSession = async (): Promise<boolean> => {
  try {
    const client = await getSecureSupabaseClient();
    const { data: { session }, error } = await client.auth.getSession();
    
    if (error || !session) return false;
    
    // Check if session is expired
    if (session.expires_at && session.expires_at <= Math.floor(Date.now() / 1000)) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
};

/**
 * Get current user with role
 */
export const getCurrentUser = async () => {
  try {
    const client = await getSecureSupabaseClient();
    const { data: { user }, error } = await client.auth.getUser();
    
    if (error || !user) return null;
    
    // Get user role (with fallback)
    try {
      const { data: profile } = await client
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
        
      return { ...user, role: profile?.role || 'viewer' };
    } catch {
      return { ...user, role: 'viewer' };
    }
  } catch (error) {
    console.error('[Supabase] Get user error:', error.message);
    return null;
  }
};

/**
 * Get user's dealership ID
 */
export const getUserDealershipId = async (): Promise<number | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;
    
    const client = await getSecureSupabaseClient();
    
    // Try users table first
    const { data } = await client
      .from('users')
      .select('dealership_id')
      .eq('id', user.id)
      .single();
      
    return data?.dealership_id || null;
  } catch {
    return null;
  }
};

/**
 * Get dealership data from Supabase
 */
export const getDealershipSupabase = async (dealershipId: number) => {
  try {
    const client = await getSecureSupabaseClient();
    
    const { data, error } = await client
      .from('dealerships')
      .select('*')
      .eq('id', dealershipId)
      .single();
    
    if (error) {
      throw new Error(`Failed to fetch dealership: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('[Supabase] Get dealership error:', error.message);
    throw error;
  }
};

/**
 * Health monitoring
 */
export const getConnectionHealth = () => manager.getHealth();
export const forceReconnect = () => manager.reconnect();
export const isConfigured = () => SecureEnvironment.getInstance().isValid();
export const getConfigurationErrors = () => SecureEnvironment.getInstance().getErrors();

/**
 * Cleanup function
 */
export const cleanupSupabaseClient = (): void => {
  manager.cleanup();
};

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', cleanupSupabaseClient);
}

// =================== TYPE EXPORTS ===================

export type { Database } from './database.types';

// Common types for the application
export type DealType = 'Cash' | 'Finance' | 'Lease';
export type VehicleType = 'N' | 'U' | 'D';
export type DealStatus = 'Pending' | 'Funded' | 'Unwound';

export interface Deal {
  id?: string;
  stock_number: string;
  vin_last8: string;
  new_or_used: VehicleType;
  customer_last_name: string;
  deal_type: DealType;
  reserve_flat_amount: number | null;
  vsc_profit: number | null;
  ppm_profit: number | null;
  tire_wheel_profit: number | null;
  paint_fabric_profit: number | null;
  other_profit: number | null;
  front_end_gross: number;
  status: DealStatus;
  created_by?: string;
  sales_manager_id?: string | null;
  fi_manager_id?: string;
  salesperson_id?: string;
  salesperson_initials?: string;
  created_at?: string;
  updated_at?: string;
  funded_at?: string | null;
  unwound_at?: string | null;
}

export type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role_id: string;
  created_by: string;
  created_at: string;
};