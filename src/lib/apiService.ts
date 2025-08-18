/**
 * Enhanced API Service for The DAS Board
 * 
 * FIXES IMPLEMENTED:
 * - Supabase access token in headers for authenticated requests
 * - 401/403 error handling with session refresh/logout
 * - Input sanitization and validation
 * - Seamless mock-to-Supabase switching for production
 * - HTTPS enforcement and request retries
 * - Comprehensive error handling and logging
 */

import { 
  getSecureSupabaseClient,
  getCurrentUser,
  hasValidSession,
  getUserDealershipId,
  testSupabaseConnection,
  forceReconnect,
  cleanupSupabaseClient,
} from './supabaseClient';
import { Database } from './database.types';
import type { User, Session } from '@supabase/supabase-js';

// =================== TYPES ===================

export interface ApiResponse<T = any> {
  data: T | null;
  error: ApiError | null;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  requireAuth?: boolean;
  skipTokenRefresh?: boolean;
}

// Dealership data types
export interface Dealership {
  id: number;
  name: string;
  schema_name: string;
  group_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Sale {
  id: string;
  dealership_id: string;
  sale_date: string;
  amount: number;
  customer_name?: string;
  vehicle_model?: string;
  status?: 'pending' | 'completed' | 'cancelled';
}

export interface Deal {
  id?: string;
  stock_number: string;
  vin_last8: string;
  customer_last_name: string;
  deal_type: 'Cash' | 'Finance' | 'Lease';
  front_end_gross: number;
  status: 'Pending' | 'Funded' | 'Unwound';
  created_at?: string;
  updated_at?: string;
}

// =================== CONFIGURATION ===================

// Environment detection and configuration
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// HTTPS enforcement - critical for production security
const ENFORCE_HTTPS = isProduction || import.meta.env.VITE_ENFORCE_HTTPS === 'true';

// API configuration with fallbacks
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.dasboard.app';

// Mock API detection - seamlessly switch between mock and real API
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true' && isDevelopment;

// Request configuration
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_RETRIES = 3;
const RETRY_DELAY_BASE = 1000; // 1 second base delay

// Rate limiting
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100;
const requestCounts = new Map<string, { count: number; resetTime: number }>();

// =================== AUTHENTICATION MANAGER ===================

class AuthManager {
  private static instance: AuthManager;
  private currentSession: Session | null = null;
  private refreshPromise: Promise<Session | null> | null = null;

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  /**
   * Get current access token with automatic refresh
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const client = await getSecureSupabaseClient();
      const { data: { session }, error } = await client.auth.getSession();

      if (error) {
        console.error('[API] Session fetch error:', error.message);
        return null;
      }

      if (!session) {
        console.warn('[API] No active session');
        return null;
      }

      // Check if token is expired or expiring soon (within 5 minutes)
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = session.expires_at || 0;
      const isExpiringSoon = (expiresAt - now) < 300;

      if (isExpiringSoon) {
        console.log('[API] Token expiring soon, refreshing...');
        const refreshedSession = await this.refreshSession();
        return refreshedSession?.access_token || null;
      }

      this.currentSession = session;
      return session.access_token;
    } catch (error) {
      console.error('[API] Access token fetch failed:', error);
      return null;
    }
  }

  /**
   * Refresh session with concurrency protection
   */
  private async refreshSession(): Promise<Session | null> {
    // Prevent concurrent refresh requests
    if (this.refreshPromise) {
      return await this.refreshPromise;
    }

    this.refreshPromise = this._performRefresh();
    
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * Perform actual session refresh
   */
  private async _performRefresh(): Promise<Session | null> {
    try {
      const client = await getSecureSupabaseClient();
      const { data, error } = await client.auth.refreshSession();

      if (error) {
        console.error('[API] Session refresh failed:', error.message);
        // Force logout on refresh failure
        await this.handleAuthFailure();
        return null;
      }

      if (data.session) {
        this.currentSession = data.session;
        console.log('[API] Session refreshed successfully');
        return data.session;
      }

      console.warn('[API] Session refresh returned no session');
      return null;
    } catch (error) {
      console.error('[API] Session refresh exception:', error);
      await this.handleAuthFailure();
      return null;
    }
  }

  /**
   * Handle authentication failures (401/403 errors)
   */
  async handleAuthFailure(): Promise<void> {
    try {
      console.log('[API] Handling auth failure - signing out');
      
      const client = await getSecureSupabaseClient();
      await client.auth.signOut();
      
      this.currentSession = null;
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/auth')) {
        window.location.href = '/auth/signin';
      }
    } catch (error) {
      console.error('[API] Auth failure handling error:', error);
      // Force redirect even if signOut fails
      window.location.href = '/auth/signin';
    }
  }

