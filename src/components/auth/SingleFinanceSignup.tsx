import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function SingleFinanceSignup() {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
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
      const tempPassword = generateTempPassword();

      // Create user with Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formState.email,
        password: tempPassword,
        options: {
          data: {
            name: fullName,
            role: 'single_finance_manager',
            phone: formState.phone,
          },
        },
      });

      if (authError) throw authError;

      // Create profile entry
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: authData.user?.id,
        email: formState.email,
        name: fullName,
        role: 'single_finance_manager',
        phone: formState.phone,
      });

      if (profileError) throw profileError;

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
              companyType: 'Single Finance Manager',
              subscriptionId: authData.user?.id,
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
              role: 'Single Finance Manager',
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

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4 text-white">Finance Manager Account Created!</h2>
          <p className="text-gray-300 mb-6">
            Your finance manager account has been created successfully. You should receive an email
            with your temporary password shortly.
          </p>
          <p className="text-gray-400 mb-8">
            You can now access your dashboard at: <br />
            <span className="text-blue-400 font-mono">/dashboard/single-finance</span>
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="bg-blue-600 hover:bg-blue-500 text-white py-3 px-8 rounded-lg font-semibold transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate('/signup')}
              className="text-gray-400 hover:text-white mr-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-white">Single Finance Manager</h2>
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

            <div className="mt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Creating Account...
                  </span>
                ) : (
                  'Create Finance Manager Account'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              30-day free trial included. No credit card required during trial.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
