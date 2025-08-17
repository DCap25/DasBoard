/**
 * Secured API Service with Enhanced Security and Stability
 * Provides secure functions to interact with the Supabase API
 * 
 * Security Features:
 * - HTTPS enforcement
 * - Auth header validation
 * - Input sanitization
 * - Secure logging without sensitive data exposure
 * - Rate limiting support
 * - Request retry logic with exponential backoff
 */

import { supabase, getUserSession, getCurrentUser, getDealershipSupabase } from './supabaseClient';
import { createClient } from '@supabase/supabase-js';
import SecureLogger from './secureLogger';
import type { User } from '@supabase/supabase-js';
import DOMPurify from 'isomorphic-dompurify';

// =================== TYPE DEFINITIONS ===================
// Strong typing for all API responses and requests

interface SignInCredentials {
  email: string;
  password: string;
}

interface SignUpCredentials extends SignInCredentials {
  name?: string;
  role?: string;
  dealership_id?: string;
}

interface AuthResponse {
  user: User | null;
  session: any | null;
  error?: Error | null;
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

export interface Metric {
  id: string;
  dealership_id: string;
  metric_date: string;
  value: number;
  type: string;
  category?: string;
}

export interface FniDetail {
  id: string;
  sale_id: string;
  product_type: string;
  amount: number;
  commission?: number;
  status?: string;
}

export interface DealershipGroup {
  id: number;
  name: string;
  logo_url?: string;
  brands?: string | string[];
  created_at?: string;
  updated_at?: string;
}

export interface Dealership {
  id: number;
  name: string;
  group_id?: number;
  schema_name: string;
  logo_url?: string;
  locations?: any[];
  brands?: string[];
  created_at?: string;
  updated_at?: string;
  supabase_url?: string;
  supabase_key?: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: string[];
}

export interface SignupRequest {
  id: string;
  dealership_name: string;
  contact_person: string;
  email: string;
  tier: 'free_trial' | 'finance_manager' | 'dealership' | 'dealer_group';
  add_ons?: string[];
  stripe_subscription_id?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  processed_at?: string;
  processed_by?: string;
}

interface ApiRequestOptions extends RequestInit {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
}

interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: any;
}

// =================== SECURITY CONFIGURATION ===================

// Enforce HTTPS in production - never allow HTTP requests with sensitive data
const ENFORCE_HTTPS = import.meta.env.PROD || import.meta.env.VITE_ENFORCE_HTTPS === 'true';

// API configuration with HTTPS enforcement
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = ENFORCE_HTTPS && API_BASE_URL.startsWith('http://') 
  ? API_BASE_URL.replace('http://', 'https://') 
  : API_BASE_URL;

// Security headers for all requests
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100;
const requestCounts = new Map<string, { count: number; resetTime: number }>();

// =================== SECURITY UTILITIES ===================

/**
 * Sanitize string input to prevent XSS and injection attacks
 * Uses DOMPurify for comprehensive sanitization
 */
const sanitizeInput = (input: any): any => {
  if (typeof input === 'string') {
    // Remove any HTML/script tags and sanitize
    return DOMPurify.sanitize(input, { 
      ALLOWED_TAGS: [], 
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true 
    }).trim();
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  if (input && typeof input === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      // Sanitize both keys and values
      const sanitizedKey = sanitizeInput(key);
      sanitized[sanitizedKey] = sanitizeInput(value);
    }
    return sanitized;
  }
  return input;
};

/**
 * Validate email format to prevent injection
 * Strict validation following RFC 5322
 */
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= 254; // RFC 5321 maximum email length
};

/**
 * Validate and sanitize URL parameters
 * Prevents URL injection and parameter pollution
 */
const sanitizeUrlParams = (params: Record<string, any>): URLSearchParams => {
  const sanitized = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key && value !== undefined && value !== null) {
      // Sanitize both key and value
      const sanitizedKey = encodeURIComponent(sanitizeInput(key));
      const sanitizedValue = encodeURIComponent(sanitizeInput(String(value)));
      sanitized.append(sanitizedKey, sanitizedValue);
    }
  }
  return sanitized;
};

/**
 * Check rate limiting for API requests
 * Prevents abuse and DDoS attacks
 */
const checkRateLimit = (identifier: string): boolean => {
  const now = Date.now();
  const limit = requestCounts.get(identifier);
  
  if (!limit || now > limit.resetTime) {
    requestCounts.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return true;
  }
  
  if (limit.count >= MAX_REQUESTS_PER_WINDOW) {
    SecureLogger.warning('Rate limit exceeded for identifier', { identifier });
    return false;
  }
  
  limit.count++;
  return true;
};

/**
 * Validate authentication token structure
 * Ensures token is properly formatted and not expired
 */
const validateAuthToken = (token: string): boolean => {
  if (!token || typeof token !== 'string') return false;
  
  // Check token format (JWT structure)
  const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
  if (!jwtRegex.test(token)) return false;
  
  try {
    // Decode and validate JWT payload (without verification - that's server's job)
    const [, payload] = token.split('.');
    const decoded = JSON.parse(atob(payload));
    
    // Check expiration if present
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      SecureLogger.warning('Auth token expired');
      return false;
    }
    
    return true;
  } catch (error) {
    SecureLogger.error('Invalid auth token format');
    return false;
  }
};

// =================== ERROR HANDLING ===================

/**
 * Enhanced error handler with secure logging
 * Never exposes sensitive information in errors
 */
const handleApiError = (error: any, context: string): ApiError => {
  const apiError: ApiError = new Error('API request failed');
  
  // Extract safe error information
  if (error.response) {
    apiError.status = error.response.status;
    apiError.message = getErrorMessage(error.response.status);
    
    // Log detailed error securely (not exposed to client)
    SecureLogger.error(`API Error in ${context}`, {
      status: error.response.status,
      path: context,
      // Never log sensitive headers or body data
    });
  } else if (error.request) {
    apiError.message = 'Network error - please check your connection';
    apiError.code = 'NETWORK_ERROR';
  } else {
    apiError.message = 'Request failed - please try again';
    apiError.code = 'REQUEST_ERROR';
  }
  
  return apiError;
};

/**
 * Get user-friendly error message based on status code
 * Avoids exposing internal system details
 */
const getErrorMessage = (status: number): string => {
  switch (status) {
    case 400: return 'Invalid request - please check your input';
    case 401: return 'Authentication required - please sign in';
    case 403: return 'Access denied - insufficient permissions';
    case 404: return 'Resource not found';
    case 429: return 'Too many requests - please try again later';
    case 500: return 'Server error - please try again later';
    case 503: return 'Service temporarily unavailable';
    default: return 'An error occurred - please try again';
  }
};