  /**
   * Get authentication headers for API requests
   */
  async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getAccessToken();
    
    if (!token) {
      throw new Error('No valid authentication token available');
    }

    return {
      'Authorization': `Bearer ${token}`,
      'X-Auth-Provider': 'supabase',
    };
  }
}

// =================== INPUT SANITIZATION ===================

/**
 * Sanitize string input to prevent XSS and injection attacks
 */
function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .substring(0, 1000); // Limit length
}

/**
 * Sanitize object recursively
 */
function sanitizeInput(input: any): any {
  if (input === null || input === undefined) {
    return input;
  }

  if (typeof input === 'string') {
    return sanitizeString(input);
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }

  if (typeof input === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      const sanitizedKey = sanitizeString(key);
      sanitized[sanitizedKey] = sanitizeInput(value);
    }
    return sanitized;
  }

  return input;
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate UUID format
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// =================== RATE LIMITING ===================

/**
 * Check if request is rate limited
 */
function checkRateLimit(identifier: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = requestCounts.get(identifier);

  if (!record || now > record.resetTime) {
    // Reset or initialize
    requestCounts.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return { allowed: true };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { 
      allowed: false, 
      retryAfter: Math.ceil((record.resetTime - now) / 1000)
    };
  }

  record.count++;
  return { allowed: true };
}

// =================== ERROR HANDLING ===================

/**
 * Create standardized API error
 */
function createApiError(message: string, status?: number, code?: string, details?: any): ApiError {
  return {
    message,
    status,
    code,
    details,
  };
}

/**
 * Handle HTTP errors with proper logging
 */
async function handleHttpError(response: Response): Promise<ApiError> {
  let errorMessage = `HTTP ${response.status}`;
  let errorCode = response.status.toString();
  let errorDetails: any = null;

  // Try to parse error response
  try {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
      errorCode = errorData.code || errorCode;
      errorDetails = errorData.details;
    }
  } catch {
    // Use default error message if parsing fails
  }

  // Handle authentication errors
  if (response.status === 401 || response.status === 403) {
    console.warn(`[API] Auth error (${response.status}): ${errorMessage}`);
    // Don't automatically handle auth failure here - let caller decide
  }

  return createApiError(errorMessage, response.status, errorCode, errorDetails);
}

// =================== MOCK API (DEVELOPMENT ONLY) ===================

/**
 * Mock API responses for development
 */
class MockApi {
  static async delay(ms: number = 500): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  static async mockDealerships(): Promise<Dealership[]> {
    await this.delay();
    return [
      { id: 1, name: 'Demo Dealership', schema_name: 'demo_dealership' },
      { id: 2, name: 'Test Motors', schema_name: 'test_motors' },
    ];
  }

  static async mockSales(): Promise<Sale[]> {
    await this.delay();
    return [
      {
        id: '1',
        dealership_id: '1',
        sale_date: new Date().toISOString(),
        amount: 25000,
        customer_name: 'John Doe',
        vehicle_model: 'Toyota Camry',
        status: 'completed',
      },
      {
        id: '2',
        dealership_id: '1',
        sale_date: new Date().toISOString(),
        amount: 35000,
        customer_name: 'Jane Smith',
        vehicle_model: 'Honda Accord',
        status: 'pending',
      },
    ];
  }

  static async mockDeals(): Promise<Deal[]> {
    await this.delay();
    return [
      {
        id: '1',
        stock_number: 'STK001',
        vin_last8: '12345678',
        customer_last_name: 'Johnson',
        deal_type: 'Finance',
        front_end_gross: 2500,
        status: 'Pending',
        created_at: new Date().toISOString(),
      },
      {
        id: '2', 
        stock_number: 'STK002',
        vin_last8: '87654321',
        customer_last_name: 'Williams',
        deal_type: 'Lease',
        front_end_gross: 3000,
        status: 'Funded',
        created_at: new Date().toISOString(),
      },
    ];
  }
}

