# Supabase Error Troubleshooting Guide

This guide provides comprehensive solutions for common Supabase errors encountered in the DasBoard project, with specific focus on authentication, CORS, RLS policies, and network issues.

## 🚨 Quick Error Reference

| Error Type     | Common Symptoms               | Priority    | Quick Fix                        |
| -------------- | ----------------------------- | ----------- | -------------------------------- |
| **CORS**       | "blocked by CORS policy"      | 🔴 Critical | Check Supabase URL & origins     |
| **RLS**        | "violates row-level security" | 🟡 High     | Review RLS policies              |
| **AUTH**       | "Invalid login credentials"   | 🟡 High     | Check credentials & confirmation |
| **NETWORK**    | "network error", "timeout"    | 🟠 Medium   | Check internet connection        |
| **RATE_LIMIT** | "too many requests"           | 🟠 Medium   | Wait and retry                   |

## 🔧 Error Handling System

The DasBoard project uses a comprehensive error handling system located in `src/lib/supabaseErrorHandler.ts` that automatically:

- ✅ Detects error types using pattern matching
- ✅ Provides user-friendly error messages
- ✅ Suggests specific fixes for each error type
- ✅ Logs detailed debugging information
- ✅ Shows toast notifications for critical errors
- ✅ Implements automatic retry logic where appropriate

## 📋 Common Error Types & Solutions

### 1. CORS Errors 🔴

**Error Messages:**

- "blocked by CORS policy"
- "access-control-allow-origin"
- "cross-origin request blocked"
- "failed to fetch"

**Root Causes:**

- Incorrect Supabase URL in environment variables
- Domain not added to Supabase allowed origins
- Browser security policy blocking requests
- Invalid SSL certificates

**Solutions:**

#### Step 1: Verify Environment Variables

```bash
# Check your .env file
VITE_SUPABASE_URL=https://iugjtokydvbcvmrpeziv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Step 2: Add Domain to Supabase

1. Go to Supabase Dashboard → Settings → API
2. Add your domain to "Site URL" and "Additional URLs"
3. Include both `http://localhost:5173` (dev) and your production domain

#### Step 3: Test Connection

```javascript
// Test in browser console
import { testSupabaseConnection } from './src/lib/supabaseClient';
testSupabaseConnection().then(result => console.log(result));
```

#### Step 4: Clear Browser Cache

- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Clear site data in Developer Tools → Application → Storage

### 2. RLS (Row Level Security) Errors 🟡

**Error Messages:**

- "violates row-level security policy"
- "insufficient privilege"
- "permission denied"
- "access denied"

**Root Causes:**

- RLS policies blocking legitimate access
- User not authenticated when accessing protected tables
- Incorrect role assignments
- Missing or overly restrictive policies

**Solutions:**

#### Step 1: Check Authentication Status

```javascript
// Verify user is authenticated
const {
  data: { session },
} = await supabase.auth.getSession();
console.log('Session:', session);
```

#### Step 2: Review RLS Policies

```sql
-- Check existing policies
SELECT
  tablename,
  policyname,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

#### Step 3: Common Policy Fixes

```sql
-- Allow authenticated users to read their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Allow all authenticated users to read roles
CREATE POLICY "Allow authenticated users to read roles"
ON roles FOR SELECT
TO authenticated
USING (true);
```

#### Step 4: Temporary Development Fix

```sql
-- ONLY FOR DEVELOPMENT - disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
-- Remember to re-enable with proper policies later
```

### 3. Authentication Errors 🟡

**Error Messages:**

- "Invalid login credentials"
- "Email not confirmed"
- "User not found"
- "Token has expired"
- "Invalid refresh token"

**Root Causes:**

- Incorrect email/password combination
- Unconfirmed email address
- Expired session tokens
- Account doesn't exist

**Solutions:**

#### Invalid Credentials

```javascript
// Check for typos in email/password
// Verify Caps Lock is not enabled
// Try password reset if needed
const { error } = await supabase.auth.resetPasswordForEmail(email);
```

#### Email Not Confirmed

```javascript
// Resend confirmation email
const { error } = await supabase.auth.resend({
  type: 'signup',
  email: email,
});
```

#### Session Expired

```javascript
// Refresh session
const { data, error } = await supabase.auth.refreshSession();
if (error) {
  // Force re-login
  await supabase.auth.signOut();
  // Redirect to login page
}
```

#### Account Management

```javascript
// Check if user exists (admin only)
const { data: users } = await supabase.auth.admin.listUsers();
const userExists = users.users.find(u => u.email === email);
```

### 4. Network Errors 🟠

**Error Messages:**

- "network error"
- "connection failed"
- "timeout"
- "unreachable"
- "offline"

**Root Causes:**

- Internet connectivity issues
- VPN interference
- Firewall blocking requests
- DNS resolution problems
- Supabase service outage

**Solutions:**

#### Step 1: Basic Connectivity Check

```javascript
// Test internet connection
fetch('https://www.google.com', { mode: 'no-cors' })
  .then(() => console.log('Internet OK'))
  .catch(() => console.log('Internet DOWN'));
