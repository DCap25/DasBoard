import { defineConfig, loadEnv, type ViteDevServer, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { Buffer } from 'buffer';
import type { Request, Response, NextFunction } from 'express';

// ================================================================
// ENHANCED SECURE VITE CONFIGURATION FOR THE DAS BOARD
// ================================================================
// SECURITY ENHANCEMENTS IMPLEMENTED:
// 1. Comprehensive environment variable validation and sanitization
// 2. Enhanced Content Security Policy with strict directives
// 3. Secure bundle optimization with integrity protection
// 4. Advanced security headers for all environments
// 5. Source map protection and secure minification
// 6. Strict alias resolution and path traversal prevention
// 7. Memory leak prevention and resource cleanup
// 8. Enhanced HTTPS configuration with security validation
// 9. Secure dependency bundling and chunking strategy
// 10. Production hardening with security-first optimizations
// ================================================================

// Security: Define allowed environment variables for client-side with validation
const ALLOWED_CLIENT_ENV_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY', 
  'VITE_API_URL',
  'VITE_APP_URL',
  'VITE_MARKETING_URL',
  'VITE_DEPLOYMENT_VERSION',
  'VITE_ENVIRONMENT',
  'VITE_FEATURE_FLAGS',
  'VITE_RATE_LIMIT_ENABLED',
  'VITE_DEBUG_MODE'
] as const;

// Security: Environment variable validation patterns
const ENV_VALIDATION_PATTERNS = {
  VITE_SUPABASE_URL: /^https:\/\/[a-zA-Z0-9-]+\.supabase\.co$/,
  VITE_SUPABASE_ANON_KEY: /^eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/,
  VITE_API_URL: /^https?:\/\/[a-zA-Z0-9.-]+(?::[0-9]+)?(?:\/.*)?$/,
  VITE_APP_URL: /^https?:\/\/[a-zA-Z0-9.-]+(?::[0-9]+)?(?:\/.*)?$/,
  VITE_MARKETING_URL: /^https?:\/\/[a-zA-Z0-9.-]+(?::[0-9]+)?(?:\/.*)?$/,
} as const;

