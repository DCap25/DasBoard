import { loadStripe, Stripe } from '@stripe/stripe-js';

// Client-side Stripe (for checkout sessions)
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.error('Stripe publishable key is missing from environment variables');
      return null;
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

// Stripe Price IDs (you'll need to create these in your Stripe dashboard)
export const STRIPE_PRICE_IDS = {
  FINANCE_MANAGER: 'price_finance_manager_monthly', // $5/month (currently free with promo)
  DEALERSHIP_SMALL: 'price_dealership_small_monthly', // $250/month per dealership
  DEALERSHIP_L1: 'price_dealership_l1_monthly', // $200/month per dealership (6-12 locations)
  DEALERSHIP_L2: 'price_dealership_l2_monthly', // $250/month per dealership (13-25 locations)
} as const;

// Pricing configuration
export const PRICING_CONFIG = {
  FINANCE_MANAGER: {
    name: 'Finance Manager',
    price: 500, // $5.00 in cents
    currency: 'usd',
    interval: 'month',
    promo: {
      enabled: true,
      discount_percent: 100, // 100% off (free)
      original_price: 500,
    },
  },
  DEALERSHIP_SMALL: {
    name: 'Small Dealership',
    price: 25000, // $250.00 in cents
    currency: 'usd',
    interval: 'month',
  },
  DEALERSHIP_L1: {
    name: 'Dealer Group Level 1 (6-12 locations)',
    price: 20000, // $200.00 in cents per dealership
    currency: 'usd',
    interval: 'month',
  },
  DEALERSHIP_L2: {
    name: 'Dealer Group Level 2 (13-25 locations)',
    price: 25000, // $250.00 in cents per dealership
    currency: 'usd',
    interval: 'month',
  },
} as const;

export type PricingTier = keyof typeof PRICING_CONFIG;

// Helper function to get pricing for a tier
export const getPricingForTier = (tier: PricingTier) => {
  return PRICING_CONFIG[tier];
};

// Helper function to check if a tier is currently free (promotional)
export const isTierFree = (tier: PricingTier): boolean => {
  const config = PRICING_CONFIG[tier];
  return 'promo' in config && config.promo.enabled && config.promo.discount_percent === 100;
};
