/**
 * Authentication Import and Async/Await Validator
 *
 * This utility validates and provides guidance for proper Supabase imports
 * and async/await usage patterns in the authentication system.
 */

// Standard Supabase imports that should be used consistently
export const REQUIRED_SUPABASE_IMPORTS = {
  // Core types
  types: [
    'User',
    'Session',
    'AuthError',
    'PostgrestError',
    'AuthResponse',
    'AuthTokenResponse',
    'AuthTokenResponsePassword',
    'AuthTokenResponsePasswordless',
    'AuthUser',
    'AuthSession',
    'AuthChangeEvent',
    'AuthEventType',
    'Provider',
    'SupabaseClient',
    'RealtimeChannel',
    'RealtimePresenceState',
    'RealtimePostgresChangesPayload',
    'RealtimePostgresInsertPayload',
    'RealtimePostgresUpdatePayload',
    'RealtimePostgresDeletePayload',
  ],

  // Core functions
  functions: [
    'createClient',
    'createBrowserClient',
    'createServerClient',
    'createRouteHandlerClient',
    'createServerComponentClient',
    'createMiddlewareClient',
  ],

  // Auth-specific imports
  auth: [
    'AuthApiError',
    'AuthRetryableFetchError',
    'AuthUnknownError',
    'AuthWeakPasswordError',
    'AuthInvalidTokenResponseError',
    'AuthInvalidCredentialsError',
    'AuthImplicitGrantRedirectError',
    'AuthPKCEGrantCodeExchangeError',
    'AuthOAuthError',
    'AuthSessionMissingError',
  ],
};

// Patterns for proper async/await usage
export const ASYNC_PATTERNS = {
  // Correct patterns
  correct: [
    'const { data, error } = await supabase.auth.signInWithPassword({ email, password });',
    'const { data: { user }, error } = await supabase.auth.getUser();',
    'const { data: { session }, error } = await supabase.auth.getSession();',
    'const { error } = await supabase.auth.signOut();',
    'const { data, error } = await supabase.from("table").select("*");',
    'const { data, error } = await supabase.from("table").insert(data);',
    'const { data, error } = await supabase.from("table").update(data).eq("id", id);',
    'const { data, error } = await supabase.from("table").delete().eq("id", id);',
  ],

  // Incorrect patterns to avoid
  incorrect: [
    'supabase.auth.signInWithPassword({ email, password }).then(({ data, error }) => {});',
    'supabase.auth.getUser().then(({ data: { user }, error }) => {});',
    'supabase.from("table").select("*").then(({ data, error }) => {});',
    'const result = supabase.auth.signInWithPassword({ email, password }); // Missing await',
    'supabase.auth.signOut(); // Missing await and error handling',
  ],
};

// Common import issues and their fixes
export const IMPORT_FIXES = {
  // Missing imports
  missingImports: {
    'User is not defined': 'import { User } from "@supabase/supabase-js";',
    'Session is not defined': 'import { Session } from "@supabase/supabase-js";',
    'AuthError is not defined': 'import { AuthError } from "@supabase/supabase-js";',
    'PostgrestError is not defined': 'import { PostgrestError } from "@supabase/supabase-js";',
    'createClient is not defined': 'import { createClient } from "@supabase/supabase-js";',
  },

  // Incorrect imports
  incorrectImports: {
    'import supabase from "@supabase/supabase-js"':
      'import { createClient } from "@supabase/supabase-js";',
    'import * as supabase from "@supabase/supabase-js"':
      'import { createClient, User, Session } from "@supabase/supabase-js";',
    'const supabase = require("@supabase/supabase-js")':
      'import { createClient } from "@supabase/supabase-js";',
  },
};

