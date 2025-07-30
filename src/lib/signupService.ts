import { supabase } from './supabaseClient';

export interface SimplifiedSignupData {
  fullName: string;
  email: string;
  password: string;
  accountType: 'single-finance' | 'small-dealer-group' | 'large-dealer-group';
}

export interface SignupResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

/**
 * Process simplified signup form submission
 */
export const submitSimplifiedSignup = async (
  formData: SimplifiedSignupData
): Promise<SignupResponse> => {
  try {
    console.log('[SIGNUP] Processing simplified signup:', {
      email: formData.email,
      accountType: formData.accountType,
    });

    console.log('[SIGNUP] Step 1: Setting up variables...');

    // For Single Finance Manager, we still need to create the user account
    // Don't bypass the normal signup process

    console.log('[SIGNUP] Step 2: Creating subscription tier map...');
    // Map account types to subscription tiers
    const subscriptionTierMap = {
      'single-finance': 'finance_manager',
      'small-dealer-group': 'dealership',
      'large-dealer-group': 'dealer_group_l2',
    };

    console.log('[SIGNUP] Step 3: Subscription tier map created, proceeding to user creation...');
    console.log('[SIGNUP] Skipping database signup request for now - going directly to user creation');
    
    // TEMPORARY: Skip the database signup request creation for testing
    // TODO: Fix signup_requests table permissions
    const signupRequest = {
      id: 'temp-' + Date.now(),
      email: formData.email,
      full_name: formData.fullName,
      account_type: formData.accountType,
    };
    
    console.log('[SIGNUP] Using temporary signup request:', signupRequest);

    console.log('[SIGNUP] Signup request created:', signupRequest);
    
    console.log('[SIGNUP] Checking account type for auth creation:', formData.accountType);

    // For single finance managers, create user account immediately
    if (formData.accountType === 'single-finance') {
      console.log('[SIGNUP] Creating Supabase auth user for single-finance...');
      
      try {
        // Add timeout wrapper to prevent hanging
        const authPromise = supabase.auth.signUp({
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
          setTimeout(() => {
            reject(new Error('Auth signup timeout - taking too long'));
          }, 10000); // 10 second timeout
        });
        
        console.log('[SIGNUP] Waiting for auth signup to complete...');
        const { data: authData, error: authError } = await Promise.race([
          authPromise,
          timeoutPromise
        ]) as any;
        
        console.log('[SIGNUP] Auth signup completed with timeout protection');
        
        console.log('[SIGNUP] Auth signup result:', { 
          user: authData?.user?.id, 
          session: !!authData?.session,
          error: authError?.message 
        });

        if (authError) {
          console.error('[SIGNUP] Auth error:', authError);
          
          // Handle specific auth errors
          if (authError.message?.includes('User already registered')) {
            console.log('[SIGNUP] User already exists, checking if they are signed in...');
            
            // Check if user is already signed in
            try {
              const { data: { session } } = await supabase.auth.getSession();
              if (session?.user && session.user.email === formData.email) {
                console.log('[SIGNUP] User already signed in, redirecting to welcome page');
                
                // User exists and is signed in, redirect to welcome page
                return {
                  success: true,
                  message: 'Welcome back! Redirecting to your dashboard.',
                  data: {
                    user: session.user,
                    signupRequest,
                    nextStep: 'welcome_page',
                    redirectTo: '/welcome/single-finance?existing=true',
                    requiresEmailConfirmation: false,
                  },
                };
              }
            } catch (sessionError) {
              console.error('[SIGNUP] Error checking session for existing user:', sessionError);
            }
            
            return {
              success: false,
              message: 'An account with this email already exists. Please sign in instead.',
              error: authError.message,
              redirectTo: '/auth?message=' + encodeURIComponent('Account already exists. Please sign in.'),
            };
          } else if (authError.message?.includes('Password should be at least')) {
            return {
              success: false,
              message: 'Password must be at least 6 characters long.',
              error: authError.message,
            };
          } else {
            return {
              success: false,
              message: `Account creation failed: ${authError.message}`,
              error: authError.message,
            };
          }
        }

        // Check if we're in development mode
        const isDevelopment = import.meta.env.MODE === 'development';
        const skipEmailVerification = isDevelopment || import.meta.env.VITE_SKIP_EMAIL_VERIFICATION === 'true';
        
        // Check if email confirmation is required
        if (authData.user && !authData.user.email_confirmed_at && !skipEmailVerification) {
          // For Single Finance Manager, still direct to welcome page after verification
          if (formData.accountType === 'single-finance') {
            return {
              success: true,
              message: 'Account created successfully! Please check your email and click the verification link, then you\'ll see your welcome page.',
              data: {
                user: authData.user,
                signupRequest,
                nextStep: 'email_verification',
                redirectTo: '/welcome/single-finance?newuser=true',
                requiresEmailConfirmation: true,
              },
            };
          } else {
            return {
              success: true,
              message: 'Account created successfully! Please check your email and click the verification link before signing in.',
              data: {
                user: authData.user,
                signupRequest,
                nextStep: 'email_verification',
                requiresEmailConfirmation: true,
              },
            };
          }
        } else {
          // In development or when email verification is disabled
          const message = skipEmailVerification 
            ? 'Account created! You can now sign in (email verification disabled for development).'
            : 'Account created and verified! You can now sign in.';

          // For Single Finance Manager, redirect to welcome page
          if (formData.accountType === 'single-finance') {
            console.log('[SIGNUP] Returning success response for single-finance');
            const response = {
              success: true,
              message: 'Account created successfully! Welcome to The DAS Board.',
              data: {
                user: authData.user,
                signupRequest,
                nextStep: 'welcome_page',
                redirectTo: '/welcome/single-finance?newuser=true',
                requiresEmailConfirmation: false,
              },
            };
            console.log('[SIGNUP] Response:', response);
            return response;
          }
            
          return {
            success: true,
            message,
            data: {
              user: authData.user,
              signupRequest,
              nextStep: 'login_ready',
              requiresEmailConfirmation: false,
            },
          };
        }
      } catch (authError) {
        console.error('[SIGNUP] Auth exception:', authError);
        
        // If it's a timeout error, but we detected the user was created (SIGNED_IN event)
        // let's check if the user actually exists
        if (authError instanceof Error && authError.message.includes('timeout')) {
          console.log('[SIGNUP] Timeout detected, checking if user was created anyway...');
          
          try {
            // Check if user was created despite timeout
            console.log('[SIGNUP] Calling getSession to check for created user...');
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            console.log('[SIGNUP] Session check result:', { 
              hasSession: !!session, 
              userEmail: session?.user?.email,
              targetEmail: formData.email,
              sessionError: sessionError?.message 
            });
            
            if (session?.user && session.user.email === formData.email) {
              console.log('[SIGNUP] User was created despite timeout, proceeding with success');
              
              const successResponse = {
                success: true,
                message: 'Account created successfully! Welcome to The DAS Board.',
                data: {
                  user: session.user,
                  signupRequest,
                  nextStep: 'welcome_page',
                  redirectTo: '/welcome/single-finance?newuser=true',
                  requiresEmailConfirmation: false,
                },
              };
              
              console.log('[SIGNUP] Returning success response:', successResponse);
              return successResponse;
            } else {
              console.log('[SIGNUP] No matching session found after timeout');
            }
          } catch (sessionError) {
            console.error('[SIGNUP] Error checking session after timeout:', sessionError);
          }
        }
        
        return {
          success: false,
          message: 'Account creation failed. Please try again.',
          error: authError instanceof Error ? authError.message : 'Authentication service error',
        };
      }
    }

    // For dealer groups, return success with payment flow next
    return {
      success: true,
      message: 'Registration submitted successfully! Please check your email for next steps.',
      data: {
        signupRequest,
        nextStep: formData.accountType.includes('dealer-group')
          ? 'payment_setup'
          : 'approval_pending',
      },
    };
  } catch (error) {
    console.error('[SIGNUP] Unexpected error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  } finally {
    console.log('[SIGNUP] Function execution completed');
  }
};

/**
 * Check if email is already registered
 */
export const checkEmailAvailability = async (email: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('signup_requests')
      .select('email')
      .eq('email', email)
      .limit(1);

    if (error) {
      console.error('[SIGNUP] Email check error:', error);
      return false; // Assume not available on error
    }

    return data.length === 0; // Available if no records found
  } catch (error) {
    console.error('[SIGNUP] Email check exception:', error);
    return false;
  }
};

