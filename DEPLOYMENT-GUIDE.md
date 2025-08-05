# Security Features Deployment Guide

Since automated deployment requires authentication that's not available in this environment, please follow these manual steps to deploy the security features to your Supabase project.

## 🎯 Quick Start

**Your Supabase Project**: `iugjtokydvbcvmrpeziv`  
**Dashboard URL**: https://app.supabase.com/project/iugjtokydvbcvmrpeziv

---

## 📋 Step 1: Deploy Database Migrations

### 1.1 Open Supabase SQL Editor
1. Go to https://app.supabase.com/project/iugjtokydvbcvmrpeziv
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### 1.2 Run Rate Limiting Migration

Copy and paste the following SQL:

```sql
-- Create rate_limits table for server-side rate limiting
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL,
    attempts INTEGER DEFAULT 0,
    blocked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON public.rate_limits(key);
CREATE INDEX IF NOT EXISTS idx_rate_limits_blocked_until ON public.rate_limits(blocked_until);

-- Enable RLS on rate_limits table
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role full access
CREATE POLICY "Service role can manage rate limits" ON public.rate_limits
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create a function to clean up old rate limit entries
CREATE OR REPLACE FUNCTION clean_old_rate_limits()
RETURNS void AS $$
BEGIN
    DELETE FROM public.rate_limits
    WHERE created_at < NOW() - INTERVAL '24 hours'
    AND (blocked_until IS NULL OR blocked_until < NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Click "Run" to execute this migration.**

### 1.3 Run RLS Security Migration

Create another new query and run:

```sql
-- Enable Row Level Security (RLS) on all tables
-- This ensures data access is properly controlled based on user authentication and authorization

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role can manage all profiles" ON public.profiles
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create audit log table for security events
CREATE TABLE IF NOT EXISTS public.security_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    event_type TEXT NOT NULL,
    table_name TEXT,
    record_id TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Service role can insert audit logs
CREATE POLICY "Service role can insert audit logs" ON public.security_audit_log
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON public.security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_event_type ON public.security_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON public.security_audit_log(created_at);
```

**Click "Run" to execute this migration.**

---

## ⚡ Step 2: Deploy Edge Function for Rate Limiting

### 2.1 Navigate to Edge Functions
1. In your Supabase Dashboard, go to **Edge Functions**
2. Click **Create Function**
3. Name it: `rate-limiter`

### 2.2 Copy the Rate Limiter Code

Replace the default function code with:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  blockDurationMs: number
}

const rateLimitConfigs: Record<string, RateLimitConfig> = {
  signIn: { windowMs: 15 * 60 * 1000, maxRequests: 5, blockDurationMs: 15 * 60 * 1000 },
  signUp: { windowMs: 10 * 60 * 1000, maxRequests: 3, blockDurationMs: 30 * 60 * 1000 },
  passwordReset: { windowMs: 5 * 60 * 1000, maxRequests: 3, blockDurationMs: 10 * 60 * 1000 },
  api: { windowMs: 1 * 60 * 1000, maxRequests: 30, blockDurationMs: 5 * 60 * 1000 },
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { action, identifier } = await req.json()
    
    if (!action || !identifier) {
      return new Response(
        JSON.stringify({ error: 'Missing action or identifier' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const config = rateLimitConfigs[action] || rateLimitConfigs.api
    const now = Date.now()
    const key = `rate_limit:${action}:${identifier}`

    // Get existing rate limit data
    const { data: existingData } = await supabaseClient
      .from('rate_limits')
      .select('*')
      .eq('key', key)
      .single()

    if (existingData) {
      // Check if blocked
      if (existingData.blocked_until && new Date(existingData.blocked_until).getTime() > now) {
        return new Response(
          JSON.stringify({
            limited: true,
            retryAfterMs: new Date(existingData.blocked_until).getTime() - now,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        )
      }

      // Check if window expired
      const windowStart = new Date(existingData.window_start).getTime()
      if (now - windowStart > config.windowMs) {
        // Reset window
        await supabaseClient
          .from('rate_limits')
          .update({
            window_start: new Date(now).toISOString(),
            attempts: 1,
            blocked_until: null,
          })
          .eq('key', key)

        return new Response(
          JSON.stringify({
            limited: false,
            remainingAttempts: config.maxRequests - 1,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Check if limit exceeded
      if (existingData.attempts >= config.maxRequests) {
        // Block the user
        const blockedUntil = new Date(now + config.blockDurationMs).toISOString()
        await supabaseClient
          .from('rate_limits')
          .update({
            blocked_until: blockedUntil,
          })
          .eq('key', key)

        return new Response(
          JSON.stringify({
            limited: true,
            retryAfterMs: config.blockDurationMs,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        )
      }

      // Increment attempts
      await supabaseClient
        .from('rate_limits')
        .update({
          attempts: existingData.attempts + 1,
        })
        .eq('key', key)

      return new Response(
        JSON.stringify({
          limited: false,
          remainingAttempts: config.maxRequests - existingData.attempts - 1,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      // Create new rate limit entry
      await supabaseClient
        .from('rate_limits')
        .insert({
          key,
          window_start: new Date(now).toISOString(),
          attempts: 1,
        })

      return new Response(
        JSON.stringify({
          limited: false,
          remainingAttempts: config.maxRequests - 1,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
```

