import { supabase } from './supabaseClient';

export interface SimpleSignupData {
  fullName: string;
  email: string;
  password: string;
  accountType: string;
}

export const alternativeSignup = async (formData: SimpleSignupData) => {
  console.log('[ALT_SIGNUP] Starting alternative signup process...');

  try {
    // Set up auth state listener to detect successful signup
    let signupSuccess = false;
    let signupError = null;

    const authListener = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[ALT_SIGNUP] Auth state change:', event, !!session);
      if (event === 'SIGNED_IN' && session?.user?.email === formData.email) {
        console.log('[ALT_SIGNUP] Detected successful signup via auth state!');
        signupSuccess = true;
      }
    });

    console.log('[ALT_SIGNUP] Starting signup call...');

    // Start the signup process (but don't wait for it)
    const signupPromise = supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          account_type: formData.accountType,
        },
      },
    });

    // Wait for either the signup to complete or auth state to change
    const maxWaitTime = 10000; // 10 seconds
    const startTime = Date.now();

    while (!signupSuccess && !signupError && Date.now() - startTime < maxWaitTime) {
      await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms

      // Check if signup promise resolved
      try {
        const result = await Promise.race([
          signupPromise,
          new Promise(resolve => setTimeout(() => resolve(null), 50)),
        ]);

        if (result) {
          console.log('[ALT_SIGNUP] Signup promise resolved:', result);
          const { data, error } = result as any;
          if (error) {
            signupError = error;
          } else if (data.user) {
            signupSuccess = true;
          }
          break;
        }
      } catch (e) {
        // Signup promise hasn't resolved yet, continue waiting
      }
    }

    // Clean up listener
    authListener.data.subscription.unsubscribe();

    if (signupError && !signupSuccess) {
      console.log('[ALT_SIGNUP] Signup failed with error:', signupError);

      // Check if it's "User already registered" error and we detected auth state change
      if (signupError.message?.includes('User already registered')) {
        console.log('[ALT_SIGNUP] User already registered error, checking current session...');
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user?.email === formData.email) {
          console.log('[ALT_SIGNUP] User is already authenticated, treating as success');
          signupSuccess = true;
        } else {
          return {
            success: false,
            message: 'Account already exists. Please sign in instead.',
          };
        }
      } else {
        return {
          success: false,
          message: signupError.message || 'Signup failed',
        };
      }
    }

    if (signupSuccess) {
      console.log('[ALT_SIGNUP] Signup successful! Waiting for session to be ready...');

      // Wait for session to be established
      let sessionReady = false;
      const maxSessionWait = 5000; // 5 seconds
      const sessionStartTime = Date.now();

      while (!sessionReady && Date.now() - sessionStartTime < maxSessionWait) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user?.email === formData.email) {
          console.log('[ALT_SIGNUP] Session is ready!');
          sessionReady = true;
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      if (!sessionReady) {
        console.log('[ALT_SIGNUP] Session not ready after waiting, but continuing anyway...');
      }

      // Additional wait for AuthContext to process the session
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

    console.log('[ALT_SIGNUP] Signup timed out without success or error');
    return {
      success: false,
      message: 'Signup process timed out. Please try again or sign in if your account was created.',
    };
  } catch (error) {
    console.error('[ALT_SIGNUP] Exception:', error);
    return {
      success: false,
      message: 'An error occurred during signup. Please try again.',
    };
  }
};
