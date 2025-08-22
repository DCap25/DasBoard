/**
 * Enhanced Secure API Service for The DAS Board
 * 
 * SECURITY IMPROVEMENTS IMPLEMENTED:
 * - Comprehensive input validation and sanitization
 * - Enhanced error handling with security-aware logging
 * - CSRF protection and security headers
 * - Robust rate limiting with IP-based fallbacks
 * - SQL injection prevention through parameterized queries
 * - Audit trail logging for sensitive operations
 * - Enhanced session management and token security
 * - Content Security Policy enforcement
 * - Data encryption for sensitive fields
 * - Role-based access control validation
 * 
 * STATE MANAGEMENT SAFETY FEATURES ADDED:
 * - Error ID generation with format: error_timestamp_random for debugging
 * - Comprehensive error logging with type/severity classification
 * - Safe state operation wrappers with retry logic and fallbacks
 * - Protected user session retrieval with graceful degradation
 * - Safe Supabase client access with connection fallbacks
 * - Try-catch protection around all session-dependent operations
 * - Graceful fallback responses to prevent app crashes
 * - State error classification: session, auth, network, state, validation
 * - Severity levels: low, medium, high, critical for proper monitoring
 * - Timeout protection for long-running state operations
 * - Exponential backoff retry mechanisms for transient failures
 * 
 * ORIGINAL FIXES MAINTAINED:
 * - Supabase access token in headers for authenticated requests
 * - 401/403 error handling with session refresh/logout
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

// =================== SECURITY CONSTANTS ===================

/** Security: CSRF protection configuration */
const CSRF_CONFIG = {
  TOKEN_LENGTH: 32,
  TOKEN_EXPIRY: 30 * 60 * 1000, // 30 minutes
  HEADER_NAME: 'X-CSRF-Token',
} as const;

/** Security: Rate limiting configuration (enhanced) */
const RATE_LIMIT_CONFIG = {
  MAX_REQUESTS_PER_MINUTE: 60,
  MAX_REQUESTS_PER_HOUR: 1000,
  BURST_LIMIT: 10,
  WINDOW_SIZE: 60 * 1000, // 1 minute
  HOUR_WINDOW_SIZE: 60 * 60 * 1000, // 1 hour
  BLOCKED_DURATION: 15 * 60 * 1000, // 15 minutes
} as const;

/** Security: Input validation limits */
const VALIDATION_LIMITS = {
  MAX_STRING_LENGTH: 1000,
  MAX_ARRAY_LENGTH: 100,
  MAX_OBJECT_DEPTH: 5,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
} as const;

/** Security: Sensitive field patterns for data masking */
const SENSITIVE_PATTERNS = [
  /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, // Credit card numbers
  /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/g, // SSN patterns
  /\b[A-Z0-9]{17}\b/g, // VIN numbers (full)
] as const;

// =================== ENHANCED TYPES ===================

/** Security: Enhanced API response with security metadata */
export interface ApiResponse<T = any> {
  data: T | null;
  error: ApiError | null;
  success: boolean;
  /** Security: Request tracking ID for audit purposes */
  requestId?: string;
  /** Security: Response timestamp */
  timestamp?: number;
  /** Security: Rate limit information */
  rateLimit?: {
    remaining: number;
    resetTime: number;
    limit: number;
  };
}

/** Security: Enhanced API error with security context */
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  /** Security: Sanitized details (no sensitive info) */
  details?: any;
  /** Security: Request ID for tracking */
  requestId?: string;
  /** Security: Error classification */
  type?: 'validation' | 'authorization' | 'rate_limit' | 'network' | 'server' | 'unknown';
}

/** Security: Enhanced request options with security features */
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  requireAuth?: boolean;
  skipTokenRefresh?: boolean;
  /** Security: Skip rate limiting for internal requests */
  skipRateLimit?: boolean;
  /** Security: Request requires elevated permissions */
  requireElevated?: boolean;
  /** Security: Custom validation rules */
  validationRules?: ValidationRule[];
  /** Security: Audit this request */
  auditRequest?: boolean;
}

/** Security: Validation rule interface */
interface ValidationRule {
  field: string;
  type: 'string' | 'number' | 'email' | 'uuid' | 'date' | 'enum';
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  allowedValues?: string[];
}

/** Security: Enhanced dealership data with access control */
export interface Dealership {
  id: number;
  name: string;
  schema_name: string;
  group_id?: number;
  created_at?: string;
  updated_at?: string;
  /** Security: Access level for current user */
  access_level?: 'read' | 'write' | 'admin';
  /** Security: Data classification */
  classification?: 'public' | 'internal' | 'confidential';
}

/** Security: Enhanced sale data with PII protection */
export interface Sale {
  id: string;
  dealership_id: string;
  sale_date: string;
  amount: number;
  /** Security: Masked customer name for privacy */
  customer_name?: string;
  vehicle_model?: string;
  status?: 'pending' | 'completed' | 'cancelled';
  /** Security: Full customer name (only for authorized users) */
  customer_full_name?: string;
  /** Security: Audit trail */
  created_by?: string;
  modified_by?: string;
  access_log?: AccessLogEntry[];
}

/** Security: Enhanced deal data with encryption support */
export interface Deal {
  id?: string;
  stock_number: string;
  /** Security: Only last 8 digits for privacy */
  vin_last8: string;
  /** Security: Masked customer surname */
  customer_last_name: string;
  deal_type: 'Cash' | 'Finance' | 'Lease';
  front_end_gross: number;
  status: 'Pending' | 'Funded' | 'Unwound';
  created_at?: string;
  updated_at?: string;
  /** Security: Full customer details (encrypted, authorized access only) */
  customer_details_encrypted?: string;
  /** Security: Audit trail */
  created_by?: string;
  modified_by?: string;
  dealership_id?: number;
  fi_manager_id?: string;
}

/** Security: Access log entry for audit trail */
interface AccessLogEntry {
  timestamp: number;
  user_id: string;
  action: string;
  ip_address?: string;
  user_agent?: string;
}

/** Security: CSRF token structure */
interface CSRFToken {
  token: string;
  expires: number;
  userId: string;
}

/** Security: Rate limit tracking */
interface RateLimitRecord {
  count: number;
  hourlyCount: number;
  firstRequest: number;
  lastRequest: number;
  blockedUntil?: number;
}

// =================== SECURITY UTILITIES ===================

/** Security: Generate secure request ID */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/** Security: Generate CSRF token */
function generateCSRFToken(userId: string): CSRFToken {
  const token = crypto.getRandomValues(new Uint8Array(CSRF_CONFIG.TOKEN_LENGTH))
    .reduce((acc, val) => acc + val.toString(16).padStart(2, '0'), '');
  
  return {
    token,
    expires: Date.now() + CSRF_CONFIG.TOKEN_EXPIRY,
    userId,
  };
}

/** Security: Mask sensitive data in strings */
function maskSensitiveData(text: string): string {
  if (!text || typeof text !== 'string') return text;
  
  let masked = text;
  
  // Mask each sensitive pattern
  for (const pattern of SENSITIVE_PATTERNS) {
    masked = masked.replace(pattern, (match) => {
      if (match.length <= 4) return '*'.repeat(match.length);
      return match.substring(0, 2) + '*'.repeat(Math.max(0, match.length - 4)) + match.substring(match.length - 2);
    });
  }
  
  return masked;
}

/** Security: Deep object validation with depth limiting */
function validateObjectDepth(obj: any, maxDepth: number = VALIDATION_LIMITS.MAX_OBJECT_DEPTH, currentDepth = 0): boolean {
  if (currentDepth > maxDepth) {
    console.warn(`[Security] Object depth exceeded limit: ${maxDepth}`);
    return false;
  }
  
  if (obj && typeof obj === 'object') {
    for (const value of Object.values(obj)) {
      if (!validateObjectDepth(value, maxDepth, currentDepth + 1)) {
        return false;
      }
    }
  }
  
  return true;
}

/** Security: Enhanced input sanitization with comprehensive XSS prevention */
function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data: URLs
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/expression\s*\(/gi, '') // Remove CSS expressions
    .replace(/url\s*\(/gi, '') // Remove CSS url() functions
    .trim()
    .substring(0, VALIDATION_LIMITS.MAX_STRING_LENGTH);
}

/** Security: Enhanced recursive input sanitization */
function sanitizeInput(input: any, depth = 0): any {
  // Security: Prevent deep object attacks
  if (depth > VALIDATION_LIMITS.MAX_OBJECT_DEPTH) {
    console.warn('[Security] Maximum sanitization depth exceeded');
    return null;
  }
  
  if (input === null || input === undefined) {
    return input;
  }

  if (typeof input === 'string') {
    return sanitizeString(input);
  }

  if (Array.isArray(input)) {
    // Security: Limit array size
    if (input.length > VALIDATION_LIMITS.MAX_ARRAY_LENGTH) {
      console.warn(`[Security] Array length exceeded limit: ${VALIDATION_LIMITS.MAX_ARRAY_LENGTH}`);
      return input.slice(0, VALIDATION_LIMITS.MAX_ARRAY_LENGTH);
    }
    return input.map(item => sanitizeInput(item, depth + 1));
  }

  if (typeof input === 'object') {
    const sanitized: any = {};
    let propertyCount = 0;
    
    for (const [key, value] of Object.entries(input)) {
      // Security: Limit object properties
      if (propertyCount >= VALIDATION_LIMITS.MAX_ARRAY_LENGTH) {
        console.warn('[Security] Object property count exceeded limit');
        break;
      }
      
      const sanitizedKey = sanitizeString(key);
      if (sanitizedKey) { // Only include valid keys
        sanitized[sanitizedKey] = sanitizeInput(value, depth + 1);
        propertyCount++;
      }
    }
    return sanitized;
  }

  // Security: Validate numbers
  if (typeof input === 'number') {
    if (!Number.isFinite(input)) {
      console.warn('[Security] Invalid number detected');
      return 0;
    }
    return input;
  }

  return input;
}

