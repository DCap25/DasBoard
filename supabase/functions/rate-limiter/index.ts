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