# Das Board

A comprehensive dashboard application for automotive dealerships built with React, TypeScript, and Vite.

**Latest Update**: Added Deals by Lender analytics, improved pricing system, enhanced dashboard layouts, and global site scaling.

## Features

- **Role-based Authentication**: Secure login system with multiple user roles
- **Multi-language Support**: Complete internationalization with support for English, Spanish, French, German, Portuguese, Italian, Dutch, Swedish, Chinese, and Greek
- **Professional UI**: Modern, responsive design with dark/light mode support
- **Dealership Management**: Comprehensive tools for managing sales, finance, and administration
- **Real-time Data**: Live updates and real-time synchronization
- **Mobile Responsive**: Fully optimized for mobile and tablet devices

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS, Radix UI Components
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL via Supabase
- **State Management**: React Context API
- **Build Tool**: Vite
- **Package Manager**: npm

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd dasboard

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev

# Build for production
npm run build
```

## Common Dev Issues

### Environment Variable Problems (Most Common)

The DAS Board uses Vite for building, which has specific requirements for environment variable loading that can cause authentication failures.

#### Problem: "Missing Supabase env vars - restart dev server" Error

**Cause**: Vite only loads environment variables when the development server starts. If you:
- Add or modify `.env` file while server is running
- Change `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY`
- Switch between environment files

The changes won't take effect until you restart the server.

**Solution**:
```bash
# Stop the current dev server (Ctrl+C)
# Then restart it
npm run dev
```

#### Required Environment Variables

The following variables are **required** for authentication to work:

```bash
# In your .env file:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Important Notes**:
- Variables must start with `VITE_` to be accessible in the browser
- URLs must use `https://` in production
- Never commit your actual `.env` file to version control

#### Verifying Environment Variables

**Method 1: Browser Console**
Open DevTools Console and run:
```javascript
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING');
```

**Method 2: Application Debug Component**
The app includes a built-in environment checker at `/debug` or look for the "Environment Test" component.

**Method 3: Network Tab**
Check browser DevTools Network tab for failed requests to Supabase with 400/401 errors.

#### Common Environment Issues

| Symptom | Cause | Solution |
|---------|-------|----------|
| "No userId found" errors | Missing/invalid Supabase keys | Verify `.env` file and restart dev server |
| Redirected to login repeatedly | Environment variables not loaded | Restart `npm run dev` |
| "Invalid API key" in console | Wrong `VITE_SUPABASE_ANON_KEY` | Check Supabase dashboard for correct key |
| "Failed to fetch" errors | Wrong `VITE_SUPABASE_URL` | Verify URL format: `https://project.supabase.co` |
| App loads but auth fails | Variables set but server not restarted | Always restart after `.env` changes |

#### Environment Variable Workflow

1. **Initial Setup**:
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   npm run dev
   ```

2. **Making Changes**:
   ```bash
   # Stop server (Ctrl+C)
   # Edit .env file
   npm run dev  # Restart to load new variables
   ```

3. **Verification**:
   - Check browser console for environment variables
   - Test login/signup functionality
   - Verify no "Missing Supabase env vars" errors

#### Production Deployment

For production deployments (Netlify, Vercel, etc.):
- Set environment variables in the hosting platform's dashboard
- **Never** use `.env` files in production
- Trigger a new deployment after adding/changing variables
- Use the hosting platform's environment variable interface

#### Getting Help

If environment issues persist:
1. Check `.env.example` for the latest required variables
2. Verify Supabase project settings and keys
3. Review `NETLIFY_ENV_SETUP.md` for deployment-specific guidance
4. Check browser console for specific error messages

## Project Structure

- `src/`: Source files
  - `components/`: React components
  - `contexts/`: Context providers for state management
  - `lib/`: Utilities and services
  - `pages/`: Main route pages
  - `styles/`: Global styles and Tailwind configuration
- `sales-api-new/`: Mock API server
- `temp/`: Temporary files for development
- `public/`: Static assets

## Session Persistence & Route Protection

The application implements secure session persistence across routes:

- **Automatic Token Refresh**: Sessions are refreshed before expiration
- **Route Guards**: Protected routes require valid authentication
- **Persistent Storage**: Sessions persist across browser refreshes
- **Cross-Tab Sync**: Authentication state syncs across browser tabs
- **Secure Cookies**: Production uses httpOnly, secure cookies

### Testing Session Persistence

```bash
# Run session persistence tests
npm run test:session