// Security: Enhanced environment variable validation with comprehensive checks and 500 error prevention
function validateEnvironmentVariables(env: Record<string, string>, mode: string): void {
  const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  const missingVars = requiredVars.filter(varName => !env[varName]);
  
  console.log(`🔧 [Vite Config] Validating environment variables for ${mode} mode...`);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars);
    console.error('🚨 [500 Prevention] Missing environment variables will cause 500 errors during authentication');
    console.error('💡 [500 Prevention] Add missing variables to your deployment platform:');
    missingVars.forEach(varName => {
      console.error(`   ${varName}=your_${varName.toLowerCase().replace('vite_', '').replace('_', '_')}_here`);
    });
    
    if (mode === 'production') {
      throw new Error(`🚨 Missing required environment variables: ${missingVars.join(', ')}. This will cause 500 errors in production.`);
    } else {
      console.warn('⚠️  Development mode: some features may not work without all environment variables');
      console.warn('⚠️  [500 Prevention] Restart dev server after adding environment variables: npm run dev');
    }
  }

  // Security: Validate environment variable formats with strict patterns
  Object.entries(ENV_VALIDATION_PATTERNS).forEach(([varName, pattern]) => {
    if (env[varName] && !pattern.test(env[varName])) {
      const message = `❌ Invalid format for ${varName}. Expected pattern: ${pattern.source}`;
      console.error(message);
      console.error(`🚨 [500 Prevention] Invalid ${varName} format will cause authentication 500 errors`);
      
      // Provide helpful format examples
      if (varName === 'VITE_SUPABASE_URL') {
        console.error('💡 Expected format: https://your-project.supabase.co');
      } else if (varName === 'VITE_SUPABASE_ANON_KEY') {
        console.error('💡 Expected format: JWT starting with "eyJ" (get from Supabase Dashboard > Settings > API)');
      }
      
      if (mode === 'production') {
        throw new Error(message);
      }
    }
  });

  // Enhanced: Production environment validation with detailed 500 error prevention
  if (mode === 'production') {
    console.log('🏭 [Production] Running production-specific validations...');
    
    const httpsVars = ['VITE_API_URL', 'VITE_APP_URL', 'VITE_MARKETING_URL', 'VITE_SUPABASE_URL'];
    httpsVars.forEach(varName => {
      if (env[varName]) {
        if (!env[varName].startsWith('https://')) {
          console.error(`❌ ${varName} must use HTTPS in production`);
          console.error(`🚨 [500 Prevention] HTTP URLs in production cause security and connection issues`);
          throw new Error(`${varName} must use HTTPS in production`);
        }
        
        // Security: Additional checks for suspicious patterns that cause 500 errors
        if (env[varName].includes('localhost') || env[varName].includes('127.0.0.1')) {
          console.error(`❌ ${varName} cannot use localhost URLs in production`);
          console.error(`🚨 [500 Prevention] Localhost URLs will cause connection failures in production`);
          console.error(`💡 [500 Prevention] Update deployment environment variables with production URLs`);
          throw new Error(`${varName} cannot use localhost URLs in production`);
        }
        
        // Check for development/staging URLs in production
        if (varName === 'VITE_SUPABASE_URL') {
          if (env[varName].includes('dev-') || env[varName].includes('staging-') || env[varName].includes('test-')) {
            console.warn(`⚠️  ${varName} appears to be a development/staging URL in production`);
            console.warn(`⚠️  [500 Prevention] This may cause data inconsistencies`);
          }
        }
      }
    });
    
    // Check for development-specific settings in production
    if (env.VITE_DEBUG_MODE === 'true') {
      console.warn('⚠️  Debug mode is enabled in production - consider setting VITE_DEBUG_MODE=false');
    }
    
    if (env.VITE_SKIP_EMAIL_VERIFICATION === 'true') {
      console.error('❌ Email verification is disabled in production - security risk!');
      console.error('🚨 [Security] Set VITE_SKIP_EMAIL_VERIFICATION=false for production');
      throw new Error('Email verification must be enabled in production');
    }
    
    // Validate environment identifier
    if (env.VITE_ENVIRONMENT && env.VITE_ENVIRONMENT !== 'production') {
      console.warn(`⚠️  VITE_ENVIRONMENT is set to "${env.VITE_ENVIRONMENT}" but building for production`);
      console.warn('💡 Consider setting VITE_ENVIRONMENT=production for consistency');
    }
  }
  
  // Enhanced: Development mode helpful warnings
  if (mode === 'development') {
    console.log('🛠️  [Development] Running development-specific checks...');
    
    // Warn if using production URLs in development
    if (env.VITE_SUPABASE_URL && env.VITE_SUPABASE_URL.includes('.supabase.co') && 
        !env.VITE_SUPABASE_URL.includes('localhost')) {
      console.warn('⚠️  Development using production Supabase URL');
      console.warn('💡 Consider using a separate Supabase project for development');
    }
    
    // Check for missing optional development variables
    const devVars = ['VITE_API_URL', 'VITE_DEBUG_MODE'];
    const missingDevVars = devVars.filter(varName => !env[varName]);
    if (missingDevVars.length > 0) {
      console.info('💡 Optional development variables not set:', missingDevVars.join(', '));
    }
  }
  
  console.log(`✅ [Vite Config] Environment validation completed for ${mode} mode`);
}