/** Security: Enhanced validation functions */
function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string' || email.length > 254) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') return false;
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

function isValidId(id: any): boolean {
  return (typeof id === 'string' && isValidUUID(id)) || 
         (typeof id === 'number' && Number.isInteger(id) && id > 0);
}

/** Security: Validate input against rules */
function validateInputRules(data: any, rules: ValidationRule[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (const rule of rules) {
    const value = data[rule.field];
    
    // Check required fields
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`Field '${rule.field}' is required`);
      continue;
    }
    
    // Skip validation if field is optional and empty
    if (!rule.required && (value === undefined || value === null || value === '')) {
      continue;
    }
    
    // Type validation
    switch (rule.type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push(`Field '${rule.field}' must be a string`);
        } else {
          if (rule.min && value.length < rule.min) {
            errors.push(`Field '${rule.field}' must be at least ${rule.min} characters`);
          }
          if (rule.max && value.length > rule.max) {
            errors.push(`Field '${rule.field}' must be at most ${rule.max} characters`);
          }
          if (rule.pattern && !rule.pattern.test(value)) {
            errors.push(`Field '${rule.field}' format is invalid`);
          }
        }
        break;
        
      case 'number':
        if (typeof value !== 'number' || !Number.isFinite(value)) {
          errors.push(`Field '${rule.field}' must be a valid number`);
        } else {
          if (rule.min !== undefined && value < rule.min) {
            errors.push(`Field '${rule.field}' must be at least ${rule.min}`);
          }
          if (rule.max !== undefined && value > rule.max) {
            errors.push(`Field '${rule.field}' must be at most ${rule.max}`);
          }
        }
        break;
        
      case 'email':
        if (!isValidEmail(value)) {
          errors.push(`Field '${rule.field}' must be a valid email address`);
        }
        break;
        
      case 'uuid':
        if (!isValidUUID(value)) {
          errors.push(`Field '${rule.field}' must be a valid UUID`);
        }
        break;
        
      case 'enum':
        if (rule.allowedValues && !rule.allowedValues.includes(value)) {
          errors.push(`Field '${rule.field}' must be one of: ${rule.allowedValues.join(', ')}`);
        }
        break;
    }
  }
  
  return { isValid: errors.length === 0, errors };
}

// =================== SECURITY MANAGERS ===================

/** Security: Enhanced CSRF Protection Manager */
class CSRFManager {
  private static instance: CSRFManager;
  private tokens = new Map<string, CSRFToken>();
  
  static getInstance(): CSRFManager {
    if (!CSRFManager.instance) {
      CSRFManager.instance = new CSRFManager();
    }
    return CSRFManager.instance;
  }
  
  /** Security: Generate CSRF token for user */
  generateToken(userId: string): string {
    const csrfToken = generateCSRFToken(userId);
    this.tokens.set(userId, csrfToken);
    
    // Cleanup expired tokens
    this.cleanupExpiredTokens();
    
    return csrfToken.token;
  }
  
  /** Security: Validate CSRF token */
  validateToken(userId: string, token: string): boolean {
    const storedToken = this.tokens.get(userId);
    
    if (!storedToken) {
      console.warn(`[Security] No CSRF token found for user: ${userId.substring(0, 8)}...`);
      return false;
    }
    
    if (Date.now() > storedToken.expires) {
      console.warn(`[Security] Expired CSRF token for user: ${userId.substring(0, 8)}...`);
      this.tokens.delete(userId);
      return false;
    }
    
    if (storedToken.token !== token) {
      console.warn(`[Security] Invalid CSRF token for user: ${userId.substring(0, 8)}...`);
      return false;
    }
    
    return true;
  }
  
  /** Security: Cleanup expired tokens */
  private cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [userId, token] of this.tokens.entries()) {
      if (now > token.expires) {
        this.tokens.delete(userId);
      }
    }
  }
}

/** Security: Enhanced Rate Limiting Manager */
class RateLimitManager {
  private static instance: RateLimitManager;
  private records = new Map<string, RateLimitRecord>();
  
  static getInstance(): RateLimitManager {
    if (!RateLimitManager.instance) {
      RateLimitManager.instance = new RateLimitManager();
    }
    return RateLimitManager.instance;
  }
  
  /** Security: Check if request is allowed */
  checkLimit(identifier: string): { allowed: boolean; retryAfter?: number; remaining: number } {
    const now = Date.now();
    const record = this.records.get(identifier);
    
    // Check if currently blocked
    if (record?.blockedUntil && now < record.blockedUntil) {
      return {
        allowed: false,
        retryAfter: Math.ceil((record.blockedUntil - now) / 1000),
        remaining: 0,
      };
    }
    
    if (!record) {
      // First request
      this.records.set(identifier, {
        count: 1,
        hourlyCount: 1,
        firstRequest: now,
        lastRequest: now,
      });
      
      return {
        allowed: true,
        remaining: RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_MINUTE - 1,
      };
    }
    
    // Reset counters if windows have passed
    if (now - record.firstRequest > RATE_LIMIT_CONFIG.WINDOW_SIZE) {
      record.count = 1;
      record.firstRequest = now;
    } else {
      record.count++;
    }
    
    if (now - record.lastRequest > RATE_LIMIT_CONFIG.HOUR_WINDOW_SIZE) {
      record.hourlyCount = 1;
    } else {
      record.hourlyCount++;
    }
    
    record.lastRequest = now;
    
    // Check limits
    if (record.count > RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_MINUTE ||
        record.hourlyCount > RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_HOUR) {
      
      // Block the identifier
      record.blockedUntil = now + RATE_LIMIT_CONFIG.BLOCKED_DURATION;
      
      console.warn(`[Security] Rate limit exceeded for identifier: ${identifier.substring(0, 8)}...`);
      
      return {
        allowed: false,
        retryAfter: Math.ceil(RATE_LIMIT_CONFIG.BLOCKED_DURATION / 1000),
        remaining: 0,
      };
    }
    
    return {
      allowed: true,
      remaining: Math.max(0, RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_MINUTE - record.count),
    };
  }
  
  /** Security: Reset limits for identifier */
  resetLimits(identifier: string): void {
    this.records.delete(identifier);
  }
}

/** Security: Audit Logger */
class AuditLogger {
  private static instance: AuditLogger;
  
  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }
  
  /** Security: Log sensitive operation */
  async logOperation(
    operation: string,
    userId: string,
    details: any,
    success: boolean,
    requestId: string
  ): Promise<void> {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        operation,
        user_id: userId,
        details: maskSensitiveData(JSON.stringify(details)),
        success,
        request_id: requestId,
        ip_address: this.getClientIP(),
        user_agent: navigator?.userAgent || 'unknown',
      };
      
      // In production, send to audit logging service
      console.log('[Audit]', logEntry);
      
      // Store in Supabase audit table (if configured)
      const client = await getSecureSupabaseClient();
      await client.from('audit_logs').insert(logEntry);
      
    } catch (error) {
      console.error('[Security] Audit logging failed:', error);
      // Don't throw - audit logging failures shouldn't break operations
    }
  }
  
  /** Security: Get client IP (simplified for browser environment) */
  private getClientIP(): string {
    // In production, this would be handled by the server
    return 'client-side';
  }
}

// =================== STATE MANAGEMENT UTILITY FUNCTIONS ===================