# Manual testing
1. Sign in to the application
2. Navigate between protected routes
3. Refresh the browser
4. Open app in new tab
5. Verify session persists
```

## Performance Optimization

- **Code Splitting**: Automatic route-based code splitting
- **Bundle Optimization**: Vendor chunks for better caching
- **Compression**: Brotli and Gzip compression in production
- **CDN Support**: Static assets can be served from CDN
- **PWA Support**: Optional Progressive Web App features
- **Image Optimization**: Automatic image optimization

## Monitoring & Analytics

- **Error Tracking**: Sentry integration for error monitoring
- **Performance Monitoring**: Core Web Vitals tracking
- **User Analytics**: Google Analytics support
- **Custom Events**: Track user interactions and conversions
- **Session Recording**: Optional session replay for debugging

## Troubleshooting Quick Reference

### ReferenceError Issues (Critical)

The DAS Board includes comprehensive runtime safety mechanisms to prevent ReferenceErrors. If you encounter `ReferenceError: X is not defined`, follow these steps:

#### Common ReferenceError Scenarios
| Error | Component | Cause | Solution |
|-------|-----------|-------|----------|
| `ReferenceError: envError is not defined` | AuthContext | Missing state variable declaration | Check AuthContext.tsx state initialization |
| `ReferenceError: ErrorType is not defined` | ErrorBoundary | Enum not properly loaded | Verify ErrorBoundary.tsx enum exports |
| `ReferenceError: useAuth is not defined` | Various components | Missing AuthProvider wrapper | Check App.tsx provider hierarchy |
| `ReferenceError: generateErrorId is not defined` | State management | Function not in scope | Verify callback dependencies |

#### Quick Diagnostic Steps

**Step 1: Check Build Integrity**
```bash
# Clean build to resolve module loading issues
npm run build

# If build fails, check for circular dependencies
npm run build --verbose

# Check for TypeScript errors
npx tsc --noEmit
```

**Step 2: Verify Provider Hierarchy**
```bash
# Check that providers are properly wrapped in App.tsx
# Order should be: ErrorBoundary > AuthProvider > DealershipProvider > Router
grep -n "ErrorBoundary\|AuthProvider\|DealershipProvider" src/App.tsx
```

**Step 3: Runtime Safety Verification**
Open browser console and run:
```javascript
// Check AuthContext variables
console.log('AuthContext loaded:', typeof useAuth);

// Check ErrorBoundary enums
console.log('ErrorType available:', typeof ErrorType);
console.log('ErrorSeverity available:', typeof ErrorSeverity);

// Check initialization state
console.log('App Instance ID:', window.appEvents?.[0]?.details?.appInstanceId);
```

#### Advanced Debugging

**Check Error Boundary Logs**
```javascript
// View error boundary activity in console
console.log(window.appEvents?.filter(e => e.event.includes('ERROR_BOUNDARY')));

// Check for initialization errors
console.log(window.appEvents?.filter(e => e.event.includes('APP_INIT')));
```

**Verify State Management**
```javascript
// Check for runtime safety warnings
console.log(window.appEvents?.filter(e => e.event.includes('RUNTIME_SAFETY')));

// Check state initialization
const authErrors = window.appEvents?.filter(e => e.event.includes('AuthProvider'));
console.log('Auth Provider Events:', authErrors);
```

#### Module Loading Issues

**If variables are undefined at runtime:**
1. **Check import statements** - Ensure proper ES6 imports
2. **Verify export statements** - Check default vs named exports  
3. **Check circular dependencies** - Use `npm run build --verbose`
4. **Clear module cache** - Restart development server
5. **Check TypeScript compilation** - Run `npx tsc --noEmit`

**File-Specific Checks:**

*AuthContext.tsx Issues:*
```bash
# Verify all state variables are properly declared
grep -n "useState\|useCallback" src/contexts/AuthContext.tsx | head -20

# Check for missing dependencies in callbacks
grep -A 5 -B 5 "ensureVariableDefined" src/contexts/AuthContext.tsx
```

*ErrorBoundary.tsx Issues:*
```bash
# Verify enum exports
grep -n "export.*ErrorType\|export.*ErrorSeverity" src/components/ErrorBoundary.tsx

# Check for safe enum access
grep -n "safeGetErrorType\|safeGetErrorSeverity" src/components/ErrorBoundary.tsx
```

### Authentication Issues
| Issue | Quick Fix |
|-------|----------|
| "Missing Supabase env vars" | Restart dev server: `npm run dev` |
| Login redirects in loop | Check `.env` file and restart server |
| "No userId found" | Verify `VITE_SUPABASE_ANON_KEY` is set |
| Network errors to Supabase | Check `VITE_SUPABASE_URL` format |
| ReferenceError on auth methods | Check AuthProvider wrapping in App.tsx |

### Environment Variable Debug Commands
```bash
# Check if variables are loaded in browser console:
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING');

# Restart dev server after any .env changes:
npm run dev

# Verify .env file exists and has correct format:
cat .env | grep VITE_SUPABASE