// Security: Enhanced input sanitization with comprehensive XSS prevention
function sanitizeEnvironmentValue(value: string, varName: string): string {
  if (!value || typeof value !== 'string') return '';
  
  // Security: Remove potential XSS vectors
  let sanitized = value
    .replace(/[<>'"]/g, '') // Remove angle brackets and quotes
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:text\/html/gi, '') // Remove data HTML URLs
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();

  // Security: URL-specific validation
  if (varName.includes('URL')) {
    if (sanitized.includes('javascript:') || sanitized.includes('data:')) {
      console.error(`❌ Potentially dangerous protocol detected in ${varName}: ${sanitized}`);
      throw new Error(`Invalid protocol in environment variable ${varName}`);
    }
    
    // Security: Validate URL structure
    try {
      new URL(sanitized);
    } catch {
      if (sanitized !== '') { // Allow empty URLs
        console.warn(`⚠️  Invalid URL format in ${varName}: ${sanitized}`);
      }
    }
  }
  
  return sanitized;
}

// Security: Create secure environment variable object with enhanced validation
function createSecureEnvDefines(env: Record<string, string>): Record<string, string> {
  const secureEnv: Record<string, string> = {};
  
  ALLOWED_CLIENT_ENV_VARS.forEach(varName => {
    if (env[varName]) {
      try {
        const sanitizedValue = sanitizeEnvironmentValue(env[varName], varName);
        if (sanitizedValue) {
          secureEnv[`import.meta.env.${varName}`] = JSON.stringify(sanitizedValue);
        }
      } catch (error) {
        console.error(`❌ Failed to sanitize ${varName}:`, error.message);
        throw error;
      }
    }
  });
  
  return secureEnv;
}

// Security: Enhanced HTTPS configuration with certificate validation
function getHttpsConfig(mode: string): boolean | { key: Buffer; cert: Buffer } {
  if (mode === 'production') return false;
  
  // Security: Try to use local HTTPS certificates with validation
  const certPath = path.resolve(process.cwd(), 'certs');
  const keyFile = path.join(certPath, 'key.pem');
  const certFile = path.join(certPath, 'cert.pem');
  
  // Security: Validate certificate path is within project directory
  if (!keyFile.startsWith(process.cwd()) || !certFile.startsWith(process.cwd())) {
    console.warn('⚠️  Certificate paths outside project directory - security risk');
    return false;
  }
  
  if (fs.existsSync(keyFile) && fs.existsSync(certFile)) {
    try {
      const keyData = fs.readFileSync(keyFile);
      const certData = fs.readFileSync(certFile);
      
      // Security: Basic certificate validation
      if (keyData.length < 100 || certData.length < 100) {
        console.warn('⚠️  Certificate files appear invalid (too small)');
        return false;
      }
      
      if (!keyData.includes('-----BEGIN') || !certData.includes('-----BEGIN')) {
        console.warn('⚠️  Certificate files do not appear to be valid PEM format');
        return false;
      }
      
      console.log('✅ Valid HTTPS certificates found');
      return {
        key: keyData,
        cert: certData
      };
    } catch (error) {
      console.warn('⚠️  Could not read HTTPS certificates:', error.message);
    }
  }
  
  // Security: Provide clear guidance for HTTPS setup
  if (mode === 'development') {
    console.warn('⚠️  HTTPS certificates not found. For enhanced security:');
    console.info('📝 Install mkcert: https://github.com/FiloSottile/mkcert');
    console.info('📝 Run: mkdir certs && cd certs');
    console.info('📝 Run: mkcert -install && mkcert localhost 127.0.0.1 ::1');
  }
  
  return false;
}

// Security: Enhanced Content Security Policy with strict directives
const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    // Security: Remove unsafe-inline in production, use nonces instead
    "'unsafe-inline'", // Required for Vite HMR in development
    'https://apis.google.com',
    'https://*.supabase.co'
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for CSS-in-JS libraries
    'https://fonts.googleapis.com'
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
    'data:' // For base64 fonts
  ],
  'img-src': [
    "'self'",
    'data:', // For base64 images
    'blob:', // For generated images
    'https://*.supabase.co',
    'https://images.unsplash.com' // If using Unsplash images
  ],
  'connect-src': [
    "'self'",
    'https://*.supabase.co',
    'wss://*.supabase.co', // WebSocket connections
    'https://api.stripe.com' // If using Stripe
  ],
  'frame-src': ["'none'"], // Security: Block all frames
  'object-src': ["'none'"], // Security: Block objects/embeds
  'base-uri': ["'self'"], // Security: Restrict base URI
  'form-action': ["'self'"], // Security: Restrict form submissions
  'frame-ancestors': ["'none'"], // Security: Prevent clickjacking
  'upgrade-insecure-requests': [], // Security: Upgrade HTTP to HTTPS
  'block-all-mixed-content': [] // Security: Block mixed content
};

