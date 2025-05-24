-- Create function to delete users by email
-- This allows more thorough cleanup of auth and profiles
CREATE OR REPLACE FUNCTION admin_delete_user_by_email(email_param TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_id UUID;
    result JSONB;
    found_users INT := 0;
BEGIN
    -- First try to find user in profiles
    SELECT id INTO user_id FROM profiles WHERE email = email_param OR email ILIKE '%' || email_param || '%';
    
    IF user_id IS NOT NULL THEN
        -- First delete from profiles
        DELETE FROM profiles WHERE id = user_id;
        found_users := found_users + 1;
        
        -- Then try to clean up auth
        BEGIN
            -- This requires auth admin privileges
            DELETE FROM auth.users WHERE id = user_id;
        EXCEPTION WHEN OTHERS THEN
            -- Log the error but continue
            result := jsonb_build_object(
                'status', 'warning',
                'message', 'Error deleting from auth: ' || SQLERRM,
                'user_id', user_id::TEXT
            );
        END;
    END IF;
    
    -- Also try to clean up by email directly
    BEGIN
        -- This requires auth admin privileges
        DELETE FROM auth.users WHERE email = email_param;
        found_users := found_users + 1;
    EXCEPTION WHEN OTHERS THEN
        -- Log the error but continue
        result := jsonb_build_object(
            'status', 'warning',
            'message', 'Error deleting by email: ' || SQLERRM,
            'email', email_param
        );
    END;
    
    -- Return success result
    RETURN jsonb_build_object(
        'status', 'success',
        'message', 'Account cleanup attempted',
        'count', found_users,
        'details', COALESCE(result, '{}'::JSONB)
    );
END;
$$;

-- Create function to delete multiple test accounts at once
CREATE OR REPLACE FUNCTION admin_delete_test_accounts(email_list TEXT[], exclude_email TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    counter INT := 0;
    email TEXT;
    result JSONB;
BEGIN
    -- Process each email
    FOREACH email IN ARRAY email_list
    LOOP
        -- Skip excluded email
        IF exclude_email IS NULL OR email <> exclude_email THEN
            -- Call single delete function
            SELECT admin_delete_user_by_email(email) INTO result;
            counter := counter + 1;
        END IF;
    END LOOP;
    
    -- Return success result
    RETURN jsonb_build_object(
        'status', 'success',
        'message', 'Test accounts cleanup attempted',
        'count', counter
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION admin_delete_user_by_email TO authenticated;
GRANT EXECUTE ON FUNCTION admin_delete_test_accounts TO authenticated; 