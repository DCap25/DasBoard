-- Insert sample data into dealership_groups if empty
INSERT INTO public.dealership_groups (name, description)
SELECT 'Sample Group', 'A sample dealership group for testing'
WHERE NOT EXISTS (SELECT 1 FROM public.dealership_groups);

-- Get the inserted group ID
DO $$
DECLARE
  group_id INTEGER;
BEGIN
  -- Get the group ID
  SELECT id INTO group_id FROM public.dealership_groups LIMIT 1;
  
  -- Insert sample dealership if no records exist
  IF NOT EXISTS (SELECT 1 FROM public.dealerships) THEN
    INSERT INTO public.dealerships (
      name, 
      description, 
      address, 
      city, 
      state, 
      zip, 
      phone, 
      group_id
    ) VALUES (
      'Sample Dealership', 
      'A sample dealership for testing', 
      '123 Test Street', 
      'Test City', 
      'TS', 
      '12345', 
      '555-123-4567', 
      group_id
    );
  END IF;
  
  -- Ensure we have all needed roles
  INSERT INTO public.roles (name)
  VALUES 
    ('Sales'),
    ('Admin'),
    ('Manager'),
    ('Finance'),
    ('Test Admin')
  ON CONFLICT (name) DO NOTHING;
END $$; 