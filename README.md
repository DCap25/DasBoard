# Dealership Sales Dashboard

A React-based dashboard application for automobile dealerships, providing role-based access to sales data, metrics, and F&I details.

## Features

- **Authentication**: Secure login with role-based access control
- **Multi-tenant**: Data isolation by dealership
- **Dashboard**: Visual overview of key metrics and recent sales
- **Sales Management**: Track and manage vehicle sales
- **F&I Details**: Monitor finance and insurance products and revenue
- **Metrics**: Performance analytics by salesperson, team, and dealership
- **Dark/Light Mode**: Customizable theme settings

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Routing**: React Router
- **API Communication**: Fetch API with custom service layer
- **Authentication**: JWT-based auth with localStorage token management
- **Testing**: Custom test utilities with end-to-end verification
- **Build**: Vite with TypeScript

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm 7.x or higher

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/dasboard.git
   cd dasboard
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the mock API server:

   ```
   cd sales-api-new
   npm install
   npm run dev
   ```

4. In a separate terminal, start the dashboard application:

   ```
   cd .. (if you're in the sales-api-new directory)
   npm run dev
   ```

5. Access the application at http://localhost:5173/

### Environment Configuration

Create a `.env.development` file in the root directory with the following variables:

```
VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_URL=http://localhost:3001
USE_MOCK_SUPABASE=true
```

Set `USE_MOCK_SUPABASE=false` if you want to use a real Supabase instance.

## Testing

### Run Tests

```
npm run test
```

### Verify Build

```
npm run test:build
```

### Build for Production

```
npm run build
```

## Test User Credentials

| Email                   | Password | Role            |
| ----------------------- | -------- | --------------- |
| testsales@example.com   | password | Salesperson     |
| testfinance@example.com | password | Finance Manager |
| testmanager@example.com | password | Sales Manager   |
| testgm@example.com      | password | General Manager |
| testadmin@example.com   | password | Admin           |

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

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Deployment Status

**⚠️ NOTICE: This application is currently not deployed to production.**

The Vercel deployment has been removed due to authentication issues. Local development is still fully functional.

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

This application can be run in two modes:

- Development mode using the mock API (default)
- Production mode using Supabase

See the `supabase-test-guide.md` for detailed testing procedures.

## Re-deployment Instructions

Deployment is currently paused until authentication issues are resolved. To re-enable deployment:

1. Fix the authentication issues in `src/lib/apiService.ts` and `src/contexts/AuthContext.tsx`
2. Update the Supabase configuration in `.env.production`
3. Set up a new Vercel project with the repository
4. Configure the following environment variables:
   - `VITE_API_URL=https://dijulexxrgfmaiewtavb.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=[your-anon-key]`
   - `USE_MOCK_SUPABASE=false`

Please do not re-deploy until the authentication issues are fully resolved.

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