```

#### Step 2: DNS Resolution

```bash
# Test DNS resolution
nslookup iugjtokydvbcvmrpeziv.supabase.co
```

#### Step 3: VPN/Proxy Issues

- Temporarily disable VPN
- Check corporate firewall settings
- Try different network (mobile hotspot)

#### Step 4: Service Status

- Check Supabase Status: https://status.supabase.com/
- Monitor for service outages

### 5. Rate Limiting Errors 🟠

**Error Messages:**

- "too many requests"
- "rate limit exceeded"
- "quota exceeded"
- "throttled"

**Root Causes:**

- Excessive API requests
- Rapid authentication attempts
- Bulk operations without throttling
- Shared IP limits

**Solutions:**

#### Step 1: Implement Exponential Backoff

```javascript
const retryWithBackoff = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.message.includes('rate limit') && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        continue;
      }
      throw error;
    }
  }
};
```

#### Step 2: Batch Operations

```javascript
// Instead of individual requests
const users = await Promise.all(
  emails.map(email => supabase.from('users').select('*').eq('email', email))
);

// Use batch queries
const { data: users } = await supabase.from('users').select('*').in('email', emails);
```

#### Step 3: Caching Strategy

```javascript
// Cache frequently accessed data
const userCache = new Map();

const getUser = async id => {
  if (userCache.has(id)) {
    return userCache.get(id);
  }

  const { data } = await supabase.from('users').select('*').eq('id', id);
  userCache.set(id, data);
  return data;
};
```

## 🔍 Debugging Tools

### 1. Browser Developer Tools

```javascript
// Enable verbose logging
localStorage.setItem('supabase.debug', 'true');

// Check network requests
// Open DevTools → Network tab → Filter by "supabase"
```

### 2. Supabase Client Debug Mode

```javascript
// Enable debug mode in supabaseClient.ts
const supabase = createClient(url, key, {
  auth: {
    debug: true, // Enable auth debugging
  },
});
```

### 3. Error Handler Testing

```javascript
// Test error handling system
import { debugErrorHandling } from './src/lib/supabaseErrorHandler';
debugErrorHandling(); // Runs test cases for all error types
```

### 4. Connection Testing

```javascript
// Test various connection aspects
import { testSupabaseConnection } from './src/lib/supabaseClient';
import { testConnection } from './src/lib/apiService';

// Test basic connection
testSupabaseConnection().then(console.log);

// Test API service connection
testConnection().then(console.log);
```

## 🛠️ Environment Configuration

### Development Environment

```bash
# .env.development
VITE_SUPABASE_URL=https://iugjtokydvbcvmrpeziv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NODE_ENV=development
```

### Production Environment

```bash
# .env.production
VITE_SUPABASE_URL=https://iugjtokydvbcvmrpeziv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NODE_ENV=production
```

### Netlify Configuration

```toml
# netlify.toml
[build.environment]
  VITE_SUPABASE_URL = "https://iugjtokydvbcvmrpeziv.supabase.co"
  VITE_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 📊 Monitoring & Logging

### 1. Error Tracking

```javascript
// Custom error tracking
window.addEventListener('unhandledrejection', event => {
  if (event.reason?.message?.includes('supabase')) {
    console.error('Unhandled Supabase error:', event.reason);
    // Send to error tracking service
  }
});
```

### 2. Performance Monitoring

```javascript
// Track API response times
const startTime = Date.now();
const { data, error } = await supabase.from('table').select('*');
const duration = Date.now() - startTime;
console.log(`Query took ${duration}ms`);
```

### 3. Auth State Monitoring

```javascript
// Monitor authentication state changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event, {
    hasSession: !!session,
    userId: session?.user?.id,
    timestamp: new Date().toISOString(),
  });
});
```

## 🚀 Best Practices

### 1. Error Handling

- ✅ Always wrap Supabase calls in try-catch blocks
- ✅ Use the centralized error handler for consistent UX
- ✅ Provide specific error messages for different scenarios
- ✅ Log errors with context for debugging

### 2. Authentication

- ✅ Check authentication status before protected operations
- ✅ Handle session expiration gracefully
- ✅ Implement proper logout cleanup
- ✅ Use appropriate session persistence settings

### 3. Performance

- ✅ Cache frequently accessed data
- ✅ Use batch operations for multiple requests
- ✅ Implement proper loading states
- ✅ Add retry logic for transient failures

### 4. Security

- ✅ Never expose service role keys in client code
- ✅ Implement proper RLS policies
- ✅ Validate user input before database operations
- ✅ Use secure session storage

## 📞 Getting Help

### 1. Check Logs

```bash
# View browser console logs
# Filter by "Supabase", "Auth", or "Error"
```

### 2. Test Connection

```javascript
// Run connection tests
testSupabaseConnection();
testConnection();
```

### 3. Review Configuration

```javascript
// Check environment variables
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Anon Key Length:', import.meta.env.VITE_SUPABASE_ANON_KEY?.length);
```

### 4. Community Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/supabase)

## 🔄 Update History

- **v1.0.0** - Initial comprehensive error handling system
- **v1.1.0** - Added CORS and RLS specific solutions
- **v1.2.0** - Enhanced authentication error handling
- **v1.3.0** - Added network error diagnostics and rate limiting solutions

---

_This guide is automatically updated as new error patterns are discovered and solutions are implemented._
