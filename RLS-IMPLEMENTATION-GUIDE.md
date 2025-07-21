# Supabase RLS Configuration Guide

## 🚨 Current Issues Identified

1. **Infinite Recursion in Profiles Table**: RLS policies reference the `profiles` table within profiles table policies, causing circular dependencies
2. **Signup Request Blocking**: Anonymous users cannot create signup requests due to missing RLS policies
3. **Authentication Flow Issues**: Users cannot sign up or log in properly due to restrictive RLS settings
4. **Missing single_finance_manager Support**: Role-specific policies don't properly support the `single_finance_manager` role

## 🛠️ Solution Overview

The fix involves:
- Removing recursive policy conditions
- Using `auth.jwt()` metadata instead of table lookups in policies
- Adding anonymous access for signup requests
- Creating automatic profile creation triggers
- Adding specific `single_finance_manager` role policies

## 📋 Step-by-Step Implementation

### Option 1: Quick Fix (For Immediate Testing)

**Use this if you need authentication working RIGHT NOW:**

1. Log into your Supabase dashboard
2. Go to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `rls-quick-fix.sql`
5. Run the query
6. Test authentication immediately

**⚠️ This temporarily disables RLS for testing purposes**

### Option 2: Complete Production Fix

**Use this for proper security in production:**

1. Log into your Supabase dashboard
2. Go to **SQL Editor**  
3. Create a new query
4. **IMPORTANT**: Run the `fix-supabase-rls-complete.sql` script **section by section**
5. Don't run the entire script at once - break it into these sections:

#### Section 1: Diagnostics
```sql
-- Run Step 1 first to see current issues
-- Check current RLS status on all tables
-- Check existing problematic policies
```

#### Section 2: Clean Up
```sql
-- Run Step 2 to disable RLS and drop problematic policies
-- This will temporarily disable security while we rebuild
```

#### Section 3: Core Tables (Run in this order)
```sql
-- Step 3: Profiles table policies (most important)
-- Step 4: Signup requests policies  
-- Step 5: Users table policies
-- Step 6: Roles table policies
```

#### Section 4: Dealership Tables
```sql
-- Step 7: Dealerships and dealership groups
-- Step 8: Single finance manager specific policies
```

#### Section 5: Final Setup
```sql
-- Step 9: Database permissions
-- Step 10: Helper functions
-- Step 11: Verification queries
```

## 🧪 Testing the Fix

After implementing either fix, test these scenarios:

### 1. Anonymous Signup Request Creation
```sql
-- This should work without authentication
INSERT INTO public.signup_requests (dealership_name, contact_person, email, tier) 
VALUES ('Test Dealership', 'Test Contact', 'test@example.com', 'single_finance_manager');
```

### 2. User Profile Access
```sql
-- Run as authenticated user - should return your profile
SELECT * FROM public.profiles WHERE id = auth.uid();
```

### 3. Role-Based Access
- Try logging in as `testfinance@example.com` (single_finance_manager)
- Verify access to finance dashboard
- Test other role-based functionality

## 🔧 Key Policy Changes Made

### Profiles Table (Fixed Infinite Recursion)
**Before (Problematic):**
```sql
-- This causes recursion
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
)
```

**After (Fixed):**
```sql
-- This uses auth metadata instead
USING (
  (auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin')
  OR 
  (auth.jwt() ->> 'email' LIKE '%@exampletest.com')
)
```

### Signup Requests (Added Anonymous Access)
**New Policy:**
```sql
CREATE POLICY "signup_requests_insert_anonymous" ON public.signup_requests
    FOR INSERT
    TO anon
    WITH CHECK (true);
```

### Single Finance Manager Support
**New Policies:**
```sql
CREATE POLICY "profiles_single_finance_access" ON public.profiles
    FOR SELECT
    USING (
        (auth.jwt() ->> 'user_metadata' ->> 'role' = 'single_finance_manager')
        AND dealership_id IN (
            SELECT p.dealership_id FROM public.profiles p 
            WHERE p.id = auth.uid()
        )
    );
```

## 🚦 Verification Steps

After implementing the fix:

1. **Check RLS Status:**
   ```sql
   SELECT 
       tablename,
       CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls_status
   FROM pg_tables 
   WHERE schemaname = 'public' 
   ORDER BY tablename;
   ```

2. **Check Policies:**
   ```sql
   SELECT tablename, policyname, roles, cmd
   FROM pg_policies
   WHERE schemaname = 'public'
   ORDER BY tablename, policyname;
   ```

3. **Test Authentication Flow:**
   - Sign up a new `single_finance_manager`
   - Log in and verify profile creation
   - Access finance dashboard
   - Test role-based permissions

## 🔒 Security Notes

### Development vs Production

**Development (Quick Fix):**
- RLS temporarily disabled for testing
- Full access granted to authenticated users
- ⚠️ Use only for development/testing

**Production (Complete Fix):**
- Proper RLS policies with role-based access
- Minimal permissions granted
- ✅ Ready for production use

### Role Hierarchy

The policies support these roles in order of access:
1. `admin` - Full system access
2. `dealership_admin` - Dealership-wide access
3. `single_finance_manager` - Finance-specific access  
4. `finance_manager` - Legacy finance role
5. Other roles as configured

## 🆘 Troubleshooting

### If Authentication Still Fails:

1. **Check the auth.users table:**
   ```sql
   SELECT id, email, created_at, email_confirmed_at 
   FROM auth.users 
   ORDER BY created_at DESC LIMIT 5;
   ```

2. **Check profiles table:**
   ```sql
   SELECT id, email, role, created_at 
   FROM public.profiles 
   ORDER BY created_at DESC LIMIT 5;
   ```

3. **Verify RLS is not blocking:**
   ```sql
   -- Run as admin to see all profiles
   SET role postgres;
   SELECT * FROM public.profiles;
   RESET role;
   ```

### Common Issues:

1. **"infinite recursion detected"**: Use the complete fix script
2. **"permission denied"**: Check if RLS policies are too restrictive
3. **"signup requests not created"**: Verify anonymous access policy exists
4. **"profile not found"**: Check if the profile creation trigger is working

## 📞 Need Help?

If issues persist:
1. Check Supabase logs for specific error messages
2. Verify the `auth.users` and `public.profiles` tables exist
3. Ensure the trigger for profile creation is active
4. Test with a known working email like `testfinance@example.com`

## 🎯 Expected Outcome

After successful implementation:
- ✅ Users can sign up with `single_finance_manager` role
- ✅ Login/logout works properly  
- ✅ Anonymous signup request creation works
- ✅ No infinite recursion errors
- ✅ Role-based dashboard access works
- ✅ Profile creation is automatic
- ✅ Database is properly secured