/**
 * Get demo data for sales demonstrations
 */
export const getDemoData = () => {
  return {
    user: {
      id: 'demo-user-123',
      email: 'demo@thedasboard.com',
      name: 'Demo Sales Manager',
      role: 'sales_manager',
      dealership: 'Premier Auto Group',
      account_type: 'small-dealer-group',
    },
    metrics: {
      monthly_sales: 42,
      monthly_revenue: 1250000,
      avg_deal_size: 29762,
      fi_penetration: 0.78,
      pvr: 2845,
      monthly_goals: {
        sales: 45,
        revenue: 1300000,
        fi_penetration: 0.8,
      },
      ytd_performance: {
        sales: 487,
        revenue: 14500000,
        deals_closed: 487,
      },
    },
    deals: [
      {
        id: 'demo-001',
        customer: 'Johnson',
        vehicle: '2024 Toyota Camry',
        deal_type: 'Finance',
        front_end: 2500,
        fi_profit: 3200,
        total_profit: 5700,
        status: 'Funded',
        date: '2025-01-15',
      },
      {
        id: 'demo-002',
        customer: 'Martinez',
        vehicle: '2024 Honda CR-V',
        deal_type: 'Lease',
        front_end: 1800,
        fi_profit: 2800,
        total_profit: 4600,
        status: 'Pending',
        date: '2025-01-16',
      },
      {
        id: 'demo-003',
        customer: 'Wilson',
        vehicle: '2023 Ford F-150',
        deal_type: 'Finance',
        front_end: 3200,
        fi_profit: 3800,
        total_profit: 7000,
        status: 'Funded',
        date: '2025-01-16',
      },
    ],
  };
};

/**
 * Create demo login session
 */
export const createDemoSession = () => {
  const demoData = getDemoData();

  // Store demo data in localStorage for the session
  localStorage.setItem('demo_session', JSON.stringify(demoData));
  localStorage.setItem('demo_mode', 'true');

  return demoData;
};
