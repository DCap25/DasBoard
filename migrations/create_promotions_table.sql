-- Create promotions table to track promotional pricing changes
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tier TEXT NOT NULL,
  original_price DECIMAL(10, 2) NOT NULL,
  promo_price DECIMAL(10, 2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE, -- NULL indicates open-ended promotion
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Add comment for the table
COMMENT ON TABLE promotions IS 'Tracks promotional pricing changes for subscription tiers';

-- Add RLS policies for the promotions table
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can view promotions
CREATE POLICY "Authenticated users can view promotions" 
ON promotions FOR SELECT 
TO authenticated
USING (true);

-- Only admin users can create, update, delete promotions
CREATE POLICY "Admin users can manage promotions" 
ON promotions FOR ALL 
TO authenticated
USING (auth.uid() IN (
  SELECT id FROM profiles WHERE role = 'master_admin'
));

-- Add promo_applied column to signup_requests table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'signup_requests' AND column_name = 'promo_applied'
  ) THEN
    ALTER TABLE signup_requests ADD COLUMN promo_applied BOOLEAN DEFAULT false;
    COMMENT ON COLUMN signup_requests.promo_applied IS 'Indicates if promotional pricing was applied to this signup';
  END IF;
END $$;

-- Insert current promotion for Finance Manager Only tier
INSERT INTO promotions (tier, original_price, promo_price, start_date, description)
VALUES 
('finance_manager_only', 5.00, 0.00, '2025-05-18', 'Finance Manager Only - Free for a limited time'); 