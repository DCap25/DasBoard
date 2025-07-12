# Row Level Security (RLS) Configuration Guide

## Overview

This guide documents the Row Level Security (RLS) configuration for the DasBoard project. RLS ensures that users can only access data they're authorized to see, providing database-level security for multi-tenant operations.

## RLS Status

✅ **RLS is ENABLED and CONFIGURED** on all critical tables:

- `profiles` - User profile information
- `dealerships` - Dealership data
- `dealership_groups` - Dealership group data
- `roles` - System roles
- `users` - User account data
- `sales` - Sales data
- `deals` - Deal information
- `metrics` - Performance metrics
- `fni_details` - Finance and Insurance details

## Policy Summary

### 1. Profiles Table

- **Select**: Users can view their own profile OR admins can view any profile
- **Insert**: Users can create their own profile OR admins can create any profile
- **Update**: Users can update their own profile OR admins can update any profile

### 2. Roles Table

- **Select**: All authenticated users can view roles
- **Modify**: Only admins can create/update/delete roles

### 3. Dealership Groups Table

- **Select**: All authenticated users can view dealership groups
- **Modify**: Only admins can create/update/delete dealership groups

### 4. Dealerships Table

- **Select**: All authenticated users can view dealerships
- **Insert**: Only admins can create dealerships
- **Update**: Admins OR dealership admins for their own dealership
- **Delete**: Only admins can delete dealerships

### 5. Users Table

- **Select**: Users can view their own data OR admins can view any user OR dealership admins can view users in their dealership
- **Modify**: Only admins can create/update/delete users

### 6. Sales Table

- **Select**: Users can view sales from their dealership OR admins can view any sales
- **Modify**: Managers/admins OR salespeople for their dealership

### 7. Deals Table

- **Complex role-based policies**: Salespeople can manage their own deals, managers can manage deals in their dealership, admins can manage all deals

## Helper Functions

The following PostgreSQL functions are available for use in policies:

### `is_admin(user_id UUID DEFAULT auth.uid())`

Returns `true` if the user has admin or master_admin role.

### `is_dealership_admin(user_id UUID DEFAULT auth.uid(), check_dealership_id INTEGER DEFAULT NULL)`

Returns `true` if the user is a dealership admin, optionally for a specific dealership.

### `get_user_dealership_id(user_id UUID DEFAULT auth.uid())`

Returns the dealership ID for the given user.

### `user_has_role(user_id UUID DEFAULT auth.uid(), role_name TEXT DEFAULT NULL)`

Returns `true` if the user has the specified role.

## Application-Level RLS Helpers

### Key Files

- `src/lib/rlsHelpers.ts` - RLS utility functions
- `src/lib/apiService.ts` - Enhanced with RLS-aware database operations
- `src/lib/supabaseErrorHandler.ts` - RLS error handling

### Main Functions

#### Authentication

```typescript
// Ensure user is authenticated
await ensureAuthenticated();

// Get current user profile (cached)
const profile = await getCurrentUserProfile();

// Check if user is admin
const isAdmin = await isCurrentUserAdmin();
```

#### Access Control

```typescript
// Check dealership access
const accessCheck = await canAccessDealership(dealershipId);

// Require dealership access (throws error if denied)
await requireDealershipAccess(dealershipId);
```

#### Database Operations

```typescript
// Execute RLS-aware query
const data = await executeRLSQuery(() => supabase.from('table').select('*'), 'operation_name');

// Execute admin-only query
const adminData = await executeAdminQuery(
  () => supabase.from('table').select('*'),
  'admin_operation'
);

// Execute dealership-scoped query
const dealershipData = await executeDealershipQuery(
  () => supabase.from('table').select('*'),
  'dealership_operation',
  dealershipId
);
```

## Error Handling

### RLS Error Types

- **Access Denied**: User doesn't have permission for the operation
- **Authentication Required**: User needs to log in
- **Role Insufficient**: User's role doesn't allow the operation

### Error Messages

- Clear, user-friendly messages
- No sensitive information leaked
- Proper logging for debugging

## Testing RLS Policies

### Manual Testing

1. Log in as different user types (admin, dealership admin, regular user)
2. Try to access data from different dealerships
3. Verify proper access restrictions

### Automated Testing

```typescript
// Test RLS policies for a table
await testRLSPolicies('profiles');

// Get RLS policy information
const policyInfo = await getRLSPolicyInfo();
```

## Common Use Cases

### 1. Viewing Sales Data

```typescript
// This will automatically check if user can access the dealership
const sales = await getSales(dealershipId);
```

### 2. Creating a New Deal

```typescript
// RLS policies ensure user can only create deals for their dealership
const deal = await createRecord('deals', dealData);
```

### 3. Admin Operations

```typescript
// Only admins can perform this operation
const allUsers = await executeAdminQuery(() => supabase.from('users').select('*'), 'get_all_users');
```

## Security Best Practices

### 1. Always Use RLS-Aware Functions

❌ **Don't do this:**

```typescript
const { data } = await supabase.from('sales').select('*');
```

✅ **Do this:**

```typescript
const sales = await executeRLSQuery(() => supabase.from('sales').select('*'), 'get_sales');
```

### 2. Check Access Before Operations

```typescript
// Check access before expensive operations
const canAccess = await canAccessDealership(dealershipId);
if (!canAccess.canAccess) {
  throw new Error(`Access denied: ${canAccess.reason}`);
}
```

### 3. Use Proper Error Handling

```typescript
try {
  const data = await executeRLSQuery(/* ... */);
} catch (error) {
  if (error.message.includes('Access denied')) {
    // Handle access denied
  }
}
```

## Troubleshooting

### Common Issues

#### 1. "Access Denied" Errors

- Check if user is authenticated
- Verify user's role and dealership assignment
- Review RLS policies for the table

#### 2. "Authentication Required" Errors

- Ensure user is logged in
- Check if session is valid
- Verify Supabase configuration

#### 3. Infinite Recursion in Policies

- Avoid self-referencing policies
- Use helper functions to prevent recursion
- Test policies thoroughly

### Debug Commands

```sql
-- Check RLS status
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'your_table';

-- List policies for a table
SELECT * FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'your_table';

-- Test helper functions
SELECT is_admin('user-id-here');
SELECT get_user_dealership_id('user-id-here');
```

## Migration History

### Latest Migration: `optimize_rls_policies_for_auth_fixed`

- Cleaned up conflicting policies
- Created consistent policy naming
- Added helper functions
- Improved error handling

### Key Changes Made:

1. Removed conflicting "allow all" policies
2. Created role-based access patterns
3. Added proper authentication checks
4. Implemented dealership-scoped access
5. Added comprehensive error handling

## Performance Considerations

### 1. Policy Complexity

- Keep policies simple and efficient
- Use indexes on columns used in policies
- Avoid complex subqueries in policies

### 2. Caching

- User profiles are cached for 5 minutes
- Clear cache on logout or profile updates
- Use `getCurrentUserProfile(true)` to force refresh

### 3. Database Indexes

The following indexes support RLS policies:

- `profiles_email_idx` on `profiles(email)`
- `profiles_dealership_id_idx` on `profiles(dealership_id)`
- `users_email_idx` on `users(email)`
- `dealerships_group_id_idx` on `dealerships(dealership_group_id)`

## Conclusion

The RLS configuration provides robust, database-level security for the DasBoard application. By following the patterns and using the helper functions provided, developers can ensure that data access is properly controlled and secure.

For any questions or issues with RLS configuration, refer to the troubleshooting section or check the Supabase documentation for advanced RLS patterns.
