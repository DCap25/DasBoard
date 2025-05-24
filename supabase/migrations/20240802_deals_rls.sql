-- Enable Row Level Security on deals table
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- Create RLS policy: Salespeople can only see their own deals
CREATE POLICY deals_salesperson_select
  ON deals
  FOR SELECT
  USING (
    salesperson_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND (role IN ('sales_manager', 'general_manager', 'admin'))
    )
  );

-- Create RLS policy: Salespeople can only insert their own deals
CREATE POLICY deals_salesperson_insert
  ON deals
  FOR INSERT
  WITH CHECK (
    salesperson_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (role IN ('sales_manager', 'general_manager', 'admin'))
    )
  );

-- Create RLS policy: Salespeople can only update their own deals, but limited fields
CREATE POLICY deals_salesperson_update
  ON deals
  FOR UPDATE
  USING (
    salesperson_id = auth.uid() AND
    NOT EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (role IN ('sales_manager', 'general_manager', 'admin'))
    )
  )
  WITH CHECK (
    salesperson_id = auth.uid() AND
    NOT EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (role IN ('sales_manager', 'general_manager', 'admin'))
    )
  );

-- Create RLS policy: Sales managers can update specific deal fields
CREATE POLICY deals_manager_update
  ON deals
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (role IN ('sales_manager', 'general_manager', 'admin'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (role IN ('sales_manager', 'general_manager', 'admin'))
    )
  );

-- Create function to validate manager updates to ensure they only update allowed fields
CREATE OR REPLACE FUNCTION validate_deal_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the current user is a sales manager or general manager 
  -- but not an admin (admins can update anything)
  IF EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('sales_manager', 'general_manager')
    AND role != 'admin'
  ) THEN
    -- Sales managers can only update front_end_gross and status
    IF (
      (OLD.customer_name != NEW.customer_name) OR
      (OLD.vehicle != NEW.vehicle) OR
      (OLD.sale_date != NEW.sale_date) OR
      (OLD.back_end_gross != NEW.back_end_gross) OR
      (OLD.salesperson_id != NEW.salesperson_id)
    ) THEN
      RAISE EXCEPTION 'Sales Managers can only update front_end_gross and status fields';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce the validation on deal updates
CREATE TRIGGER deals_update_validation
  BEFORE UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION validate_deal_update();

-- Comment on the policies and functions for documentation
COMMENT ON POLICY deals_salesperson_select ON deals IS 'Salespeople can only view their own deals, managers can view all deals';
COMMENT ON POLICY deals_salesperson_insert ON deals IS 'Salespeople can only create their own deals, managers can create any deal';
COMMENT ON POLICY deals_salesperson_update ON deals IS 'Salespeople can only update their own deals';
COMMENT ON POLICY deals_manager_update ON deals IS 'Sales managers, general managers, and admins can update any deal';
COMMENT ON FUNCTION validate_deal_update() IS 'Enforces that sales managers can only update the front_end_gross and status fields'; 