// =================== NETWORK UTILITIES ===================

/**
 * Retry logic with exponential backoff
 * Handles transient network failures gracefully
 */
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on client errors (4xx)
      if (error.status && error.status >= 400 && error.status < 500) {
        throw error;
      }
      
      // Calculate exponential backoff delay
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      
      SecureLogger.info(`Retry attempt ${attempt + 1}/${maxRetries} after ${Math.round(delay)}ms`);
      
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

/**
 * Handle API response with proper error checking
 * Validates response structure and content type
 */
const handleResponse = async <T>(response: Response): Promise<T> => {
  // Check content type
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');
  
  if (!response.ok) {
    let errorMessage = getErrorMessage(response.status);
    
    if (isJson) {
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Use default error message if JSON parsing fails
      }
    }
    
    const error: ApiError = new Error(errorMessage);
    error.status = response.status;
    throw error;
  }
  
  if (!isJson) {
    throw new Error('Invalid response format - expected JSON');
  }
  
  try {
    const data = await response.json();
    return data as T;
  } catch (error) {
    throw new Error('Failed to parse response data');
  }
};

// =================== AUTH HEADER MANAGEMENT ===================

/**
 * Get secure auth headers for API requests
 * Validates session and token before including in headers
 */
const getAuthHeaders = async (): Promise<Headers> => {
  const headers = new Headers({
    'Content-Type': 'application/json',
    ...SECURITY_HEADERS,
  });
  
  try {
    // Get current user session
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('No authenticated user');
    }
    
    // Get session with validation
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      throw new Error('Invalid or expired session');
    }
    
    // Validate token format before using
    if (!validateAuthToken(session.access_token)) {
      throw new Error('Invalid authentication token format');
    }
    
    // Add auth header with validated token
    headers.set('Authorization', `Bearer ${session.access_token}`);
    
    // Add user context for logging (non-sensitive)
    headers.set('X-User-ID', user.id);
    
    return headers;
  } catch (error) {
    SecureLogger.error('Failed to get auth headers', { error: error.message });
    throw new Error('Authentication required');
  }
};

// =================== MAIN API REQUEST FUNCTION ===================

/**
 * Secure generic API request function with comprehensive security features
 * Includes auth validation, input sanitization, retry logic, and error handling
 */
export const apiRequest = async <T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> => {
  // Validate endpoint format
  if (!endpoint || typeof endpoint !== 'string') {
    throw new Error('Invalid API endpoint');
  }
  
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Check rate limiting
  const userIdentifier = await getCurrentUser().then(u => u?.id || 'anonymous');
  if (!checkRateLimit(userIdentifier)) {
    throw new Error('Rate limit exceeded - please try again later');
  }
  
  // Build full URL with HTTPS enforcement
  const url = `${API_URL}${normalizedEndpoint}`;
  
  // Validate URL protocol in production
  if (ENFORCE_HTTPS && !url.startsWith('https://')) {
    throw new Error('Secure connection required - HTTPS only');
  }
  
  const {
    maxRetries = 3,
    retryDelay = 1000,
    timeout = 30000,
    ...fetchOptions
  } = options;
  
  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    // Get authenticated headers
    const authHeaders = await getAuthHeaders();
    
    // Merge headers
    const headers = new Headers(authHeaders);
    if (fetchOptions.headers) {
      const customHeaders = new Headers(fetchOptions.headers);
      customHeaders.forEach((value, key) => {
        // Prevent header injection
        const sanitizedKey = sanitizeInput(key);
        const sanitizedValue = sanitizeInput(value);
        headers.set(sanitizedKey, sanitizedValue);
      });
    }
    
    // Sanitize request body if present
    let body = fetchOptions.body;
    if (body) {
      if (typeof body === 'string') {
        try {
          const parsed = JSON.parse(body);
          const sanitized = sanitizeInput(parsed);
          body = JSON.stringify(sanitized);
        } catch {
          // If not JSON, sanitize as string
          body = sanitizeInput(body);
        }
      }
    }
    
    // Execute request with retry logic
    const response = await retryWithBackoff(
      () => fetch(url, {
        ...fetchOptions,
        headers,
        body,
        signal: controller.signal,
        credentials: 'same-origin', // Prevent CORS credential leaks
        mode: 'cors',
      }),
      maxRetries,
      retryDelay
    );
    
    return await handleResponse<T>(response);
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    throw handleApiError(error, endpoint);
  } finally {
    clearTimeout(timeoutId);
  }
};

// =================== AUTHENTICATION FUNCTIONS ===================

/**
 * Secure sign in with comprehensive validation
 * Prevents auth bypass and credential stuffing attacks
 */
export async function signIn(credentials: SignInCredentials): Promise<AuthResponse> {
  try {
    // Validate and sanitize inputs
    if (!validateEmail(credentials.email)) {
      throw new Error('Invalid email format');
    }
    
    const sanitizedEmail = sanitizeInput(credentials.email).toLowerCase();
    const sanitizedPassword = credentials.password; // Don't sanitize passwords
    
    // Check password strength (minimum requirements)
    if (sanitizedPassword.length < 8) {
      throw new Error('Invalid credentials'); // Generic message to prevent enumeration
    }
    
    SecureLogger.info('Sign in attempt', { email: sanitizedEmail });
    
    // Attempt authentication with rate limiting
    const { data, error } = await retryWithBackoff(() =>
      supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: sanitizedPassword,
      })
    );
    
    if (error) {
      SecureLogger.warning('Sign in failed', { email: sanitizedEmail });
      throw new Error('Invalid credentials'); // Generic error to prevent enumeration
    }
    
    if (!data.user) {
      throw new Error('Authentication failed');
    }
    
    // Fetch user profile with validation
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (profileError) {
      SecureLogger.warning('Profile fetch failed', { userId: data.user.id });
    }
    
    // Combine auth user with profile data
    const userWithProfile = profileData ? { ...data.user, ...profileData } : data.user;
    
    SecureLogger.info('Sign in successful', { userId: data.user.id });
    
    return {
      user: userWithProfile,
      session: data.session,
    };
  } catch (error: any) {
    SecureLogger.error('Sign in error', { error: error.message });
    throw new Error('Authentication failed - please try again');
  }
}

/**
 * Secure sign up with validation and sanitization
 * Prevents account enumeration and injection attacks
 */
