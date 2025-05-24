-- Create a secure function to update pay plans that enforces admin-only access
CREATE OR REPLACE FUNCTION update_pay_plan(
  p_role_id TEXT,
  p_front_end_percent NUMERIC,
  p_back_end_percent NUMERIC,
  p_csi_bonus NUMERIC,
  p_demo_allowance NUMERIC,
  p_vsc_bonus NUMERIC,
  p_ppm_bonus NUMERIC,
  p_volume_bonus JSONB
) RETURNS VOID AS $$
DECLARE
  v_user_role TEXT;
  v_updated_at TIMESTAMP;
BEGIN
  -- Get the current user's role
  SELECT role INTO v_user_role 
  FROM profiles 
  WHERE id = auth.uid();
  
  -- Check if user is an admin
  IF v_user_role != 'admin' THEN
    RAISE EXCEPTION 'Access denied: Only administrators can modify pay plans';
  END IF;
  
  v_updated_at := NOW();
  
  -- Insert or update the pay plan
  INSERT INTO pay_plans (
    role_id,
    front_end_percent,
    back_end_percent,
    csi_bonus,
    demo_allowance,
    vsc_bonus,
    ppm_bonus,
    volume_bonus,
    updated_by,
    updated_at
  ) VALUES (
    p_role_id,
    p_front_end_percent,
    p_back_end_percent,
    p_csi_bonus,
    p_demo_allowance,
    p_vsc_bonus,
    p_ppm_bonus,
    p_volume_bonus,
    auth.uid(),
    v_updated_at
  ) ON CONFLICT (role_id) DO UPDATE SET
    front_end_percent = p_front_end_percent,
    back_end_percent = p_back_end_percent,
    csi_bonus = p_csi_bonus,
    demo_allowance = p_demo_allowance,
    vsc_bonus = p_vsc_bonus,
    ppm_bonus = p_ppm_bonus,
    volume_bonus = p_volume_bonus,
    updated_by = auth.uid(),
    updated_at = v_updated_at;
    
  -- Log the change for audit purposes
  INSERT INTO audit_logs (
    table_name,
    record_id,
    action,
    changed_by,
    changed_at,
    old_data,
    new_data
  ) VALUES (
    'pay_plans',
    p_role_id,
    'UPDATE',
    auth.uid(),
    v_updated_at,
    NULL, -- Could fetch old data if needed
    jsonb_build_object(
      'role_id', p_role_id,
      'front_end_percent', p_front_end_percent,
      'back_end_percent', p_back_end_percent,
      'csi_bonus', p_csi_bonus,
      'demo_allowance', p_demo_allowance,
      'vsc_bonus', p_vsc_bonus,
      'ppm_bonus', p_ppm_bonus,
      'volume_bonus', p_volume_bonus
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  action TEXT NOT NULL,
  changed_by UUID NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  old_data JSONB,
  new_data JSONB
);

-- Set up RLS for pay_plans table
ALTER TABLE pay_plans ENABLE ROW LEVEL SECURITY;

-- RLS policy: Only admins can see pay plans
CREATE POLICY pay_plans_view_policy 
  ON pay_plans
  FOR SELECT
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- RLS policy: Only the secure function can modify pay plans
CREATE POLICY pay_plans_modify_policy 
  ON pay_plans
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Set up RLS for profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS policy: Users can view all profiles
CREATE POLICY profiles_view_policy
  ON profiles
  FOR SELECT
  USING (true);

-- RLS policy: Only admins can modify profiles
CREATE POLICY profiles_modify_policy
  ON profiles
  FOR INSERT UPDATE DELETE
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Set up RLS for roles table
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- RLS policy: Everyone can view roles
CREATE POLICY roles_view_policy
  ON roles
  FOR SELECT
  USING (true);

-- RLS policy: Only admins can modify roles
CREATE POLICY roles_modify_policy
  ON roles
  FOR INSERT UPDATE DELETE
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Comment on the function to document its purpose
COMMENT ON FUNCTION update_pay_plan IS 'Securely updates pay plans with role-based access control and audit logging'; 