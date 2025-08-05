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

-- Create a scheduled job to clean up old entries (requires pg_cron extension)
-- Note: This needs to be set up in Supabase dashboard or via API
-- SELECT cron.schedule('clean-rate-limits', '0 */6 * * *', 'SELECT clean_old_rate_limits();');