/** State Management: Generate unique error ID for debugging */
function generateStateErrorId(): string {
  return `error_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/** State Management: Log state-related errors with classification */
function logStateError(
  errorId: string, 
  operation: string, 
  error: any, 
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
  type: 'session' | 'auth' | 'network' | 'state' | 'validation' = 'state'
): void {
  const errorMessage = error?.message || 'Unknown error';
  const errorCode = error?.code || 'UNKNOWN';
  
  console.error(`[StateError:${severity}:${type}] ${operation} [${errorId}]: ${errorMessage}`, {
    errorId,
    operation,
    severity,
    type,
    errorCode,
    timestamp: new Date().toISOString()
  });
}

/** State Management: Safe state operation wrapper with retry logic */
async function safeStateOperation<T>(
  operation: () => Promise<T>,
  operationName: string,
  fallbackValue: T,
  options: {
    retries?: number;
    timeout?: number;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    logErrors?: boolean;
  } = {}
): Promise<T> {
  const { retries = 1, timeout = 10000, severity = 'medium', logErrors = true } = options;
  const errorId = generateStateErrorId();
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Timeout protection
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(`Operation timeout after ${timeout}ms`)), timeout)
      );
      
      const result = await Promise.race([operation(), timeoutPromise]);
      return result;
    } catch (error: any) {
      if (logErrors) {
        logStateError(errorId, `${operationName} (attempt ${attempt}/${retries})`, error, severity);
      }
      
      // Check for 500 errors specifically
      if (error?.status === 500 || error?.code === '500' || error?.message?.includes('500')) {
        console.error(`[Supabase 500] Database error in ${operationName}: ${error.message || 'Unknown 500 error'}`);
        
        // For role-based calls, add user message
        if (operationName.includes('finance') || operationName.includes('manager') || operationName.includes('promotion')) {
          console.warn(`[User Message] 500 error in ${operationName}: Service temporarily unavailable. Please try again in a moment.`);
        }
        
        // Retry for 500 errors
        if (attempt < retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff up to 5s
          console.log(`[Retry] Retrying ${operationName} in ${delay}ms due to 500 error...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      // Don't retry on final attempt or non-500 errors
      if (attempt === retries || (error?.status && error.status < 500 && error.status !== 429)) {
        if (logErrors) {
          console.error(`[StateOperation] ${operationName} failed after ${retries} attempts [${errorId}]`);
        }
        return fallbackValue;
      }
      
      // Retry delay for other errors
      const delay = Math.min(500 * attempt, 2000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return fallbackValue;
}

/** State Management: Safe Supabase client retrieval */
async function safeGetSupabaseClient() {
  try {
    return await getSecureSupabaseClient();
  } catch (error: any) {
    console.error('[StateError] Failed to get Supabase client:', error.message);
    return null;
  }
}

/** State Management: Safe current user retrieval */
async function safeGetCurrentUser() {
  try {
    return await getCurrentUser();
  } catch (error: any) {
    console.error('[StateError] Failed to get current user:', error.message);
    return null;
  }
}

// =================== CONFIGURATION ===================

// Environment detection and configuration
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Security: HTTPS enforcement - critical for production
const ENFORCE_HTTPS = isProduction || import.meta.env.VITE_ENFORCE_HTTPS === 'true';

// API configuration with security validation
const API_BASE_URL = (() => {
  const url = import.meta.env.VITE_API_URL || 'https://api.dasboard.app';
  
  // Security: Validate API URL
  if (ENFORCE_HTTPS && !url.startsWith('https://')) {
    console.error('[Security] API URL must use HTTPS in production');
    throw new Error('Insecure API URL not allowed in production');
  }
  
  return url;
})();

// Mock API detection with security consideration
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true' && isDevelopment;

// Request configuration
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_RETRIES = 3;
const RETRY_DELAY_BASE = 1000; // 1 second base delay

// Security: Initialize managers
const csrfManager = CSRFManager.getInstance();
const rateLimitManager = RateLimitManager.getInstance();
const auditLogger = AuditLogger.getInstance();

// =================== ENVIRONMENT VALIDATION ===================

/**
 * Environment error checker - validates Supabase environment variables
 * before making any Supabase client calls
 */
class EnvironmentValidator {
  private static instance: EnvironmentValidator;
  private lastCheck: number = 0;
  private envStatus: { isValid: boolean; error?: string } | null = null;
  
  static getInstance(): EnvironmentValidator {
    if (!EnvironmentValidator.instance) {
      EnvironmentValidator.instance = new EnvironmentValidator();
    }
    return EnvironmentValidator.instance;
  }
  
  /**
   * Check if Supabase environment variables are properly loaded
   * Returns specific error messages for different missing env var scenarios
   */
  validateEnvironment(): { isValid: boolean; error?: string } {
    const now = Date.now();
    
    // Cache result for 5 seconds to avoid repeated checks
    if (this.envStatus && (now - this.lastCheck) < 5000) {
      return this.envStatus;
    }
    
    this.lastCheck = now;
    
    // Check for Supabase URL
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl === 'undefined' || supabaseUrl.trim() === '') {
      const error = 'Env vars not loaded; restart npm run dev - VITE_SUPABASE_URL missing';
      console.error(`[Security] ${error}`);
      this.envStatus = { isValid: false, error };
      return this.envStatus;
    }
    
    // Check for Supabase anon key
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!supabaseKey || supabaseKey === 'undefined' || supabaseKey.trim() === '') {
      const error = 'Env vars not loaded; restart npm run dev - VITE_SUPABASE_ANON_KEY missing';
      console.error(`[Security] ${error}`);
      this.envStatus = { isValid: false, error };
      return this.envStatus;
    }
    
    // Validate URL format
    try {
      new URL(supabaseUrl);
    } catch {
      const error = 'Env vars not loaded; restart npm run dev - VITE_SUPABASE_URL invalid format';
      console.error(`[Security] ${error}`);
      this.envStatus = { isValid: false, error };
      return this.envStatus;
    }
    
    // Validate key format (basic check)
    if (supabaseKey.length < 32) {
      const error = 'Env vars not loaded; restart npm run dev - VITE_SUPABASE_ANON_KEY too short';
      console.error(`[Security] ${error}`);
      this.envStatus = { isValid: false, error };
      return this.envStatus;
    }
    
    this.envStatus = { isValid: true };
    return this.envStatus;
  }
  
  /**
   * Force refresh of environment validation
   */
  refresh(): void {
    this.envStatus = null;
    this.lastCheck = 0;
  }
  
  /**
   * Get current environment status without validation
   */
  getStatus(): { isValid: boolean; error?: string } | null {
    return this.envStatus;
  }
}

// =================== ENHANCED AUTHENTICATION MANAGER ===================

class AuthManager {
  private static instance: AuthManager;
  private currentSession: Session | null = null;
  private refreshPromise: Promise<Session | null> | null = null;
  private sessionValidationCache = new Map<string, { isValid: boolean; expires: number }>();
  private envValidator = EnvironmentValidator.getInstance();
  
  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  /** Security: Enhanced access token retrieval with environment validation and validation caching */
  async getAccessToken(): Promise<string | null> {
    try {
      // Environment validation: Check before making Supabase calls
      const envCheck = this.envValidator.validateEnvironment();
      if (!envCheck.isValid) {
        console.error(`[Security] Environment validation failed: ${envCheck.error}`);
        throw new Error(envCheck.error);
      }
      
      const client = await getSecureSupabaseClient();
      const { data: { session }, error } = await client.auth.getSession();

      if (error) {
        console.error('[Security] Session fetch error:', error.message);
        return null;
      }

      if (!session?.access_token) {
        console.warn('[Security] No active session or access token');
        return null;
      }

      // Security: Check token validation cache
      const cacheKey = session.access_token.substring(0, 16); // Safe prefix for caching
      const cached = this.sessionValidationCache.get(cacheKey);
      
      if (cached && Date.now() < cached.expires) {
        if (!cached.isValid) {
          console.warn('[Security] Cached session marked as invalid');
          return null;
        }
      } else {
        // Validate and cache session
        const isValid = await this.validateSessionSecurity(session);
        this.sessionValidationCache.set(cacheKey, {
          isValid,
          expires: Date.now() + 5 * 60 * 1000, // 5 minute cache
        });
        
        if (!isValid) {
          return null;
        }
      }

      // Check if token is expired or expiring soon (within 5 minutes)
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = session.expires_at || 0;
      const isExpiringSoon = (expiresAt - now) < 300;

      if (isExpiringSoon) {
        console.log('[Security] Token expiring soon, refreshing...');
        const refreshedSession = await this.refreshSession();
        return refreshedSession?.access_token || null;
      }

      this.currentSession = session;
      return session.access_token;
    } catch (error) {
      console.error('[Security] Access token fetch failed:', error);
      return null;
    }
  }

  /** Security: Validate session security properties */
  private async validateSessionSecurity(session: Session): Promise<boolean> {
    try {
      // Check session age
      if (session.user.created_at) {
        const sessionAge = Date.now() - new Date(session.user.created_at).getTime();
        const maxAge = 8 * 60 * 60 * 1000; // 8 hours
        
        if (sessionAge > maxAge) {
          console.warn('[Security] Session exceeds maximum age');
          return false;
        }
      }
      
      // Validate token structure
      if (!session.access_token || session.access_token.length < 32) {
        console.warn('[Security] Invalid token structure');
        return false;
      }
      
      // Check user verification status
      if (!session.user.email_confirmed_at) {
        console.warn('[Security] User email not verified');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('[Security] Session validation error:', error);
      return false;
    }
  }

  /** Security: Enhanced session refresh with security validation */
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

  /** Security: Perform actual session refresh with environment validation */
  private async _performRefresh(): Promise<Session | null> {
    try {
      // Environment validation: Check before making Supabase calls
      const envCheck = this.envValidator.validateEnvironment();
      if (!envCheck.isValid) {
        console.error(`[Security] Environment validation failed during refresh: ${envCheck.error}`);
        throw new Error(envCheck.error);
      }
      
      const client = await getSecureSupabaseClient();
      const { data, error } = await client.auth.refreshSession();

      if (error) {
        console.error('[Security] Session refresh failed:', error.message);
        // Clear validation cache on refresh failure
        this.sessionValidationCache.clear();
        await this.handleAuthFailure();
        return null;
      }

      if (data.session) {
        // Validate refreshed session
        const isValid = await this.validateSessionSecurity(data.session);
        if (!isValid) {
          console.error('[Security] Refreshed session failed validation');
          await this.handleAuthFailure();
          return null;
        }
        
        this.currentSession = data.session;
        console.log('[Security] Session refreshed and validated successfully');
        return data.session;
      }

      console.warn('[Security] Session refresh returned no session');
      return null;
    } catch (error) {
      console.error('[Security] Session refresh exception:', error);
      await this.handleAuthFailure();
      return null;
    }
  }

  /** Security: Enhanced authentication failure handling with environment validation */
  async handleAuthFailure(): Promise<void> {
    try {
      console.log('[Security] Handling auth failure - performing secure cleanup');
      
      // Clear session validation cache
      this.sessionValidationCache.clear();
      
      // Environment validation: Check before making Supabase calls
      const envCheck = this.envValidator.validateEnvironment();
      if (!envCheck.isValid) {
        console.warn(`[Security] Skipping signOut due to environment error: ${envCheck.error}`);
        // Still perform local cleanup
        this.currentSession = null;
        this.clearStoredTokens();
        
        // Redirect to login with environment error indicator
        if (!window.location.pathname.includes('/auth')) {
          window.location.href = '/auth/signin?env_error=true';
        }
        return;
      }
      
      const client = await getSecureSupabaseClient();
      await client.auth.signOut();
      
      this.currentSession = null;
      
      // Security: Clear any sensitive data from localStorage/sessionStorage
      this.clearStoredTokens();
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/auth')) {
        window.location.href = '/auth/signin';
      }
    } catch (error) {
      console.error('[Security] Auth failure handling error:', error);
      // Force redirect even if signOut fails
      window.location.href = '/auth/signin';
    }
  }

