# Authentication Fix Documentation

This document outlines the changes made to fix the 401 Unauthorized error in the Das Board application and provides instructions for verifying the fixes.

## Issues Fixed

1. **Supabase Client Configuration**
   - Updated `supabaseClient.ts` to use the correct Supabase anon key
   - Ensured the client properly connects to the dealership-1 Supabase instance
   - Fixed environment variable handling for development and production modes

2. **Authentication Logic**
   - Enhanced `apiService.ts` to handle authentication correctly for both mock API and Supabase
   - Fixed the POST request to Supabase's token endpoint by properly handling credentials
   - Added robust error handling for authentication failures
   - Improved user profile retrieval after authentication succeeds

3. **Context Synchronization**
   - Updated `AuthContext.tsx` to properly detect and use the correct authentication mode
   - Added a `refreshUser` function to ensure user data is always current
   - Improved token management between mock API and Supabase modes
   - Fixed the auth state listener to prevent memory leaks

## Test Credentials

Use the following test accounts for verifying the authentication works correctly:

| Email | Password | Role | Expected Redirect |
|-------|----------|------|------------------|
| testsales@example.com | password | Salesperson | /dashboard/salesperson |
| testfinance@example.com | password | Finance Manager | /finance |
| testmanager@example.com | password | Sales Manager | /dashboard/sales-manager |
| testgm@example.com | password | General Manager | /dashboard/general-manager |
| testadmin@example.com | password | Admin | /dashboard/admin |

## Testing Instructions

### 1. Test with Mock API (Development Mode)

1. Start the mock API server:
   ```
   cd sales-api-new
   npm run start
   ```

2. In a separate terminal, start the application in development mode:
   ```
   cd ..
   npm run dev
   ```

3. Test logging in with each test user and verify correct redirects based on role.

4. Verify that the user can only access data from dealership-1.

### 2. Test with Live Supabase (Production Mode)

1. Build the application for production:
   ```
   npm run build
   ```

2. Start the preview server:
   ```
   npm run preview
   ```

3. Test logging in with the same test users and verify correct redirects.

4. Confirm that data access is properly limited based on dealership ID.

### 3. Run Automated Tests

```
node src/test-auth.js
```

This test script will verify that both mock API and Supabase authentication work correctly.

## Supabase Configuration Details

1. **Dealership-1 Instance**:
   - URL: https://dijulexxrgfmaiewtavb.supabase.co
   - Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpanVsZXh4cmdmbWFpZXd0YXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MjI4MTUsImV4cCI6MjA2MTI5ODgxNX0.8wHE8CliPJooMvp4qqg7HAqqZ7vSX8wSWacjgp4M9sA

2. **Das Board Master Instance** (not currently used):
   - URL: https://iugjtokydvbcvmrpeziv.supabase.co
   - Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Z2p0b2t5ZHZiY3ZtcnBleml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MTk3NjUsImV4cCI6MjA2MTI5NTc2NX0.XCNQoJbGQiXuyR_CFevro1Y8lqvh2_jmjrD181UYtY4

## Environment Configuration

### .env.development
```
VITE_SUPABASE_URL=https://dijulexxrgfmaiewtavb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpanVsZXh4cmdmbWFpZXd0YXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MjI4MTUsImV4cCI6MjA2MTI5ODgxNX0.8wHE8CliPJooMvp4qqg7HAqqZ7vSX8wSWacjgp4M9sA
VITE_API_URL=http://localhost:3001
USE_MOCK_SUPABASE=true
```

### .env.production
```
VITE_SUPABASE_URL=https://dijulexxrgfmaiewtavb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpanVsZXh4cmdmbWFpZXd0YXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MjI4MTUsImV4cCI6MjA2MTI5ODgxNX0.8wHE8CliPJooMvp4qqg7HAqqZ7vSX8wSWacjgp4M9sA
VITE_API_URL=https://dijulexxrgfmaiewtavb.supabase.co
USE_MOCK_SUPABASE=false
```

## Deploying to Vercel

After confirming that the authentication fixes work correctly, update the `.vercelignore` file to allow deployment:

```
# Vercel Ignore File
# Only ignore node_modules and other development files

node_modules
.git
.env.local
.env.development
.env.development.local
```

## Troubleshooting

If authentication issues persist:

1. Check that email authentication is enabled in the Supabase dashboard
2. Verify that test users exist in both the `auth.users` and `profiles` tables
3. Confirm that RLS policies allow users to access their profiles
4. Check browser console for any JS errors during the authentication process
5. Clear browser localStorage/cookies and try again

## Additional Notes

- The updated authentication system accommodates both mock API and Supabase authentication flows
- Token management is properly handled in both systems
- Profile data is fetched after authentication to ensure the user has complete information
- Role-based routing is determined by the user's role stored in their profile 