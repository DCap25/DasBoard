/**
 * Production Environment Validation for The DAS Board
 * 
 * This module provides comprehensive validation of environment variables
 * with specific checks for production vs development differences that
 * commonly cause 500 errors in Supabase applications.
 */

// =================== ENVIRONMENT VALIDATION TYPES ===================

export interface EnvValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  differences: ProductionDifference[];
  recommendations: string[];
  environment: 'development' | 'production' | 'preview' | 'unknown';
}

export interface ProductionDifference {
  key: string;
  issue: string;
  local: string;
  expected: string;
  severity: 'error' | 'warning' | 'info';
}

export interface SupabaseConfig {
  url: string | undefined;
  anonKey: string | undefined;
  environment: string | undefined;
}

// =================== VALIDATION PATTERNS ===================

const VALIDATION_PATTERNS = {
  SUPABASE_URL: /^https:\/\/[a-zA-Z0-9-]+\.supabase\.co$/,
  SUPABASE_ANON_KEY: /^eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/,
  API_URL: /^https?:\/\/[a-zA-Z0-9.-]+(?::[0-9]+)?(?:\/.*)?$/,
  APP_URL: /^https?:\/\/[a-zA-Z0-9.-]+(?::[0-9]+)?(?:\/.*)?$/
} as const;

// =================== CORE VALIDATION FUNCTION ===================

/**
 * Comprehensive environment validation with production 500 error prevention
 */
export function validateEnvironment(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const differences: ProductionDifference[] = [];
  const recommendations: string[] = [];

  // Detect current environment
  const environment = detectEnvironment();
  const isProduction = environment === 'production';
  const isPreview = environment === 'preview';

  console.log(`[EnvValidation] Validating environment: ${environment}`);

  // Get current environment variables
  const config = getSupabaseConfig();

  // =================== CRITICAL SUPABASE VALIDATION ===================
  
  // Check if Supabase URL is present
  if (!config.url) {
    errors.push('VITE_SUPABASE_URL is missing');
    recommendations.push('Add VITE_SUPABASE_URL to your environment variables');
    console.error('🚨 [EnvValidation] Missing VITE_SUPABASE_URL - this will cause 500 errors');
  } else {
    // Validate URL format
    if (!VALIDATION_PATTERNS.SUPABASE_URL.test(config.url)) {
      errors.push('VITE_SUPABASE_URL format is invalid');
      recommendations.push('URL should match pattern: https://your-project.supabase.co');
      console.error('🚨 [EnvValidation] Invalid Supabase URL format:', config.url);
    }
    
    // Check for localhost/development URLs in production
    if ((isProduction || isPreview) && (config.url.includes('localhost') || config.url.includes('127.0.0.1'))) {
      differences.push({
        key: 'VITE_SUPABASE_URL',
        issue: 'Development URL in production',
        local: config.url,
        expected: 'https://your-project.supabase.co',
        severity: 'error'
      });
      errors.push('Production environment using localhost Supabase URL');
      recommendations.push('Update VITE_SUPABASE_URL to your production Supabase project URL');
      console.error('🚨 [EnvValidation] Production using localhost URL:', config.url);
    }

    // Warn about HTTP in production
    if ((isProduction || isPreview) && config.url.startsWith('http://')) {
      differences.push({
        key: 'VITE_SUPABASE_URL',
        issue: 'HTTP instead of HTTPS in production',
        local: config.url,
        expected: config.url.replace('http://', 'https://'),
        severity: 'error'
      });
      errors.push('Production Supabase URL must use HTTPS');
      recommendations.push('Change VITE_SUPABASE_URL to use HTTPS');
      console.error('🚨 [EnvValidation] HTTP URL in production:', config.url);
    }
  }

  // Check if Supabase anon key is present
  if (!config.anonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is missing');
    recommendations.push('Add VITE_SUPABASE_ANON_KEY from your Supabase dashboard');
    console.error('🚨 [EnvValidation] Missing VITE_SUPABASE_ANON_KEY - this will cause 500 errors');
  } else {
    // Validate anon key format
    if (!VALIDATION_PATTERNS.SUPABASE_ANON_KEY.test(config.anonKey)) {
      errors.push('VITE_SUPABASE_ANON_KEY format appears invalid');
      recommendations.push('Key should be a JWT starting with "eyJ"');
      console.error('🚨 [EnvValidation] Invalid Supabase anon key format');
    }
    
    // Check key length (JWT tokens are typically quite long)
    if (config.anonKey.length < 100) {
      warnings.push('VITE_SUPABASE_ANON_KEY appears too short');
      recommendations.push('Verify you copied the complete anon key from Supabase dashboard');
      console.warn('⚠️ [EnvValidation] Supabase anon key appears too short');
    }
  }

  // =================== ENVIRONMENT-SPECIFIC CHECKS ===================

  if (isProduction || isPreview) {
    // Production-specific validations
    checkProductionEnvironment(config, errors, warnings, differences, recommendations);
  } else {
    // Development-specific validations  
    checkDevelopmentEnvironment(config, errors, warnings, recommendations);
  }

  // =================== CROSS-ENVIRONMENT CHECKS ===================
  
  checkEnvironmentConsistency(config, environment, differences, warnings, recommendations);

  // =================== FINAL VALIDATION ===================

  const isValid = errors.length === 0;

  // Log results
  if (isValid) {
    console.log('✅ [EnvValidation] Environment validation passed');
  } else {
    console.error('❌ [EnvValidation] Environment validation failed:', errors);
  }

  if (warnings.length > 0) {
    console.warn('⚠️ [EnvValidation] Environment warnings:', warnings);
  }

  if (differences.length > 0) {
    console.warn('🔍 [EnvValidation] Production differences detected:', differences);
  }

  return {
    isValid,
    errors,
    warnings,
    differences,
    recommendations,
    environment
  };
}