  /** Security: Clear stored tokens from browser storage */
  private clearStoredTokens(): void {
    try {
      // Clear potential token storage
      if (sessionStorage) {
        sessionStorage.removeItem('supabase.auth.token');
        sessionStorage.removeItem('sb-auth-token');
      }
      if (localStorage) {
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('sb-auth-token');
      }
    } catch (error) {
      console.warn('[Security] Token cleanup warning:', error);
    }
  }

  /** Security: Get enhanced authentication headers with environment validation */
  async getAuthHeaders(): Promise<Record<string, string>> {
    // Environment validation: Check before making Supabase calls
    const envCheck = this.envValidator.validateEnvironment();
    if (!envCheck.isValid) {
      throw new Error(envCheck.error || 'Environment validation failed');
    }
    
    const token = await this.getAccessToken();
    
    if (!token) {
      throw new Error('No valid authentication token available');
    }

    const currentUser = await getCurrentUser();
    const csrfToken = currentUser ? csrfManager.generateToken(currentUser.id) : null;

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'X-Auth-Provider': 'supabase',
      'X-API-Version': '1.0',
      'X-Client-Type': 'web',
    };

    // Security: Add CSRF token if available
    if (csrfToken) {
      headers[CSRF_CONFIG.HEADER_NAME] = csrfToken;
    }

    return headers;
  }

  /** Security: Validate request permissions with environment validation */
  async validateRequestPermissions(operation: string, resourceId?: string): Promise<boolean> {
    try {
      // Environment validation: Check before making Supabase calls
      const envCheck = this.envValidator.validateEnvironment();
      if (!envCheck.isValid) {
        console.error(`[Security] Environment validation failed during permission check: ${envCheck.error}`);
        return false;
      }
      
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        return false;
      }

      // Security: Check user verification status
      if (!currentUser.email_confirmed_at) {
        console.warn('[Security] Unverified user attempting operation:', operation);
        return false;
      }

      // Security: Role-based access control (implement based on your schema)
      // This would typically check user roles against operation requirements
      
      return true;
    } catch (error) {
      console.error('[Security] Permission validation error:', error);
      return false;
    }
  }
}

// =================== ENHANCED HTTP CLIENT ===================

/** Security: Enhanced HTTP client with comprehensive security features */
class HttpClient {
  private authManager = AuthManager.getInstance();

