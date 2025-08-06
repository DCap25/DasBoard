/**
 * Environment Configuration
 * Centralizes all environment variable access with validation
 */

// Validate required environment variables
const validateEnv = () => {
  const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    console.error('Please check your .env file or deployment environment variables');
  }
};

// Run validation
validateEnv();

// Environment configuration with fallbacks
export const env = {
  // Supabase Configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    publishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
  },
  
  // API Configuration
  api: {
    url: import.meta.env.VITE_API_URL || import.meta.env.VITE_SUPABASE_URL || '',
  },
  
  // Feature Flags
  features: {
    skipEmailVerification: import.meta.env.VITE_SKIP_EMAIL_VERIFICATION === 'true',
  },
  
  // Environment Info
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production',
  mode: import.meta.env.MODE,
} as const;

// Security helper to check if keys are properly configured
export const isConfigured = () => {
  return Boolean(env.supabase.url && env.supabase.anonKey);
};

// Helper to get the appropriate Supabase key
export const getSupabaseKey = () => {
  // Use publishable key if available, otherwise fall back to anon key
  return env.supabase.publishableKey || env.supabase.anonKey;
};

// Export type for environment configuration
export type Environment = typeof env;