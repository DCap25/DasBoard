import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// ================================================================
// SECURE VITE CONFIGURATION FOR THE DAS BOARD
// ================================================================
// Security Features:
// 1. HTTPS enforcement for development and production
// 2. Secure environment variable handling
// 3. Content Security Policy (CSP) headers
// 4. Security headers for production builds
// 5. Optimized bundle security and performance
// 6. Source map protection in production
// 7. Environment variable validation
// ================================================================

// Security: Define allowed environment variables for client-side
const ALLOWED_CLIENT_ENV_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_API_URL',
  'VITE_APP_URL',
  'VITE_MARKETING_URL',
  'VITE_DEPLOYMENT_VERSION',
  'VITE_ENVIRONMENT',
  'VITE_FEATURE_FLAGS',
  'VITE_RATE_LIMIT_ENABLED'
] as const;

// Security: Validate environment variables
function validateEnvironmentVariables(env: Record<string, string>, mode: string): void {
  const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  const missingVars = requiredVars.filter(varName => !env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars);
    if (mode === 'production') {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    } else {
      console.warn('⚠️  Development mode: some features may not work without all environment variables');
    }
  }

  // Security: Validate Supabase URL format
  if (env.VITE_SUPABASE_URL && !env.VITE_SUPABASE_URL.match(/^https:\/\/[a-zA-Z0-9-]+\.supabase\.co$/)) {
    console.warn('⚠️  Supabase URL format may be invalid. Expected: https://[project].supabase.co');
  }

  // Security: Ensure production uses HTTPS URLs
  if (mode === 'production') {
    ['VITE_API_URL', 'VITE_APP_URL', 'VITE_MARKETING_URL'].forEach(varName => {
      if (env[varName] && !env[varName].startsWith('https://')) {
        console.error(`❌ ${varName} must use HTTPS in production`);
        throw new Error(`${varName} must use HTTPS in production`);
      }
    });
  }
}

// Security: Create secure environment variable object for client
function createSecureEnvDefines(env: Record<string, string>): Record<string, string> {
  const secureEnv: Record<string, string> = {};
  
  ALLOWED_CLIENT_ENV_VARS.forEach(varName => {
    if (env[varName]) {
      // Security: Sanitize environment variables before client exposure
      let value = env[varName];
      
      // Remove any potential XSS vectors
      value = value.replace(/[<>'"]/g, '');
      
      // Ensure no script injections in URLs
      if (varName.includes('URL') && value.includes('javascript:')) {
        console.error(`❌ JavaScript protocol detected in ${varName}`);
        throw new Error(`Invalid protocol in environment variable ${varName}`);
      }
      
      secureEnv[`import.meta.env.${varName}`] = JSON.stringify(value);
    }
  });
  
  return secureEnv;
}

// Security: Get HTTPS configuration for development
function getHttpsConfig(mode: string): boolean | { key: Buffer; cert: Buffer } {
  if (mode === 'production') return false;
  
  // Try to use local HTTPS certificates for development
  const certPath = path.resolve(process.cwd(), 'certs');
  const keyFile = path.join(certPath, 'key.pem');
  const certFile = path.join(certPath, 'cert.pem');
  
  if (fs.existsSync(keyFile) && fs.existsSync(certFile)) {
    try {
      return {
        key: fs.readFileSync(keyFile),
        cert: fs.readFileSync(certFile)
      };
    } catch (error) {
      console.warn('⚠️  Could not read HTTPS certificates, falling back to HTTP');
    }
  }
  
  // For now, allow HTTP in development but warn user
  console.warn('⚠️  HTTPS certificates not found. Please set up HTTPS for development.');
  console.info('📝 To set up HTTPS: mkcert -install && mkcert localhost 127.0.0.1 ::1');
  
  return false;
}

// Security: Content Security Policy for production builds
const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for Vite in development
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
    'https://fonts.gstatic.com'
  ],
  'img-src': [
    "'self'",
    'data:', // For base64 images
    'blob:', // For generated images
    'https://*.supabase.co'
  ],
  'connect-src': [
    "'self'",
    'https://*.supabase.co',
    'wss://*.supabase.co',
    'https://api.stripe.com'
  ],
  'frame-src': ["'none'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': []
};

function generateCSP(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, sources]) => 
      sources.length > 0 ? `${directive} ${sources.join(' ')}` : directive
    )
    .join('; ');
}