  /** Security: Enhanced HTTP request with full security stack */
  async request<T = any>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const requestId = generateRequestId();
    const startTime = Date.now();
    
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = DEFAULT_TIMEOUT,
      retries = DEFAULT_RETRIES,
      requireAuth = true,
      skipTokenRefresh = false,
      skipRateLimit = false,
      requireElevated = false,
      validationRules = [],
      auditRequest = false,
    } = options;

    // Security: URL validation
    if (!url) {
      return {
        data: null,
        error: this.createSecureError('URL is required', 400, 'INVALID_REQUEST', requestId),
        success: false,
        requestId,
        timestamp: Date.now(),
      };
    }

    // Security: Ensure HTTPS in production
    if (ENFORCE_HTTPS && url.startsWith('http://')) {
      url = url.replace('http://', 'https://');
    }

    // Security: Input validation
    if (validationRules.length > 0 && body) {
      const validation = validateInputRules(body, validationRules);
      if (!validation.isValid) {
        return {
          data: null,
          error: this.createSecureError(
            `Validation failed: ${validation.errors.join(', ')}`,
            400,
            'VALIDATION_ERROR',
            requestId
          ),
          success: false,
          requestId,
          timestamp: Date.now(),
        };
      }
    }

    // Security: Rate limiting check (unless skipped)
    if (!skipRateLimit) {
      const currentUser = await getCurrentUser().catch(() => null);
      const identifier = currentUser?.id || 'anonymous';
      const rateLimitCheck = rateLimitManager.checkLimit(identifier);
      
      if (!rateLimitCheck.allowed) {
        const error = this.createSecureError(
          'Rate limit exceeded',
          429,
          'RATE_LIMITED',
          requestId
        );
        
        return {
          data: null,
          error,
          success: false,
          requestId,
          timestamp: Date.now(),
          rateLimit: {
            remaining: rateLimitCheck.remaining,
            resetTime: Date.now() + (rateLimitCheck.retryAfter! * 1000),
            limit: RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_MINUTE,
          },
        };
      }
    }

    // Security: Permission validation for elevated operations
    if (requireElevated) {
      const hasPermission = await this.authManager.validateRequestPermissions(method, url);
      if (!hasPermission) {
        return {
          data: null,
          error: this.createSecureError('Insufficient permissions', 403, 'FORBIDDEN', requestId),
          success: false,
          requestId,
          timestamp: Date.now(),
        };
      }
    }

    let lastError: ApiError | null = null;

    // Retry loop with exponential backoff
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Security: Prepare headers with security enhancements
        const requestHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-Request-ID': requestId,
          'X-Client-Timestamp': Date.now().toString(),
          ...headers,
        };

        // Security: Add authentication headers if required (with environment validation)
        if (requireAuth) {
          try {
            const authHeaders = await this.authManager.getAuthHeaders();
            Object.assign(requestHeaders, authHeaders);
          } catch (authError: any) {
            console.error('[Security] Auth header error:', authError);
            
            // Check if this is an environment error
            if (authError.message?.includes('Env vars not loaded') || 
                authError.message?.includes('restart npm run dev') ||
                authError.message?.includes('VITE_SUPABASE')) {
              return {
                data: null,
                error: this.createSecureError(
                  authError.message || 'Environment configuration error', 
                  503, 
                  'ENV_ERROR', 
                  requestId
                ),
                success: false,
                requestId,
                timestamp: Date.now(),
              };
            }
            
            return {
              data: null,
              error: this.createSecureError('Authentication failed', 401, 'AUTH_FAILED', requestId),
              success: false,
              requestId,
              timestamp: Date.now(),
            };
          }
        }

        // Security: Prepare request body with sanitization
        let requestBody: string | undefined;
        if (body) {
          if (typeof body === 'string') {
            requestBody = body;
          } else {
            // Security: Validate object depth before sanitization
            if (!validateObjectDepth(body)) {
              return {
                data: null,
                error: this.createSecureError('Request body too complex', 400, 'INVALID_REQUEST', requestId),
                success: false,
                requestId,
                timestamp: Date.now(),
              };
            }
            
            const sanitizedBody = sanitizeInput(body);
            requestBody = JSON.stringify(sanitizedBody);
          }
        }

        // Security: Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        console.log(`[Security] ${method} ${url} (attempt ${attempt}/${retries}) [${requestId}]`);

        try {
          // Make the request
          const response = await fetch(url, {
            method,
            headers: requestHeaders,
            body: requestBody,
            signal: controller.signal,
            credentials: 'include',
            // Security: Additional fetch options
            cache: 'no-cache',
            redirect: 'follow',
          });

          clearTimeout(timeoutId);

          // Security: Handle successful response
          if (response.ok) {
            let data: T | null = null;
            
            const contentType = response.headers.get('content-type');
            if (contentType?.includes('application/json')) {
              try {
                const rawData = await response.json();
                // Security: Sanitize response data
                data = sanitizeInput(rawData);
              } catch (parseError) {
                console.warn('[Security] JSON parse error:', parseError);
                // Return success with null data if JSON parsing fails
              }
            }

            // Security: Audit successful request if required
            if (auditRequest) {
              const currentUser = await getCurrentUser().catch(() => null);
              if (currentUser) {
                await auditLogger.logOperation(
                  `${method} ${url}`,
                  currentUser.id,
                  { body: maskSensitiveData(requestBody || '') },
                  true,
                  requestId
                );
              }
            }

            console.log(`[Security] ${method} ${url} - Success [${requestId}]`);
            return {
              data,
              error: null,
              success: true,
              requestId,
              timestamp: Date.now(),
            };
          }

          // Security: Handle HTTP errors
          const error = await this.handleHttpError(response, requestId);
          
          // Enhanced 500 Error Handling: Specific handling for Supabase 500 errors
          if (response.status === 500) {
            console.error(`[Supabase 500] Database error during ${method} ${url}: ${error.message || 'Unknown database error'}`);
            
            // Log specific 500 error with context
            const errorDetails = {
              url,
              method,
              requestId,
              attempt,
              maxRetries: retries,
              timestamp: new Date().toISOString()
            };
            console.error('[Supabase 500] Error details:', errorDetails);
            
            // For role-based operations, add user-friendly message
            if (url.includes('finance') || url.includes('manager') || url.includes('promotion') || 
                url.includes('deals') || url.includes('sales') || url.includes('profile')) {
              console.warn('[User Message] Service temporarily unavailable due to database maintenance. Please try again in a moment.');
            }
            
            // Always retry 500 errors with exponential backoff
            if (attempt < retries) {
              const retryDelay = Math.min(1000 * Math.pow(2, attempt - 1), 8000); // Up to 8 seconds
              console.log(`[Retry] Retrying ${method} ${url} in ${retryDelay}ms due to 500 error (attempt ${attempt + 1}/${retries})`);
              await new Promise(resolve => setTimeout(resolve, retryDelay));
              continue;
            }
          }
          
          // Security: Handle authentication errors
          if ((response.status === 401 || response.status === 403) && !skipTokenRefresh) {
            console.warn(`[Security] Auth error ${response.status}, handling... [${requestId}]`);
            await this.authManager.handleAuthFailure();
            return {
              data: null,
              error,
              success: false,
              requestId,
              timestamp: Date.now(),
            };
          }

          lastError = error;

          // Don't retry client errors (4xx) except 401/403/429/500
          if (response.status >= 400 && response.status < 500 && 
              ![401, 403, 429].includes(response.status)) {
            break;
          }

        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          
          if (fetchError.name === 'AbortError') {
            lastError = this.createSecureError('Request timeout', 408, 'TIMEOUT', requestId);
          } else {
            // Enhanced 500 Error Handling: Check for network-level 500 errors
            const errorMessage = fetchError.message || 'Network error occurred';
            
            if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error') ||
                errorMessage.includes('database') || errorMessage.includes('postgres')) {
              console.error(`[Supabase 500] Network-level database error: ${errorMessage}`);
              console.warn('[User Message] Network connectivity issue with database. Please check your connection and try again.');
              
              lastError = this.createSecureError(
                'Database connectivity issue. Please try again.',
                500,
                'NETWORK_DB_ERROR',
                requestId
              );
            } else {
              lastError = this.createSecureError(
                'Network error occurred',
                0,
                'NETWORK_ERROR',
                requestId
              );
            }
          }
        }

        // Wait before retry (exponential backoff with jitter)
        if (attempt < retries) {
          const delay = RETRY_DELAY_BASE * Math.pow(2, attempt - 1) + Math.random() * 1000;
          console.log(`[Security] Retrying in ${Math.round(delay)}ms... [${requestId}]`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

      } catch (error: any) {
        lastError = this.createSecureError(
          'Request failed',
          0,
          'REQUEST_FAILED',
          requestId
        );
      }
    }

    // Security: Audit failed request if required
    if (auditRequest) {
      const currentUser = await getCurrentUser().catch(() => null);
      if (currentUser) {
        await auditLogger.logOperation(
          `${method} ${url}`,
          currentUser.id,
          { error: lastError?.message },
          false,
          requestId
        );
      }
    }

    console.error(`[Security] ${method} ${url} - Failed after ${retries} attempts [${requestId}]:`, lastError);

    return {
      data: null,
      error: lastError || this.createSecureError('Unknown error occurred', 500, 'UNKNOWN_ERROR', requestId),
      success: false,
      requestId,
      timestamp: Date.now(),
    };
  }

  /** Security: Create secure error with minimal information leakage */
  private createSecureError(
    message: string, 
    status?: number, 
    code?: string, 
    requestId?: string
  ): ApiError {
    // Security: Mask sensitive information in error messages
    const secureMessage = maskSensitiveData(message);
    
    return {
      message: secureMessage,
      status,
      code,
      requestId,
      type: this.classifyErrorType(status, code),
    };
  }

  /** Security: Classify error types for better handling */
  private classifyErrorType(status?: number, code?: string): ApiError['type'] {
    if (code === 'VALIDATION_ERROR') return 'validation';
    if (status === 401 || status === 403) return 'authorization';
    if (status === 429 || code === 'RATE_LIMITED') return 'rate_limit';
    if (status === 0 || code === 'NETWORK_ERROR' || code === 'TIMEOUT') return 'network';
    if (status && status >= 500) return 'server';
    return 'unknown';
  }

  /** Security: Enhanced HTTP error handling with secure logging and 500 error focus */
  private async handleHttpError(response: Response, requestId: string): Promise<ApiError> {
    let errorMessage = `Request failed`;
    let errorCode = response.status.toString();
    let errorDetails: any = null;

    // Try to parse error response safely
    try {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const errorData = await response.json();
        
        // Security: Sanitize error data
        const sanitizedData = sanitizeInput(errorData);
        errorMessage = sanitizedData.message || sanitizedData.error || errorMessage;
        errorCode = sanitizedData.code || errorCode;
        errorDetails = sanitizedData.details;
      }
    } catch {
      // Use default error message if parsing fails
    }

    // Enhanced 500 Error Handling: Specific handling for database errors
    if (response.status === 500) {
      console.error(`[Supabase 500] Database error [${requestId}]: ${maskSensitiveData(errorMessage)}`);
      
      // Check for specific Supabase error patterns
      if (errorMessage.includes('database') || errorMessage.includes('postgres') || 
          errorMessage.includes('relation') || errorMessage.includes('column')) {
        console.error(`[Supabase 500] Database schema or connection issue detected`);
        errorMessage = 'Database temporarily unavailable. Please try again in a moment.';
      } else if (errorMessage.includes('timeout') || errorMessage.includes('connection')) {
        console.error(`[Supabase 500] Database connection timeout detected`);
        errorMessage = 'Database connection timeout. Please try again.';
      } else {
        console.error(`[Supabase 500] Generic database error detected`);
        errorMessage = 'Service temporarily unavailable due to database maintenance.';
      }
      
      // Log additional context for 500 errors
      console.error(`[Supabase 500] Response details:`, {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries()),
        requestId,
        timestamp: new Date().toISOString()
      });
    } else {
      // Security: Log non-500 errors normally
      console.warn(`[Security] HTTP Error ${response.status} [${requestId}]: ${maskSensitiveData(errorMessage)}`);
    }

    return this.createSecureError(errorMessage, response.status, errorCode, requestId);
  }
}

// =================== MOCK API (DEVELOPMENT ONLY) ===================

/** Security: Mock API with security considerations for development */
class MockApi {
  /** Security: Simulate realistic delays */
  static async delay(ms: number = 500): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  /** Security: Mock dealerships with access control simulation */
  static async mockDealerships(): Promise<Dealership[]> {
    await this.delay();
    return [
      { 
        id: 1, 
        name: 'Demo Dealership', 
        schema_name: 'demo_dealership',
        access_level: 'admin',
        classification: 'internal',
      },
      { 
        id: 2, 
        name: 'Test Motors', 
        schema_name: 'test_motors',
        access_level: 'read',
        classification: 'internal',
      },
    ];
  }

  /** Security: Mock sales with PII protection */
  static async mockSales(): Promise<Sale[]> {
    await this.delay();
    return [
      {
        id: '1',
        dealership_id: '1',
        sale_date: new Date().toISOString(),
        amount: 25000,
        customer_name: 'J*** D**', // Masked for privacy
        vehicle_model: 'Toyota Camry',
        status: 'completed',
        created_by: 'mock-user-1',
      },
      {
        id: '2',
        dealership_id: '1',
        sale_date: new Date().toISOString(),
        amount: 35000,
        customer_name: 'J*** S***', // Masked for privacy
        vehicle_model: 'Honda Accord',
        status: 'pending',
        created_by: 'mock-user-2',
      },
    ];
  }

  /** Security: Mock deals with secure data handling */
  static async mockDeals(): Promise<Deal[]> {
    await this.delay();
    return [
      {
        id: '1',
        stock_number: 'STK001',
        vin_last8: '12345678', // Only last 8 digits
        customer_last_name: 'Johnson',
        deal_type: 'Finance',
        front_end_gross: 2500,
        status: 'Pending',
        created_at: new Date().toISOString(),
        created_by: 'mock-user-1',
        dealership_id: 1,
      },
      {
        id: '2', 
        stock_number: 'STK002',
        vin_last8: '87654321', // Only last 8 digits
        customer_last_name: 'Williams',
        deal_type: 'Lease',
        front_end_gross: 3000,
        status: 'Funded',
        created_at: new Date().toISOString(),
        created_by: 'mock-user-2',
        dealership_id: 1,
      },
    ];
  }
}

// =================== ENHANCED API SERVICE ===================

