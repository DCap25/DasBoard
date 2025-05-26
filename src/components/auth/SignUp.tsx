import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, Info } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { loadStripe } from '@stripe/stripe-js';

// Stripe publishable key
const STRIPE_PK =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
  'pk_test_51RPqKnCLgbYukTp1kaTp1BJBfqp5B0W5aLh98d99pGJrU8qIivlCSplN80Kqlbppa3FZL7vY910HlMUYDLcK5Izs00wwbp0MCA';

export default function SignUp() {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    dealershipName: '',
    contactName: '',
    email: '',
    phone: '',
    tier: 'dealership', // Default to dealership tier
    groupLevel: 'level_1', // Default to Level 1 for dealer groups
    dealershipCount: 2, // Minimum dealership count
    addOns: {
      plus: false,
      plusplus: false,
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Calculate price based on selected tier and add-ons
  const getBasePrice = () => {
    if (formState.tier === 'dealership') {
      return 200; // $200/month for single Dealership tier
    } else if (formState.tier === 'dealer_group') {
      // Price per dealership based on group level
      const pricePerDealership =
        formState.groupLevel === 'level_1' ? 200 : formState.groupLevel === 'level_2' ? 250 : 0;

      return pricePerDealership * formState.dealershipCount;
    }
    return 200; // Default
  };

  const basePrice = getBasePrice();
  const plusPrice = formState.addOns.plus ? 100 : 0; // $100/month for + Version
  const plusplusPrice = formState.addOns.plusplus ? 500 : 0; // $500/month for ++ Version
  const totalPrice = basePrice + plusPrice + plusplusPrice;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'tier' && value === 'dealer_group') {
      // When switching to dealer_group, ensure minimum dealership count
      setFormState(prev => ({
        ...prev,
        [name]: value,
        dealershipCount:
          prev.groupLevel === 'level_1'
            ? Math.max(prev.dealershipCount, 2)
            : Math.max(prev.dealershipCount, 6),
      }));
    } else if (name === 'groupLevel') {
      // When changing group level, adjust minimum dealership count
      setFormState(prev => ({
        ...prev,
        [name]: value,
        dealershipCount:
          value === 'level_1'
            ? Math.max(prev.dealershipCount, 2)
            : Math.max(prev.dealershipCount, 6),
      }));
    } else if (name === 'dealershipCount') {
      // Ensure dealership count stays within tier limits
      const minCount = formState.groupLevel === 'level_1' ? 2 : 6;
      const maxCount = formState.groupLevel === 'level_1' ? 5 : 15;
      const countValue = Math.min(Math.max(parseInt(value) || minCount, minCount), maxCount);

      setFormState(prev => ({ ...prev, [name]: countValue }));
    } else {
      setFormState(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormState(prev => ({
      ...prev,
      addOns: {
        ...prev.addOns,
        [name]: checked,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    console.log('[SignUp] Starting subscription signup process');
    try {
      console.log('[SignUp] Submitting signup request', {
        name: formState.dealershipName,
        tier: formState.tier,
        groupLevel: formState.groupLevel,
        dealershipCount: formState.dealershipCount,
        addOns: Object.keys(formState.addOns).filter(
          key => formState.addOns[key as keyof typeof formState.addOns]
        ),
      });

      // Create signup request in Supabase
      const { data, error } = await supabase
        .from('signup_requests')
        .insert({
          dealership_name: formState.dealershipName,
          contact_person: formState.contactName,
          email: formState.email,
          tier: formState.tier,
          add_ons: Object.keys(formState.addOns).filter(
            key => formState.addOns[key as keyof typeof formState.addOns]
          ),
          status: 'pending',
          metadata:
            formState.tier === 'dealer_group'
              ? {
                  group_level: formState.groupLevel,
                  dealership_count: formState.dealershipCount,
                }
              : {},
        })
        .select();

      if (error) {
        console.error('[SignUp] Error creating signup request:', error);
        throw new Error(error.message);
      }

      console.log('[SignUp] Signup request created successfully:', data);

      // Send email notifications
      try {
        // Send notification to admin
        await fetch('/.netlify/functions/send-emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'signup_notification',
            data: {
              name: formState.contactName,
              email: formState.email,
              companyType: formState.tier === 'dealer_group' ? 'Dealer Group' : 'Single Dealership',
              subscriptionId: data[0].id,
            },
          }),
        });

        // Send welcome email to user
        await fetch('/.netlify/functions/send-emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'welcome_email',
            data: {
              name: formState.contactName,
              email: formState.email,
            },
          }),
        });
      } catch (emailError) {
        console.warn('[SignUp] Email sending failed:', emailError);
        // Don't fail the signup process if email fails
      }

      // Redirect to Stripe checkout
      const stripe = await loadStripe(STRIPE_PK);

      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }

      // Create a line item for the base subscription
      const lineItems = [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name:
                formState.tier === 'dealer_group'
                  ? `Dealer Group Subscription (${formState.dealershipCount} dealerships)`
                  : 'Dealership Subscription',
              description:
                formState.tier === 'dealer_group'
                  ? `Monthly subscription for ${formState.dealershipCount} dealerships at ${
                      formState.groupLevel === 'level_1' ? '$200' : '$250'
                    } per dealership`
                  : 'Monthly subscription for Das Board dealership management',
            },
            unit_amount: basePrice * 100, // in cents
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ];

      // Add line items for add-ons if selected
      if (formState.addOns.plus) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: '+ Version Add-on',
              description: 'Additional user capacity for Das Board',
            },
            unit_amount: plusPrice * 100, // in cents
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        });
      }

      if (formState.addOns.plusplus) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: '++ Version Add-on',
              description: 'Maximum user capacity for Das Board',
            },
            unit_amount: plusplusPrice * 100, // in cents
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        });
      }

      // Create checkout session
      console.log('[SignUp] Creating Stripe checkout session', {
        signupRequestId: data[0].id,
        tier: formState.tier,
        dealershipCount: formState.tier === 'dealer_group' ? formState.dealershipCount : 1,
        basePrice,
        plusPrice,
        plusplusPrice,
        totalPrice,
        lineItems,
      });

      try {
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            signupRequestId: data[0].id,
            lineItems,
            customerEmail: formState.email,
            metadata: {
              dealershipName: formState.dealershipName,
              tier: formState.tier,
              groupLevel: formState.tier === 'dealer_group' ? formState.groupLevel : null,
              dealershipCount: formState.tier === 'dealer_group' ? formState.dealershipCount : 1,
              addOns: JSON.stringify(
                Object.keys(formState.addOns).filter(
                  key => formState.addOns[key as keyof typeof formState.addOns]
                )
              ),
            },
            successUrl: `${window.location.origin}/signup/success?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${window.location.origin}/signup`,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('[SignUp] Checkout session creation failed:', errorData);
          throw new Error(errorData.error || 'Failed to create checkout session');
        }

        const session = await response.json();
        console.log('[SignUp] Checkout session created successfully:', session.id);

        // Redirect to checkout
        const result = await stripe.redirectToCheckout({
          sessionId: session.id,
        });

        if (result.error) {
          console.error('[SignUp] Redirect to checkout failed:', result.error);
          throw result.error;
        }
      } catch (checkoutError) {
        console.error('[SignUp] Stripe checkout process failed:', checkoutError);
        throw checkoutError;
      }

      // If for some reason we get here without redirecting
      setSuccess(true);
    } catch (err) {
      console.error('[SignUp] Error in signup process:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto text-center mt-12">
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-6 text-white">Sign Up Successful</h2>
        <p className="text-gray-300">
          Thank you for signing up! Your request has been submitted and is pending approval.
          <br />
          You will receive an email with further instructions once your account is ready.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto mt-12">
      <div className="bg-gray-800 shadow-md rounded-lg px-8 pt-6 pb-8 mb-4 border border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-white text-center">Sign Up</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 text-red-100 rounded flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="dealershipName" className="block text-gray-300 text-sm font-bold mb-2">
              {formState.tier === 'dealer_group' ? 'Dealer Group Name' : 'Dealership Name'}
            </label>
            <input
              id="dealershipName"
              name="dealershipName"
              type="text"
              value={formState.dealershipName}
              onChange={handleChange}
              required
              className="bg-gray-700 shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:border-blue-500"
              placeholder={`Enter ${
                formState.tier === 'dealer_group' ? 'dealer group' : 'dealership'
              } name`}
            />
          </div>

          <div>
            <label htmlFor="contactName" className="block text-gray-300 text-sm font-bold mb-2">
              Contact Name
            </label>
            <input
              id="contactName"
              name="contactName"
              type="text"
              value={formState.contactName}
              onChange={handleChange}
              required
              className="bg-gray-700 shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:border-blue-500"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-gray-300 text-sm font-bold mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formState.email}
              onChange={handleChange}
              required
              className="bg-gray-700 shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:border-blue-500"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-gray-300 text-sm font-bold mb-2">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formState.phone}
              onChange={handleChange}
              required
              className="bg-gray-700 shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:border-blue-500"
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <label htmlFor="tier" className="block text-gray-300 text-sm font-bold mb-2">
              Subscription Type
            </label>
            <select
              id="tier"
              name="tier"
              value={formState.tier}
              onChange={handleChange}
              className="bg-gray-700 shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:border-blue-500"
            >
              <option value="dealership">Single Dealership</option>
              <option value="dealer_group">Dealer Group (Multiple Dealerships)</option>
            </select>
          </div>

          {formState.tier === 'dealer_group' && (
            <>
              <div>
                <label htmlFor="groupLevel" className="block text-gray-300 text-sm font-bold mb-2">
                  Group Level
                </label>
                <select
                  id="groupLevel"
                  name="groupLevel"
                  value={formState.groupLevel}
                  onChange={handleChange}
                  className="bg-gray-700 shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:border-blue-500"
                >
                  <option value="level_1">Level 1 (2-5 dealerships, $200/month each)</option>
                  <option value="level_2">Level 2 (6-15 dealerships, $250/month each)</option>
                  <option value="level_3" disabled>
                    Level 3 (16+ dealerships, contact us)
                  </option>
                </select>
                {formState.groupLevel === 'level_3' && (
                  <p className="mt-1 text-amber-400 text-sm flex items-center">
                    <Info className="h-4 w-4 mr-1" />
                    For larger groups, please contact us directly for custom pricing.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="dealershipCount"
                  className="block text-gray-300 text-sm font-bold mb-2"
                >
                  Number of Dealerships
                </label>
                <input
                  id="dealershipCount"
                  name="dealershipCount"
                  type="number"
                  min={formState.groupLevel === 'level_1' ? 2 : 6}
                  max={formState.groupLevel === 'level_1' ? 5 : 15}
                  value={formState.dealershipCount}
                  onChange={handleChange}
                  required
                  className="bg-gray-700 shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:border-blue-500"
                />
                <p className="mt-1 text-gray-400 text-sm">
                  {formState.groupLevel === 'level_1'
                    ? 'Level 1 supports 2-5 dealerships'
                    : 'Level 2 supports 6-15 dealerships'}
                </p>
              </div>
            </>
          )}

          <div className="mt-8">
            <h3 className="text-white font-bold text-lg mb-4">Add-Ons (Optional)</h3>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="plus"
                    name="plus"
                    type="checkbox"
                    checked={formState.addOns.plus}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="plus" className="font-medium text-white">
                    + Version (+$100/month)
                  </label>
                  <p className="text-gray-400">
                    {formState.tier === 'dealer_group'
                      ? 'Increases user limits per dealership and adds 1 Area VP (Level 1) or 2 Area VPs (Level 2)'
                      : 'Adds 10 more Sales People (up to 20 total), 5 F&I Managers, Finance Director, 5 Sales Managers, 1 GSM/GM'}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="plusplus"
                    name="plusplus"
                    type="checkbox"
                    checked={formState.addOns.plusplus}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="plusplus" className="font-medium text-white">
                    ++ Version (+$500/month)
                  </label>
                  <p className="text-gray-400">
                    {formState.tier === 'dealer_group'
                      ? 'Maximizes user limits per dealership and adds unlimited Area VPs'
                      : 'Up to 50 Sales People, 10 Finance People, 3 Finance Assistants, 8 Sales Managers'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="flex justify-between mb-2">
              <span className="text-gray-300">Base Price:</span>
              <span className="text-white font-medium">${basePrice}/month</span>
            </div>

            {formState.addOns.plus && (
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">+ Version:</span>
                <span className="text-white font-medium">+${plusPrice}/month</span>
              </div>
            )}

            {formState.addOns.plusplus && (
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">++ Version:</span>
                <span className="text-white font-medium">+${plusplusPrice}/month</span>
              </div>
            )}

            <div className="flex justify-between pt-2 border-t border-gray-700 mt-2">
              <span className="text-gray-200 font-bold">Total:</span>
              <span className="text-white font-bold">${totalPrice}/month</span>
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-light-orange to-dark-orange text-white px-4 py-3 rounded-md hover:scale-105 transition-all duration-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  Processing...
                </span>
              ) : (
                'Subscribe & Continue'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
