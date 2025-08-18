/**
 * Secure Environment Configuration Manager
 *
 * This module provides secure access to environment variables with
 * validation, sanitization, and type safety for The DAS Board application.
 *
 * Security Features:
 * - Environment variable validation and sanitization
 * - Type-safe access to configuration values
 * - Runtime validation of required variables
 * - Protection against injection attacks
 * - Secure defaults for missing variables
 */

// Type definitions for environment configuration
interface AppEnvironment {
  // Core application settings
  environment: 'development' | 'staging' | 'production';
  isDevelopment: boolean;
  isProduction: boolean;
  isStaging: boolean;

  // Supabase configuration
  supabase: {
    url: string;
    anonKey: string;
    isValid: boolean;
  };

  // API configuration
  api: {
    url: string;
    isHttps: boolean;
  };

  // Application URLs
  app: {
    url: string;
    marketingUrl: string;
    baseUrl: string;
    basePath: string;
  };

  // Feature flags
  features: {
    debugMode: boolean;
    skipEmailVerification: boolean;
    enableDevtools: boolean;
    rateLimitEnabled: boolean;
    maintenanceMode: boolean;
    betaFeatures: boolean;
  };

  // Build information
  build: {
    version: string;
    timestamp: string;
  };
}

// Security: Define allowed environment variables
const ALLOWED_ENV_VARS = {
  // Required variables
  VITE_SUPABASE_URL: { required: true, type: 'url' as const },
  VITE_SUPABASE_ANON_KEY: { required: true, type: 'string' as const },

  // Optional variables with defaults
  VITE_API_URL: { required: false, type: 'url' as const, default: 'http://localhost:3001' },
  VITE_APP_URL: { required: false, type: 'url' as const, default: 'http://localhost:5173' },
  VITE_MARKETING_URL: { required: false, type: 'url' as const, default: 'http://localhost:5173' },
  VITE_ENVIRONMENT: {
    required: false,
    type: 'enum' as const,
    default: 'development',
    values: ['development', 'staging', 'production'],
  },
  VITE_DEPLOYMENT_VERSION: { required: false, type: 'string' as const, default: '1.0.0' },
  VITE_BASE_PATH: { required: false, type: 'string' as const, default: '/' },

  // Feature flags
  VITE_DEBUG_MODE: { required: false, type: 'boolean' as const, default: 'false' },
  VITE_SKIP_EMAIL_VERIFICATION: { required: false, type: 'boolean' as const, default: 'false' },
  VITE_ENABLE_DEVTOOLS: { required: false, type: 'boolean' as const, default: 'true' },
  VITE_RATE_LIMIT_ENABLED: { required: false, type: 'boolean' as const, default: 'true' },
  VITE_FEATURE_FLAGS: { required: false, type: 'json' as const, default: '{}' },
} as const;

type AllowedEnvVar = keyof typeof ALLOWED_ENV_VARS;

/**
 * Security: Validate URL format and protocol
 */