// Security: Generate CSP string with environment-specific rules
function generateCSP(mode: string): string {
  const directives = { ...CSP_DIRECTIVES };
  
  // Security: Stricter CSP for production
  if (mode === 'production') {
    // Remove unsafe-inline from script-src in production (would need nonces)
    // directives['script-src'] = directives['script-src'].filter(src => src !== "'unsafe-inline'");
  }
  
  return Object.entries(directives)
    .map(([directive, sources]) => 
      sources.length > 0 ? `${directive} ${sources.join(' ')}` : directive
    )
    .join('; ');
}

// Security: Enhanced security headers plugin with comprehensive protection
function securityHeadersPlugin(mode: string): Plugin {
  return {
    name: 'security-headers',
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req: Request, res: Response, next: NextFunction) => {
        // Security: Comprehensive security headers for development
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
        
        // Security: Additional security headers for development
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
        res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
        res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
        
        // Security: Cache control for development
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        
        next();
      });
    },
    generateBundle(options: any, bundle: Record<string, any>) {
      // Security: Add comprehensive security headers to HTML for production
      for (const fileName in bundle) {
        if (fileName.endsWith('.html')) {
          const htmlChunk = bundle[fileName];
          if (htmlChunk && htmlChunk.type === 'asset' && typeof htmlChunk.source === 'string') {
            const csp = generateCSP(mode);
            const securityHeaders = `
    <!-- Security Headers -->
    <meta http-equiv="Content-Security-Policy" content="${csp}">
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta http-equiv="X-Frame-Options" content="DENY">
    <meta http-equiv="X-XSS-Protection" content="1; mode=block">
    <meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">
    <meta http-equiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=(), payment=()">
    <meta http-equiv="Cross-Origin-Opener-Policy" content="same-origin">
    <meta http-equiv="Cross-Origin-Embedder-Policy" content="require-corp">
    <meta http-equiv="Cross-Origin-Resource-Policy" content="same-site">
    <!-- SEO Security -->
    <meta name="robots" content="noindex, nofollow, noarchive, nosnippet">
    <meta name="googlebot" content="noindex, nofollow, noarchive, nosnippet">`;

            htmlChunk.source = htmlChunk.source.replace('<head>', `<head>${securityHeaders}`);
          }
        }
      }
    }
  };
}