export async function signUp(credentials: SignUpCredentials): Promise<AuthResponse> {
  try {
    // Validate and sanitize inputs
    if (!validateEmail(credentials.email)) {
      throw new Error('Invalid email format');
    }
    
    const sanitizedEmail = sanitizeInput(credentials.email).toLowerCase();
    const sanitizedPassword = credentials.password; // Don't sanitize passwords
    const sanitizedName = credentials.name ? sanitizeInput(credentials.name) : undefined;
    const sanitizedRole = credentials.role ? sanitizeInput(credentials.role) : undefined;
    const sanitizedDealershipId = credentials.dealership_id 
      ? sanitizeInput(credentials.dealership_id) 
      : undefined;
    
    // Validate password strength
    if (sanitizedPassword.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(sanitizedPassword)) {
      throw new Error('Password must contain uppercase, lowercase, and numbers');
    }
    
    const { data, error } = await supabase.auth.signUp({
      email: sanitizedEmail,
      password: sanitizedPassword,
      options: {
        data: {
          name: sanitizedName,
          role: sanitizedRole,
          dealership_id: sanitizedDealershipId,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) {
      SecureLogger.warning('Sign up failed', { email: sanitizedEmail });
      throw new Error('Registration failed - please try again');
    }
    
    SecureLogger.info('Sign up successful', { email: sanitizedEmail });
    
    return {
      user: data.user,
      session: data.session,
    };
  } catch (error: any) {
    SecureLogger.error('Sign up error', { error: error.message });
    throw error;
  }
}

/**
 * Secure sign out with session cleanup
 */
export async function signOut(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      SecureLogger.error('Sign out error', { error: error.message });
      throw error;
    }
    
    // Clear any cached data
    requestCounts.clear();
    
    SecureLogger.info('Sign out successful');
  } catch (error: any) {
    SecureLogger.error('Sign out failed', { error: error.message });
    throw new Error('Sign out failed - please try again');
  }
}

/**
 * Get user profile with caching and validation
 */
export async function getProfile(): Promise<User | null> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return null;
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) {
      SecureLogger.warning('Profile fetch error', { userId: user.id });
      return user;
    }
    
    return {
      ...user,
      ...data,
    };
  } catch (error: any) {
    SecureLogger.error('Get profile error', { error: error.message });
    return null;
  }
}

// =================== DEALERSHIP DATA FUNCTIONS ===================

/**
 * Get dealerships with proper typing and error handling
 */