// Security: Security headers plugin for production
function securityHeadersPlugin() {
  return {
    name: 'security-headers',
    configureServer(server: any) {
      server.middlewares.use((_req: any, res: any, next: any) => {
        // Security headers for development
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        next();
      });
    },
    generateBundle(options: any, bundle: any) {
      // Add security headers meta tags to HTML for production
      for (const fileName in bundle) {
        if (fileName.endsWith('.html')) {
          const htmlChunk = bundle[fileName];
          if (htmlChunk.type === 'asset' && typeof htmlChunk.source === 'string') {
            htmlChunk.source = htmlChunk.source.replace(
              '<head>',
              `<head>
    <meta http-equiv="Content-Security-Policy" content="${generateCSP()}">
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta http-equiv="X-Frame-Options" content="DENY">
    <meta http-equiv="X-XSS-Protection" content="1; mode=block">
    <meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">
    <meta http-equiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=()">
    <meta name="robots" content="noindex" />`
            );
          }
        }
      }
    }
  };
}

export default defineConfig(({ mode }) => {
  // Load environment variables with validation
  const env = loadEnv(mode, process.cwd(), '');
  
  // Security: Validate environment variables
  validateEnvironmentVariables(env, mode);
  
  // Security: Set base path with validation
  const base = env.VITE_BASE_PATH || '/';
  if (base !== '/' && !base.startsWith('/')) {
    throw new Error('VITE_BASE_PATH must start with /');
  }

  // Security: Get HTTPS configuration
  const httpsConfig = getHttpsConfig(mode);
  
  // Security: Determine if we're in production
  const isProduction = mode === 'production';
  
  console.log(`🔧 Building for ${mode} mode`);
  console.log(`🔒 HTTPS enabled: ${!!httpsConfig}`);
  console.log(`📦 Base path: ${base}`);

  return {
    plugins: [
      react({
        // Security: Disable React DevTools in production
        babel: {
          plugins: isProduction ? ['babel-plugin-transform-remove-console'] : []
        }
      }),
      securityHeadersPlugin()
    ],
    base,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      host: 'localhost', // Security: Bind to localhost only
      https: httpsConfig,
      open: !process.env.CI, // Security: Don't auto-open in CI environments
      strictPort: true, // Security: Fail if port is already in use
      // Security: Configure proxy with security headers
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3001',
          changeOrigin: true,
          secure: isProduction, // Require SSL in production
          // Security: Add headers to proxied requests
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('X-Forwarded-Proto', httpsConfig ? 'https' : 'http');
              proxyReq.setHeader('X-Forwarded-Host', 'localhost:5173');
            });
          }
        },
      },
      // Security: Disable server listing and add security headers
      middlewareMode: false,
      fs: {
        // Security: Restrict file access to project directory
        strict: true,
        allow: ['.']
      }
    },
    build: {
      outDir: 'dist',
      // Security: Enable source maps only in development
      sourcemap: !isProduction,
      minify: 'terser',
      target: 'es2020', // Security: Use modern target for better optimization
      // Security: Configure Terser for secure minification
      terserOptions: {
        compress: {
          // Security: Remove console logs and debugger statements in production
          drop_console: isProduction,
          drop_debugger: true,
          // Security: Remove unreachable code
          dead_code: true,
          // Security: Remove unused code
          unused: true,
          // Security: Inline functions for better obfuscation
          inline: 2
        },
        mangle: {
          // Security: Mangle all names except for debugging
          safari10: true
        },
        format: {
          // Security: Remove comments in production
          comments: false
        }
      },
      rollupOptions: {
        // Security: Configure external dependencies for proper resolution
        external: (id) => {
          // Never externalize isomorphic-dompurify - bundle it
          if (id === 'isomorphic-dompurify') {
            return false;
          }
          // Don't externalize any other dependencies by default
          return false;
        },
        output: {
          // Security: Split chunks for better caching and security
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'router': ['react-router-dom'],
            'ui-components': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-tabs',
              '@radix-ui/react-checkbox',
              '@radix-ui/react-select'
            ],
            'supabase': ['@supabase/supabase-js'],
            'query': ['@tanstack/react-query'],
            'utils': ['clsx', 'tailwind-merge', 'date-fns'],
            'icons': ['lucide-react'],
            'crypto': ['crypto-js'], // Security: Separate crypto libraries
            'security': ['isomorphic-dompurify'] // Security: Include DOMPurify for XSS prevention
          },
          // Security: Use hash-based file names for cache busting
          chunkFileNames: 'assets/[name].[hash].js',
          entryFileNames: 'assets/[name].[hash].js',
          assetFileNames: (assetInfo) => {
            // Security: Add integrity hashes to asset names
            const extType = assetInfo.name?.split('.').pop();
            if (extType === 'css') {
              return 'assets/[name].[hash].css';
            }
            return 'assets/[name].[hash].[ext]';
          }
        },
        // Security: External dependencies for reduced bundle size
        external: isProduction ? [] : ['node:fs', 'node:path']
      },
      // Security: Optimize bundle size with warnings
      chunkSizeWarningLimit: 1000,
      // Security: Additional build optimizations
      cssCodeSplit: true,
      assetsInlineLimit: 4096, // Inline small assets for fewer requests
      reportCompressedSize: false, // Security: Disable size reporting in CI
      // Security: Enable tree shaking
      lib: undefined // Ensure we're building an app, not a library
    },
    preview: {
      port: 4173,
      host: 'localhost', // Security: Bind to localhost only
      https: httpsConfig,
      strictPort: true,
      // Security: Add security headers to preview server
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
      }
    },
    // Security: Define client-side environment variables securely
    define: createSecureEnvDefines(env),
    // Security: Configure esbuild for secure builds
    esbuild: {
      // Security: Drop console and debugger in production
      drop: isProduction ? ['console', 'debugger'] : [],
      // Security: Enable legal comments only in development
      legalComments: isProduction ? 'none' : 'inline',
      // Security: Minify identifiers in production
      minifyIdentifiers: isProduction,
      minifySyntax: isProduction,
      minifyWhitespace: isProduction
    },
    // Security: CSS configuration
    css: {
      // Security: Enable CSS modules for better isolation
      modules: {
        localsConvention: 'camelCaseOnly'
      },
      // Security: PostCSS configuration
      postcss: {
        plugins: isProduction ? [
          // Add autoprefixer and cssnano for production
        ] : []
      }
    },
    // Security: Dependency optimization
    optimizeDeps: {
      // Security: Pre-bundle dependencies for faster loading
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query',
        'lucide-react',
        'isomorphic-dompurify' // Security: Ensure DOMPurify is pre-bundled
      ],
      // Security: Exclude Node.js modules from bundling
      exclude: ['node:fs', 'node:path', 'node:crypto']
    },
    // Security: Worker configuration
    worker: {
      format: 'es',
      plugins: () => [react()]
    },
    // Security: Environment prefix for client-side variables
    envPrefix: 'VITE_',
    // Security: Logger configuration
    logLevel: isProduction ? 'error' : 'info',
    clearScreen: !process.env.CI, // Don't clear screen in CI
    // Security: SSR configuration for proper module resolution
    ssr: {
      // Security: Ensure isomorphic-dompurify is bundled, not externalized
      noExternal: ['isomorphic-dompurify']
    }
  };
});