// =================== ENVIRONMENT DETECTION ===================

function detectEnvironment(): EnvValidationResult['environment'] {
  // Check Vite environment
  if (import.meta.env.PROD) return 'production';
  if (import.meta.env.DEV) return 'development';
  
  // Check explicit environment variable
  const viteEnv = import.meta.env.VITE_ENVIRONMENT;
  if (viteEnv === 'production') return 'production';
  if (viteEnv === 'development') return 'development';
  if (viteEnv === 'preview') return 'preview';
  
  // Check deployment platform indicators
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Netlify/Vercel production patterns
    if (hostname.includes('netlify.app') || 
        hostname.includes('vercel.app') ||
        hostname.includes('herokuapp.com') ||
        (!hostname.includes('localhost') && !hostname.includes('127.0.0.1'))) {
      return 'production';
    }
    
    // Preview/staging patterns
    if (hostname.includes('deploy-preview') || 
        hostname.includes('staging') ||
        hostname.includes('preview')) {
      return 'preview';
    }
  }
  
  // Check Node environment as fallback
  const nodeEnv = typeof process !== 'undefined' ? process.env.NODE_ENV : undefined;
  if (nodeEnv === 'production') return 'production';
  if (nodeEnv === 'development') return 'development';
  
  return 'unknown';
}

// =================== SUPABASE CONFIG GETTER ===================

function getSupabaseConfig(): SupabaseConfig {
  return {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    environment: import.meta.env.VITE_ENVIRONMENT
  };
}

// =================== PRODUCTION-SPECIFIC CHECKS ===================

function checkProductionEnvironment(
  config: SupabaseConfig,
  errors: string[],
  warnings: string[],
  differences: ProductionDifference[],
  recommendations: string[]
): void {
  console.log('[EnvValidation] Running production-specific checks...');
  
  // Check that we're not using development keys
  if (config.url && config.url.includes('localhost')) {
    errors.push('Production environment using localhost URLs');
    recommendations.push('Update Supabase URL for production deployment');
  }
  
  // Check for debug mode in production
  const debugMode = import.meta.env.VITE_DEBUG_MODE;
  if (debugMode === 'true' || debugMode === true) {
    warnings.push('Debug mode is enabled in production');
    recommendations.push('Set VITE_DEBUG_MODE=false for production');
    console.warn('⚠️ [EnvValidation] Debug mode enabled in production');
  }
  
  // Check for development API URLs
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl && (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1'))) {
    differences.push({
      key: 'VITE_API_URL',
      issue: 'Development API URL in production',
      local: apiUrl,
      expected: 'https://api.yourdomain.com',
      severity: 'warning'
    });
    warnings.push('Production using development API URL');
  }
  
  // Check environment identifier
  if (config.environment !== 'production') {
    warnings.push('VITE_ENVIRONMENT should be set to "production"');
    recommendations.push('Set VITE_ENVIRONMENT=production for production deployments');
  }
}

// =================== DEVELOPMENT-SPECIFIC CHECKS ===================

function checkDevelopmentEnvironment(
  config: SupabaseConfig,
  errors: string[],
  warnings: string[],
  recommendations: string[]
): void {
  console.log('[EnvValidation] Running development-specific checks...');
  
  // Check if using production URLs in development
  if (config.url && !config.url.includes('localhost') && !config.url.includes('supabase.co')) {
    warnings.push('Development using non-localhost Supabase URL');
    recommendations.push('Consider using a development Supabase project for local development');
  }
  
  // Recommend HTTPS for development if available
  const appUrl = import.meta.env.VITE_APP_URL;
  if (appUrl && appUrl.startsWith('http://')) {
    recommendations.push('Consider using HTTPS in development for better production parity');
  }
}

// =================== ENVIRONMENT CONSISTENCY CHECKS ===================

