import { supabase } from './supabaseClient';

export interface SimpleSignupData {
  fullName: string;
  email: string;
  password: string;
  accountType: string;
}

export const quickSignup = async (formData: SimpleSignupData) => {
  console.log('[QUICK_SIGNUP] Starting quick signup process...');

  try {
    // First check if user already exists and is signed in (with timeout)
    console.log('[QUICK_SIGNUP] Checking existing session...');
    let existingSession = null;
    try {
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Session check timeout')), 2000)
      );

      const result = (await Promise.race([sessionPromise, timeoutPromise])) as any;
      existingSession = result?.data?.session;
      console.log('[QUICK_SIGNUP] Existing session check complete:', !!existingSession);
    } catch (error) {
      console.log('[QUICK_SIGNUP] Session check failed or timed out, continuing anyway');
    }

    if (existingSession?.user?.email === formData.email) {
      console.log('[QUICK_SIGNUP] User already signed in, proceeding to welcome');
      return {
        success: true,
        message: 'Welcome back!',
        redirectTo:
          formData.accountType === 'single-finance'
            ? '/welcome/single-finance?existing=true'
            : '/auth',
      };
    }

    console.log('[QUICK_SIGNUP] No existing session, initiating signup...');

    // Start the signup but don't wait for it
    supabase.auth
      .signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            account_type: formData.accountType,
          },
        },
      })
      .then(result => {
        console.log('[QUICK_SIGNUP] Signup promise eventually resolved:', result);
      })
      .catch(error => {
        console.log('[QUICK_SIGNUP] Signup promise eventually failed:', error);
      });

    // Wait for auth state to change or session to appear
    console.log('[QUICK_SIGNUP] Waiting for auth state change...');
    const maxWait = 8000; // 8 seconds
    const startTime = Date.now();
    let authenticated = false;

    while (!authenticated && Date.now() - startTime < maxWait) {
      // Check if session exists (with timeout protection)
      try {
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session poll timeout')), 1000)
        );

        const result = (await Promise.race([sessionPromise, timeoutPromise])) as any;
        const session = result?.data?.session;

        console.log('[QUICK_SIGNUP] Session poll result:', {
          hasSession: !!session,
          sessionEmail: session?.user?.email,
          targetEmail: formData.email,
          timeElapsed: Date.now() - startTime,
        });

        if (session?.user?.email === formData.email) {
          console.log('[QUICK_SIGNUP] Session detected! User authenticated.');
          authenticated = true;
          break;
        }
      } catch (error) {
        console.log('[QUICK_SIGNUP] Session poll failed:', error.message);
      }

      // Wait a bit before checking again
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log('[QUICK_SIGNUP] Polling complete. Authenticated:', authenticated);

    if (authenticated) {
      console.log('[QUICK_SIGNUP] Authentication confirmed, preparing redirect...');

      // Small delay for AuthContext to fully initialize
      await new Promise(resolve => setTimeout(resolve, 1000));

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

    // If we got here, authentication didn't complete in time
    console.log(
      '[QUICK_SIGNUP] Authentication timeout after 8 seconds - checking one more time...'
    );

    // One final check
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.email === formData.email) {
        console.log('[QUICK_SIGNUP] Final check successful! User is authenticated.');

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
    } catch (error) {
      console.log('[QUICK_SIGNUP] Final session check failed');
    }

    return {
      success: false,
      message:
        'Signup is taking longer than expected. Please try signing in or wait a moment and refresh.',
    };
  } catch (error) {
    console.error('[QUICK_SIGNUP] Exception:', error);
    return {
      success: false,
      message: 'An error occurred during signup. Please try again.',
    };
  }
};