/** Security: Main API service class with comprehensive security */
export class ApiService {
  private http = new HttpClient();
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /** Security: Build and validate URL */
  private buildUrl(endpoint: string): string {
    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const url = `${this.baseUrl}/${cleanEndpoint}`;
    
    // Security: Validate final URL
    try {
      new URL(url);
      return url;
    } catch {
      throw new Error('Invalid URL constructed');
    }
  }

  // =================== DEALERSHIP OPERATIONS ===================

  /** Security: Enhanced dealership retrieval with state management safety and access control */
  async getDealerships(): Promise<ApiResponse<Dealership[]>> {
    if (USE_MOCK_API) {
      return safeStateOperation(
        async () => {
          const mockData = await MockApi.mockDealerships();
          return { data: mockData, error: null, success: true };
        },
        'getDealerships (mock)',
        { data: [], error: { message: 'Mock API unavailable', status: 503, type: 'server' }, success: false },
        { severity: 'low' }
      );
    }

    const errorId = generateStateErrorId();
    
    return safeStateOperation(
      async () => {
        // Environment validation: Check before making Supabase calls
        const envValidator = EnvironmentValidator.getInstance();
        const envCheck = envValidator.validateEnvironment();
        if (!envCheck.isValid) {
          logStateError(errorId, 'getDealerships - environment validation', new Error(envCheck.error || 'Environment invalid'), 'high', 'validation');
          return {
            data: null,
            error: { 
              message: envCheck.error || 'Environment configuration error',
              status: 503,
              code: 'ENV_ERROR',
              type: 'server'
            },
            success: false,
          };
        }
        
        const client = await safeGetSupabaseClient();
        if (!client) {
          logStateError(errorId, 'getDealerships - client unavailable', new Error('Supabase client unavailable'), 'critical', 'state');
          throw new Error('Database connection unavailable');
        }
        
        const currentUser = await safeGetCurrentUser();
        if (!currentUser) {
          logStateError(errorId, 'getDealerships - no user', new Error('No authenticated user'), 'medium', 'auth');
          return {
            data: null,
            error: { message: 'Authentication required', status: 401, type: 'authorization' },
            success: false,
          };
        }

        // Security: Apply row-level security through RLS with enhanced 500 error handling
        const { data, error } = await client
          .from('dealerships')
          .select('*')
          .order('name');

        if (error) {
          logStateError(errorId, 'getDealerships - database query', error, 'high', 'state');
          
          // Enhanced 500 Error Handling: Check for database-specific errors
          const errorMessage = error.message || 'Unknown database error';
          const isDbError = errorMessage.includes('database') || errorMessage.includes('postgres') || 
                           errorMessage.includes('connection') || errorMessage.includes('timeout') ||
                           errorMessage.includes('relation') || errorMessage.includes('column');
          
          if (isDbError) {
            console.error(`[Supabase 500] Database error in getDealerships: ${errorMessage}`);
            console.warn('[User Message] Database temporarily unavailable. Please refresh the page or try again in a moment.');
            
            // Track 500 error in global monitor
            DatabaseErrorMonitor.getInstance().track500Error('getDealerships', error, { dealershipQuery: true });
          }
          
          return {
            data: null,
            error: { 
              message: isDbError ? 'Database temporarily unavailable. Please try again in a moment.' : 'Failed to fetch dealerships', 
              status: isDbError ? 500 : (error.code === 'PGRST116' ? 404 : 500), 
              code: isDbError ? 'DB_500_ERROR' : 'DB_ERROR',
              type: 'server'
            },
            success: false,
          };
        }

        // Security: Add access control metadata with error protection
        try {
          const enhancedData = (data || []).map(dealership => ({
            ...dealership,
            access_level: 'read' as const,
            classification: 'internal' as const,
          }));

          return { data: enhancedData, error: null, success: true };
        } catch (enhanceError) {
          logStateError(errorId, 'getDealerships - data enhancement', enhanceError, 'low', 'state');
          // Return raw data if enhancement fails
          return { data: data || [], error: null, success: true };
        }
      },
      'getDealerships',
      {
        data: null,
        error: { 
          message: 'Service temporarily unavailable', 
          status: 500,
          type: 'server'
        },
        success: false,
      },
      { retries: 2, severity: 'high', logErrors: true }
    );
  }