# Check for undefined environment variables causing ReferenceErrors:
node -e "console.log('Env check:', process.env.VITE_SUPABASE_URL ? 'OK' : 'MISSING')"
```

### Build and Type Issues
```bash
# Fix TypeScript errors that can cause ReferenceErrors
npx tsc --noEmit

# Clean build to resolve stale references
rm -rf node_modules/.vite dist
npm run build

# Check for circular dependencies
npm run build 2>&1 | grep -i circular

# Verify all imports are resolvable
npm run build --verbose
```

### Need More Help?
- Check the **ReferenceError Issues** section above for runtime errors
- Review the "Common Dev Issues" section for environment problems
- Check `NETLIFY_ENV_SETUP.md` for deployment issues
- Ensure `.env.example` matches your setup
- Verify Supabase project settings and API keys
- Run `npm run test:providers` to verify provider functionality

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Deployment Status

**✅ PRODUCTION READY**: This application has been updated with comprehensive authentication, error handling, and production deployment configurations.

**Latest Updates:**
- ✅ Fixed authentication system with secure session management
- ✅ Added comprehensive error boundaries and recovery mechanisms
- ✅ Implemented production-ready auth middleware
- ✅ Added environment-specific configurations (dev/staging/prod)
- ✅ Integrated comprehensive testing suite with Vitest
- ✅ Added security headers and CSP policies
- ✅ Implemented rate limiting and CSRF protection

## Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dasboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (Critical Step)
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your Supabase credentials:
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```
   **⚠️ Important**: Variables must start with `VITE_` to work in the browser.

4. **Start the application**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

5. **Verify setup**
   - Open browser DevTools Console
   - Run: `console.log(import.meta.env.VITE_SUPABASE_URL)`
   - Should show your Supabase URL, not `undefined`

### Alternative Development Modes

**With Mock API** (for offline development):
```bash
# Terminal 1: Start mock API
cd sales-api-new
npm run start

# Terminal 2: Start app with mock mode
cd ..
npm run dev
```

**Multi-port Development** (for testing):
```bash
npm run dev:alt   # Port 5174
npm run dev:alt2  # Port 5175
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run auth-specific tests
npm run test:auth

# Run provider safety tests (ReferenceError prevention)
npm run test:providers

# Run error boundary tests
npm run test:boundaries

# Watch mode for development
npm run test:watch

# Test runtime safety mechanisms
npm run test:runtime-safety
```

### Provider and ReferenceError Testing

The DAS Board includes comprehensive tests to prevent ReferenceErrors and ensure provider stability:

#### Test Categories

1. **Provider Integration Tests** - Verify proper provider wrapping and context availability
2. **Runtime Safety Tests** - Ensure undefined variables are handled gracefully  
3. **Error Boundary Tests** - Validate error boundary functionality and recovery
4. **State Management Tests** - Test safe state updates and error handling
5. **Module Loading Tests** - Verify proper enum and variable initialization

#### Running Specific Test Suites

```bash
# Test AuthProvider and context availability
npm run test -- --grep "AuthProvider|useAuth"

# Test ErrorBoundary enum availability
npm run test -- --grep "ErrorType|ErrorSeverity"

# Test runtime safety mechanisms
npm run test -- --grep "runtime.*safety|ensureVariableDefined"

# Test provider hierarchy
npm run test -- --grep "provider.*hierarchy|context.*wrapping"

# Test error boundary integration
npm run test -- --grep "error.*boundary|error.*recovery"
```

#### Package.json Script Suggestions

Add these scripts to your `package.json` for comprehensive ReferenceError testing:

```json
{
  "scripts": {
    "test:providers": "vitest run test-snippets/provider-safety.test.ts",
    "test:boundaries": "vitest run test-snippets/error-boundary.test.ts", 
    "test:runtime-safety": "vitest run test-snippets/runtime-safety.test.ts",
    "test:reference-errors": "vitest run test-snippets/ --grep 'ReferenceError|undefined'",
    "test:watch:providers": "vitest watch test-snippets/provider-safety.test.ts",
    "test:coverage:safety": "vitest run --coverage test-snippets/",
    "test:debug:providers": "vitest run test-snippets/ --reporter=verbose --no-coverage"
  }
}
```

#### Test File Structure

The test snippets are organized as follows:

```
test-snippets/
├── provider-safety.test.ts      # AuthProvider & context safety tests
├── error-boundary.test.ts       # ErrorBoundary enum & safety tests  
├── runtime-safety.test.ts       # Runtime safety mechanism tests
├── vitest.config.example.ts     # Vitest configuration for safety tests
└── setup.ts                     # Test environment setup
```

#### Example Test Implementation

To implement these tests in your project:

1. **Copy test files** to your project's test directory
2. **Update vitest.config.ts** with the configuration from `vitest.config.example.ts`
3. **Add test scripts** to your `package.json`
4. **Install dependencies**:
   ```bash
   npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
   ```