// Async/await validation patterns
export const ASYNC_VALIDATION = {
  // Functions that must be awaited
  requiresAwait: [
    'supabase.auth.signInWithPassword',
    'supabase.auth.signInWithOtp',
    'supabase.auth.signInWithOAuth',
    'supabase.auth.signUp',
    'supabase.auth.signOut',
    'supabase.auth.getUser',
    'supabase.auth.getSession',
    'supabase.auth.refreshSession',
    'supabase.auth.updateUser',
    'supabase.auth.resetPasswordForEmail',
    'supabase.auth.verifyOtp',
    'supabase.auth.resend',
    'supabase.from().select',
    'supabase.from().insert',
    'supabase.from().update',
    'supabase.from().upsert',
    'supabase.from().delete',
    'supabase.rpc',
    'supabase.storage.from().upload',
    'supabase.storage.from().download',
    'supabase.storage.from().remove',
    'supabase.storage.from().list',
  ],

  // Functions that don't need await (synchronous)
  noAwaitNeeded: [
    'supabase.auth.onAuthStateChange',
    'supabase.channel',
    'supabase.removeChannel',
    'supabase.removeAllChannels',
    'supabase.from().eq',
    'supabase.from().neq',
    'supabase.from().gt',
    'supabase.from().gte',
    'supabase.from().lt',
    'supabase.from().lte',
    'supabase.from().like',
    'supabase.from().ilike',
    'supabase.from().is',
    'supabase.from().in',
    'supabase.from().contains',
    'supabase.from().containedBy',
    'supabase.from().rangeGt',
    'supabase.from().rangeGte',
    'supabase.from().rangeLt',
    'supabase.from().rangeLte',
    'supabase.from().rangeAdjacent',
    'supabase.from().overlaps',
    'supabase.from().textSearch',
    'supabase.from().match',
    'supabase.from().not',
    'supabase.from().or',
    'supabase.from().filter',
    'supabase.from().order',
    'supabase.from().limit',
    'supabase.from().range',
    'supabase.from().abortSignal',
    'supabase.from().single',
    'supabase.from().maybeSingle',
    'supabase.from().csv',
    'supabase.from().explain',
  ],
};

// Error handling patterns
export const ERROR_HANDLING_PATTERNS = {
  // Proper error handling
  proper: [
    `try {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
} catch (error) {
  console.error('Authentication error:', error);
  throw error;
}`,

    `const { data, error } = await supabase.auth.signInWithPassword({ email, password });
if (error) {
  console.error('Sign in error:', error.message);
  return { success: false, error: error.message };
}
return { success: true, data };`,

    `const { data, error } = await withErrorHandling(
  async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },
  'sign_in',
  { showToast: true, logToConsole: true }
);`,
  ],

  // Improper error handling
  improper: [
    `const { data, error } = await supabase.auth.signInWithPassword({ email, password });
// Missing error check`,

    `try {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return data; // Not checking error
} catch (error) {
  // Only catches exceptions, not Supabase errors
}`,

    `supabase.auth.signInWithPassword({ email, password })
  .then(({ data, error }) => {
    // Using .then() instead of async/await
  });`,
  ],
};

/**
 * Validate Supabase imports in a code string
 */
