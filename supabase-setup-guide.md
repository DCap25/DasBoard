# Supabase Setup Guide for Das Board

## Step 1: Access Supabase Project

1. Go to the Supabase dashboard: https://app.supabase.com/
2. Log in with your Supabase account
3. Access the project: `dijulexxrgfmaiewtavb`

## Step 2: Configure Authentication

1. Navigate to Authentication > Settings
2. Under Email Auth, ensure Email provider is enabled
3. Configure password settings:
   - Minimum password length: 8
   - Enable "Require special character"
4. Under Site URL, enter: `http://localhost:5173`
5. Under Redirect URLs, add:
   - `http://localhost:5173/auth/callback`
   - `http://localhost:5174/auth/callback`
   - `https://dasboard-app.vercel.app/auth/callback` (for future Vercel deployment)

## Step 3: Configure CORS Settings

1. Navigate to Project Settings > API
2. Under CORS (Cross-Origin Resource Sharing), add these domains to the allowed list:
   - `http://localhost:5173`
   - `http://localhost:5174`
   - `https://dasboard-app.vercel.app` (for future deployment)

## Step 4: Create Database Tables

1. Navigate to SQL Editor
2. Create a new query
3. Copy the entire content of `supabase-init.sql` and execute it
4. This will create:
   - Dealerships table
   - Profiles table (linked to auth.users)
   - Sales table
   - Metrics table
   - F&I Details table
   - Proper RLS policies
   - Helper functions and triggers

## Step 5: Create Test Users

1. Navigate to Authentication > Users
2. Click "Create new user" to create these test accounts:
   - Email: `testsales@example.com`, Password: `password`, Role: Salesperson
   - Email: `testfinance@example.com`, Password: `password`, Role: Finance Manager
   - Email: `testmanager@example.com`, Password: `password`, Role: Sales Manager
   - Email: `testgm@example.com`, Password: `password`, Role: General Manager
   - Email: `testadmin@example.com`, Password: `password`, Role: Admin
3. After creating each user, note down their UUID

## Step 6: Insert Sample Data

1. Navigate to SQL Editor
2. Create a new query
3. Copy the content of `supabase-sample-data.sql`
4. Replace the placeholder UUIDs with the actual UUIDs of your created users
5. Execute the SQL to insert sample data

## Step 7: Verify Settings

1. Verify RLS is enabled:
   - Go to Database > Tables
   - Check each table to ensure RLS is enabled
   - Verify policies are listed for each table

2. Test a query:
   - Go to SQL Editor
   - Try: `SELECT * FROM public.dealerships;`
   - You should not see any data when logged out (due to RLS)

## Step 8: Configure Application Environment

1. Create or update `.env.development`:
   ```
   VITE_API_URL=http://localhost:3001
   USE_MOCK_SUPABASE=true
   ```

2. Create `.env.production`:
   ```
   VITE_API_URL=https://dijulexxrgfmaiewtavb.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon-key-from-api-settings>
   USE_MOCK_SUPABASE=false
   ```

3. Get the anon key from Project Settings > API > Project API keys > anon/public

## Step 9: Test Local Development

1. Start the mock API for development:
   ```
   cd sales-api-new
   npm run start
   ```

2. Start the Das Board application:
   ```
   cd ..
   npm run dev
   ```

3. Test with mock API:
   - Login with test credentials
   - Verify data access based on role
   - Check multi-tenant isolation

## Step 10: Test Production Build

1. Create a production build:
   ```
   npm run build
   ```

2. Preview the production build:
   ```
   npm run preview
   ```

3. With `.env.production` properly configured, this build will connect to Supabase
   - Test login
   - Verify data access
   - Check role-based permissions
   - Confirm multi-tenant isolation

## Troubleshooting

### If RLS policies don't work:
- Verify that the policies are properly created
- Check that the user UUID in profiles table matches the auth.users UUID
- Ensure the user is assigned to the correct dealership

### If authentication fails:
- Check CORS settings
- Verify Site URL and Redirect URLs
- Ensure the anon key is correctly set in `.env.production`

### If data isn't showing:
- Check browser console for errors
- Verify that sample data was inserted correctly
- Confirm that user roles are set up properly 