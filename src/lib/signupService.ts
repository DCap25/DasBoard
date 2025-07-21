import { supabase } from './supabase';

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

    // Map account types to subscription tiers
    const subscriptionTierMap = {
      'single-finance': 'finance_manager',
      'small-dealer-group': 'dealership',
      'large-dealer-group': 'dealer_group_l2',
    };

    // Create signup request in database
    const { data: signupRequest, error: dbError } = await supabase
      .from('signup_requests')
      .insert({
        email: formData.email,
        full_name: formData.fullName,
        account_type: formData.accountType,
        subscription_tier: subscriptionTierMap[formData.accountType],
        status: 'pending',
        stripe_payment_status:
          formData.accountType === 'single-finance' ? 'free_promotional' : 'pending',
      })
      .select()
      .single();

    if (dbError) {
      console.error('[SIGNUP] Database error:', dbError);
      
      // If this is a 401/authentication error, suggest using the dashboard selector for now
      if (dbError.message?.includes('401') || dbError.message?.toLowerCase().includes('unauthorized')) {
        return {
          success: false,
          message: 'Real user signup is currently disabled. Please use the Dashboard Selector for demo access.',
          error: dbError.message,
        };
      }
      
      return {
        success: false,
        message: 'Database error occurred. Please try again later or use the Dashboard Selector for demo access.',
        error: dbError.message,
      };
    }

    console.log('[SIGNUP] Signup request created:', signupRequest);

    // For single finance managers, create user account immediately
    if (formData.accountType === 'single-finance') {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              account_type: formData.accountType,
            },
          },
        });

        if (authError) {
          console.error('[SIGNUP] Auth error:', authError);
          return {
            success: false,
            message: 'Account creation failed. Please try again.',
            error: authError.message,
          };
        }

        return {
          success: true,
          message: 'Account created successfully! Please check your email to verify your account.',
          data: {
            user: authData.user,
            signupRequest,
            nextStep: 'email_verification',
          },
        };
      } catch (authError) {
        console.error('[SIGNUP] Auth exception:', authError);
        return {
          success: false,
          message: 'Account creation failed. Please try again.',
          error: 'Authentication service error',
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