export function validateSupabaseImports(code: string): {
  valid: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Check for proper import statements
  const importRegex = /import\s+.*from\s+['"]@supabase\/supabase-js['"];?/g;
  const imports = code.match(importRegex) || [];

  if (imports.length === 0) {
    issues.push('No Supabase imports found');
    suggestions.push('Add: import { createClient } from "@supabase/supabase-js";');
  }

  // Check for common incorrect import patterns
  Object.entries(IMPORT_FIXES.incorrectImports).forEach(([incorrect, correct]) => {
    if (code.includes(incorrect)) {
      issues.push(`Incorrect import pattern: ${incorrect}`);
      suggestions.push(`Use instead: ${correct}`);
    }
  });

  // Check for missing type imports
  const typeUsagePatterns = [
    { pattern: /:\s*User\b/, import: 'User' },
    { pattern: /:\s*Session\b/, import: 'Session' },
    { pattern: /:\s*AuthError\b/, import: 'AuthError' },
    { pattern: /:\s*PostgrestError\b/, import: 'PostgrestError' },
  ];

  typeUsagePatterns.forEach(({ pattern, import: importName }) => {
    if (pattern.test(code) && !code.includes(`import.*${importName}`)) {
      issues.push(`Using ${importName} type without importing it`);
      suggestions.push(`Add ${importName} to your imports from @supabase/supabase-js`);
    }
  });

  return {
    valid: issues.length === 0,
    issues,
    suggestions,
  };
}

/**
 * Validate async/await usage in Supabase calls
 */
export function validateAsyncAwait(code: string): {
  valid: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Check for missing await on functions that require it
  ASYNC_VALIDATION.requiresAwait.forEach(func => {
    const funcPattern = func.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const awaitPattern = new RegExp(`await\\s+${funcPattern}`, 'g');
    const nonAwaitPattern = new RegExp(`(?<!await\\s)${funcPattern}`, 'g');

    const awaitMatches = code.match(awaitPattern) || [];
    const nonAwaitMatches = code.match(nonAwaitPattern) || [];

    if (nonAwaitMatches.length > awaitMatches.length) {
      issues.push(`Missing await on ${func}`);
      suggestions.push(`Add await before ${func} calls`);
    }
  });

  // Check for .then() usage (should use async/await instead)
  const thenPattern = /supabase\.[^.]+\.[^.]+\([^)]*\)\.then\(/g;
  const thenMatches = code.match(thenPattern) || [];

  if (thenMatches.length > 0) {
    issues.push('Using .then() instead of async/await');
    suggestions.push('Convert .then() calls to async/await pattern');
  }

  // Check for proper error handling
  const supabaseCallPattern = /const\s+{\s*data,\s*error\s*}\s*=\s*await\s+supabase\./g;
  const supabaseCalls = code.match(supabaseCallPattern) || [];

  supabaseCalls.forEach(call => {
    const callIndex = code.indexOf(call);
    const afterCall = code.substring(callIndex + call.length, callIndex + call.length + 200);

    if (!afterCall.includes('if (error)') && !afterCall.includes('error &&')) {
      issues.push('Missing error handling after Supabase call');
      suggestions.push('Add error checking: if (error) { /* handle error */ }');
    }
  });

  return {
    valid: issues.length === 0,
    issues,
    suggestions,
  };
}

/**
 * Generate corrected code with proper imports and async/await
 */
export function generateCorrectedCode(originalCode: string): string {
  let correctedCode = originalCode;

  // Fix imports
  Object.entries(IMPORT_FIXES.incorrectImports).forEach(([incorrect, correct]) => {
    correctedCode = correctedCode.replace(incorrect, correct);
  });

  // Add missing awaits
  ASYNC_VALIDATION.requiresAwait.forEach(func => {
    const funcPattern = func.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const nonAwaitPattern = new RegExp(`(?<!await\\s)${funcPattern}`, 'g');
    correctedCode = correctedCode.replace(nonAwaitPattern, `await ${func}`);
  });

  // Convert .then() to async/await (basic conversion)
  correctedCode = correctedCode.replace(
    /supabase\.([^.]+)\.([^.]+)\(([^)]*)\)\.then\(\s*\(\s*{\s*data,\s*error\s*}\s*\)\s*=>\s*{/g,
    'const { data, error } = await supabase.$1.$2($3);\nif (error) {\n  console.error("Supabase error:", error);\n  throw error;\n}'
  );

  return correctedCode;
}

/**
 * Comprehensive validation of authentication code
 */
export function validateAuthCode(code: string): {
  valid: boolean;
  importIssues: string[];
  asyncIssues: string[];
  suggestions: string[];
  correctedCode?: string;
} {
  const importValidation = validateSupabaseImports(code);
  const asyncValidation = validateAsyncAwait(code);

  const allIssues = [...importValidation.issues, ...asyncValidation.issues];
  const allSuggestions = [...importValidation.suggestions, ...asyncValidation.suggestions];

  return {
    valid: importValidation.valid && asyncValidation.valid,
    importIssues: importValidation.issues,
    asyncIssues: asyncValidation.issues,
    suggestions: allSuggestions,
    correctedCode: allIssues.length > 0 ? generateCorrectedCode(code) : undefined,
  };
}

/**
 * Best practices for Supabase authentication
 */
export const BEST_PRACTICES = {
  imports: [
    'Always import specific functions and types from @supabase/supabase-js',
    'Use TypeScript types for better type safety',
    'Import only what you need to reduce bundle size',
    'Use consistent import statements across your project',
  ],

  asyncAwait: [
    'Always use async/await instead of .then() for better readability',
    'Always await Supabase authentication and database operations',
    'Handle errors properly with try/catch or error checking',
    'Use proper TypeScript types for function parameters and return values',
  ],

  errorHandling: [
    'Always check for errors after Supabase operations',
    'Use centralized error handling utilities',
    'Provide user-friendly error messages',
    'Log errors for debugging purposes',
    'Handle different error types appropriately',
  ],

  security: [
    'Never expose service role keys in client-side code',
    'Use RLS (Row Level Security) policies for data protection',
    'Validate user input before database operations',
    'Use proper authentication checks in protected routes',
    'Implement proper session management',
  ],

  performance: [
    'Use connection pooling for server-side applications',
    'Implement proper caching strategies',
    'Use select() to fetch only required fields',
    'Implement pagination for large datasets',
    'Use proper indexing for database queries',
  ],
};

// Export validation functions for use in tests and development tools
export default {
  validateSupabaseImports,
  validateAsyncAwait,
  generateCorrectedCode,
  validateAuthCode,
  REQUIRED_SUPABASE_IMPORTS,
  ASYNC_PATTERNS,
  IMPORT_FIXES,
  ASYNC_VALIDATION,
  ERROR_HANDLING_PATTERNS,
  BEST_PRACTICES,
};
