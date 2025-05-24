'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { createClient } from '@supabase/supabase-js';

// Hardcoded Supabase configuration for testing
const supabaseUrl = 'https://iugjtokydvbcvmrpeziv.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Z2p0b2t5ZHZiY3ZtcnBleml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MTk3NjUsImV4cCI6MjA2MTI5NTc2NX0.XCNQoJbGQiXuyR_CFevro1Y8lqvh2_jmjrD181UYtY4';
// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  schema: { skipCache: true },
  // Remove any default select queries or column restrictions
  global: {
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
  },
});
const stripePromise = loadStripe(
  'pk_test_51RPqKnCLgbYukTp1kaTp1BJBfqp5B0W5aLh98d99pGJrU8qIivlCSplN80Kqlbppa3FZL7vY910HlMUYDLcK5Izs00wwbp0MCA'
);
// Initialize Stripe
// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

// Add a function to notify master admin of signups
const notifyMasterAdmin = async signupData => {
  try {
    // Make a call to a hypothetical API endpoint that will notify the master admin
    // In a real implementation, this would make a call to a serverless function
    console.log('Notifying master admin of new signup:', signupData);

    // Create a notification record directly in the admin_notifications table
    const { error } = await supabase.from('admin_notifications').insert({
      type: 'signup_request',
      content: {
        dealership_name: signupData.dealership_name,
        contact_person: signupData.contact_person,
        email: signupData.email,
        tier: signupData.tier,
        add_ons: signupData.add_ons,
        timestamp: new Date().toISOString(),
      },
      is_read: false,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error creating admin notification:', error);
    } else {
      console.log('Successfully created admin notification');
    }

    return { success: true };
  } catch (error) {
    console.error('Error notifying master admin:', error);
    return { success: false, error };
  }
};

export default function SignupForm() {
  console.log('Rendering SignupForm component');

  // Form state
  const [dealershipName, setDealershipName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedTier, setSelectedTier] = useState('trial');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showAddOns, setShowAddOns] = useState(false);
  // New dealer group specific state
  const [dealerGroupLevel, setDealerGroupLevel] = useState('level_1');
  const [dealershipCount, setDealershipCount] = useState(2); // Default to minimum for Level 1
  const [showGroupOptions, setShowGroupOptions] = useState(false);

  // Client-side validations
  const validateForm = () => {
    console.log('Validating form data');
    const errors: Record<string, string> = {};

    if (!dealershipName.trim()) {
      errors.dealershipName = 'Dealership name is required';
    }

    if (!firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (phone.trim() && !/^[0-9()\-\s+]{10,15}$/.test(phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    // Dealer group specific validations
    if (selectedTier === 'group') {
      if (dealerGroupLevel === 'level_1' && (dealershipCount < 2 || dealershipCount > 5)) {
        errors.dealershipCount = 'Level 1 requires between 2-5 dealerships';
      } else if (dealerGroupLevel === 'level_2' && (dealershipCount < 6 || dealershipCount > 15)) {
        errors.dealershipCount = 'Level 2 requires between 6-15 dealerships';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Check initialization on mount
  useEffect(() => {
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase environment variables not configured');
      setError('Service configuration error. Please contact support.');
    }

    console.log('SignupForm component initialized', {
      supabaseConfigured: Boolean(supabaseUrl && supabaseKey),
      stripeConfigured: true,
    });
  }, []);

  // Updated pricing tiers with Finance Manager Only
  const tiers = [
    { id: 'trial', name: 'Free to Try (30-day trial)', price: 'Free' },
    {
      id: 'finance',
      name: 'Finance Manager Only',
      price: (
        <span>
          <span className="line-through text-gray-300">$5/month</span>{' '}
          <span className="text-red-500 font-bold">Free</span>{' '}
          <span className="text-gray-300 text-xs italic ml-1">for a limited time</span>
        </span>
      ),
      trialDays: 30,
      isPromo: true,
    },
    {
      id: 'finance_only',
      name: 'Finance Manager Only (30-day free trial)',
      price: (
        <span>
          <span className="line-through text-gray-300">$5/month</span>{' '}
          <span className="text-red-500 font-bold">Free</span>{' '}
          <span className="text-gray-300 text-xs italic ml-1">for a limited time</span>
        </span>
      ),
      trialDays: 30,
      isPromo: true,
    },
    { id: 'dealership', name: 'Dealerships', price: '$200/month' },
    { id: 'group', name: 'Dealer Groups', price: 'From $200/dealership/month' },
  ];

  // Dealer group pricing levels
  const groupLevels = [
    {
      id: 'level_1',
      name: 'Level 1 (2-5 dealerships)',
      price: '$200/dealership/month',
      min: 2,
      max: 5,
    },
    {
      id: 'level_2',
      name: 'Level 2 (6-15 dealerships)',
      price: '$250/dealership/month',
      min: 6,
      max: 15,
    },
    {
      id: 'level_3',
      name: 'Level 3 (16+ dealerships)',
      price: 'Contact for pricing',
      isContact: true,
    },
  ];

  // Add-on options for Dealership and Dealer Group tiers
  const addOns = [
    {
      id: 'plus',
      name: '+ Version',
      price: '$100/month',
      description:
        'Increases user limits to 20 Sales People, 5 F&I Managers, Finance Director, 5 Sales Managers, 1 GSM/GM',
    },
    {
      id: 'plusplus',
      name: '++ Version',
      price: '$500/month',
      description:
        'Increases user limits to 50 Sales People, 10 Finance People, 3 Finance Assistants, 8 Sales Managers',
    },
  ];

  // Toggle add-on selection
  const toggleAddOn = (addOnId: string) => {
    setSelectedAddOns(prev => {
      if (prev.includes(addOnId)) {
        return prev.filter(id => id !== addOnId);
      } else {
        return [...prev, addOnId];
      }
    });
  };

  // Update selected tier and reset add-ons if not dealership or group
  useEffect(() => {
    // Reset add-ons when tier changes
    if (selectedTier !== 'dealership' && selectedTier !== 'group') {
      setSelectedAddOns([]);
    }

    // Show add-ons for dealership or group tiers
    setShowAddOns(selectedTier === 'dealership' || selectedTier === 'group');

    // Show group options only for group tier
    setShowGroupOptions(selectedTier === 'group');

    // Reset dealer group level if not group tier
    if (selectedTier !== 'group') {
      setDealerGroupLevel('level_1');
      setDealershipCount(2);
    } else {
      // Set default values for group tier
      setDealershipCount(dealerGroupLevel === 'level_1' ? 2 : 6);
    }

    console.log(
      `Tier changed to ${selectedTier}. ShowAddOns: ${
        selectedTier === 'dealership' || selectedTier === 'group'
      }`
    );
  }, [selectedTier]);

  // Update dealershipCount when group level changes
  useEffect(() => {
    if (dealerGroupLevel === 'level_1') {
      setDealershipCount(Math.max(2, Math.min(dealershipCount, 5)));
    } else if (dealerGroupLevel === 'level_2') {
      setDealershipCount(Math.max(6, Math.min(dealershipCount, 15)));
    }
    console.log(`Group level changed to ${dealerGroupLevel}. Dealership count: ${dealershipCount}`);
  }, [dealerGroupLevel]);

  // Calculate total monthly cost
  const calculateTotalCost = () => {
    let total = 0;
    let perDealership = 0;
    let totalDealerships = 1;

    // Base tier cost
    switch (selectedTier) {
      case 'finance':
        // Free for a limited time (previously $5)
        total += 0;
        break;
      case 'finance_only':
        // Free for a limited time (previously $5)
        total += 0;
        break;
      case 'dealership':
        total += 200;
        break;
      case 'group':
        // Group pricing is per dealership
        perDealership =
          dealerGroupLevel === 'level_1' ? 200 : dealerGroupLevel === 'level_2' ? 250 : 300;
        totalDealerships = dealershipCount;
        total += perDealership * totalDealerships;
        break;
      default:
        // Free trial
        break;
    }

    // Add-ons cost
    if (selectedAddOns.includes('plus')) {
      total += 100;
    }
    if (selectedAddOns.includes('plusplus')) {
      total += 500;
    }

    // Format output
    if (selectedTier === 'trial') {
      return 'Free for 30 days';
    } else if (selectedTier === 'finance_only' || selectedTier === 'finance') {
      return (
        <span>
          <span className="line-through text-gray-300">$5/month</span>{' '}
          <span className="text-red-500 font-bold">Free</span>{' '}
          <span className="text-gray-300 text-xs italic ml-1">for a limited time</span>
        </span>
      );
    } else if (selectedTier === 'group' && dealerGroupLevel === 'level_3') {
      return 'Contact for pricing';
    } else if (selectedTier === 'group') {
      return `$${(
        perDealership * totalDealerships
      ).toLocaleString()}/month for ${totalDealerships} dealerships`;
    } else {
      return `$${total}/month`;
    }
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    console.log('Form submitted with version 9');

    if (!validateForm()) {
      console.log('Validation failed:', validationErrors);
      return;
    }

    try {
      setLoading(true);
      console.log('Starting signup process');

      // Generate a truly unique timestamp-based email
      // Format: original+yyyymmddhhmmss@domain.com
      const now = new Date();
      const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
        now.getDate()
      ).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(
        now.getMinutes()
      ).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

      let finalEmail;
      if (email.includes('@')) {
        const [localPart, domain] = email.split('@');
        finalEmail = `${localPart}+${timestamp}@${domain}`;
      } else {
        finalEmail = email;
      }

      console.log(`Using unique email: ${finalEmail}`);

      // Determine tier information
      let tier = selectedTier;
      if (tier === 'trial') {
        tier = 'free_trial';
      } else if (tier === 'finance') {
        tier = 'finance_manager';
      } else if (tier === 'finance_only') {
        tier = 'finance_manager_only';
      } else if (tier === 'group') {
        tier = 'dealer_group';
      }

      // Map to valid subscription_tier
      let validSubscriptionTier = 'free_trial'; // Default fallback
      if (tier === 'free_trial') {
        validSubscriptionTier = 'free_trial';
      } else if (tier === 'finance_manager' || tier === 'finance_manager_only') {
        validSubscriptionTier = 'finance_manager';
      } else if (tier === 'dealer_group') {
        validSubscriptionTier = 'dealer_group_l1';
      } else if (tier === 'dealership') {
        validSubscriptionTier = 'dealership';
      }

      // Prepare the signup data object explicitly
      const signupData = {
        dealership_name: dealershipName,
        contact_person: `${firstName} ${lastName}`,
        first_name: firstName,
        last_name: lastName,
        email: finalEmail, // Using our unique email
        phone: phone || '',
        tier: tier,
        subscription_tier: validSubscriptionTier,
        status: 'pending',
        add_ons: selectedAddOns.length > 0 ? selectedAddOns : null,
        promo_applied: tier === 'finance_manager' || tier === 'finance_manager_only',
      };

      console.log('Signup data being sent to Supabase:', signupData);

      // Try a simplified direct method
      const { data, error } = await supabase.from('signup_requests').insert(signupData);

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Database error:', error);

        // Special handling for unique constraint violation
        if (error.code === '23505' && error.message?.includes('signup_requests_email_key')) {
          throw new Error(
            'An account with this email already exists. Please try a different email address.'
          );
        }

        throw new Error(`Database error: ${error.message || 'Unknown error'}`);
      }

      // Success path
      console.log('Signup successful!');
      setSuccess(true);

      // Reset form after successful signup
      setDealershipName('');
      setFirstName('');
      setLastName('');
      setContactName('');
      setEmail('');
      setPhone('');
      setSelectedTier('trial');
      setSelectedAddOns([]);
      setDealerGroupLevel('level_1');
      setDealershipCount(2);
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message || 'An error occurred during signup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success UI
  if (success) {
    return (
      <div className="bg-white shadow-md rounded-lg p-8 max-w-lg mx-auto text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Thanks for signing up!</h2>
        <p className="text-gray-600 mb-6">
          {selectedTier === 'trial'
            ? 'Your free trial has been activated. You can now start using The Das Board.'
            : selectedTier === 'group'
            ? 'Your dealer group request has been received. We will contact you shortly to set up your account.'
            : 'Your request has been received. We will contact you shortly to set up your account.'}
        </p>
        <button
          onClick={() => (window.location.href = '/')}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Return to Home
        </button>
      </div>
    );
  }

  // Main form UI
  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 py-6 px-6">
        <h2 className="text-2xl font-bold text-white">Sign Up for The Das Board</h2>
        <p className="text-blue-100 mt-2">
          Choose the plan that's right for your dealership or finance office.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 border-l-4 border-red-600">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label htmlFor="dealershipName" className="block text-gray-700 font-medium mb-1">
            {selectedTier === 'group' ? 'Dealer Group Name' : 'Dealership/Company Name'}
          </label>
          <input
            type="text"
            id="dealershipName"
            value={dealershipName}
            onChange={e => setDealershipName(e.target.value)}
            className={`w-full p-3 border ${
              validationErrors.dealershipName ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder={
              selectedTier === 'group'
                ? 'Enter your dealer group name'
                : 'Enter your dealership name'
            }
          />
          {validationErrors.dealershipName && (
            <p className="text-red-600 text-sm mt-1">{validationErrors.dealershipName}</p>
          )}
        </div>

        <div>
          <label htmlFor="firstName" className="block text-gray-700 font-medium mb-1">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            className={`w-full p-3 border ${
              validationErrors.firstName ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder="Enter your first name"
          />
          {validationErrors.firstName && (
            <p className="text-red-600 text-sm mt-1">{validationErrors.firstName}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-gray-700 font-medium mb-1">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            className={`w-full p-3 border ${
              validationErrors.lastName ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder="Enter your last name"
          />
          {validationErrors.lastName && (
            <p className="text-red-600 text-sm mt-1">{validationErrors.lastName}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={`w-full p-3 border ${
              validationErrors.email ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder="Enter your email address"
          />
          {validationErrors.email && (
            <p className="text-red-600 text-sm mt-1">{validationErrors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-gray-700 font-medium mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className={`w-full p-3 border ${
              validationErrors.phone ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder="Enter your phone number"
          />
          {validationErrors.phone && (
            <p className="text-red-600 text-sm mt-1">{validationErrors.phone}</p>
          )}
        </div>

        <div className="mt-6">
          <label className="block text-gray-700 font-medium mb-3">Select Your Plan</label>
          <div className="space-y-3">
            {tiers.map(tier => (
              <div
                key={tier.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedTier === tier.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedTier(tier.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{tier.name}</h3>
                    {tier.trialDays && (
                      <p className="text-sm text-gray-500">{tier.trialDays}-day free trial</p>
                    )}
                  </div>
                  <div className="text-blue-600 font-bold">{tier.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dealer Group Options - Only show when group tier is selected */}
        {showGroupOptions && (
          <div className="mt-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
            <label className="block text-gray-700 font-medium mb-3">
              Select Dealer Group Level
            </label>
            <div className="space-y-3 mb-4">
              {groupLevels.map(level => (
                <div
                  key={level.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    dealerGroupLevel === level.id
                      ? 'border-blue-500 bg-blue-100'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    if (!level.isContact) {
                      setDealerGroupLevel(level.id);
                    } else {
                      window.open(
                        'mailto:contact@thedasboard.com?subject=Dealer Group Level 3 Inquiry',
                        '_blank'
                      );
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{level.name}</h3>
                    </div>
                    <div className="text-blue-600 font-bold">{level.price}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dealership count - Only for Level 1 and Level 2 */}
            {dealerGroupLevel !== 'level_3' && (
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Number of Dealerships
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={dealershipCount}
                    onChange={e => {
                      const count = parseInt(e.target.value);
                      const level =
                        dealerGroupLevel === 'level_1' ? groupLevels[0] : groupLevels[1];

                      if (!isNaN(count)) {
                        setDealershipCount(Math.max(level.min, Math.min(count, level.max)));
                      }
                    }}
                    min={dealerGroupLevel === 'level_1' ? 2 : 6}
                    max={dealerGroupLevel === 'level_1' ? 5 : 15}
                    className="w-20 p-2 border border-gray-300 rounded-md"
                  />
                  <span className="text-gray-600">
                    dealerships ({dealerGroupLevel === 'level_1' ? '2-5' : '6-15'})
                  </span>
                </div>
                {validationErrors.dealershipCount && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.dealershipCount}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Add-ons section - Only show for Dealership or Group tier */}
        {showAddOns && (
          <div className="mt-6">
            <label className="block text-gray-700 font-medium mb-3">Version Add-Ons</label>
            <div className="space-y-3">
              {addOns.map(addon => (
                <div
                  key={addon.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedAddOns.includes(addon.id)
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => toggleAddOn(addon.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{addon.name}</h3>
                      <p className="text-sm text-gray-500">{addon.description}</p>
                      {selectedTier === 'group' && (
                        <p className="text-xs text-blue-600 mt-1">
                          * Applied to each dealership in your group
                        </p>
                      )}
                    </div>
                    <div className="text-green-600 font-bold">
                      {addon.price}
                      {selectedTier === 'group' && ' per dealership'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Total cost summary */}
        {selectedTier !== 'trial' && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">Total Monthly Cost:</span>
              <span className="text-lg font-bold text-blue-600">{calculateTotalCost()}</span>
            </div>
            {selectedTier === 'group' && dealerGroupLevel !== 'level_3' && (
              <div className="mt-2 text-sm text-gray-500">
                Based on {dealershipCount} dealerships
                {selectedAddOns.length > 0 ? ' with selected add-ons' : ''}
              </div>
            )}
          </div>
        )}

        <div className="mt-8">
          <button
            type="submit"
            disabled={loading || (selectedTier === 'group' && dealerGroupLevel === 'level_3')}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              <span>
                {selectedTier === 'trial'
                  ? 'Start Free Trial'
                  : selectedTier === 'group' && dealerGroupLevel === 'level_3'
                  ? 'Contact Us for Pricing'
                  : 'Continue to Payment'}
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