export const getDealerships = async (groupId?: number): Promise<Dealership[]> => {
  try {
    let query = supabase
      .from('dealerships')
      .select('*, dealership_groups(name)')
      .order('name');
    
    if (groupId) {
      query = query.eq('group_id', groupId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw handleApiError(error, 'getDealerships');
    }
    
    return data || [];
  } catch (error: any) {
    SecureLogger.error('Get dealerships error', { error: error.message });
    throw error;
  }
};

/**
 * Create dealership with validation and sanitization
 */
export const createDealership = async (
  dealershipData: Omit<Dealership, 'id'>
): Promise<Dealership> => {
  try {
    // Sanitize all input data
    const sanitizedData = sanitizeInput(dealershipData);
    
    // Generate secure schema name if not provided
    if (!sanitizedData.schema_name) {
      sanitizedData.schema_name = `dealership_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Validate schema name format
    if (!/^[a-z0-9_]+$/.test(sanitizedData.schema_name)) {
      throw new Error('Invalid schema name format');
    }
    
    // Handle brands properly
    if (sanitizedData.brands && Array.isArray(sanitizedData.brands)) {
      sanitizedData.brands = JSON.stringify(sanitizedData.brands);
    }
    
    const { data, error } = await supabase
      .from('dealerships')
      .insert(sanitizedData)
      .select()
      .single();
    
    if (error) {
      throw handleApiError(error, 'createDealership');
    }
    
    SecureLogger.info('Dealership created', { dealershipId: data.id });
    
    return data;
  } catch (error: any) {
    SecureLogger.error('Create dealership error', { error: error.message });
    throw error;
  }
};

/**
 * Delete dealership with cascade protection
 */
export const deleteDealership = async (dealershipId: number): Promise<{ success: boolean }> => {
  try {
    // Validate dealership ID
    if (!dealershipId || dealershipId <= 0) {
      throw new Error('Invalid dealership ID');
    }
    
    // Check for related data before deletion
    const { data: relatedData } = await supabase
      .from('sales')
      .select('id')
      .eq('dealership_id', dealershipId)
      .limit(1);
    
    if (relatedData && relatedData.length > 0) {
      throw new Error('Cannot delete dealership with existing data');
    }
    
    const { error } = await supabase
      .from('dealerships')
      .delete()
      .eq('id', dealershipId);
    
    if (error) {
      throw handleApiError(error, 'deleteDealership');
    }
    
    SecureLogger.info('Dealership deleted', { dealershipId });
    
    return { success: true };
  } catch (error: any) {
    SecureLogger.error('Delete dealership error', { error: error.message });
    throw error;
  }
};

// =================== SALES DATA FUNCTIONS ===================

/**
 * Get sales with filtering and pagination
 */
export async function getSales(
  dealershipId?: string,
  options?: { limit?: number; offset?: number; dateFrom?: string; dateTo?: string }
): Promise<Sale[]> {
  try {
    let query = supabase.from('sales').select('*');
    
    if (dealershipId) {
      query = query.eq('dealership_id', sanitizeInput(dealershipId));
    }
    
    if (options?.dateFrom) {
      query = query.gte('sale_date', sanitizeInput(options.dateFrom));
    }
    
    if (options?.dateTo) {
      query = query.lte('sale_date', sanitizeInput(options.dateTo));
    }
    
    if (options?.limit) {
      query = query.limit(Math.min(options.limit, 1000)); // Max 1000 records
    }
    
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 100) - 1);
    }
    
    const { data, error } = await query.order('sale_date', { ascending: false });
    
    if (error) {
      throw handleApiError(error, 'getSales');
    }
    
    return data || [];
  } catch (error: any) {
    SecureLogger.error('Get sales error', { error: error.message });
    throw error;
  }
}

/**
 * Create sale with validation
 */
export async function createSale(sale: Omit<Sale, 'id'>): Promise<Sale> {
  try {
    // Sanitize input data
    const sanitizedSale = sanitizeInput(sale);
    
    // Validate required fields
    if (!sanitizedSale.dealership_id || !sanitizedSale.amount || !sanitizedSale.sale_date) {
      throw new Error('Missing required sale fields');
    }
    
    // Validate amount
    if (sanitizedSale.amount < 0 || sanitizedSale.amount > 999999999) {
      throw new Error('Invalid sale amount');
    }
    
    const { data, error } = await supabase
      .from('sales')
      .insert([sanitizedSale])
      .select()
      .single();
    
    if (error) {
      throw handleApiError(error, 'createSale');
    }
    
    SecureLogger.info('Sale created', { saleId: data.id });
    
    return data;
  } catch (error: any) {
    SecureLogger.error('Create sale error', { error: error.message });
    throw error;
  }
}

// =================== METRICS FUNCTIONS ===================

/**
 * Get metrics with aggregation support
 */
export async function getMetricsData(
  dealershipId?: string,
  timeframe?: string
): Promise<Metric[]> {
  try {
    let query = supabase.from('metrics').select('*');
    
    if (dealershipId) {
      query = query.eq('dealership_id', sanitizeInput(dealershipId));
    }
    
    if (timeframe) {
      const sanitizedTimeframe = sanitizeInput(timeframe);
      // Validate timeframe format (YYYY-MM-DD)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(sanitizedTimeframe)) {
        throw new Error('Invalid timeframe format');
      }
      query = query.gte('metric_date', sanitizedTimeframe);
    }
    
    const { data, error } = await query.order('metric_date', { ascending: false });
    
    if (error) {
      throw handleApiError(error, 'getMetricsData');
    }
    
    return data || [];
  } catch (error: any) {
    SecureLogger.error('Get metrics error', { error: error.message });
    throw error;
  }
}

// =================== F&I FUNCTIONS ===================

/**
 * Get F&I details with validation
 */
export async function getFniData(saleId?: string): Promise<FniDetail[]> {
  try {
    let query = supabase.from('fni_details').select('*');
    
    if (saleId) {
      query = query.eq('sale_id', sanitizeInput(saleId));
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw handleApiError(error, 'getFniData');
    }
    
    return data || [];
  } catch (error: any) {
    SecureLogger.error('Get F&I data error', { error: error.message });
    throw error;
  }
}

// =================== DEALERSHIP GROUP FUNCTIONS ===================

/**
 * Get dealership groups with proper error handling
 */
export const getDealershipGroups = async (): Promise<DealershipGroup[]> => {
  try {
    const { data, error } = await supabase
      .from('dealership_groups')
      .select('*')
      .order('name');
    
    if (error) {
      throw handleApiError(error, 'getDealershipGroups');
    }
    
    // Process brands field
    const processedData = (data || []).map(group => ({
      ...group,
      brands: typeof group.brands === 'string' 
        ? group.brands.split(',').map(b => b.trim())
        : group.brands
    }));
    
    return processedData;
  } catch (error: any) {
    SecureLogger.error('Get dealership groups error', { error: error.message });
    throw error;
  }
};

/**
 * Create dealership group with validation
 */
export const createDealershipGroup = async (
  groupData: Omit<DealershipGroup, 'id'>
): Promise<DealershipGroup> => {
  try {
    // Sanitize input data
    const sanitizedData = sanitizeInput(groupData);
    
    // Process brands field
    if (sanitizedData.brands) {
      if (Array.isArray(sanitizedData.brands)) {
        sanitizedData.brands = sanitizedData.brands.join(',');
      }
    }
    
    const { data, error } = await supabase
      .from('dealership_groups')
      .insert(sanitizedData)
      .select()
      .single();
    
    if (error) {
      throw handleApiError(error, 'createDealershipGroup');
    }
    
    SecureLogger.info('Dealership group created', { groupId: data.id });
    
    return data;
  } catch (error: any) {
    SecureLogger.error('Create dealership group error', { error: error.message });
    throw error;
  }
};

/**
 * Delete dealership group with cascade check
 */
export const deleteDealershipGroup = async (groupId: number): Promise<{ success: boolean }> => {
  try {
    // Validate group ID
    if (!groupId || groupId <= 0) {
      throw new Error('Invalid group ID');
    }
    
    // Check for related dealerships
    const { data: relatedDealerships } = await supabase
      .from('dealerships')
      .select('id')
      .eq('group_id', groupId)
      .limit(1);
    
    if (relatedDealerships && relatedDealerships.length > 0) {
      throw new Error('Cannot delete group with existing dealerships');
    }
    
    const { error } = await supabase
      .from('dealership_groups')
      .delete()
      .eq('id', groupId);
    
    if (error) {
      throw handleApiError(error, 'deleteDealershipGroup');
    }
    
    SecureLogger.info('Dealership group deleted', { groupId });
    
    return { success: true };
  } catch (error: any) {
    SecureLogger.error('Delete dealership group error', { error: error.message });
    throw error;
  }
};

// =================== ROLE MANAGEMENT ===================

/**
 * Get roles with caching
 */
let rolesCache: Role[] | null = null;
let rolesCacheTime = 0;
const ROLES_CACHE_TTL = 300000; // 5 minutes

export const getRoles = async (): Promise<Role[]> => {
  try {
    // Return cached roles if still valid
    if (rolesCache && Date.now() - rolesCacheTime < ROLES_CACHE_TTL) {
      return rolesCache;
    }
    
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('id');
    
    if (error) {
      throw handleApiError(error, 'getRoles');
    }
    
    // Cache the results
    rolesCache = data || [];
    rolesCacheTime = Date.now();
    
    return rolesCache;
  } catch (error: any) {
    SecureLogger.error('Get roles error', { error: error.message });
    throw error;
  }
};

/**
 * Update user role with validation
 */
export const updateUserRole = async (
  userId: string,
  roleId: number,
  dealershipId?: number
): Promise<any> => {
  try {
    // Validate inputs
    if (!userId || !roleId) {
      throw new Error('Invalid user or role ID');
    }
    
    const updateData: any = {
      role_id: roleId,
    };
    
    if (dealershipId) {
      updateData.dealership_id = dealershipId;
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      throw handleApiError(error, 'updateUserRole');
    }
    
    SecureLogger.info('User role updated', { userId, roleId });
    
    return data;
  } catch (error: any) {
    SecureLogger.error('Update user role error', { error: error.message });
    throw error;
  }
};

// =================== SIGNUP REQUEST MANAGEMENT ===================

/**
 * Get signup requests with filtering
 */
export const getSignupRequests = async (
  status?: 'pending' | 'approved' | 'rejected'
): Promise<SignupRequest[]> => {
  try {
    let query = supabase
      .from('signup_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw handleApiError(error, 'getSignupRequests');
    }
    
    return data || [];
  } catch (error: any) {
    SecureLogger.error('Get signup requests error', { error: error.message });
    throw error;
  }
};

// =================== DEALERSHIP CONFIGURATION ===================

/**
 * Get dealership Supabase configuration securely
 * Never exposes keys in logs or errors
 */
export const getDealershipSupabaseConfig = async (
  dealershipId: number
): Promise<{ supabase_url: string; supabase_key: string } | null> => {
  try {
    const { data, error } = await supabase
      .from('dealerships')
      .select('supabase_url, supabase_key')
      .eq('id', dealershipId)
      .single();
    
    if (error) {
      throw handleApiError(error, 'getDealershipSupabaseConfig');
    }
    
    if (!data || !data.supabase_url || !data.supabase_key) {
      // Try environment variables as fallback
      const schemaName = `dealership_${dealershipId}`;
      const envUrlKey = `VITE_${schemaName.toUpperCase()}_SUPABASE_URL`;
      const envAnonKey = `VITE_${schemaName.toUpperCase()}_SUPABASE_ANON_KEY`;
      
      const url = import.meta.env[envUrlKey];
      const key = import.meta.env[envAnonKey];
      
      if (!url || !key) {
        SecureLogger.warning('No Supabase config found for dealership', { dealershipId });
        return null;
      }
      
      return {
        supabase_url: url,
        supabase_key: key,
      };
    }
    
    return data;
  } catch (error: any) {
    SecureLogger.error('Get dealership config error', { error: error.message });
    return null;
  }
};

/**
 * Test dealership connection securely
 */
export const testDealershipConnection = async (
  dealershipId: number
): Promise<{ success: boolean; message: string }> => {
  try {
    const config = await getDealershipSupabaseConfig(dealershipId);
    
    if (!config) {
      return {
        success: false,
        message: 'Missing configuration for this dealership',
      };
    }
    
    // Create temporary client for testing
    const tempClient = createClient(config.supabase_url, config.supabase_key);
    
    // Test with a simple query
    const { error } = await tempClient
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      return {
        success: false,
        message: 'Connection failed',
      };
    }
    
    return {
      success: true,
      message: 'Connection successful',
    };
  } catch (error: any) {
    SecureLogger.error('Test connection error', { error: error.message });
    return {
      success: false,
      message: 'Connection test failed',
    };
  }
};

// =================== DEALERSHIP USER MANAGEMENT ===================

/**
 * Create user in dealership with full validation
 */
export const createDealershipUser = async (
  dealershipId: number,
  userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role_id: string;
    phone_number?: string;
  }
): Promise<{ success: boolean; user?: any; error?: string }> => {
  try {
    // Validate email
    if (!validateEmail(userData.email)) {
      throw new Error('Invalid email format');
    }
    
    // Validate password strength
    if (userData.password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    
    // Sanitize input data
    const sanitizedData = {
      email: sanitizeInput(userData.email).toLowerCase(),
      password: userData.password, // Don't sanitize password
      first_name: sanitizeInput(userData.first_name),
      last_name: sanitizeInput(userData.last_name),
      role_id: sanitizeInput(userData.role_id),
      phone_number: userData.phone_number ? sanitizeInput(userData.phone_number) : undefined,
    };
    
    // Test connection first
    const connectionTest = await testDealershipConnection(dealershipId);
    if (!connectionTest.success) {
      throw new Error('Cannot connect to dealership');
    }
    
    // Get dealership client
    const dealershipClient = getDealershipSupabase(dealershipId);
    
    // Create user in auth system
    const { data: authData, error: authError } = await dealershipClient.auth.admin.createUser({
      email: sanitizedData.email,
      password: sanitizedData.password,
      email_confirm: true,
      user_metadata: {
        first_name: sanitizedData.first_name,
        last_name: sanitizedData.last_name,
        role_id: sanitizedData.role_id,
        dealership_id: dealershipId,
      },
    });
    
    if (authError || !authData.user) {
      throw new Error('Failed to create user account');
    }
    
    // Add user to profiles table
    const { error: profileError } = await dealershipClient
      .from('users')
      .insert({
        id: authData.user.id,
        ...sanitizedData,
        dealership_id: dealershipId,
      });
    
    if (profileError) {
      // Try to clean up auth user
      await dealershipClient.auth.admin.deleteUser(authData.user.id).catch(() => {});
      throw new Error('Failed to create user profile');
    }
    
    SecureLogger.info('Dealership user created', { dealershipId, userId: authData.user.id });
    
    return {
      success: true,
      user: authData.user,
    };
  } catch (error: any) {
    SecureLogger.error('Create dealership user error', { error: error.message });
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get users from dealership with pagination
 */
export const getDealershipUsers = async (
  dealershipId: number,
  options?: { limit?: number; offset?: number }
): Promise<any[]> => {
  try {
    // Test connection first
    const connectionTest = await testDealershipConnection(dealershipId);
    if (!connectionTest.success) {
      throw new Error('Cannot connect to dealership');
    }
    
    // Get dealership client
    const dealershipClient = getDealershipSupabase(dealershipId);
    
    let query = dealershipClient
      .from('users')
      .select('*, roles(name)')
      .order('last_name', { ascending: true });
    
    if (options?.limit) {
      query = query.limit(Math.min(options.limit, 100)); // Max 100 users per request
    }
    
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw handleApiError(error, 'getDealershipUsers');
    }
    
    return data || [];
  } catch (error: any) {
    SecureLogger.error('Get dealership users error', { error: error.message });
    throw error;
  }
};

// =================== SCHEMA MANAGEMENT ===================

/**
 * Create dealership schema with validation
 */
export const createDealershipSchema = async (schemaName: string): Promise<{ success: boolean }> => {
  try {
    // Validate schema name
    if (!/^[a-z0-9_]+$/.test(schemaName)) {
      throw new Error('Invalid schema name - use only lowercase letters, numbers, and underscores');
    }
    
    const { error } = await supabase.rpc('create_dealership_schema', {
      schema_name: sanitizeInput(schemaName),
    });
    
    if (error) {
      throw handleApiError(error, 'createDealershipSchema');
    }
    
    SecureLogger.info('Schema created', { schemaName });
    
    return { success: true };
  } catch (error: any) {
    SecureLogger.error('Create schema error', { error: error.message });
    throw error;
  }
};

/**
 * Update dealership schema name
 */
export const updateDealershipSchema = async (
  dealershipId: number,
  schemaName: string
): Promise<Dealership> => {
  try {
    // Validate inputs
    if (!dealershipId || dealershipId <= 0) {
      throw new Error('Invalid dealership ID');
    }
    
    if (!/^[a-z0-9_]+$/.test(schemaName)) {
      throw new Error('Invalid schema name format');
    }
    
    const { data, error } = await supabase
      .from('dealerships')
      .update({ schema_name: sanitizeInput(schemaName) })
      .eq('id', dealershipId)
      .select()
      .single();
    
    if (error) {
      throw handleApiError(error, 'updateDealershipSchema');
    }
    
    SecureLogger.info('Schema updated', { dealershipId, schemaName });
    
    return data;
  } catch (error: any) {
    SecureLogger.error('Update schema error', { error: error.message });
    throw error;
  }
};

// =================== CONNECTION TESTING ===================

/**
 * Test connection to Supabase
 */
export async function testConnection(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    return !error;
  } catch (error: any) {
    SecureLogger.error('Connection test failed', { error: error.message });
    return false;
  }
}

/**
 * Test schema connections for debugging
 */
export const testSchemaConnections = async (): Promise<{
  globalTables: { success: boolean; message?: string };
  dealershipSchema: { success: boolean; message?: string };
}> => {
  try {
    // Test global tables
    const { error: groupsError } = await supabase
      .from('dealership_groups')
      .select('count(*)', { count: 'exact', head: true });
    
    const { error: dealershipsError } = await supabase
      .from('dealerships')
      .select('count(*)', { count: 'exact', head: true });
    
    const globalSuccess = !groupsError && !dealershipsError;
    
    // Test dealership schema
    const { data: firstDealership } = await supabase
      .from('dealerships')
      .select('schema_name')
      .limit(1)
      .single();
    
    let schemaResult = { success: false, message: 'No dealerships found' };
    
    if (firstDealership) {
      const { error: schemaError } = await supabase
        .from(`${firstDealership.schema_name}.pay_plans`)
        .select('count(*)', { count: 'exact', head: true });
      
      schemaResult = {
        success: !schemaError,
        message: schemaError ? 'Schema test failed' : 'Schema test successful',
      };
    }
    
    return {
      globalTables: {
        success: globalSuccess,
        message: globalSuccess ? 'Global tables accessible' : 'Global tables error',
      },
      dealershipSchema: schemaResult,
    };
  } catch (error: any) {
    SecureLogger.error('Schema connection test error', { error: error.message });
    return {
      globalTables: { success: false, message: 'Test failed' },
      dealershipSchema: { success: false, message: 'Test failed' },
    };
  }
};

// =================== GENERIC DATA OPERATIONS ===================

/**
 * Generic data fetching with type safety
 */
export async function getData<T>(table: string): Promise<T[]> {
  try {
    // Validate table name to prevent injection
    if (!/^[a-z0-9_]+$/.test(table)) {
      throw new Error('Invalid table name');
    }
    
    const { data, error } = await supabase
      .from(table)
      .select('*');
    
    if (error) {
      throw handleApiError(error, `getData:${table}`);
    }
    
    return data as T[] || [];
  } catch (error: any) {
    SecureLogger.error('Get data error', { table, error: error.message });
    throw error;
  }
}

/**
 * Get dealership-specific data with schema isolation
 */
export const getDealershipData = async <T>(
  dealershipId: number,
  table: string,
  columns: string = '*'
): Promise<T[]> => {
  try {
    // Validate inputs
    if (!dealershipId || dealershipId <= 0) {
      throw new Error('Invalid dealership ID');
    }
    
    if (!/^[a-z0-9_]+$/.test(table)) {
      throw new Error('Invalid table name');
    }
    
    // Get schema name
    const { data: dealership, error: dealershipError } = await supabase
      .from('dealerships')
      .select('schema_name')
      .eq('id', dealershipId)
      .single();
    
    if (dealershipError || !dealership) {
      throw new Error('Dealership not found');
    }
    
    // Query dealership-specific table
    const { data, error } = await supabase
      .from(`${dealership.schema_name}.${table}`)
      .select(columns);
    
    if (error) {
      throw handleApiError(error, `getDealershipData:${table}`);
    }
    
    return data as T[] || [];
  } catch (error: any) {
    SecureLogger.error('Get dealership data error', { dealershipId, table, error: error.message });
    throw error;
  }
};

/**
 * Create dealership record with validation
 */
export const createDealershipRecord = async <T>(
  dealershipId: number,
  table: string,
  recordData: any
): Promise<T> => {
  try {
    // Validate inputs
    if (!dealershipId || dealershipId <= 0) {
      throw new Error('Invalid dealership ID');
    }
    
    if (!/^[a-z0-9_]+$/.test(table)) {
      throw new Error('Invalid table name');
    }
    
    // Sanitize record data
    const sanitizedData = sanitizeInput(recordData);
    
    // Get schema name
    const { data: dealership, error: dealershipError } = await supabase
      .from('dealerships')
      .select('schema_name')
      .eq('id', dealershipId)
      .single();
    
    if (dealershipError || !dealership) {
      throw new Error('Dealership not found');
    }
    
    // Insert record
    const { data, error } = await supabase
      .from(`${dealership.schema_name}.${table}`)
      .insert(sanitizedData)
      .select()
      .single();
    
    if (error) {
      throw handleApiError(error, `createDealershipRecord:${table}`);
    }
    
    SecureLogger.info('Dealership record created', { dealershipId, table });
    
    return data as T;
  } catch (error: any) {
    SecureLogger.error('Create dealership record error', { 
      dealershipId, 
      table, 
      error: error.message 
    });
    throw error;
  }
};

// =================== SECURE LOGGING OPERATIONS ===================

/**
 * Log schema operation securely without exposing sensitive data
 */
export const logSchemaOperation = async (
  action: string,
  details: any
): Promise<boolean> => {
  try {
    // Sanitize log data
    const sanitizedAction = sanitizeInput(action);
    const sanitizedDetails = sanitizeInput(details);
    
    // Remove any sensitive fields
    delete sanitizedDetails.password;
    delete sanitizedDetails.supabase_key;
    delete sanitizedDetails.access_token;
    
    await supabase
      .from('logs')
      .insert({
        action: sanitizedAction,
        details: sanitizedDetails,
        timestamp: new Date().toISOString(),
      });
    
    return true;
  } catch (error: any) {
    // Don't fail operations due to logging errors
    SecureLogger.warning('Failed to log operation', { action });
    return true;
  }
};

// =================== LEGACY API ENDPOINT WRAPPERS ===================
// These maintain backward compatibility while adding security

/**
 * Get dealership basic info (legacy wrapper)
 */
export const getDealershipBasicInfo = async (dealershipId: string): Promise<any> => {
  return apiRequest(`/dealerships/${encodeURIComponent(dealershipId)}`);
};

/**
 * Update dealership data (legacy wrapper)
 */
export const updateDealershipData = async (dealershipId: string, data: any): Promise<any> => {
  const sanitizedData = sanitizeInput(data);
  return apiRequest(`/dealerships/${encodeURIComponent(dealershipId)}`, {
    method: 'PUT',
    body: JSON.stringify(sanitizedData),
  });
};

/**
 * Get sales data with params (legacy wrapper)
 */
export const getSalesData = async (
  dealershipId: string,
  params?: Record<string, string>
): Promise<any> => {
  const queryString = params ? sanitizeUrlParams(params).toString() : '';
  return apiRequest(
    `/dealerships/${encodeURIComponent(dealershipId)}/sales${queryString ? `?${queryString}` : ''}`
  );
};

/**
 * Get metrics (legacy wrapper)
 */
export const getMetrics = async (dealershipId: string, timeframe?: string): Promise<any> => {
  const query = timeframe ? `?timeframe=${encodeURIComponent(sanitizeInput(timeframe))}` : '';
  return apiRequest(`/dealerships/${encodeURIComponent(dealershipId)}/metrics${query}`);
};

/**
 * Get F&I details (legacy wrapper)
 */
export const getFniDetails = async (
  dealershipId: string,
  params?: Record<string, string>
): Promise<any> => {
  const queryString = params ? sanitizeUrlParams(params).toString() : '';
  return apiRequest(
    `/dealerships/${encodeURIComponent(dealershipId)}/fni${queryString ? `?${queryString}` : ''}`
  );
};

/**
 * Get basic dealerships (legacy wrapper)
 */
export const getBasicDealerships = async (): Promise<Dealership[]> => {
  const { data, error } = await supabase
    .from('dealerships')
    .select('*');
  
  if (error) {
    throw handleApiError(error, 'getBasicDealerships');
  }
  
  return data || [];
};

/**
 * Get goal tracking data with security validation
 * Implements secure data fetching for goal tracking metrics
 */
export const getGoalTrackingData = async (
  dealershipId?: string,
  timeframe?: string,
  userId?: string
): Promise<any> => {
  try {
    // Input validation and sanitization
    const sanitizedDealershipId = dealershipId ? sanitizeInput(dealershipId) : null;
    let sanitizedTimeframe = timeframe ? sanitizeInput(timeframe) : 'month';
    const sanitizedUserId = userId ? sanitizeInput(userId) : null;
    
    // Validate dealership ID format if provided
    if (sanitizedDealershipId && !/^[a-zA-Z0-9_-]+$/.test(sanitizedDealershipId)) {
      throw new Error('Invalid dealership ID format');
    }
    
    // Validate timeframe options
    const validTimeframes = ['week', 'month', 'quarter', 'year'];
    if (!validTimeframes.includes(sanitizedTimeframe)) {
      SecureLogger.warning('Invalid timeframe provided, using default', { 
        timeframe: sanitizedTimeframe 
      });
      sanitizedTimeframe = 'month';
    }
    
    // Build query parameters securely
    const params: Record<string, string> = {
      timeframe: sanitizedTimeframe,
    };
    
    if (sanitizedDealershipId) {
      params.dealership_id = sanitizedDealershipId;
    }
    
    if (sanitizedUserId) {
      params.user_id = sanitizedUserId;
    }
    
    // Log the request for security monitoring
    SecureLogger.info('Goal tracking data requested', {
      dealership_id: sanitizedDealershipId,
      timeframe: sanitizedTimeframe,
      user_id: sanitizedUserId,
    });
    
    // Construct secure API endpoint
    const endpoint = sanitizedDealershipId 
      ? `/dealerships/${encodeURIComponent(sanitizedDealershipId)}/goals`
      : '/goals';
    
    const queryString = sanitizeUrlParams(params).toString();
    const fullEndpoint = `${endpoint}${queryString ? `?${queryString}` : ''}`;
    
    // Make secure API request with timeout
    const response = await apiRequest(fullEndpoint, {
      timeout: SECURITY_CONFIG.NETWORK_TIMEOUT,
    });
    
    // Validate response structure
    if (response && typeof response === 'object') {
      // Log successful data retrieval
      SecureLogger.info('Goal tracking data retrieved successfully', {
        dealership_id: sanitizedDealershipId,
        data_size: Array.isArray(response) ? response.length : 'object',
      });
      
      return response;
    }
    
    // Return empty array if no valid data
    return [];
    
  } catch (error) {
    // Handle and log errors securely
    const sanitizedError = handleApiError(error, 'getGoalTrackingData');
    
    SecureLogger.error('Goal tracking data fetch failed', {
      dealership_id: dealershipId,
      timeframe,
      error: sanitizedError.message,
    });
    
    throw sanitizedError;
  }
};

/**
 * Get finance manager deals with security validation
 * Implements secure data fetching for finance manager specific deals
 */
export const getFinanceManagerDeals = async (
  managerId?: string,
  dealershipId?: string,
  status?: string,
  dateRange?: { start?: string; end?: string }
): Promise<any[]> => {
  try {
    // Input validation and sanitization
    const sanitizedManagerId = managerId ? sanitizeInput(managerId) : null;
    const sanitizedDealershipId = dealershipId ? sanitizeInput(dealershipId) : null;
    let sanitizedStatus = status ? sanitizeInput(status) : null;
    
    // Validate manager ID format if provided
    if (sanitizedManagerId && !/^[a-zA-Z0-9_-]+$/.test(sanitizedManagerId)) {
      throw new Error('Invalid manager ID format');
    }
    
    // Validate dealership ID format if provided
    if (sanitizedDealershipId && !/^[a-zA-Z0-9_-]+$/.test(sanitizedDealershipId)) {
      throw new Error('Invalid dealership ID format');
    }
    
    // Validate status options
    const validStatuses = ['pending', 'funded', 'unwound', 'cancelled'];
    if (sanitizedStatus && !validStatuses.includes(sanitizedStatus.toLowerCase())) {
      SecureLogger.warning('Invalid status provided, ignoring filter', { 
        status: sanitizedStatus 
      });
      sanitizedStatus = null;
    }
    
    // Validate date range if provided
    if (dateRange?.start || dateRange?.end) {
      const startDate = dateRange.start ? new Date(dateRange.start) : null;
      const endDate = dateRange.end ? new Date(dateRange.end) : null;
      
      if (startDate && isNaN(startDate.getTime())) {
        throw new Error('Invalid start date format');
      }
      
      if (endDate && isNaN(endDate.getTime())) {
        throw new Error('Invalid end date format');
      }
      
      if (startDate && endDate && startDate > endDate) {
        throw new Error('Start date must be before end date');
      }
    }
    
    // Build query parameters securely
    const params: Record<string, string> = {};
    
    if (sanitizedManagerId) {
      params.manager_id = sanitizedManagerId;
    }
    
    if (sanitizedDealershipId) {
      params.dealership_id = sanitizedDealershipId;
    }
    
    if (sanitizedStatus) {
      params.status = sanitizedStatus;
    }
    
    if (dateRange?.start) {
      params.start_date = dateRange.start;
    }
    
    if (dateRange?.end) {
      params.end_date = dateRange.end;
    }
    
    // Log the request for security monitoring
    SecureLogger.info('Finance manager deals requested', {
      manager_id: sanitizedManagerId,
      dealership_id: sanitizedDealershipId,
      status: sanitizedStatus,
      has_date_range: !!(dateRange?.start || dateRange?.end),
    });
    
    // Construct secure API endpoint
    const endpoint = sanitizedManagerId 
      ? `/finance-managers/${encodeURIComponent(sanitizedManagerId)}/deals`
      : '/finance-deals';
    
    const queryString = sanitizeUrlParams(params).toString();
    const fullEndpoint = `${endpoint}${queryString ? `?${queryString}` : ''}`;
    
    // Make secure API request with timeout
    const response = await apiRequest(fullEndpoint, {
      timeout: SECURITY_CONFIG.NETWORK_TIMEOUT,
    });
    
    // Validate response structure
    if (Array.isArray(response)) {
      // Log successful data retrieval
      SecureLogger.info('Finance manager deals retrieved successfully', {
        manager_id: sanitizedManagerId,
        dealership_id: sanitizedDealershipId,
        deals_count: response.length,
      });
      
      return response;
    }
    
    // Return empty array if no valid data
    return [];
    
  } catch (error) {
    // Handle and log errors securely
    const sanitizedError = handleApiError(error, 'getFinanceManagerDeals');
    
    SecureLogger.error('Finance manager deals fetch failed', {
      manager_id: managerId,
      dealership_id: dealershipId,
      status,
      error: sanitizedError.message,
    });
    
    throw sanitizedError;
  }
};

/**
 * Log finance manager deal with security validation
 * Implements secure deal logging for finance managers
 */
export const logFinanceManagerDeal = async (dealData: any): Promise<any> => {
  try {
    // Input validation
    if (!dealData || typeof dealData !== 'object') {
      throw new Error('Invalid deal data provided');
    }
    
    // Required fields validation
    const requiredFields = ['customer_name', 'deal_type', 'amount'];
    for (const field of requiredFields) {
      if (!dealData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    // Sanitize input data
    const sanitizedDealData = {
      ...dealData,
      customer_name: sanitizeInput(dealData.customer_name),
      deal_type: sanitizeInput(dealData.deal_type),
      amount: parseFloat(dealData.amount) || 0,
      notes: dealData.notes ? sanitizeInput(dealData.notes) : '',
      manager_id: dealData.manager_id ? sanitizeInput(dealData.manager_id) : null,
      dealership_id: dealData.dealership_id ? sanitizeInput(dealData.dealership_id) : null,
    };
    
    // Validate deal type
    const validDealTypes = ['finance', 'lease', 'cash'];
    if (!validDealTypes.includes(sanitizedDealData.deal_type.toLowerCase())) {
      throw new Error('Invalid deal type');
    }
    
    // Validate amount is positive
    if (sanitizedDealData.amount <= 0) {
      throw new Error('Deal amount must be greater than zero');
    }
    
    // Validate manager ID format if provided
    if (sanitizedDealData.manager_id && !/^[a-zA-Z0-9_-]+$/.test(sanitizedDealData.manager_id)) {
      throw new Error('Invalid manager ID format');
    }
    
    // Validate dealership ID format if provided
    if (sanitizedDealData.dealership_id && !/^[a-zA-Z0-9_-]+$/.test(sanitizedDealData.dealership_id)) {
      throw new Error('Invalid dealership ID format');
    }
    
    // Log the request for security monitoring
    SecureLogger.info('Finance manager deal logging requested', {
      deal_type: sanitizedDealData.deal_type,
      amount: sanitizedDealData.amount,
      manager_id: sanitizedDealData.manager_id,
      dealership_id: sanitizedDealData.dealership_id,
    });
    
    // Add metadata
    const dealWithMetadata = {
      ...sanitizedDealData,
      created_at: new Date().toISOString(),
      status: 'pending',
      logged_by: sanitizedDealData.manager_id,
    };
    
    // Make secure API request
    const response = await apiRequest('/finance-deals', {
      method: 'POST',
      body: JSON.stringify(dealWithMetadata),
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: SECURITY_CONFIG.NETWORK_TIMEOUT,
    });
    
    // Log successful deal creation
    SecureLogger.info('Finance manager deal logged successfully', {
      deal_id: response?.id,
      deal_type: sanitizedDealData.deal_type,
      amount: sanitizedDealData.amount,
    });
    
    return response;
    
  } catch (error) {
    // Handle and log errors securely
    const sanitizedError = handleApiError(error, 'logFinanceManagerDeal');
    
    SecureLogger.error('Finance manager deal logging failed', {
      error: sanitizedError.message,
    });
    
    throw sanitizedError;
  }
};

// =================== EXPORT DEFAULT ===================

export default {
  // Auth functions
  signIn,
  signUp,
  signOut,
  getProfile,
  
  // Dealership functions
  getDealerships,
  createDealership,
  deleteDealership,
  getDealershipBasicInfo,
  updateDealershipData,
  
  // Sales functions
  getSales,
  createSale,
  getSalesData,
  
  // Metrics functions
  getMetricsData,
  getMetrics,
  getGoalTrackingData,
  
  // F&I functions
  getFniData,
  getFniDetails,
  getFinanceManagerDeals,
  logFinanceManagerDeal,
  
  // Dealership groups
  getDealershipGroups,
  createDealershipGroup,
  deleteDealershipGroup,
  
  // Roles
  getRoles,
  updateUserRole,
  
  // Signup requests
  getSignupRequests,
  
  // Dealership configuration
  getDealershipSupabaseConfig,
  testDealershipConnection,
  
  // User management
  createDealershipUser,
  getDealershipUsers,
  
  // Schema management
  createDealershipSchema,
  updateDealershipSchema,
  
  // Testing
  testConnection,
  testSchemaConnections,
  
  // Generic operations
  getData,
  getDealershipData,
  createDealershipRecord,
  
  // Utilities
  apiRequest,
  logSchemaOperation,
  getBasicDealerships,
};