// =================== HTTP CLIENT ===================

/**
 * Enhanced HTTP client with retry logic and authentication
 */
class HttpClient {
  private authManager = AuthManager.getInstance();

  /**
   * Make HTTP request with full error handling and retries
   */
  async request<T = any>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = DEFAULT_TIMEOUT,
      retries = DEFAULT_RETRIES,
      requireAuth = true,
      skipTokenRefresh = false,
    } = options;

    // Validate URL
    if (!url) {
      return {
        data: null,
        error: createApiError('URL is required'),
        success: false,
      };
    }

    // Ensure HTTPS in production
    if (ENFORCE_HTTPS && url.startsWith('http://')) {
      url = url.replace('http://', 'https://');
    }

    // Rate limiting check
    const userId = await getCurrentUser().then(u => u?.id).catch(() => 'anonymous');
    const rateLimitCheck = checkRateLimit(userId || 'anonymous');
    
    if (!rateLimitCheck.allowed) {
      return {
        data: null,
        error: createApiError(
          `Rate limit exceeded. Try again in ${rateLimitCheck.retryAfter} seconds`,
          429,
          'RATE_LIMITED'
        ),
        success: false,
      };
    }

    let lastError: ApiError | null = null;

    // Retry loop
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Prepare headers
        const requestHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...headers,
        };

        // Add authentication headers if required
        if (requireAuth) {
          try {
            const authHeaders = await this.authManager.getAuthHeaders();
            Object.assign(requestHeaders, authHeaders);
          } catch (authError) {
            console.error('[API] Auth header error:', authError);
            return {
              data: null,
              error: createApiError('Authentication failed', 401, 'AUTH_FAILED'),
              success: false,
            };
          }
        }

        // Prepare request body
        let requestBody: string | undefined;
        if (body) {
          if (typeof body === 'string') {
            requestBody = body;
          } else {
            // Sanitize and serialize object
            const sanitizedBody = sanitizeInput(body);
            requestBody = JSON.stringify(sanitizedBody);
          }
        }

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        console.log(`[API] ${method} ${url} (attempt ${attempt}/${retries})`);

        try {
          // Make the request
          const response = await fetch(url, {
            method,
            headers: requestHeaders,
            body: requestBody,
            signal: controller.signal,
            credentials: 'include',
          });

          clearTimeout(timeoutId);

          // Handle successful response
          if (response.ok) {
            let data: T | null = null;
            
            const contentType = response.headers.get('content-type');
            if (contentType?.includes('application/json')) {
              try {
                data = await response.json();
              } catch (parseError) {
                console.warn('[API] JSON parse error:', parseError);
                // Return success with null data if JSON parsing fails
              }
            }

            console.log(`[API] ${method} ${url} - Success`);
            return {
              data,
              error: null,
              success: true,
            };
          }

          // Handle HTTP errors
          const error = await handleHttpError(response);
          
          // Handle authentication errors
          if ((response.status === 401 || response.status === 403) && !skipTokenRefresh) {
            console.warn(`[API] Auth error ${response.status}, handling...`);
            await this.authManager.handleAuthFailure();
            return {
              data: null,
              error,
              success: false,
            };
          }

          lastError = error;

          // Don't retry client errors (4xx) except 401/403
          if (response.status >= 400 && response.status < 500 && response.status !== 401 && response.status !== 403) {
            break;
          }

        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          
          if (fetchError.name === 'AbortError') {
            lastError = createApiError('Request timeout', 408, 'TIMEOUT');
          } else {
            lastError = createApiError(
              `Network error: ${fetchError.message}`,
              0,
              'NETWORK_ERROR'
            );
          }
        }

        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          const delay = RETRY_DELAY_BASE * Math.pow(2, attempt - 1) + Math.random() * 1000;
          console.log(`[API] Retrying in ${Math.round(delay)}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

      } catch (error: any) {
        lastError = createApiError(
          `Request failed: ${error.message}`,
          0,
          'REQUEST_FAILED'
        );
      }
    }

    console.error(`[API] ${method} ${url} - Failed after ${retries} attempts:`, lastError);

    return {
      data: null,
      error: lastError || createApiError('Unknown error occurred'),
      success: false,
    };
  }
}

// =================== API SERVICE ===================

/**
 * Main API service class
 */
export class ApiService {
  private http = new HttpClient();
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Build full URL for endpoint
   */
  private buildUrl(endpoint: string): string {
    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${this.baseUrl}/${cleanEndpoint}`;
  }

  // =================== DEALERSHIP OPERATIONS ===================

  /**
   * Get all dealerships
   */
  async getDealerships(): Promise<ApiResponse<Dealership[]>> {
    if (USE_MOCK_API) {
      const mockData = await MockApi.mockDealerships();
      return { data: mockData, error: null, success: true };
    }

    try {
      const client = await getSecureSupabaseClient();
      const { data, error } = await client
        .from('dealerships')
        .select('*')
        .order('name');

      if (error) {
        return {
          data: null,
          error: createApiError(error.message, 500, 'DB_ERROR'),
          success: false,
        };
      }

      return { data: data || [], error: null, success: true };
    } catch (error: any) {
      return {
        data: null,
        error: createApiError(`Failed to fetch dealerships: ${error.message}`),
        success: false,
      };
    }
  }

  /**
   * Get dealership by ID
   */
  async getDealership(id: number): Promise<ApiResponse<Dealership>> {
    if (!id || id <= 0) {
      return {
        data: null,
        error: createApiError('Invalid dealership ID'),
        success: false,
      };
    }

    try {
      const client = await getSecureSupabaseClient();
      const { data, error } = await client
        .from('dealerships')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return {
          data: null,
          error: createApiError(error.message, error.code === 'PGRST116' ? 404 : 500),
          success: false,
        };
      }

      return { data, error: null, success: true };
    } catch (error: any) {
      return {
        data: null,
        error: createApiError(`Failed to fetch dealership: ${error.message}`),
        success: false,
      };
    }
  }

  // =================== SALES OPERATIONS ===================

  /**
   * Get sales data
   */
  async getSales(dealershipId?: string): Promise<ApiResponse<Sale[]>> {
    if (USE_MOCK_API) {
      const mockData = await MockApi.mockSales();
      return { data: mockData, error: null, success: true };
    }

    try {
      const client = await getSecureSupabaseClient();
      let query = client.from('sales').select('*');

      if (dealershipId) {
        if (!isValidUUID(dealershipId) && !/^\d+$/.test(dealershipId)) {
          return {
            data: null,
            error: createApiError('Invalid dealership ID format'),
            success: false,
          };
        }
        query = query.eq('dealership_id', dealershipId);
      }

      const { data, error } = await query.order('sale_date', { ascending: false });

      if (error) {
        return {
          data: null,
          error: createApiError(error.message, 500, 'DB_ERROR'),
          success: false,
        };
      }

      return { data: data || [], error: null, success: true };
    } catch (error: any) {
      return {
        data: null,
        error: createApiError(`Failed to fetch sales: ${error.message}`),
        success: false,
      };
    }
  }

  /**
   * Create new sale
   */
  async createSale(saleData: Omit<Sale, 'id'>): Promise<ApiResponse<Sale>> {
    // Input validation
    if (!saleData.dealership_id || !saleData.amount || !saleData.sale_date) {
      return {
        data: null,
        error: createApiError('Missing required fields: dealership_id, amount, sale_date'),
        success: false,
      };
    }

    if (saleData.amount <= 0) {
      return {
        data: null,
        error: createApiError('Sale amount must be greater than zero'),
        success: false,
      };
    }

    try {
      const client = await getSecureSupabaseClient();
      const sanitizedData = sanitizeInput(saleData);

      const { data, error } = await client
        .from('sales')
        .insert([sanitizedData])
        .select()
        .single();

      if (error) {
        return {
          data: null,
          error: createApiError(error.message, 500, 'DB_ERROR'),
          success: false,
        };
      }

      return { data, error: null, success: true };
    } catch (error: any) {
      return {
        data: null,
        error: createApiError(`Failed to create sale: ${error.message}`),
        success: false,
      };
    }
  }

  // =================== DEAL OPERATIONS ===================

  /**
   * Get deals
   */
  async getDeals(dealershipId?: number): Promise<ApiResponse<Deal[]>> {
    if (USE_MOCK_API) {
      const mockData = await MockApi.mockDeals();
      return { data: mockData, error: null, success: true };
    }

    try {
      const client = await getSecureSupabaseClient();
      
      // If no dealership ID provided, try to get user's dealership
      let targetDealershipId = dealershipId;
      if (!targetDealershipId) {
        targetDealershipId = await getUserDealershipId();
      }

      if (!targetDealershipId) {
        return {
          data: null,
          error: createApiError('No dealership ID available'),
          success: false,
        };
      }

      const { data, error } = await client
        .from('deals')
        .select('*')
        .eq('dealership_id', targetDealershipId)
        .order('created_at', { ascending: false });

      if (error) {
        return {
          data: null,
          error: createApiError(error.message, 500, 'DB_ERROR'),
          success: false,
        };
      }

      return { data: data || [], error: null, success: true };
    } catch (error: any) {
      return {
        data: null,
        error: createApiError(`Failed to fetch deals: ${error.message}`),
        success: false,
      };
    }
  }

  /**
   * Create new deal
   */
  async createDeal(dealData: Omit<Deal, 'id'>): Promise<ApiResponse<Deal>> {
    // Input validation
    if (!dealData.stock_number || !dealData.vin_last8 || !dealData.customer_last_name) {
      return {
        data: null,
        error: createApiError('Missing required fields: stock_number, vin_last8, customer_last_name'),
        success: false,
      };
    }

    if (dealData.front_end_gross < 0) {
      return {
        data: null,
        error: createApiError('Front end gross cannot be negative'),
        success: false,
      };
    }

    try {
      const client = await getSecureSupabaseClient();
      const sanitizedData = sanitizeInput(dealData);

      // Add current user as creator
      const currentUser = await getCurrentUser();
      if (currentUser) {
        sanitizedData.created_by = currentUser.id;
      }

      const { data, error } = await client
        .from('deals')
        .insert([sanitizedData])
        .select()
        .single();

      if (error) {
        return {
          data: null,
          error: createApiError(error.message, 500, 'DB_ERROR'),
          success: false,
        };
      }

      return { data, error: null, success: true };
    } catch (error: any) {
      return {
        data: null,
        error: createApiError(`Failed to create deal: ${error.message}`),
        success: false,
      };
    }
  }

  // =================== USER OPERATIONS ===================

  /**
   * Get current user profile
   */
  async getCurrentProfile(): Promise<ApiResponse<User>> {
    try {
      const user = await getCurrentUser();
      
      if (!user) {
        return {
          data: null,
          error: createApiError('No authenticated user', 401, 'UNAUTHENTICATED'),
          success: false,
        };
      }

      return { data: user, error: null, success: true };
    } catch (error: any) {
      return {
        data: null,
        error: createApiError(`Failed to get profile: ${error.message}`),
        success: false,
      };
    }
  }

  // =================== TESTING OPERATIONS ===================

  /**
   * Test API connectivity
   */
  async testConnection(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    try {
      const result = await testSupabaseConnection();
      
      if (result.success) {
        return {
          data: {
            status: 'connected',
            timestamp: new Date().toISOString(),
          },
          error: null,
          success: true,
        };
      }

      return {
        data: null,
        error: createApiError('Connection test failed'),
        success: false,
      };
    } catch (error: any) {
      return {
        data: null,
        error: createApiError(`Connection test error: ${error.message}`),
        success: false,
      };
    }
  }

  // =================== GOAL TRACKING OPERATIONS ===================

  /**
   * Get goal tracking data for a user
   */
  async getGoalTrackingData(userId: string) {
    try {
      const client = await getSecureSupabaseClient();
      const now = new Date();
      const currentDay = now.getDate();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

      // Get user's deals for current month
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const { data: deals, error: dealsError } = await client
        .from('deals')
        .select('*')
        .eq('created_by', userId)
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString());

      if (dealsError) {
        console.error('[API] Error fetching deals:', dealsError);
      }

      // Mock progress metrics calculation
      const totalDeals = deals?.length || 0;
      const monthlyGoal = 20; // Default goal
      const progressRatio = totalDeals / monthlyGoal;

      const progressMetrics = {
        expected: Math.floor((currentDay / daysInMonth) * monthlyGoal),
        actual: totalDeals,
        progress: Math.min(progressRatio * 100, 100),
        progressRatio,
        status: progressRatio >= 1 ? 'on-track' : 
               progressRatio >= 0.8 ? 'slightly-behind' : 
               progressRatio >= 0.6 ? 'behind' : 'neutral' as const,
      };

      return {
        deals: deals || [],
        daysOff: 0, // Could be calculated from user's schedule
        progressMetrics,
        currentDay,
        daysInMonth,
      };
    } catch (error: any) {
      console.error('[API] Error in getGoalTrackingData:', error);
      throw new Error(`Failed to get goal tracking data: ${error.message}`);
    }
  }

  /**
   * Get deals for finance manager
   */
  async getFinanceManagerDeals(dealershipId?: number) {
    try {
      const client = await getSecureSupabaseClient();
      const currentUser = await getCurrentUser();
      
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      let query = client
        .from('deals')
        .select(`
          *,
          profiles!created_by (
            first_name,
            last_name
          )
        `);

      // Filter by dealership if provided
      if (dealershipId) {
        // Assuming deals have a dealership_id field
        query = query.eq('dealership_id', dealershipId);
      }

      // Order by creation date, newest first
      query = query.order('created_at', { ascending: false });

      const { data: deals, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch finance manager deals: ${error.message}`);
      }

      return deals || [];
    } catch (error: any) {
      console.error('[API] Error in getFinanceManagerDeals:', error);
      throw error;
    }
  }

  /**
   * Log a finance manager deal
   */
  async logFinanceManagerDeal(dealData: Omit<Deal, 'id'>) {
    try {
      const client = await getSecureSupabaseClient();
      const currentUser = await getCurrentUser();
      
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Validate finance manager role (optional - could be done at UI level)
      const sanitizedData = sanitizeInput(dealData);
      
      // Add metadata
      sanitizedData.created_by = currentUser.id;
      sanitizedData.fi_manager_id = currentUser.id; // Finance manager specific
      
      const { data, error } = await client
        .from('deals')
        .insert([sanitizedData])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to log finance manager deal: ${error.message}`);
      }

      return data;
    } catch (error: any) {
      console.error('[API] Error in logFinanceManagerDeal:', error);
      throw error;
    }
  }

  // =================== UTILITY METHODS ===================

  /**
   * Make raw HTTP request (for external APIs)
   */
  async makeRequest<T = any>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith('http') ? endpoint : this.buildUrl(endpoint);
    return await this.http.request<T>(url, options);
  }
}

// =================== SINGLETON INSTANCE ===================

// Create and export singleton instance
const apiService = new ApiService();

// Export individual methods for backward compatibility
export const getDealerships = () => apiService.getDealerships();
export const getDealership = (id: number) => apiService.getDealership(id);
export const getSales = (dealershipId?: string) => apiService.getSales(dealershipId);
export const createSale = (saleData: Omit<Sale, 'id'>) => apiService.createSale(saleData);
export const getDeals = (dealershipId?: number) => apiService.getDeals(dealershipId);
export const createDeal = (dealData: Omit<Deal, 'id'>) => apiService.createDeal(dealData);
export const getCurrentProfile = () => apiService.getCurrentProfile();
export const testConnection = () => apiService.testConnection();
export const getGoalTrackingData = (userId: string) => apiService.getGoalTrackingData(userId);
export const getFinanceManagerDeals = (dealershipId?: number) => apiService.getFinanceManagerDeals(dealershipId);
export const logFinanceManagerDeal = (dealData: Omit<Deal, 'id'>) => apiService.logFinanceManagerDeal(dealData);

// Export the main service
export default apiService;

// =================== CLEANUP ===================

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    cleanupSupabaseClient();
  });
}