### 2.3 Deploy the Function
1. Click **Save and Deploy**
2. Wait for deployment to complete
3. Note the function URL (you'll see it in the dashboard)

---

## 🔍 Step 3: Verify Deployment

### 3.1 Check Database Tables
In the Supabase Dashboard:
1. Go to **Table Editor**
2. Verify these tables exist:
   - `rate_limits`
   - `security_audit_log`
3. Check that RLS is enabled (you'll see a shield icon)

### 3.2 Test Rate Limiting Function
1. Go to **Edge Functions**
2. Click on `rate-limiter`
3. Use the **Invoke** button to test with:
```json
{
  "action": "signIn",
  "identifier": "test@example.com"
}
```

### 3.3 Test in Your Application
1. Deploy your updated application
2. Try making multiple failed login attempts
3. You should be rate limited after 5 attempts

---

## 🎯 Step 4: Final Configuration

### 4.1 Enable Additional RLS (Optional)
If you have other tables like `dealerships`, run:

```sql
-- Enable RLS on dealerships table
ALTER TABLE public.dealerships ENABLE ROW LEVEL SECURITY;

-- Users can view dealerships they belong to
CREATE POLICY "Users can view dealerships they belong to" ON public.dealerships
    FOR SELECT
    TO authenticated
    USING (
        id IN (
            SELECT dealership_id 
            FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

-- Service role can manage all dealerships
CREATE POLICY "Service role can manage all dealerships" ON public.dealerships
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
```

### 4.2 Set Up Monitoring
1. **Database Logs**: Check Supabase Logs for RLS violations
2. **Function Logs**: Monitor Edge Function logs for rate limiting
3. **Security Audit**: Check `security_audit_log` table regularly

---

## ✅ Verification Checklist

- [ ] **Rate Limits Table**: Created and RLS enabled
- [ ] **Security Audit Log**: Created and accessible
- [ ] **RLS on Profiles**: Enabled with proper policies
- [ ] **Edge Function**: `rate-limiter` deployed and working
- [ ] **Application Testing**: Rate limiting works in browser
- [ ] **Security Headers**: Deployed via `_headers` file

---

## 🚨 Troubleshooting

### Common Issues:

1. **"relation does not exist"**
   - Make sure you ran all SQL migrations
   - Check table names are correct

2. **"RLS policy violated"**
   - Verify RLS policies are created correctly
   - Check user authentication in your app

3. **"Function not found"**
   - Ensure Edge Function is deployed
   - Check function name is exactly `rate-limiter`

4. **Rate limiting not working**
   - Verify Edge Function is being called in your app
   - Check network requests in browser dev tools

---

## 📞 Support

If you encounter issues:
1. Check Supabase Dashboard logs
2. Verify all SQL statements executed successfully
3. Test each component individually
4. Review the SECURITY.md file for detailed configuration

---

**🎉 Once completed, your application will have enterprise-grade security with:**
- ✅ Server-side rate limiting
- ✅ Database-level access controls (RLS)
- ✅ Security audit logging
- ✅ Dynamic encryption key management
- ✅ Comprehensive security headers

**Estimated deployment time: 15-20 minutes**