function checkEnvironmentConsistency(
  config: SupabaseConfig,
  environment: string,
  differences: ProductionDifference[],
  warnings: string[],
  recommendations: string[]
): void {
  console.log('[EnvValidation] Checking environment consistency...');
  
  // Check for mismatched environment settings
  const declaredEnv = config.environment;
  if (declaredEnv && declaredEnv !== environment) {
    differences.push({
      key: 'VITE_ENVIRONMENT',
      issue: 'Environment mismatch',
      local: `Declared: ${declaredEnv}`,
      expected: `Detected: ${environment}`,
      severity: 'warning'
    });
    warnings.push(`Environment mismatch: declared "${declaredEnv}" but detected "${environment}"`);
    recommendations.push('Ensure VITE_ENVIRONMENT matches your deployment environment');
  }
  
  // Check for URL/environment mismatches
  if (config.url) {
    const urlIndicatesProduction = config.url.includes('.supabase.co') && 
                                   !config.url.includes('localhost') && 
                                   config.url.startsWith('https://');
    
    if (urlIndicatesProduction && environment === 'development') {
      warnings.push('Development environment using production Supabase URL');
      recommendations.push('Consider using a separate Supabase project for development');
    }
    
    if (!urlIndicatesProduction && (environment === 'production' || environment === 'preview')) {
      differences.push({
        key: 'VITE_SUPABASE_URL',
        issue: 'Non-production URL in production environment',
        local: config.url,
        expected: 'https://your-project.supabase.co',
        severity: 'error'
      });
      warnings.push('Production environment not using production Supabase URL');
    }
  }
}

// =================== RUNTIME VALIDATION ===================

/**
 * Runtime validation that can be called from console or components
 */
export function validateEnvironmentRuntime(): void {
  console.group('🔍 Environment Validation Runtime Check');
  
  const result = validateEnvironment();
  
  console.log('Environment:', result.environment);
  console.log('Valid:', result.isValid);
  
  if (result.errors.length > 0) {
    console.group('❌ Errors');
    result.errors.forEach(error => console.error(`• ${error}`));
    console.groupEnd();
  }
  
  if (result.warnings.length > 0) {
    console.group('⚠️ Warnings');
    result.warnings.forEach(warning => console.warn(`• ${warning}`));
    console.groupEnd();
  }
  
  if (result.differences.length > 0) {
    console.group('🔍 Production Differences');
    result.differences.forEach(diff => {
      const icon = diff.severity === 'error' ? '❌' : diff.severity === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`${icon} ${diff.key}: ${diff.issue}`);
      console.log(`   Current: ${diff.local}`);
      console.log(`   Expected: ${diff.expected}`);
    });
    console.groupEnd();
  }
  
  if (result.recommendations.length > 0) {
    console.group('💡 Recommendations');
    result.recommendations.forEach(rec => console.info(`• ${rec}`));
    console.groupEnd();
  }
  
  console.groupEnd();
}

// =================== SUPABASE CONFIGURATION COMPARISON ===================

/**
 * Compare current Supabase configuration with expected production values
 */
export function compareSupabaseConfig(expectedConfig: Partial<SupabaseConfig>): void {
  console.group('🔍 Supabase Configuration Comparison');
  
  const current = getSupabaseConfig();
  
  // Compare URL
  if (expectedConfig.url && current.url !== expectedConfig.url) {
    const severity = current.url ? 'warning' : 'error';
    console.warn(`🔄 Supabase URL differs (${severity}):`);
    console.warn(`   Current:  ${current.url || 'MISSING'}`);
    console.warn(`   Expected: ${expectedConfig.url}`);
    
    if (severity === 'error') {
      console.error('🚨 This will cause 500 errors - update VITE_SUPABASE_URL');
    }
  } else if (expectedConfig.url) {
    console.log('✅ Supabase URL matches expected value');
  }
  
  // Compare anon key (only check presence, not value for security)
  if (expectedConfig.anonKey) {
    if (!current.anonKey) {
      console.error('❌ Supabase anon key is missing');
      console.error('🚨 This will cause 500 errors - add VITE_SUPABASE_ANON_KEY');
    } else if (current.anonKey.length !== expectedConfig.anonKey.length) {
      console.warn('⚠️ Supabase anon key length differs from expected');
      console.warn('   This may indicate a wrong key - verify in Supabase dashboard');
    } else {
      console.log('✅ Supabase anon key appears to be set correctly');
    }
  }
  
  console.groupEnd();
}

// =================== EXPORT VALIDATION FOR CONSOLE USE ===================

/**
 * Make validation functions available in browser console for debugging
 */
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.validateEnvironment = validateEnvironmentRuntime;
  // @ts-ignore  
  window.compareSupabaseConfig = compareSupabaseConfig;
  // @ts-ignore
  window.envValidation = {
    validate: validateEnvironment,
    validateRuntime: validateEnvironmentRuntime,
    compare: compareSupabaseConfig,
    getConfig: getSupabaseConfig
  };
  
  console.log('🔧 Environment validation tools available in console:');
  console.log('   validateEnvironment() - Run full validation');
  console.log('   compareSupabaseConfig(expected) - Compare configs');
  console.log('   window.envValidation - Access all validation tools');
}

export default {
  validateEnvironment,
  validateEnvironmentRuntime,
  compareSupabaseConfig,
  getSupabaseConfig,
  detectEnvironment
};