# Das Board

A comprehensive dashboard application for automotive dealerships built with React, TypeScript, and Vite.

**Latest Update**: Added Deals by Lender analytics, improved pricing system, and enhanced dashboard layouts.

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

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the mock API:
   ```
   cd sales-api-new
   npm run start
   ```
4. In a separate terminal, start the application:
   ```
   cd ..
   npm run dev
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

# Watch mode for development
npm run test:watch
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

- [ ] All environment URLs use HTTPS
- [ ] Mock API is disabled (`USE_MOCK_SUPABASE=false`)
- [ ] Email verification is enabled
- [ ] Debug mode is disabled
- [ ] Rate limiting is configured
- [ ] CSRF protection is enabled
- [ ] Security headers are configured
- [ ] Source maps are disabled in production
- [ ] Error tracking (Sentry) is configured
- [ ] Analytics is configured

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