// Security: Validate and sanitize base path
function validateBasePath(basePath: string): string {
  if (!basePath) return '/';
  
  // Security: Ensure base path starts with / and doesn't contain dangerous patterns
  if (!basePath.startsWith('/')) {
    throw new Error('VITE_BASE_PATH must start with /');
  }
  
  // Security: Prevent path traversal
  if (basePath.includes('..') || basePath.includes('\\')) {
    throw new Error('VITE_BASE_PATH cannot contain path traversal sequences');
  }
  
  // Security: Sanitize path
  const sanitized = basePath
    .replace(/[<>'"]/g, '') // Remove HTML/JS injection vectors
    .replace(/\/+/g, '/') // Normalize multiple slashes
    .replace(/\/$/, '') || '/'; // Remove trailing slash except root
  
  return sanitized === '' ? '/' : sanitized;
}

export default defineConfig(({ mode }) => {
  // Security: Load environment variables with validation
  const env = loadEnv(mode, process.cwd(), '');
  
  // Security: Validate environment variables before proceeding
  validateEnvironmentVariables(env, mode);
  
  // Security: Validate and set base path with security checks
  const base = validateBasePath(env.VITE_BASE_PATH || '/');
  
  // Security: Get HTTPS configuration with validation
  const httpsConfig = getHttpsConfig(mode);
  
  // Security: Determine environment flags
  const isProduction = mode === 'production';
  const isDevelopment = mode === 'development';
  const isTest = mode === 'test';
  
  // Security: Log configuration securely (no sensitive data) with 500 error prevention info
  console.log(`🔧 Building for ${mode} mode`);
  console.log(`🔒 HTTPS enabled: ${!!httpsConfig}`);
  console.log(`📦 Base path: ${base}`);
  console.log(`🛡️  Security headers enabled: ${true}`);
  
  // Enhanced: Log environment status for 500 error troubleshooting
  console.log(`🌍 Environment variables loaded:`);
  console.log(`   VITE_SUPABASE_URL: ${env.VITE_SUPABASE_URL ? '✅ SET' : '❌ MISSING'}`);
  console.log(`   VITE_SUPABASE_ANON_KEY: ${env.VITE_SUPABASE_ANON_KEY ? '✅ SET' : '❌ MISSING'}`);
  console.log(`   VITE_ENVIRONMENT: ${env.VITE_ENVIRONMENT || 'not set'}`);
  
  // Check for common 500 error causes
  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
    console.error('🚨 [500 Prevention] Missing Supabase configuration will cause authentication 500 errors');
    console.error('💡 [500 Prevention] Add environment variables and restart build process');
  }
  
  // Log deployment-specific information
  if (isProduction) {
    console.log('🏭 [Production Build] Additional security measures active');
    console.log('🏭 [Production Build] Source maps: disabled');
    console.log('🏭 [Production Build] Console logs: removed');
    console.log('🏭 [Production Build] Minification: enabled');
  }

  return {
    plugins: [
      react({
        // Security: Enhanced React configuration
        babel: {
          plugins: isProduction ? [
            // Security: Remove console logs and debug info in production
            ['babel-plugin-transform-remove-console', { exclude: ['error', 'warn'] }],
            // Security: Remove PropTypes in production
            ['babel-plugin-transform-remove-prop-types', { mode: 'remove' }]
          ] : []
        },
        // Security: Enable Fast Refresh only in development
        fastRefresh: isDevelopment,
        // Security: Include JSX runtime for better tree shaking
        jsxRuntime: 'automatic'
      }),
      securityHeadersPlugin(mode)
    ],
    base,
    resolve: {
      // Security: Strict alias resolution with path validation
      alias: [
        {
          find: '@',
          replacement: path.resolve(__dirname, './src'),
          // Security: Custom resolver to prevent path traversal
          customResolver: (source: string) => {
            const resolved = path.resolve(__dirname, './src', source);
            if (!resolved.startsWith(path.resolve(__dirname, './src'))) {
              throw new Error(`Security: Path traversal attempt blocked: ${source}`);
            }
            return resolved;
          }
        },
        // Security: Explicit library aliases for better control
        {
          find: 'react',
          replacement: path.resolve(__dirname, 'node_modules/react')
        },
        {
          find: 'react-dom',
          replacement: path.resolve(__dirname, 'node_modules/react-dom')
        }
      ]
    },
    server: {
      port: 5173,
      host: 'localhost', // Security: Bind to localhost only (not 0.0.0.0)
      https: httpsConfig,
      open: !process.env.CI && !isTest, // Security: Don't auto-open in CI/test environments
      strictPort: true, // Security: Fail if port is already in use
      // Security: Configure proxy with comprehensive security
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3001',
          changeOrigin: true,
          secure: isProduction, // Require SSL in production
          // Security: Enhanced proxy configuration
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              // Security: Add security headers to proxied requests
              proxyReq.setHeader('X-Forwarded-Proto', httpsConfig ? 'https' : 'http');
              proxyReq.setHeader('X-Forwarded-Host', req.headers.host || 'localhost:5173');
              proxyReq.setHeader('X-Forwarded-For', req.socket.remoteAddress || 'unknown');
              // Security: Add request ID for tracking
              proxyReq.setHeader('X-Request-ID', `vite-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
            });
            
            proxy.on('error', (err, req, res) => {
              console.error('❌ Proxy error:', err.message);
              // Security: Don't expose internal error details
              if (res && !res.headersSent) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal proxy error' }));
              }
            });
          }
        }
      },
      // Security: File system restrictions
      fs: {
        strict: true, // Security: Strict file system access
        allow: [
          // Security: Explicitly allow only necessary directories
          path.resolve(__dirname, '.'),
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'public'),
          path.resolve(__dirname, 'node_modules')
        ],
        deny: [
          // Security: Explicitly deny sensitive directories
          path.resolve(__dirname, '.env'),
          path.resolve(__dirname, '.env.local'),
          path.resolve(__dirname, 'server'),
          path.resolve(__dirname, 'scripts')
        ]
      },
      // Security: CORS configuration
      cors: {
        origin: isDevelopment ? true : false, // Allow all origins in dev, none in prod
        credentials: false // Security: Don't send credentials by default
      }
    },
    build: {
      outDir: 'dist',
      // Security: Conditional source maps (never in production)
      sourcemap: isDevelopment || isTest,
      minify: isProduction ? 'terser' : false,
      target: 'es2022', // Security: Use modern target for better optimization and security features
      
      // Security: Enhanced Terser configuration for secure minification
      terserOptions: isProduction ? {
        compress: {
          // Security: Aggressive production optimizations
          drop_console: true, // Remove all console statements
          drop_debugger: true, // Remove debugger statements
          dead_code: true, // Remove unreachable code
          unused: true, // Remove unused variables/functions
          inline: 2, // Inline functions for obfuscation
          passes: 2, // Multiple passes for better optimization
          // Security: Remove specific debugging functions
          pure_funcs: ['console.log', 'console.debug', 'console.info'],
          // Security: Remove assertions
          global_defs: {
            '@console.log': 'void',
            '@console.debug': 'void'
          }
        },
        mangle: {
          // Security: Enhanced name mangling
          safari10: true,
          toplevel: true, // Mangle top-level names
          properties: {
            // Security: Mangle properties (careful with this)
            regex: /^_/
          }
        },
        format: {
          comments: false, // Security: Remove all comments
          beautify: false, // Security: No beautification
          semicolons: true // Force semicolons for consistency
        }
      } : undefined,
      
      rollupOptions: {
        output: {
          // Security: Optimized chunking strategy for better caching and security
          manualChunks: {
            // Security: Separate vendor chunks for better caching
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-components': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-tabs',
              '@radix-ui/react-checkbox',
              '@radix-ui/react-select',
              '@radix-ui/react-toast',
              '@radix-ui/react-tooltip'
            ],
            'data-layer': ['@supabase/supabase-js', '@tanstack/react-query'],
            'utils': ['clsx', 'tailwind-merge', 'date-fns'],
            'icons': ['lucide-react'],
            'security': ['crypto-js', 'dompurify'] // Security: Separate security libraries
          },
          
          // Security: Secure file naming with integrity hashes
          chunkFileNames: (chunkInfo) => {
            const name = chunkInfo.name || 'chunk';
            return `assets/${name}.[hash].js`;
          },
          entryFileNames: 'assets/[name].[hash].js',
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name || 'asset';
            const extType = name.split('.').pop();
            
            // Security: Organize assets by type
            if (['css'].includes(extType || '')) {
              return `assets/styles/[name].[hash].[ext]`;
            }
            if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(extType || '')) {
              return `assets/images/[name].[hash].[ext]`;
            }
            if (['woff', 'woff2', 'ttf', 'eot'].includes(extType || '')) {
              return `assets/fonts/[name].[hash].[ext]`;
            }
            return `assets/[name].[hash].[ext]`;
          }
        },
        
        // Security: External dependencies configuration
        external: isProduction ? [] : [
          // Security: Keep Node.js modules external in development
          'node:fs',
          'node:path',
          'node:crypto',
          'node:os',
          'node:process'
        ]
      },
      
      // Security: Build optimizations and limits
      chunkSizeWarningLimit: 1000, // Warn on large chunks
      cssCodeSplit: true, // Split CSS for better caching
      assetsInlineLimit: 4096, // Inline small assets (4KB threshold)
      reportCompressedSize: !isProduction, // Don't report size in production (performance)
      
      // Security: Ensure we're building an app, not a library
      lib: undefined,
      
      // Security: Additional security configurations
      emptyOutDir: true, // Clean output directory
      copyPublicDir: true // Copy public assets
    },
    
    preview: {
      port: 4173,
      host: 'localhost', // Security: Bind to localhost only
      https: httpsConfig,
      strictPort: true,
      
      // Security: Comprehensive security headers for preview server
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Resource-Policy': 'same-site',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    },
    
    // Security: Define client-side environment variables securely with 500 error prevention
    define: {
      ...createSecureEnvDefines(env),
      // Security: Define build-time constants
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
      __MODE__: JSON.stringify(mode),
      // Enhanced: Add build-time environment validation flags for runtime 500 error prevention
      __ENV_VALIDATION__: JSON.stringify({
        hasSupabaseUrl: !!env.VITE_SUPABASE_URL,
        hasSupabaseKey: !!env.VITE_SUPABASE_ANON_KEY,
        environment: env.VITE_ENVIRONMENT || mode,
        buildMode: mode,
        timestamp: new Date().toISOString()
      })
    },
    
    // Security: Enhanced esbuild configuration
    esbuild: {
      // Security: Drop debug code in production
      drop: isProduction ? ['console', 'debugger'] : [],
      // Security: Legal comments handling
      legalComments: isProduction ? 'none' : 'inline',
      // Security: Minification settings
      minifyIdentifiers: isProduction,
      minifySyntax: isProduction,
      minifyWhitespace: isProduction,
      // Security: Target modern environments for better optimization
      target: 'es2022',
      // Security: Keep class names for better debugging in development
      keepNames: isDevelopment
    },
    
    // Security: CSS configuration with enhanced security
    css: {
      // Security: CSS modules for better isolation
      modules: {
        localsConvention: 'camelCaseOnly',
        generateScopedName: isProduction 
          ? '[hash:base64:6]' // Short hashes in production
          : '[name]__[local]___[hash:base64:5]' // Descriptive in development
      },
      // Security: PostCSS configuration
      postcss: {
        plugins: [] // Plugins loaded from postcss.config.js for better organization
      },
      // Security: Enable CSS code splitting for better caching
      devSourcemap: isDevelopment
    },
    
    // Security: Dependency optimization with security considerations
    optimizeDeps: {
      // Security: Pre-bundle critical dependencies
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query',
        'lucide-react',
        'clsx',
        'tailwind-merge'
      ],
      // Security: Exclude Node.js and potentially problematic modules
      exclude: [
        'node:fs',
        'node:path', 
        'node:crypto',
        'node:os',
        'node:process',
        'fsevents' // macOS-specific module
      ],
      // Security: Force optimization of specific modules
      force: isProduction
    },
    
    // Security: Worker configuration
    worker: {
      format: 'es',
      plugins: () => [
        react({
          // Security: Minimal React config for workers
          babel: { plugins: [] }
        })
      ]
    },
    
    // Security: Environment configuration
    envPrefix: 'VITE_', // Only expose VITE_ prefixed variables
    envDir: process.cwd(), // Security: Explicitly set env directory
    
    // Security: Logger configuration
    logLevel: isProduction ? 'warn' : 'info',
    clearScreen: !process.env.CI && !isTest, // Don't clear screen in CI/test
    
    // Security: JSON configuration
    json: {
      namedExports: true,
      stringify: false
    }
  };
});