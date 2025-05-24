-- Create dealer groups table
CREATE TABLE IF NOT EXISTS dealer_groups (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add dealer_group_id to dealerships table
ALTER TABLE dealerships 
ADD COLUMN IF NOT EXISTS dealer_group_id INT REFERENCES dealer_groups(id);

-- Create index on dealer_group_id for faster queries
CREATE INDEX IF NOT EXISTS idx_dealerships_dealer_group_id ON dealerships(dealer_group_id);

-- Create dealer_group_admins table to track which admins manage which groups
CREATE TABLE IF NOT EXISTS dealer_group_admins (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  dealer_group_id INT REFERENCES dealer_groups(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, dealer_group_id)
);

-- Create a view for convenient access to all dealerships a group admin can access
CREATE OR REPLACE VIEW group_admin_dealerships AS
SELECT 
  dga.user_id AS admin_id,
  d.id AS dealership_id,
  d.name AS dealership_name,
  d.schema_name,
  dg.id AS dealer_group_id,
  dg.name AS dealer_group_name
FROM 
  dealer_group_admins dga
  JOIN dealer_groups dg ON dga.dealer_group_id = dg.id
  JOIN dealerships d ON d.dealer_group_id = dg.id;

-- Add an enum for the role that includes dealer_group_admin
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM (
      'salesperson', 
      'finance_manager', 
      'sales_manager', 
      'general_manager', 
      'dealership_admin',
      'dealer_group_admin',
      'admin'
    );
  ELSE
    -- If the type already exists, we need to add the new value if it doesn't exist
    BEGIN
      ALTER TYPE user_role ADD VALUE 'dealer_group_admin' IF NOT EXISTS;
    EXCEPTION
      WHEN duplicate_object THEN
        -- Type value already exists, do nothing
    END;
  END IF;
END $$;

-- Add functions for aggregating data across dealerships within a group

-- Function to get all sales staff ranked by performance across a dealer group
CREATE OR REPLACE FUNCTION get_dealer_group_sales_staff_ranking(group_id INT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  dealership_id INT,
  dealership_name TEXT,
  performance_score NUMERIC,
  deals_closed INT,
  revenue_generated NUMERIC
) AS $$
DECLARE
  dealership_rec RECORD;
  schema_name TEXT;
BEGIN
  -- Loop through all dealerships in the group
  FOR dealership_rec IN 
    SELECT d.id, d.name, d.schema_name 
    FROM dealerships d 
    WHERE d.dealer_group_id = group_id
  LOOP
    schema_name := dealership_rec.schema_name;
    
    -- This uses dynamic SQL to query across schemas
    -- In a real implementation, you might create a function in each schema
    -- or implement a more robust cross-schema query mechanism
    RETURN QUERY EXECUTE format('
      SELECT 
        s.id,
        s.name,
        s.email,
        %L::INT AS dealership_id,
        %L::TEXT AS dealership_name,
        s.performance_score,
        s.deals_closed,
        s.revenue_generated
      FROM %I.staff s
      WHERE s.role = ''salesperson''
    ', dealership_rec.id, dealership_rec.name, schema_name);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to get all finance staff ranked by performance across a dealer group
CREATE OR REPLACE FUNCTION get_dealer_group_finance_staff_ranking(group_id INT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  dealership_id INT,
  dealership_name TEXT,
  performance_score NUMERIC,
  deals_closed INT,
  revenue_generated NUMERIC
) AS $$
DECLARE
  dealership_rec RECORD;
  schema_name TEXT;
BEGIN
  -- Loop through all dealerships in the group
  FOR dealership_rec IN 
    SELECT d.id, d.name, d.schema_name 
    FROM dealerships d 
    WHERE d.dealer_group_id = group_id
  LOOP
    schema_name := dealership_rec.schema_name;
    
    RETURN QUERY EXECUTE format('
      SELECT 
        s.id,
        s.name,
        s.email,
        %L::INT AS dealership_id,
        %L::TEXT AS dealership_name,
        s.performance_score,
        s.deals_closed,
        s.revenue_generated
      FROM %I.staff s
      WHERE s.role = ''finance_manager''
    ', dealership_rec.id, dealership_rec.name, schema_name);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get dealer group stats
CREATE OR REPLACE FUNCTION get_dealer_group_stats(group_id INT)
RETURNS TABLE (
  total_sales INT,
  total_revenue NUMERIC,
  avg_deal_time NUMERIC,
  top_performer TEXT,
  dealership_count INT
) AS $$
DECLARE
  dealership_count INT;
  total_sales INT := 0;
  total_revenue NUMERIC := 0;
  avg_deal_time NUMERIC := 0;
  top_performer TEXT := '';
  dealership_rec RECORD;
  schema_name TEXT;
  dealership_sales INT;
  dealership_revenue NUMERIC;
  dealership_avg_time NUMERIC;
  best_score NUMERIC := 0;
BEGIN
  -- Get dealership count
  SELECT COUNT(*) INTO dealership_count 
  FROM dealerships 
  WHERE dealer_group_id = group_id;
  
  -- Loop through all dealerships to aggregate stats
  FOR dealership_rec IN 
    SELECT d.id, d.name, d.schema_name 
    FROM dealerships d 
    WHERE d.dealer_group_id = group_id
  LOOP
    schema_name := dealership_rec.schema_name;
    
    -- Get sales count for this dealership
    EXECUTE format('
      SELECT COUNT(*) 
      FROM %I.deals 
      WHERE status = ''closed'' AND created_at >= NOW() - INTERVAL ''30 days''
    ', schema_name) INTO dealership_sales;
    
    total_sales := total_sales + COALESCE(dealership_sales, 0);
    
    -- Get revenue for this dealership
    EXECUTE format('
      SELECT COALESCE(SUM(total_amount), 0) 
      FROM %I.deals 
      WHERE status = ''closed'' AND created_at >= NOW() - INTERVAL ''30 days''
    ', schema_name) INTO dealership_revenue;
    
    total_revenue := total_revenue + COALESCE(dealership_revenue, 0);
    
    -- Calculate a score for this dealership to determine top performer
    -- This is a simple example - in reality you'd have a more complex scoring algorithm
    IF dealership_sales > 0 AND dealership_revenue > best_score THEN
      best_score := dealership_revenue;
      top_performer := dealership_rec.name;
    END IF;
    
    -- Get average deal time for this dealership
    EXECUTE format('
      SELECT AVG(EXTRACT(EPOCH FROM (closed_at - created_at))/86400) 
      FROM %I.deals 
      WHERE status = ''closed'' AND created_at >= NOW() - INTERVAL ''30 days''
    ', schema_name) INTO dealership_avg_time;
    
    -- Sum up the average times weighted by deal count
    avg_deal_time := avg_deal_time + COALESCE(dealership_avg_time * dealership_sales, 0);
  END LOOP;
  
  -- Calculate overall average deal time
  IF total_sales > 0 THEN
    avg_deal_time := avg_deal_time / total_sales;
  ELSE
    avg_deal_time := 0;
  END IF;
  
  -- Return a single row with the aggregated stats
  RETURN QUERY SELECT 
    total_sales, 
    total_revenue, 
    avg_deal_time, 
    top_performer, 
    dealership_count;
END;
$$ LANGUAGE plpgsql; 