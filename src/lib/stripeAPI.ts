import { supabase } from './supabaseClient';
import { getStripe, PRICING_CONFIG, PricingTier, isTierFree } from './stripe';

export interface CreateCheckoutSessionParams {
  tier: PricingTier;
  customerEmail: string;
  dealershipName?: string;
  contactPerson?: string;
  phoneNumber?: string;
  dealershipCount?: number;
  addOns?: string[];
  successUrl?: string;
  cancelUrl?: string;
}

export interface SignupRequestData {
  dealership_name?: string;
  contact_person?: string;
  email: string;
  phone?: string;
  tier: string;
  subscription_tier: string;
  dealer_count?: number;
  add_ons?: string[];
  promo_applied: boolean;
  status: 'pending' | 'approved' | 'trial_started';
}

/**
 * Creates a signup request in the database
 */
export const createSignupRequest = async (data: SignupRequestData) => {
  console.log('[stripeAPI] Creating signup request:', data);

  const { data: signupRequest, error } = await supabase
    .from('signup_requests')
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error('[stripeAPI] Error creating signup request:', error);
    throw new Error(`Failed to create signup request: ${error.message}`);
  }

  console.log('[stripeAPI] Signup request created:', signupRequest);
  return signupRequest;
};

/**
 * Creates a Stripe checkout session for paid tiers
 */
export const createStripeCheckoutSession = async (params: CreateCheckoutSessionParams) => {
  const {
    tier,
    customerEmail,
    dealershipName,
    contactPerson,
    phoneNumber,
    dealershipCount = 1,
    addOns = [],
    successUrl = `${window.location.origin}/success`,
    cancelUrl = `${window.location.origin}/cancel`,
  } = params;

  console.log('[stripeAPI] Creating checkout session for tier:', tier);

  // Check if tier is free (promotional)
  if (isTierFree(tier)) {
    throw new Error('This tier is currently free. No payment required.');
  }

  const pricing = PRICING_CONFIG[tier];

  // First create a signup request
  const signupRequest = await createSignupRequest({
    dealership_name: dealershipName,
    contact_person: contactPerson,
    email: customerEmail,
    phone: phoneNumber,
    tier: tier.toLowerCase(),
    subscription_tier: tier.toLowerCase(),
    dealer_count: dealershipCount,
    add_ons: addOns,
    promo_applied: false,
    status: 'pending',
  });

  // Prepare line items for Stripe
  const lineItems = [
    {
      price_data: {
        currency: pricing.currency,
        product_data: {
          name: pricing.name,
          description: `${pricing.name} subscription for ${dealershipName || 'your business'}`,
        },
        unit_amount: pricing.price,
        recurring: {
          interval: pricing.interval,
        },
      },
      quantity: dealershipCount,
    },
  ];

  // Create checkout session via your backend
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      signupRequestId: signupRequest.id,
      lineItems,
      customerEmail,
      successUrl,
      cancelUrl,
      metadata: {
        tier: tier.toLowerCase(),
        dealershipCount,
        addOns: JSON.stringify(addOns),
        signupRequestId: signupRequest.id,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to create checkout session: ${errorData.error}`);
  }

  const { id: sessionId } = await response.json();

  // Redirect to Stripe Checkout
  const stripe = await getStripe();
  if (!stripe) {
    throw new Error('Failed to load Stripe');
  }

  const { error } = await stripe.redirectToCheckout({ sessionId });
  if (error) {
    throw new Error(`Stripe checkout error: ${error.message}`);
  }
};

/**
 * Handles free tier signup (Finance Manager promotion)
 */
export const handleFreeSignup = async (params: CreateCheckoutSessionParams) => {
  console.log('[stripeAPI] Processing free signup for tier:', params.tier);

  if (!isTierFree(params.tier)) {
    throw new Error('This tier is not free. Payment is required.');
  }

  // Create signup request with promotional pricing
  const signupRequest = await createSignupRequest({
    dealership_name: params.dealershipName,
    contact_person: params.contactPerson,
    email: params.customerEmail,
    phone: params.phoneNumber,
    tier: params.tier.toLowerCase(),
    subscription_tier: params.tier.toLowerCase(),
    dealer_count: params.dealershipCount,
    add_ons: params.addOns,
    promo_applied: true,
    status: 'trial_started', // Automatically approve free signups
  });

  return signupRequest;
};

/**
 * Main signup handler that routes to appropriate flow
 */
export const handleSignup = async (params: CreateCheckoutSessionParams) => {
  console.log('[stripeAPI] Handling signup for tier:', params.tier);

  if (isTierFree(params.tier)) {
    return await handleFreeSignup(params);
  } else {
    return await createStripeCheckoutSession(params);
  }
};
