import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await signUp({ email, password, name });
      // Successful registration will redirect via auth context
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 bg-white rounded shadow-md">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">Register</h2>

      {error && (
        <div className="mb-4 p-3 sm:p-4 bg-red-100 text-red-700 rounded text-sm sm:text-base">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm sm:text-base font-medium text-gray-700">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full h-11 sm:h-10 px-4 sm:px-3 py-3 sm:py-2 text-base sm:text-sm border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none touch-manipulation"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm sm:text-base font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full h-11 sm:h-10 px-4 sm:px-3 py-3 sm:py-2 text-base sm:text-sm border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none touch-manipulation"
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm sm:text-base font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full h-11 sm:h-10 px-4 sm:px-3 py-3 sm:py-2 text-base sm:text-sm border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none touch-manipulation"
            required
            minLength={6}
          />
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Password must be at least 6 characters
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full h-11 sm:h-10 px-6 sm:px-4 py-3 sm:py-2 rounded-md text-base sm:text-sm text-white font-medium touch-manipulation transition-colors \n            ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'}`}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}
