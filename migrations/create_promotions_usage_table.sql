-- Create promotions_usage table to track users benefiting from promotions
CREATE TABLE IF NOT EXISTS promotions_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  promotion_tier TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  schema_name TEXT, -- For finance manager schemas
  dealership_id INTEGER REFERENCES dealerships(id), -- For dealership promotions
  signup_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add comment for the table
COMMENT ON TABLE promotions_usage IS 'Tracks users who have taken advantage of promotional pricing';

-- Add RLS policies for the promotions_usage table
ALTER TABLE promotions_usage ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can view promotions_usage
CREATE POLICY "Authenticated users can view promotions_usage" 
ON promotions_usage FOR SELECT 
TO authenticated
USING (true);

-- Only admin users can create, update, delete promotions_usage
CREATE POLICY "Admin users can manage promotions_usage" 
ON promotions_usage FOR ALL 
TO authenticated
USING (auth.uid() IN (
  SELECT id FROM profiles WHERE role = 'master_admin'
));

-- Add columns to subscription_events table to track promotions if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'subscription_events' AND column_name = 'is_promotional'
  ) THEN
    ALTER TABLE subscription_events ADD COLUMN is_promotional BOOLEAN DEFAULT false;
    COMMENT ON COLUMN subscription_events.is_promotional IS 'Indicates if promotional pricing was applied to this subscription event';
  END IF;

  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'subscription_events' AND column_name = 'original_amount'
  ) THEN
    ALTER TABLE subscription_events ADD COLUMN original_amount DECIMAL(10, 2);
    COMMENT ON COLUMN subscription_events.original_amount IS 'The original price before promotional discount';
  END IF;
END $$; 