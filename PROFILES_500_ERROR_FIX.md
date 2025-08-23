# Profiles Table 500 Error Fix - Production Deployment Guide

## 🚨 Problem Summary

Your production environment was experiencing 500 errors on profiles table queries, particularly for Finance Manager users, due to:

1. **Circular RLS Policy Dependencies** - RLS policies referencing the profiles table within their own definitions
2. **Complex Role Checking** - Nested queries causing performance issues and timeouts
3. **Missing Profile Records** - Auth users without corresponding profiles causing NULL reference errors
4. **Inconsistent Role Values** - Constraint violations due to role mismatches between environments

## 🛠️ Solution Overview

### SQL Fixes (`fix_profiles_rls_500_errors.sql`)
1. **Removed Circular Dependencies** - Replaced complex RLS policies with simplified, non-circular ones
2. **Added Safe Helper Functions** - Created `get_user_role()` and `safe_create_profile()` functions
3. **Fixed Missing Profiles** - Ensured all auth.users have corresponding profiles
4. **Improved Performance** - Added indexes and optimized queries
5. **Safe Auth Triggers** - Replaced problematic triggers with error-resistant ones

### TypeScript Patches (`typescript_query_patches.ts`)
1. **Safe Query Functions** - Wrapper functions that handle errors gracefully
2. **Prod-Local Diff Detection** - Identifies why queries work locally but fail in production
3. **Role Validation** - Ensures only valid roles are used
4. **Fallback Mechanisms** - Provides safe defaults when queries fail

## 🚀 Deployment Instructions

### Step 1: Backup Current Database
```sql
-- Run in Supabase SQL Editor to backup current policies
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles'
\copy (SELECT * FROM public.profiles) TO 'profiles_backup.csv' CSV HEADER;
```

### Step 2: Apply SQL Fixes
1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the entire contents of `fix_profiles_rls_500_errors.sql`
3. Execute the script
4. Verify success by checking for the completion message

### Step 3: Update TypeScript Code
Replace problematic queries in your codebase:

#### In `src/contexts/AuthContext.tsx`:
```typescript
// OLD (causes 500 errors):
const { data: profile, error } = await client
  .from('profiles')
  .select('role, dealership_id, is_group_admin')
  .eq('id', userId)
  .maybeSingle();

// NEW (safe):
import { patchedFetchUserData } from './typescript_query_patches';
const result = await patchedFetchUserData(client, userId);
```

#### In `src/App.tsx`:
```typescript
// OLD (causes RLS violations):
const { data: profile } = await client
  .from('profiles')
  .select('is_group_admin, role')
  .eq('id', session.user.id)
  .maybeSingle();

// NEW (safe):
import { patchedAppRoleCheck } from './typescript_query_patches';
const result = await patchedAppRoleCheck(client, session.user.id);
```

### Step 4: Verify the Fix
1. Test Finance Manager login in production
2. Check that profile queries return successfully
3. Monitor logs for any remaining 500 errors
4. Test role-based access features

## 🔍 Production vs Local Differences

### Why It Worked Locally But Failed in Production

| Aspect | Local Development | Production |
|--------|-------------------|------------|
| **RLS Policies** | Often disabled or simplified | Strict enforcement causes circular dependencies |
| **Database Performance** | Fast local database | Network latency + load causes timeouts |
| **Environment Variables** | Direct file access | May have caching/loading issues |
| **Error Handling** | More permissive | Strict constraint enforcement |
| **Data Consistency** | Clean test data | Real data with edge cases |

### Key Differences Addressed
- **Circular Policy Dependencies**: Fixed by simplifying RLS policies
- **Performance Issues**: Added indexes and query optimization
- **Missing Data**: Ensured all auth users have profiles
- **Error Tolerance**: Added comprehensive error handling with fallbacks

## 📊 Monitoring and Maintenance

### Check for Remaining Issues
```sql
-- Monitor for missing profiles
SELECT COUNT(*) as missing_profiles 
FROM auth.users au 
LEFT JOIN public.profiles p ON p.id = au.id 
WHERE p.id IS NULL;

-- Check policy effectiveness
SELECT COUNT(*) as accessible_profiles
FROM public.profiles 
WHERE auth.uid() IS NOT NULL;

-- Monitor query performance
SELECT schemaname, tablename, n_tup_ins, n_tup_upd, n_tup_del
FROM pg_stat_user_tables 
WHERE tablename = 'profiles';
```

### Performance Monitoring
```typescript
// Add to your error monitoring
if (queryDuration > 5000) {
  console.warn(`Slow profiles query: ${queryDuration}ms`);
  // Send to your monitoring service
}
```

## 🛡️ Security Considerations

### Updated RLS Policies
1. **profile_self_select** - Users can view their own profile
2. **profile_self_update** - Users can update their own profile  
3. **finance_manager_select** - Finance managers can view profiles
4. **admin_full_access** - Admins have complete access
5. **service_role_access** - Service role for system operations

### Role Constraints
```sql
-- Valid roles after the fix
'viewer', 'salesperson', 'finance_manager', 'single_finance_manager', 
'sales_manager', 'general_manager', 'admin', 'master_admin',
'dealership_admin', 'dealer_group_admin', 'single_dealer_admin'
```

## 🐛 Troubleshooting

### If You Still Get 500 Errors

1. **Check RLS Policies**:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```

2. **Verify Profile Completeness**:
   ```sql
   SELECT au.email, p.id IS NOT NULL as has_profile 
   FROM auth.users au 
   LEFT JOIN profiles p ON p.id = au.id;
   ```

3. **Test Safe Functions**:
   ```sql
   SELECT public.get_user_role(auth.uid());
   ```

4. **Check Logs**:
   - Supabase Dashboard → Logs → Database
   - Look for constraint violations or policy errors

### Common Issues and Solutions

| Error | Cause | Solution |
|-------|--------|----------|
| `circular dependency in RLS` | Old policies still active | Re-run the SQL fix script |
| `constraint violation` | Invalid role values | Use `validateProfileRole()` function |
| `timeout` | Large queries or missing indexes | Check indexes were created |
| `permission denied` | RLS policy too restrictive | Verify user role matches policy requirements |

## 📈 Expected Improvements

After applying these fixes, you should see:
- ✅ **Zero 500 errors** on profile queries
- ✅ **Faster query performance** (< 500ms typically)
- ✅ **Consistent behavior** between local and production
- ✅ **Better error messages** with actionable information
- ✅ **Automatic profile creation** for new users
- ✅ **Robust role-based access** for Finance Managers

## 🎯 Next Steps

1. **Deploy the fixes** using the instructions above
2. **Test thoroughly** in production environment
3. **Monitor performance** for the first few days
4. **Update any remaining** direct profile queries to use safe wrappers
5. **Consider implementing** additional monitoring for database health

---

**Note**: This fix addresses the root cause of the 500 errors while maintaining all existing functionality. The TypeScript patches provide a migration path to gradually update your codebase to use safer query patterns.