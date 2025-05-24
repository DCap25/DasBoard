-- Function to handle a new finance manager subscription
CREATE OR REPLACE FUNCTION public.handle_finance_manager_subscription(
  p_user_id UUID,
  p_subscription_id TEXT DEFAULT NULL,
  p_is_trial BOOLEAN DEFAULT FALSE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_schema_name TEXT;
  v_mapping_id UUID;
BEGIN
  -- Generate a unique schema name for this finance manager
  v_schema_name := 'finance_mgr_' || SUBSTR(MD5(p_user_id::TEXT), 1, 8);
  
  -- Log the subscription start
  INSERT INTO public.subscription_events (
    user_id,
    event_type,
    subscription_id,
    tier,
    is_trial,
    details
  ) VALUES (
    p_user_id,
    'subscription_started',
    p_subscription_id,
    'finance_manager_only',
    p_is_trial,
    jsonb_build_object(
      'schema_name', v_schema_name,
      'started_at', NOW(),
      'trial_ends_at', CASE WHEN p_is_trial THEN NOW() + INTERVAL '30 days' ELSE NULL END
    )
  );
  
  -- Create entry in schema_user_mappings
  INSERT INTO public.schema_user_mappings (
    user_id,
    schema_name,
    schema_type
  ) VALUES (
    p_user_id,
    v_schema_name,
    'finance_manager'
  ) RETURNING id INTO v_mapping_id;
  
  -- Create the schema and tables
  PERFORM public.create_schema_with_tables(v_schema_name, p_user_id);
  
  RETURN v_mapping_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error processing finance manager subscription: %', SQLERRM;
END;
$$;

-- Function to check if a trial period has expired
CREATE OR REPLACE FUNCTION public.check_finance_manager_trial_status(
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_trial_start TIMESTAMP WITH TIME ZONE;
  v_has_active_subscription BOOLEAN;
BEGIN
  -- Find the most recent trial start event
  SELECT 
    (details->>'started_at')::TIMESTAMP WITH TIME ZONE INTO v_trial_start
  FROM public.subscription_events
  WHERE user_id = p_user_id
    AND event_type = 'subscription_started'
    AND tier = 'finance_manager_only'
    AND is_trial = TRUE
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Check if there's an active paid subscription
  SELECT EXISTS (
    SELECT 1
    FROM public.subscription_events
    WHERE user_id = p_user_id
      AND event_type = 'subscription_started'
      AND tier = 'finance_manager_only'
      AND is_trial = FALSE
      AND NOT EXISTS (
        SELECT 1
        FROM public.subscription_events se2
        WHERE se2.user_id = p_user_id
          AND se2.event_type = 'subscription_ended'
          AND se2.subscription_id = subscription_events.subscription_id
      )
  ) INTO v_has_active_subscription;
  
  -- If they have a paid subscription, trial status doesn't matter
  IF v_has_active_subscription THEN
    RETURN FALSE;
  END IF;
  
  -- If they have no trial start, they're not in trial
  IF v_trial_start IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if the trial has expired (30 days)
  RETURN v_trial_start + INTERVAL '30 days' > NOW();
END;
$$;

-- Create a table to track subscription events
CREATE TABLE IF NOT EXISTS public.subscription_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('subscription_started', 'subscription_updated', 'subscription_ended')),
  subscription_id TEXT,
  tier TEXT NOT NULL,
  is_trial BOOLEAN DEFAULT FALSE,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_subscription_events_user_id ON public.subscription_events(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_subscription_id ON public.subscription_events(subscription_id);

-- Enable RLS
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription events
CREATE POLICY select_own_subscription_events
  ON public.subscription_events
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role / admin access for insert, update, delete
CREATE POLICY admin_subscription_events_all
  ON public.subscription_events
  USING (auth.jwt() ->> 'role' = 'service_role'); 