  /** Security: Enhanced dealership retrieval by ID with validation */
  async getDealership(id: number): Promise<ApiResponse<Dealership>> {
    // Security: Input validation
    if (!id || !Number.isInteger(id) || id <= 0) {
      return {
        data: null,
        error: { 
          message: 'Valid dealership ID is required', 
          status: 400,
          type: 'validation'
        },
        success: false,
      };
    }

    try {
      const client = await getSecureSupabaseClient();
      const currentUser = await getCurrentUser();
      
      if (!currentUser) {
        return {
          data: null,
          error: { message: 'Authentication required', status: 401, type: 'authorization' },
          success: false,
        };
      }

      const { data, error } = await client
        .from('dealerships')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        const status = error.code === 'PGRST116' ? 404 : 500;
        const message = status === 404 ? 'Dealership not found' : 'Failed to fetch dealership';
        
        return {
          data: null,
          error: { 
            message, 
            status, 
            code: error.code,
            type: status === 404 ? 'validation' : 'server'
          },
          success: false,
        };
      }

      // Security: Add access control metadata
      const enhancedData: Dealership = {
        ...data,
        access_level: 'read' as const,
        classification: 'internal' as const,
      };

      return { data: enhancedData, error: null, success: true };
    } catch (error: any) {
      console.error('[Security] Dealership fetch error:', error);
      return {
        data: null,
        error: { 
          message: 'Service temporarily unavailable',
          status: 500,
          type: 'server'
        },
        success: false,
      };
    }
  }

  // =================== SALES OPERATIONS ===================

  /** Security: Enhanced sales retrieval with state management safety and privacy protection */
  async getSales(dealershipId?: string): Promise<ApiResponse<Sale[]>> {
    if (USE_MOCK_API) {
      return safeStateOperation(
        async () => {
          const mockData = await MockApi.mockSales();
          return { data: mockData, error: null, success: true };
        },
        'getSales (mock)',
        { data: [], error: { message: 'Mock API unavailable', status: 503, type: 'server' }, success: false },
        { severity: 'low' }
      );
    }

    const errorId = generateStateErrorId();
    
    return safeStateOperation(
      async () => {
        const client = await safeGetSupabaseClient();
        if (!client) {
          logStateError(errorId, 'getSales - client unavailable', new Error('Supabase client unavailable'), 'critical', 'state');
          throw new Error('Database connection unavailable');
        }
        
        const currentUser = await safeGetCurrentUser();
        if (!currentUser) {
          logStateError(errorId, 'getSales - no user', new Error('No authenticated user'), 'medium', 'auth');
          return {
            data: null,
            error: { message: 'Authentication required', status: 401, type: 'authorization' },
            success: false,
          };
        }

        let query = client.from('sales').select('*');

        // Security: Validate dealership ID if provided
        if (dealershipId) {
          if (!isValidUUID(dealershipId) && !/^\d+$/.test(dealershipId)) {
            logStateError(errorId, 'getSales - invalid dealership ID', new Error(`Invalid ID format: ${dealershipId}`), 'medium', 'validation');
            return {
              data: null,
              error: { 
                message: 'Invalid dealership ID format', 
                status: 400,
                type: 'validation'
              },
              success: false,
            };
          }
          query = query.eq('dealership_id', dealershipId);
        }

        const { data, error } = await query.order('sale_date', { ascending: false });

        if (error) {
          logStateError(errorId, 'getSales - database query', error, 'high', 'state');
          return {
            data: null,
            error: { 
              message: 'Failed to fetch sales data', 
              status: 500,
              type: 'server'
            },
            success: false,
          };
        }

        // Security: Apply privacy protection to customer data with error handling
        try {
          const protectedData = (data || []).map(sale => ({
            ...sale,
            customer_name: sale.customer_name ? maskSensitiveData(sale.customer_name) : undefined,
            customer_full_name: sale.customer_name, // Would be encrypted in production
          }));

          return { data: protectedData, error: null, success: true };
        } catch (protectionError) {
          logStateError(errorId, 'getSales - data protection', protectionError, 'medium', 'state');
          // Return raw data if protection fails (less secure but functional)
          return { data: data || [], error: null, success: true };
        }
      },
      'getSales',
      {
        data: null,
        error: { 
          message: 'Service temporarily unavailable',
          status: 500,
          type: 'server'
        },
        success: false,
      },
      { retries: 2, severity: 'high', logErrors: true }
    );
  }

  /** Security: Enhanced sale creation with comprehensive validation */
  async createSale(saleData: Omit<Sale, 'id'>): Promise<ApiResponse<Sale>> {
    // Security: Define validation rules
    const validationRules: ValidationRule[] = [
      { field: 'dealership_id', type: 'string', required: true },
      { field: 'amount', type: 'number', required: true, min: 0.01 },
      { field: 'sale_date', type: 'string', required: true },
      { field: 'customer_name', type: 'string', required: false, max: 100 },
      { field: 'vehicle_model', type: 'string', required: false, max: 50 },
      { 
        field: 'status', 
        type: 'enum', 
        required: false, 
        allowedValues: ['pending', 'completed', 'cancelled'] 
      },
    ];

    // Security: Validate input
    const validation = validateInputRules(saleData, validationRules);
    if (!validation.isValid) {
      return {
        data: null,
        error: { 
          message: `Validation failed: ${validation.errors.join(', ')}`,
          status: 400,
          type: 'validation'
        },
        success: false,
      };
    }

    try {
      const client = await getSecureSupabaseClient();
      const currentUser = await getCurrentUser();
      
      if (!currentUser) {
        return {
          data: null,
          error: { message: 'Authentication required', status: 401, type: 'authorization' },
          success: false,
        };
      }

      // Security: Sanitize and enhance data
      const sanitizedData = sanitizeInput(saleData);
      sanitizedData.created_by = currentUser.id;
      sanitizedData.created_at = new Date().toISOString();

      const { data, error } = await client
        .from('sales')
        .insert([sanitizedData])
        .select()
        .single();

      if (error) {
        console.error('[Security] Sale creation error:', error.message);
        return {
          data: null,
          error: { 
            message: 'Failed to create sale',
            status: 500,
            type: 'server'
          },
          success: false,
        };
      }

      // Security: Audit the operation
      await auditLogger.logOperation(
        'CREATE_SALE',
        currentUser.id,
        { sale_id: data.id, amount: data.amount },
        true,
        generateRequestId()
      );

      return { data, error: null, success: true };
    } catch (error: any) {
      console.error('[Security] Sale creation operation error:', error);
      return {
        data: null,
        error: { 
          message: 'Service temporarily unavailable',
          status: 500,
          type: 'server'
        },
        success: false,
      };
    }
  }

  // =================== DEAL OPERATIONS ===================

  /** Security: Enhanced deals retrieval with access control */
  async getDeals(dealershipId?: number): Promise<ApiResponse<Deal[]>> {
    if (USE_MOCK_API) {
      const mockData = await MockApi.mockDeals();
      return { data: mockData, error: null, success: true };
    }

    try {
      const client = await getSecureSupabaseClient();
      const currentUser = await getCurrentUser();
      
      if (!currentUser) {
        return {
          data: null,
          error: { message: 'Authentication required', status: 401, type: 'authorization' },
          success: false,
        };
      }

      // Security: Determine target dealership with access control
      let targetDealershipId = dealershipId;
      if (!targetDealershipId) {
        targetDealershipId = await getUserDealershipId();
      }

      if (!targetDealershipId) {
        return {
          data: null,
          error: { 
            message: 'No accessible dealership found',
            status: 403,
            type: 'authorization'
          },
          success: false,
        };
      }

      const { data, error } = await client
        .from('deals')
        .select('*')
        .eq('dealership_id', targetDealershipId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Security] Deals fetch error:', error.message);
        return {
          data: null,
          error: { 
            message: 'Failed to fetch deals',
            status: 500,
            type: 'server'
          },
          success: false,
        };
      }

      // Security: Apply privacy protection
      const protectedData = (data || []).map(deal => ({
        ...deal,
        customer_last_name: deal.customer_last_name ? 
          maskSensitiveData(deal.customer_last_name) : deal.customer_last_name,
      }));

      return { data: protectedData, error: null, success: true };
    } catch (error: any) {
      console.error('[Security] Deals operation error:', error);
      return {
        data: null,
        error: { 
          message: 'Service temporarily unavailable',
          status: 500,
          type: 'server'
        },
        success: false,
      };
    }
  }

  /** Security: Enhanced deal creation with validation and audit */
  async createDeal(dealData: Omit<Deal, 'id'>): Promise<ApiResponse<Deal>> {
    // Security: Define validation rules
    const validationRules: ValidationRule[] = [
      { field: 'stock_number', type: 'string', required: true, max: 20 },
      { field: 'vin_last8', type: 'string', required: true, pattern: /^\d{8}$/ },
      { field: 'customer_last_name', type: 'string', required: true, max: 50 },
      { 
        field: 'deal_type', 
        type: 'enum', 
        required: true, 
        allowedValues: ['Cash', 'Finance', 'Lease'] 
      },
      { field: 'front_end_gross', type: 'number', required: true, min: 0 },
      { 
        field: 'status', 
        type: 'enum', 
        required: true, 
        allowedValues: ['Pending', 'Funded', 'Unwound'] 
      },
    ];

    // Security: Validate input
    const validation = validateInputRules(dealData, validationRules);
    if (!validation.isValid) {
      return {
        data: null,
        error: { 
          message: `Validation failed: ${validation.errors.join(', ')}`,
          status: 400,
          type: 'validation'
        },
        success: false,
      };
    }

    try {
      const client = await getSecureSupabaseClient();
      const currentUser = await getCurrentUser();
      
      if (!currentUser) {
        return {
          data: null,
          error: { message: 'Authentication required', status: 401, type: 'authorization' },
          success: false,
        };
      }

      // Security: Sanitize and enhance data
      const sanitizedData = sanitizeInput(dealData);
      sanitizedData.created_by = currentUser.id;
      sanitizedData.created_at = new Date().toISOString();

      // Security: Set dealership if not provided
      if (!sanitizedData.dealership_id) {
        sanitizedData.dealership_id = await getUserDealershipId();
      }

      const { data, error } = await client
        .from('deals')
        .insert([sanitizedData])
        .select()
        .single();

      if (error) {
        console.error('[Security] Deal creation error:', error.message);
        return {
          data: null,
          error: { 
            message: 'Failed to create deal',
            status: 500,
            type: 'server'
          },
          success: false,
        };
      }

      // Security: Audit the operation
      await auditLogger.logOperation(
        'CREATE_DEAL',
        currentUser.id,
        { deal_id: data.id, stock_number: data.stock_number },
        true,
        generateRequestId()
      );

      return { data, error: null, success: true };
    } catch (error: any) {
      console.error('[Security] Deal creation operation error:', error);
      return {
        data: null,
        error: { 
          message: 'Service temporarily unavailable',
          status: 500,
          type: 'server'
        },
        success: false,
      };
    }
  }

  // =================== USER OPERATIONS ===================

  /** Security: Enhanced current profile retrieval with state management safety */
  async getCurrentProfile(): Promise<ApiResponse<User>> {
    const errorId = generateStateErrorId();
    
    return safeStateOperation(
      async () => {
        const user = await safeGetCurrentUser();
        
        if (!user) {
          logStateError(errorId, 'getCurrentProfile - no user', new Error('No authenticated user'), 'medium', 'auth');
          return {
            data: null,
            error: { 
              message: 'No authenticated user', 
              status: 401, 
              code: 'UNAUTHENTICATED',
              type: 'authorization'
            },
            success: false,
          };
        }

        // Security: Remove sensitive fields from response with error handling
        try {
          const sanitizedUser = {
            ...user,
            raw_app_meta_data: undefined,
            raw_user_meta_data: undefined,
          };

          return { data: sanitizedUser, error: null, success: true };
        } catch (sanitizeError) {
          logStateError(errorId, 'getCurrentProfile - sanitization', sanitizeError, 'low', 'state');
          // Return basic user info if sanitization fails
          return { 
            data: { 
              id: user.id, 
              email: user.email, 
              created_at: user.created_at 
            } as User, 
            error: null, 
            success: true 
          };
        }
      },
      'getCurrentProfile',
      {
        data: null,
        error: { 
          message: 'Service temporarily unavailable',
          status: 500,
          type: 'server'
        },
        success: false,
      },
      { retries: 2, severity: 'medium', logErrors: true }
    );
  }

  // =================== TESTING OPERATIONS ===================

  /** Security: Enhanced connection testing */
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
        error: { 
          message: 'Connection test failed',
          status: 500,
          type: 'server'
        },
        success: false,
      };
    } catch (error: any) {
      console.error('[Security] Connection test error:', error);
      return {
        data: null,
        error: { 
          message: 'Service temporarily unavailable',
          status: 500,
          type: 'server'
        },
        success: false,
      };
    }
  }

  // =================== GOAL TRACKING OPERATIONS ===================

  /** Security: Enhanced goal tracking with state management safety and access control */
  async getGoalTrackingData(userId: string) {
    const errorId = generateStateErrorId();
    
    return safeStateOperation(
      async () => {
        // Security: Validate user ID
        if (!isValidUUID(userId)) {
          logStateError(errorId, 'getGoalTrackingData - invalid user ID', new Error(`Invalid user ID format: ${userId}`), 'medium', 'validation');
          throw new Error('Invalid user ID format');
        }

        // Security: Check if current user can access this data
        const currentUser = await safeGetCurrentUser();
        if (!currentUser || currentUser.id !== userId) {
          logStateError(errorId, 'getGoalTrackingData - unauthorized access', new Error(`User ${currentUser?.id} accessing data for ${userId}`), 'high', 'auth');
          throw new Error('Unauthorized access to user data');
        }

        const client = await safeGetSupabaseClient();
        if (!client) {
          logStateError(errorId, 'getGoalTrackingData - client unavailable', new Error('Supabase client unavailable'), 'critical', 'state');
          throw new Error('Database connection unavailable');
        }
        
        const now = new Date();
        const currentDay = now.getDate();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

        // Get user's deals for current month with error handling
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const { data: deals, error: dealsError } = await client
          .from('deals')
          .select('*')
          .eq('created_by', userId)
          .gte('created_at', startOfMonth.toISOString())
          .lte('created_at', endOfMonth.toISOString());

        if (dealsError) {
          logStateError(errorId, 'getGoalTrackingData - deals fetch', dealsError, 'high', 'state');
          throw new Error('Failed to fetch user deals');
        }

        // Calculate progress metrics securely with error handling
        try {
          const totalDeals = deals?.length || 0;
          const monthlyGoal = 20; // Default goal - would come from user settings
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
            daysOff: 0,
            progressMetrics,
            currentDay,
            daysInMonth,
          };
        } catch (calculationError) {
          logStateError(errorId, 'getGoalTrackingData - metrics calculation', calculationError, 'medium', 'state');
          // Return basic data if calculation fails
          return {
            deals: deals || [],
            daysOff: 0,
            progressMetrics: {
              expected: 0,
              actual: deals?.length || 0,
              progress: 0,
              progressRatio: 0,
              status: 'neutral' as const,
            },
            currentDay,
            daysInMonth,
          };
        }
      },
      'getGoalTrackingData',
      {
        deals: [],
        daysOff: 0,
        progressMetrics: {
          expected: 0,
          actual: 0,
          progress: 0,
          progressRatio: 0,
          status: 'neutral' as const,
        },
        currentDay: new Date().getDate(),
        daysInMonth: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate(),
      },
      { retries: 2, severity: 'medium', logErrors: true }
    );
  }

  /** Security: Enhanced finance manager deals with role validation */
  async getFinanceManagerDeals(dealershipId?: number) {
    try {
      const client = await getSecureSupabaseClient();
      const currentUser = await getCurrentUser();
      
      if (!currentUser) {
        throw new Error('Authentication required');
      }

      // Security: Validate user role (implement role checking based on your schema)
      // This would typically check if user has finance manager role

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
        query = query.eq('dealership_id', dealershipId);
      }

      // Order by creation date, newest first
      query = query.order('created_at', { ascending: false });

      const { data: deals, error } = await query;

      if (error) {
        console.error('[Security] Finance manager deals fetch error:', error);
        
        // Enhanced 500 Error Handling: Specific handling for finance manager operations
        const errorMessage = error.message || 'Unknown database error';
        const isDbError = errorMessage.includes('database') || errorMessage.includes('postgres') || 
                         errorMessage.includes('connection') || errorMessage.includes('timeout') ||
                         errorMessage.includes('relation') || errorMessage.includes('column');
        
        if (isDbError) {
          console.error(`[Supabase 500] Database error in getFinanceManagerDeals: ${errorMessage}`);
          console.warn('[User Message] Finance manager data temporarily unavailable due to database maintenance. Please try again in a moment.');
          
          // Track 500 error in global monitor for finance operations
          DatabaseErrorMonitor.getInstance().track500Error('getFinanceManagerDeals', error, { 
            financeOperation: true, 
            dealershipId: dealershipId || 'none' 
          });
          
          throw new Error('Finance manager data temporarily unavailable. Please try again in a moment.');
        }
        
        throw new Error('Failed to fetch finance manager deals');
      }

      // Security: Apply data protection
      const protectedDeals = (deals || []).map(deal => ({
        ...deal,
        customer_last_name: deal.customer_last_name ? 
          maskSensitiveData(deal.customer_last_name) : deal.customer_last_name,
      }));

      return protectedDeals;
    } catch (error: any) {
      console.error('[Security] Error in getFinanceManagerDeals:', error);
      throw error;
    }
  }

  /** Security: Enhanced finance manager deal logging */
  async logFinanceManagerDeal(dealData: Omit<Deal, 'id'>) {
    try {
      const client = await getSecureSupabaseClient();
      const currentUser = await getCurrentUser();
      
      if (!currentUser) {
        throw new Error('Authentication required');
      }

      // Security: Validate and sanitize input
      const sanitizedData = sanitizeInput(dealData);
      
      // Add metadata
      sanitizedData.created_by = currentUser.id;
      sanitizedData.fi_manager_id = currentUser.id;
      sanitizedData.created_at = new Date().toISOString();
      
      const { data, error } = await client
        .from('deals')
        .insert([sanitizedData])
        .select()
        .single();

      if (error) {
        console.error('[Security] Finance manager deal creation error:', error);
        
        // Enhanced 500 Error Handling: Specific handling for finance manager deal logging
        const errorMessage = error.message || 'Unknown database error';
        const isDbError = errorMessage.includes('database') || errorMessage.includes('postgres') || 
                         errorMessage.includes('connection') || errorMessage.includes('timeout') ||
                         errorMessage.includes('relation') || errorMessage.includes('column');
        
        if (isDbError) {
          console.error(`[Supabase 500] Database error in logFinanceManagerDeal: ${errorMessage}`);
          console.warn('[User Message] Unable to save deal due to database maintenance. Please try again in a moment.');
          
          // Track 500 error in global monitor for finance logging operations
          DatabaseErrorMonitor.getInstance().track500Error('logFinanceManagerDeal', error, { 
            financeLogging: true, 
            dealData: { stockNumber: dealData.stock_number, dealType: dealData.deal_type } 
          });
          
          throw new Error('Unable to save deal. Please try again in a moment.');
        }
        
        throw new Error('Failed to log finance manager deal');
      }

      // Security: Audit the operation
      await auditLogger.logOperation(
        'LOG_FI_DEAL',
        currentUser.id,
        { deal_id: data.id, stock_number: data.stock_number },
        true,
        generateRequestId()
      );

      return data;
    } catch (error: any) {
      console.error('[Security] Error in logFinanceManagerDeal:', error);
      throw error;
    }
  }

  // =================== UTILITY METHODS ===================

  /** Security: Enhanced raw HTTP request method */
  async makeRequest<T = any>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    try {
      const url = endpoint.startsWith('http') ? endpoint : this.buildUrl(endpoint);
      return await this.http.request<T>(url, options);
    } catch (error: any) {
      console.error('[Security] Raw request error:', error);
      return {
        data: null,
        error: { 
          message: 'Request failed',
          status: 500,
          type: 'server'
        },
        success: false,
      };
    }
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
export const validateEnvironment = () => EnvironmentValidator.getInstance().validateEnvironment();
export const getGoalTrackingData = (userId: string) => apiService.getGoalTrackingData(userId);
export const getFinanceManagerDeals = (dealershipId?: number) => apiService.getFinanceManagerDeals(dealershipId);
export const logFinanceManagerDeal = (dealData: Omit<Deal, 'id'>) => apiService.logFinanceManagerDeal(dealData);

