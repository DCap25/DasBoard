-- Function to create a new schema with tables for a Finance Manager
CREATE OR REPLACE FUNCTION public.create_schema_with_tables(
  p_schema_name TEXT,
  p_user_id UUID
) RETURNS VOID AS $$
DECLARE
BEGIN
  -- Create the schema
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I;', p_schema_name);
  
  -- Create the deals table
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.deals (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id),
      deal_amount DECIMAL(12,2) NOT NULL,
      vsc_sold BOOLEAN NOT NULL DEFAULT false,
      product_profit DECIMAL(12,2) NOT NULL DEFAULT 0,
      deal_details JSONB DEFAULT ''{}''::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  ', p_schema_name);
  
  -- Enable Row Level Security
  EXECUTE format('ALTER TABLE %I.deals ENABLE ROW LEVEL SECURITY;', p_schema_name);
  
  -- Create RLS policies
  -- Allow users to select their own deals
  EXECUTE format('
    CREATE POLICY "Users can view their own deals"
    ON %I.deals
    FOR SELECT
    USING (user_id = auth.uid());
  ', p_schema_name);
  
  -- Allow users to insert their own deals
  EXECUTE format('
    CREATE POLICY "Users can insert their own deals"
    ON %I.deals
    FOR INSERT
    WITH CHECK (user_id = auth.uid());
  ', p_schema_name);
  
  -- Allow users to update their own deals
  EXECUTE format('
    CREATE POLICY "Users can update their own deals"
    ON %I.deals
    FOR UPDATE
    USING (user_id = auth.uid());
  ', p_schema_name);
  
  -- Create updated_at trigger
  EXECUTE format('
    CREATE OR REPLACE FUNCTION %I.set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  ', p_schema_name);
  
  EXECUTE format('
    CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON %I.deals
    FOR EACH ROW
    EXECUTE FUNCTION %I.set_updated_at();
  ', p_schema_name, p_schema_name);
  
  -- Add schema_user_access entry
  INSERT INTO public.schema_user_access (user_id, schema_name)
  VALUES (p_user_id, p_schema_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create just the deals table in a schema
CREATE OR REPLACE FUNCTION public.create_deals_table(
  p_schema_name TEXT
) RETURNS VOID AS $$
BEGIN
  -- Create the deals table
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.deals (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id),
      deal_amount DECIMAL(12,2) NOT NULL,
      vsc_sold BOOLEAN NOT NULL DEFAULT false,
      product_profit DECIMAL(12,2) NOT NULL DEFAULT 0,
      deal_details JSONB DEFAULT ''{}''::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  ', p_schema_name);
  
  -- Create updated_at trigger
  EXECUTE format('
    CREATE OR REPLACE FUNCTION %I.set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  ', p_schema_name);
  
  EXECUTE format('
    DROP TRIGGER IF EXISTS set_updated_at ON %I.deals;
    CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON %I.deals
    FOR EACH ROW
    EXECUTE FUNCTION %I.set_updated_at();
  ', p_schema_name, p_schema_name, p_schema_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set up RLS policies for the deals table
CREATE OR REPLACE FUNCTION public.setup_deals_rls_policies(
  p_schema_name TEXT,
  p_user_id UUID
) RETURNS VOID AS $$
BEGIN
  -- Enable Row Level Security
  EXECUTE format('ALTER TABLE %I.deals ENABLE ROW LEVEL SECURITY;', p_schema_name);
  
  -- Drop existing policies if they exist
  EXECUTE format('DROP POLICY IF EXISTS "Users can view their own deals" ON %I.deals;', p_schema_name);
  EXECUTE format('DROP POLICY IF EXISTS "Users can insert their own deals" ON %I.deals;', p_schema_name);
  EXECUTE format('DROP POLICY IF EXISTS "Users can update their own deals" ON %I.deals;', p_schema_name);
  
  -- Create RLS policies
  -- Allow users to select their own deals
  EXECUTE format('
    CREATE POLICY "Users can view their own deals"
    ON %I.deals
    FOR SELECT
    USING (user_id = auth.uid());
  ', p_schema_name);
  
  -- Allow users to insert their own deals
  EXECUTE format('
    CREATE POLICY "Users can insert their own deals"
    ON %I.deals
    FOR INSERT
    WITH CHECK (user_id = auth.uid());
  ', p_schema_name);
  
  -- Allow users to update their own deals
  EXECUTE format('
    CREATE POLICY "Users can update their own deals"
    ON %I.deals
    FOR UPDATE
    USING (user_id = auth.uid());
  ', p_schema_name);
  
  -- Ensure user has access to the schema
  IF NOT EXISTS (SELECT 1 FROM public.schema_user_access WHERE user_id = p_user_id AND schema_name = p_schema_name) THEN
    INSERT INTO public.schema_user_access (user_id, schema_name)
    VALUES (p_user_id, p_schema_name);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure schema_user_access table exists
CREATE TABLE IF NOT EXISTS public.schema_user_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  schema_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure schema_user_mappings table exists
CREATE TABLE IF NOT EXISTS public.schema_user_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  schema_name TEXT NOT NULL,
  schema_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grant usage on these functions to authenticated users
GRANT EXECUTE ON FUNCTION public.create_schema_with_tables TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_deals_table TO authenticated;
GRANT EXECUTE ON FUNCTION public.setup_deals_rls_policies TO authenticated; 