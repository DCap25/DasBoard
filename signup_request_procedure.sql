-- Create a stored procedure for handling signup requests
CREATE OR REPLACE FUNCTION public.handle_signup_request(
  p_dealership_name TEXT,
  p_contact_person TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_tier TEXT,
  p_status TEXT DEFAULT 'pending'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  -- Insert the signup request and return the ID
  INSERT INTO public.signup_requests(
    dealership_name,
    contact_person,
    email,
    phone,
    tier,
    status,
    created_at
  )
  VALUES(
    p_dealership_name,
    p_contact_person,
    p_email,
    p_phone,
    p_tier,
    p_status,
    NOW()
  )
  RETURNING id INTO v_id;
  
  RETURN v_id;
EXCEPTION 
  WHEN others THEN
    RAISE EXCEPTION 'Error inserting signup request: %', SQLERRM;
END;
$$;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.handle_signup_request TO anon, authenticated;

-- Create a separate RLS policy for the function
ALTER FUNCTION public.handle_signup_request SECURITY DEFINER; 