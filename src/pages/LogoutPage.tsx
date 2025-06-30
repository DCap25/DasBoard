import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../lib/directAuth';

export default function LogoutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear all authentication data
    logout();

    // Also clear any other potential auth keys
    localStorage.clear();

    // Small delay then redirect to home
    setTimeout(() => {
      navigate('/', { replace: true });
    }, 1000);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-white text-2xl mb-4">Clearing Session...</div>
        <div className="text-gray-400">You will be redirected to the home page.</div>
      </div>
    </div>
  );
}