function validateUrl(url: string, requireHttps: boolean = false): boolean {
  try {
    const urlObj = new URL(url);

    // Security: Check for dangerous protocols
    const allowedProtocols = ['http:', 'https:'];
    if (!allowedProtocols.includes(urlObj.protocol)) {
      return false;
    }

    // Security: Require HTTPS in production
    if (requireHttps && urlObj.protocol !== 'https:') {
      return false;
    }

    // Security: Basic hostname validation
    if (!urlObj.hostname || urlObj.hostname.length === 0) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Security: Validate Supabase URL format
 */
function validateSupabaseUrl(url: string): boolean {
  if (!validateUrl(url, true)) {
    return false;
  }

  // Security: Validate Supabase URL pattern
  const supabasePattern = /^https:\/\/[a-zA-Z0-9-]+\.supabase\.co$/;
  return supabasePattern.test(url);
}

/**
 * Security: Sanitize string values to prevent injection
 */
function sanitizeString(value: string): string {
  return value
    .replace(/[<>"']/g, '') // Remove potential XSS characters
    .trim()
    .substring(0, 1000); // Reasonable length limit
}

/**
 * Security: Validate and parse boolean values
 */
function parseBoolean(value: string): boolean {
  const lowerValue = value.toLowerCase().trim();
  return lowerValue === 'true' || lowerValue === '1';
}

/**
 * Security: Validate and parse JSON values
 */
function parseJsonSafely(value: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return {};
  } catch {
    return {};
  }
}

/**
 * Security: Get environment variable with validation
 */
function getEnvVar(name: AllowedEnvVar): string | undefined {
  // Security: Only access allowed environment variables
  if (!(name in ALLOWED_ENV_VARS)) {
    console.error(
      `[SecureEnvironment] Attempted to access disallowed environment variable: ${name}`
    );
    return undefined;
  }

  return import.meta.env[name];
}

/**
 * Security: Validate environment variable value
 */
function validateEnvValue(
  name: AllowedEnvVar,
  value: string
): { isValid: boolean; sanitizedValue: string; error?: string } {
  const config = ALLOWED_ENV_VARS[name];

  switch (config.type) {
    case 'url':
      const isProduction = import.meta.env.VITE_ENVIRONMENT === 'production';
      if (!validateUrl(value, isProduction)) {
        return {
          isValid: false,
          sanitizedValue: value,
          error: `Invalid URL format${isProduction ? ' (HTTPS required in production)' : ''}`,
        };
      }

      // Additional validation for Supabase URL
      if (name === 'VITE_SUPABASE_URL' && !validateSupabaseUrl(value)) {
        return {
          isValid: false,
          sanitizedValue: value,
          error: 'Invalid Supabase URL format. Expected: https://[project].supabase.co',
        };
      }

      return { isValid: true, sanitizedValue: value };

    case 'enum':
      if ('values' in config && config.values && !config.values.includes(value as never)) {
        return {
          isValid: false,
          sanitizedValue: value,
          error: `Invalid value. Must be one of: ${config.values.join(', ')}`,
        };
      }
      return { isValid: true, sanitizedValue: value };

    case 'boolean':
      return { isValid: true, sanitizedValue: value };

    case 'json':
      const parsed = parseJsonSafely(value);
      return { isValid: true, sanitizedValue: JSON.stringify(parsed) };

    case 'string':
    default:
      return { isValid: true, sanitizedValue: sanitizeString(value) };
  }
}

/**
 * Security: Load and validate all environment variables
 */
function loadEnvironmentConfig(): AppEnvironment {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Security: Process each allowed environment variable
  const envValues: Record<string, string> = {};

  for (const [name, config] of Object.entries(ALLOWED_ENV_VARS)) {
    const envName = name as AllowedEnvVar;
    let value = getEnvVar(envName);

    // Security: Use default if value is missing
    if (!value) {
      if (config.required) {
        errors.push(`Missing required environment variable: ${envName}`);
        continue;
      } else if ('default' in config) {
        value = config.default;
        warnings.push(`Using default value for ${envName}`);
      }
    }

    if (value) {
      // Security: Validate the value
      const validation = validateEnvValue(envName, value);
      if (!validation.isValid) {
        errors.push(`Invalid ${envName}: ${validation.error}`);
        continue;
      }

      envValues[envName] = validation.sanitizedValue;
    }
  }

  // Security: Handle validation errors
  if (errors.length > 0) {
    console.error('[SecureEnvironment] Environment validation errors:', errors);
    if (envValues.VITE_ENVIRONMENT === 'production') {
      throw new Error(`Environment validation failed: ${errors.join(', ')}`);
    }
  }

  // Security: Log warnings in development
  if (warnings.length > 0 && envValues.VITE_ENVIRONMENT === 'development') {
    console.warn('[SecureEnvironment] Environment warnings:', warnings);
  }

  // Security: Parse feature flags safely
  const featureFlags = parseJsonSafely(envValues.VITE_FEATURE_FLAGS || '{}');

  // Security: Build secure configuration object
  const environment =
    (envValues.VITE_ENVIRONMENT as AppEnvironment['environment']) || 'development';

  return {
    environment,
    isDevelopment: environment === 'development',
    isProduction: environment === 'production',
    isStaging: environment === 'staging',

    supabase: {
      url: envValues.VITE_SUPABASE_URL || '',
      anonKey: envValues.VITE_SUPABASE_ANON_KEY || '',
      isValid: !!(envValues.VITE_SUPABASE_URL && envValues.VITE_SUPABASE_ANON_KEY),
    },

    api: {
      url: envValues.VITE_API_URL || 'http://localhost:3001',
      isHttps: (envValues.VITE_API_URL || '').startsWith('https://'),
    },

    app: {
      url: envValues.VITE_APP_URL || 'http://localhost:5173',
      marketingUrl: envValues.VITE_MARKETING_URL || 'http://localhost:5173',
      baseUrl: new URL(envValues.VITE_APP_URL || 'http://localhost:5173').origin,
      basePath: envValues.VITE_BASE_PATH || '/',
    },

    features: {
      debugMode: parseBoolean(envValues.VITE_DEBUG_MODE || 'false'),
      skipEmailVerification: parseBoolean(envValues.VITE_SKIP_EMAIL_VERIFICATION || 'false'),
      enableDevtools: parseBoolean(envValues.VITE_ENABLE_DEVTOOLS || 'true'),
      rateLimitEnabled: parseBoolean(envValues.VITE_RATE_LIMIT_ENABLED || 'true'),
      maintenanceMode: parseBoolean(String(featureFlags.maintenance_mode || false)),
      betaFeatures: parseBoolean(String(featureFlags.beta_features || false)),
    },

    build: {
      version: envValues.VITE_DEPLOYMENT_VERSION || '1.0.0',
      timestamp: new Date().toISOString(),
    },
  };
}

// Security: Load configuration once and freeze it
const config = Object.freeze(loadEnvironmentConfig());

// Security: Validate critical configuration
if (config.isProduction) {
  // Security: Ensure production security requirements
  if (!config.api.isHttps) {
    throw new Error('API URL must use HTTPS in production');
  }

  if (config.features.skipEmailVerification) {
    throw new Error('Email verification cannot be skipped in production');
  }

  if (config.features.debugMode) {
    console.warn(
      '[SecureEnvironment] Debug mode is enabled in production - this is not recommended'
    );
  }
}

/**
 * Get the secure environment configuration
 * @returns Immutable environment configuration object
 */
export function getEnvironmentConfig(): AppEnvironment {
  return config;
}

/**
 * Check if a feature flag is enabled
 * @param flagName - Name of the feature flag
 * @returns Boolean indicating if the feature is enabled
 */
export function isFeatureEnabled(flagName: keyof AppEnvironment['features']): boolean {
  return config.features[flagName];
}

/**
 * Get a secure API URL with validation
 * @param path - API path to append
 * @returns Complete API URL
 */
export function getApiUrl(path: string = ''): string {
  // Security: Sanitize path
  const sanitizedPath = path.replace(/[<>"']/g, '').replace(/^\/+/, '');
  const baseUrl = config.api.url.replace(/\/+$/, '');

  return sanitizedPath ? `${baseUrl}/${sanitizedPath}` : baseUrl;
}

/**
 * Get application URL with validation
 * @param path - Path to append
 * @returns Complete application URL
 */
export function getAppUrl(path: string = ''): string {
  // Security: Sanitize path
  const sanitizedPath = path.replace(/[<>"']/g, '').replace(/^\/+/, '');
  const baseUrl = config.app.url.replace(/\/+$/, '');

  return sanitizedPath ? `${baseUrl}/${sanitizedPath}` : baseUrl;
}

/**
 * Validate that the current environment is properly configured
 * @returns Validation result with any issues found
 */
export function validateEnvironment(): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];

  // Security: Check Supabase configuration
  if (!config.supabase.isValid) {
    issues.push('Supabase configuration is incomplete');
  }

  // Security: Check URL protocols in production
  if (config.isProduction) {
    if (!config.api.isHttps) {
      issues.push('API URL must use HTTPS in production');
    }

    if (!config.app.url.startsWith('https://')) {
      issues.push('App URL must use HTTPS in production');
    }
  }

  // Security: Check for insecure development settings in production
  if (config.isProduction) {
    if (config.features.skipEmailVerification) {
      issues.push('Email verification cannot be skipped in production');
    }

    if (config.features.debugMode) {
      issues.push('Debug mode should not be enabled in production');
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

// Export the configuration and utilities
export default config;
export type { AppEnvironment };
