import { supabase } from './supabaseClient';

export interface SimpleSignupData {
  fullName: string;
  email: string;
  password: string;
  accountType: string;
}

export const directSignup = async (formData: SimpleSignupData) => {
  console.log('[DIRECT_SIGNUP] Starting signup...');
  
  try {
    // Just attempt the signup - don't wait for it to complete
    supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          account_type: formData.accountType,
        },
      },
    }).then(({ data, error }) => {
      console.log('[DIRECT_SIGNUP] Signup completed:', { 
        success: !!data?.user, 
        error: error?.message 
      });
    }).catch(err => {
      console.log('[DIRECT_SIGNUP] Signup error:', err);
    });

    // Return success immediately - the AuthContext will handle the redirect
    console.log('[DIRECT_SIGNUP] Returning success, auth state will handle redirect');
    
    return {
      success: true,
      message: 'Creating your account...',
      // Don't redirect here - let the auth state change handle it
      redirectTo: null
    };
    
  } catch (error) {
    console.error('[DIRECT_SIGNUP] Exception:', error);
    return {
      success: false,
      message: 'An error occurred during signup. Please try again.',
    };
  }
};