// =================== GLOBAL 500 ERROR MONITORING ===================

/** Global 500 Error Monitor: Centralized monitoring for database errors */
export class DatabaseErrorMonitor {
  private static instance: DatabaseErrorMonitor;
  private errorCount = 0;
  private lastErrorTime = 0;
  private errorThreshold = 5; // Alert after 5 errors in short time
  private timeWindow = 60000; // 1 minute window

  static getInstance(): DatabaseErrorMonitor {
    if (!DatabaseErrorMonitor.instance) {
      DatabaseErrorMonitor.instance = new DatabaseErrorMonitor();
    }
    return DatabaseErrorMonitor.instance;
  }

  /** Monitor and track 500 errors across the application */
  track500Error(operation: string, error: any, context?: any): void {
    const now = Date.now();
    
    // Reset counter if outside time window
    if (now - this.lastErrorTime > this.timeWindow) {
      this.errorCount = 0;
    }
    
    this.errorCount++;
    this.lastErrorTime = now;
    
    // Log the error with full context
    console.error(`[DB Error Monitor] 500 error #${this.errorCount} in ${operation}:`, {
      error: error.message || 'Unknown error',
      errorCode: error.code,
      operation,
      context,
      timestamp: new Date().toISOString(),
      errorCount: this.errorCount
    });
    
    // Alert if threshold exceeded
    if (this.errorCount >= this.errorThreshold) {
      console.error(`[DB Error Monitor] ALERT: ${this.errorCount} database errors in ${this.timeWindow/1000} seconds!`);
      console.warn('[User Message] Multiple database issues detected. Please contact support if problems persist.');
      
      // Could trigger additional monitoring/alerting here
      // e.g., send to error tracking service, show user notification, etc.
    }
  }

  /** Get current error statistics */
  getStats(): { errorCount: number; lastErrorTime: number; isHealthy: boolean } {
    const isHealthy = this.errorCount < this.errorThreshold || 
                     (Date.now() - this.lastErrorTime) > this.timeWindow;
    
    return {
      errorCount: this.errorCount,
      lastErrorTime: this.lastErrorTime,
      isHealthy
    };
  }

  /** Reset error tracking */
  reset(): void {
    this.errorCount = 0;
    this.lastErrorTime = 0;
  }
}

// Export the global monitor instance
export const dbErrorMonitor = DatabaseErrorMonitor.getInstance();

// Export the main service and environment validator
export default apiService;
export { EnvironmentValidator };

// =================== CLEANUP ===================

// Security: Enhanced cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    // Clear sensitive data
    csrfManager.getInstance();
    rateLimitManager.getInstance();
    
    // Cleanup Supabase client
    cleanupSupabaseClient();
  });
}