5. **Run tests**:
   ```bash
   npm run test:providers
   npm run test:boundaries
   npm run test:runtime-safety
   ```

### Testing Modes

This application can be run in three modes:

- **Development**: Uses local mock API for rapid development
- **Staging**: Uses staging Supabase instance for integration testing
- **Production**: Uses production Supabase with full security

## Production Deployment

### Prerequisites

1. **Environment Setup**
   ```bash
   # Copy production environment template
   cp .env.production.example .env.production
   
   # Edit with your production values
   nano .env.production
   ```

2. **Build for Production**
   ```bash
   # Install dependencies
   npm ci
   
   # Run production build
   npm run build
   
   # Preview production build locally
   npm run preview
   ```

### Deployment Platforms

#### Netlify

1. **Connect Repository**
   - Link your GitHub repository in Netlify Dashboard
   - Set build command: `npm run build`
   - Set publish directory: `dist`

2. **Environment Variables**
   - Add all variables from `.env.production.example`
   - Ensure all URLs use HTTPS
   - Set `VITE_ENVIRONMENT=production`

3. **Deploy Settings**
   ```toml
   # netlify.toml
   [build]
     command = "npm run build"
     publish = "dist"
   
   [[headers]]
     for = "/*"
     [headers.values]
       X-Frame-Options = "DENY"
       X-Content-Type-Options = "nosniff"
       X-XSS-Protection = "1; mode=block"
   ```

#### Vercel

1. **Import Project**
   - Import from GitHub in Vercel Dashboard
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

2. **Environment Variables**
   - Add production variables in Project Settings
   - Enable "Automatically expose System Environment Variables"

3. **Deploy Configuration**
   ```json
   // vercel.json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite",
     "rewrites": [
       { "source": "/(.*)", "destination": "/" }
     ]
   }
   ```

#### AWS Amplify

1. **App Settings**
   ```yaml
   # amplify.yml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: dist
       files:
         - '**/*'
   ```

2. **Environment Variables**
   - Configure in Amplify Console > App Settings
   - Set all production environment variables

### Security Checklist

**Environment Variables**:
- [ ] All environment URLs use HTTPS
- [ ] `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- [ ] Variables start with `VITE_` prefix
- [ ] No `.env` files committed to version control
- [ ] Production uses hosting platform environment variables

**Application Security**:
- [ ] Mock API is disabled (`USE_MOCK_SUPABASE=false`)
- [ ] Email verification is enabled
- [ ] Debug mode is disabled (`VITE_DEBUG_MODE=false`)
- [ ] Rate limiting is configured
- [ ] CSRF protection is enabled
- [ ] Security headers are configured
- [ ] Source maps are disabled in production
- [ ] Error tracking (Sentry) is configured
- [ ] Analytics is configured

**Development Server**:
- [ ] Environment variables loaded correctly
- [ ] Dev server restarted after `.env` changes
- [ ] Console shows no "Missing Supabase env vars" errors
- [ ] Authentication flow works end-to-end

## Finance Manager Promotion Implementation

We have implemented a special promotional campaign for the Finance Manager tier, which is now FREE (normally $5/month) for a limited time. The implementation includes:

### Frontend Changes

1. **Homepage Updates**:

   - Added a prominent top banner announcing the free Finance Manager tier
   - Added a dedicated CTA section with eye-catching design highlighting the promotion
   - Updated the pricing section to show strikethrough pricing and "FREE" label

2. **SignupForm**:
   - Form already correctly displayed the promotion with strikethrough pricing
   - Signup process sets `promo_applied: true` for Finance Manager signups

### Backend Implementation

1. **Database Tables**:

   - `promotions` table tracks all promotional pricing changes
   - `promotions_usage` table records users who take advantage of promotions
   - `subscription_events` tracks subscription activity with promo pricing

2. **API Integration**:

   - Handle Finance Manager signup includes promotion tracking
   - Stripe checkout bypassed for promotional pricing
   - Profile settings include promotion details

3. **Tracking**:
   - All promotional signups are tracked in `promotions_usage` table
   - Analytics available through subscription events with `is_promotional` flag

### Technical Details

The promo implementation uses the following tables:

```sql
-- From migrations/create_promotions_table.sql
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tier TEXT NOT NULL,
  original_price DECIMAL(10, 2) NOT NULL,
  promo_price DECIMAL(10, 2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE, -- NULL indicates open-ended promotion
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- From migrations/create_promotions_usage_table.sql
CREATE TABLE promotions_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  promotion_tier TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  schema_name TEXT, -- For finance manager schemas
  dealership_id INTEGER REFERENCES dealerships(id), -- For dealership promotions
  signup_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

To extend or end the promotion, update the `end_date` in the promotions table and modify the UI components to reflect the change.
