import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, ArrowLeft, Info, Home } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function DealerGroupSignup() {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    groupName: '',
    level: '',
    dealershipCount: 2,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const levels = [
    { value: 'level_1', label: 'Level 1 (2-5 dealerships)', min: 2, max: 5, price: 200 },
    { value: 'level_2', label: 'Level 2 (2-15 dealerships)', min: 2, max: 15, price: 250 },
    { value: 'level_3', label: 'Level 3 (16+ dealerships)', min: 16, max: 50, price: 0 },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'level') {
      const selectedLevel = levels.find(l => l.value === value);
      setFormState(prev => ({
        ...prev,
        [name]: value,
        dealershipCount: selectedLevel?.min || 2,
      }));
    } else if (name === 'dealershipCount') {
      setFormState(prev => ({ ...prev, [name]: parseInt(value) || 2 }));
    } else {
      setFormState(prev => ({ ...prev, [name]: value }));
    }
  };

  const generateTempPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const fullName = `${formState.firstName} ${formState.lastName}`;

      // For Level 3, just send notification to admin
      if (formState.level === 'level_3') {
        try {
          await fetch('/.netlify/functions/send-emails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'large_group_notification',
              data: {
                name: fullName,
                email: formState.email,
                phone: formState.phone,
                groupName: formState.groupName,
                dealershipCount: formState.dealershipCount,
                level: 'Level 3',
              },
            }),
          });
        } catch (emailError) {
          console.warn('Failed to send large group notification:', emailError);
        }

        setSuccess(true);
        return;
      }

      const tempPassword = generateTempPassword();

      // Create dealer group
      const { data: dealerGroupData, error: dealerGroupError } = await supabase
        .from('dealerships')
        .insert({
          name: formState.groupName,
          type: 'group',
          num_teams: formState.dealershipCount,
          metadata: {
            level: formState.level,
            dealership_count: formState.dealershipCount,
          },
        })
        .select()
        .single();

      if (dealerGroupError) throw dealerGroupError;

      // Create user with Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formState.email,
        password: tempPassword,
        options: {
          data: {
            name: fullName,
            role: 'group_dealer_admin',
            phone: formState.phone,
            dealership_id: dealerGroupData.id,
          },
        },
      });

      if (authError) throw authError;

      // Create profile entry
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: authData.user?.id,
        email: formState.email,
        name: fullName,
        role: 'group_dealer_admin',
        phone: formState.phone,
        dealership_id: dealerGroupData.id,
      });

      if (profileError) throw profileError;

      // Update dealer group with admin user ID
      const { error: updateError } = await supabase
        .from('dealerships')
        .update({ admin_user_id: authData.user?.id })
        .eq('id', dealerGroupData.id);

      if (updateError) throw updateError;

      // Send signup notification to admin
      try {
        await fetch('/.netlify/functions/send-emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'signup_notification',
            data: {
              name: fullName,
              email: formState.email,
              companyType: 'Dealer Group',
              subscriptionId: authData.user?.id,
              groupName: formState.groupName,
              level: formState.level,
              dealershipCount: formState.dealershipCount,
            },
          }),
        });
      } catch (emailError) {
        console.warn('Failed to send admin notification:', emailError);
      }

      // Send temporary password email to user
      try {
        await fetch('/.netlify/functions/send-emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'temp_password',
            data: {
              name: fullName,
              email: formState.email,
              tempPassword: tempPassword,
              role: 'Dealer Group Admin',
            },
          }),
        });
      } catch (emailError) {
        console.warn('Failed to send temporary password email:', emailError);
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const selectedLevel = levels.find(l => l.value === formState.level);

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4 text-white">
            {formState.level === 'level_3' ? 'Request Submitted!' : 'Dealer Group Account Created!'}
          </h2>
          <p className="text-gray-300 mb-6">
            {formState.level === 'level_3'
              ? 'Thank you for your interest! A member of our team will contact you shortly to discuss your custom dealer group solution.'
              : 'Your dealer group account has been created successfully. You should receive an email with your temporary password shortly.'}
          </p>
          {formState.level !== 'level_3' && (
            <p className="text-gray-400 mb-8">
              You can now access your group admin dashboard at: <br />
              <span className="text-blue-400 font-mono">/group-admin</span>
            </p>
          )}
          <div className="space-y-4">
            <button
              onClick={() => navigate(formState.level === 'level_3' ? '/signup' : '/auth')}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 px-8 rounded-lg font-semibold transition-colors"
            >
              {formState.level === 'level_3' ? 'Back to Signup' : 'Go to Login'}
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-600 hover:bg-gray-500 text-white py-3 px-8 rounded-lg font-semibold transition-colors flex items-center justify-center"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/signup')}
                className="text-gray-400 hover:text-white mr-4 transition-colors"
                title="Back to signup options"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold text-white">Dealer Groups</h2>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-white transition-colors"
              title="Back to home"
            >
              <Home className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 text-red-100 rounded flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-gray-300 text-sm font-bold mb-2">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formState.firstName}
                  onChange={handleChange}
                  required
                  className="bg-gray-700 border border-gray-600 rounded w-full py-3 px-4 text-white leading-tight focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="First name"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-gray-300 text-sm font-bold mb-2">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formState.lastName}
                  onChange={handleChange}
                  required
                  className="bg-gray-700 border border-gray-600 rounded w-full py-3 px-4 text-white leading-tight focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Last name"
                />
              </div>
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
                className="bg-gray-700 border border-gray-600 rounded w-full py-3 px-4 text-white leading-tight focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-gray-300 text-sm font-bold mb-2">
                Phone Number (for 2FA)
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formState.phone}
                onChange={handleChange}
                required
                className="bg-gray-700 border border-gray-600 rounded w-full py-3 px-4 text-white leading-tight focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label htmlFor="groupName" className="block text-gray-300 text-sm font-bold mb-2">
                Dealer Group Name
              </label>
              <input
                id="groupName"
                name="groupName"
                type="text"
                value={formState.groupName}
                onChange={handleChange}
                required
                className="bg-gray-700 border border-gray-600 rounded w-full py-3 px-4 text-white leading-tight focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Enter your dealer group name"
              />
            </div>

            <div>
              <label htmlFor="level" className="block text-gray-300 text-sm font-bold mb-2">
                Group Level
              </label>
              <select
                id="level"
                name="level"
                value={formState.level}
                onChange={handleChange}
                required
                className="bg-gray-700 border border-gray-600 rounded w-full py-3 px-4 text-white leading-tight focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="">Select level</option>
                {levels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label} {level.price > 0 && `- $${level.price}/dealership/month`}
                  </option>
                ))}
              </select>
              {formState.level === 'level_3' && (
                <div className="mt-2 p-3 bg-blue-900/30 border border-blue-500/50 rounded">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-blue-300 text-sm">
                      Level 3 groups require custom pricing and setup. Our team will contact you to
                      discuss your specific needs.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {formState.level && formState.level !== 'level_3' && selectedLevel && (
              <div>
                <label
                  htmlFor="dealershipCount"
                  className="block text-gray-300 text-sm font-bold mb-2"
                >
                  Number of Dealerships
                </label>
                <select
                  id="dealershipCount"
                  name="dealershipCount"
                  value={formState.dealershipCount}
                  onChange={handleChange}
                  required
                  className="bg-gray-700 border border-gray-600 rounded w-full py-3 px-4 text-white leading-tight focus:outline-none focus:border-blue-500 transition-colors"
                >
                  {Array.from({ length: selectedLevel.max - selectedLevel.min + 1 }, (_, i) => {
                    const count = selectedLevel.min + i;
                    return (
                      <option key={count} value={count}>
                        {count} dealership{count > 1 ? 's' : ''}
                      </option>
                    );
                  })}
                </select>
                <p className="mt-2 text-gray-400 text-sm">
                  Estimated monthly cost: $
                  {(selectedLevel.price * formState.dealershipCount).toLocaleString()}
                </p>
              </div>
            )}

            <div className="mt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    {formState.level === 'level_3'
                      ? 'Submitting Request...'
                      : 'Creating Account...'}
                  </span>
                ) : formState.level === 'level_3' ? (
                  'Submit Request'
                ) : (
                  'Create Dealer Group Account'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              {formState.level === 'level_3'
                ? 'Custom pricing and setup for large dealer groups.'
                : '30-day free trial included. No credit card required during trial.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
