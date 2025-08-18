import { supabase } from './supabaseClient';

export interface SimpleSignupData {
  fullName: string;
  email: string;
  password: string;
  accountType: string;
}

export const simpleSignup = async (formData: SimpleSignupData) => {
  console.log('[SIMPLE_SIGNUP] Starting simple signup process...');

  try {
    console.log('[SIMPLE_SIGNUP] Creating user with Supabase Auth...');

    // Add timeout to prevent hanging
    const signUpPromise = supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          account_type: formData.accountType,
        },
      },
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('SignUp timeout - but user may have been created')), 8000);
    });

    let data, error;
    try {
      const result = await Promise.race([signUpPromise, timeoutPromise]);
      data = result.data;
      error = result.error;
    } catch (timeoutError) {
      console.log('[SIMPLE_SIGNUP] SignUp call timed out, checking if user was created...');

      // Check if user was actually created despite the timeout
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user?.email === formData.email) {
        console.log('[SIMPLE_SIGNUP] User was created successfully despite timeout!');
        data = { user: sessionData.session.user, session: sessionData.session };
        error = null;
      } else {
        console.log('[SIMPLE_SIGNUP] No session found after timeout');
        return {
          success: false,
          message: 'Signup process timed out. Please try signing in or try again.',
        };
      }
    }

    console.log('[SIMPLE_SIGNUP] Supabase result:', {
      hasUser: !!data.user,
      hasSession: !!data.session,
      error: error?.message,
    });

    if (error) {
      console.error('[SIMPLE_SIGNUP] Error:', error);

      if (error.message?.includes('User already registered')) {
        console.log('[SIMPLE_SIGNUP] User already registered error - checking session...');

        // Check if user is already signed in
        const {
          data: { session },
        } = await supabase.auth.getSession();
        console.log('[SIMPLE_SIGNUP] Current session check:', {
          hasSession: !!session,
          sessionEmail: session?.user?.email,
          targetEmail: formData.email,
        });

        if (session?.user?.email === formData.email) {
          console.log('[SIMPLE_SIGNUP] User already signed in, redirecting to welcome!');
          return {
            success: true,
            message: 'Welcome back!',
            redirectTo: '/welcome/single-finance?existing=true',
          };
        } else {
          console.log(
            '[SIMPLE_SIGNUP] No matching session found - this might be a Supabase caching issue'
          );
          // Try to sign in with the credentials to see if the account actually exists
          console.log('[SIMPLE_SIGNUP] Attempting to sign in to verify account exists...');
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });

          if (signInData.user && !signInError) {
            console.log('[SIMPLE_SIGNUP] Sign in successful - account does exist, redirecting...');
            return {
              success: true,
              message: 'Welcome back!',
              redirectTo: '/welcome/single-finance?existing=true',
            };
          } else {
            console.log('[SIMPLE_SIGNUP] Sign in failed:', signInError?.message);
            return {
              success: false,
              message:
                'There was an issue with your account. Please contact support or try with a different email.',
            };
          }
        }
      }

      return {
        success: false,
        message: error.message,
      };
    }

    if (data.user) {
      console.log('[SIMPLE_SIGNUP] User created successfully!');

      // Wait a moment for AuthContext to initialize the session
      console.log('[SIMPLE_SIGNUP] Waiting for AuthContext to initialize...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (formData.accountType === 'single-finance') {
        return {
          success: true,
          message: 'Account created successfully! Welcome to The DAS Board.',
          redirectTo: '/welcome/single-finance?newuser=true',
        };
      } else {
        return {
          success: true,
          message: 'Account created successfully!',
          redirectTo: '/auth',
        };
      }
    }

    return {
      success: false,
      message: 'Something went wrong. Please try again.',
    };
  } catch (error) {
    console.error('[SIMPLE_SIGNUP] Exception:', error);
    return {
      success: false,
      message: 'An error occurred during signup. Please try again.',
    };
  }
};
