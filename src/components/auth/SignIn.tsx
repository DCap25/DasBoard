import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function SignIn() {
  const { signIn, error, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(email, password);
  };

  // Preset test users for easy access
  const testUsers = [
    { email: 'testfni@example.com', password: 'password', role: 'F&I' },
    { email: 'testsales@example.com', password: 'password', role: 'Sales Manager' },
    { email: 'testgm@example.com', password: 'password', role: 'General Manager' },
    { email: 'testadmin@example.com', password: 'password', role: 'Admin' },
  ];

  const selectTestUser = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form 
        onSubmit={handleSignIn} 
        className="bg-gray-800 shadow-md rounded-lg px-8 pt-6 pb-8 mb-4 border border-gray-700"
      >
        <h2 className="text-2xl font-bold mb-6 text-white text-center">Sign In</h2>
        
        {error && (
          <div className="mb-4 p-2 bg-red-800 text-red-100 rounded">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-gray-700 shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:border-blue-500"
            placeholder="Email"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-gray-700 shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:border-blue-500"
            placeholder="******************"
          />
        </div>
        
        <div className="flex items-center justify-center mb-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition-colors duration-300"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>

        <div className="mb-2">
          <p className="text-gray-300 text-sm font-medium mb-2">Test Users:</p>
          <div className="grid grid-cols-1 gap-2">
            {testUsers.map((user) => (
              <button
                key={user.email}
                type="button"
                onClick={() => selectTestUser(user.email, user.password)}
                className="text-sm bg-gray-700 hover:bg-gray-600 text-white py-1 px-2 rounded text-left"
              >
                {user.role}: {user.email}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
} 