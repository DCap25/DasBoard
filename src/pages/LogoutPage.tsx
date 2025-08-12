import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutDirectAuth } from '../lib/directAuth';
import { supabase } from '../lib/supabaseClient';

export default function LogoutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear all authentication data
    logoutDirectAuth();

    // Clear only authentication-related localStorage keys (preserve user data like deals)
    const authKeys = [
      'supabase.auth.token',
      'supabase.auth.expires_at',
      'supabase.auth.expires_in',
      'directauth_user',
      'direct_auth_user',
      'force_redirect_after_login',
      'force_redirect_timestamp',
      'logout_in_progress',
    ];

    authKeys.forEach(key => localStorage.removeItem(key));

    // Also remove any sb-*-auth-token keys created by Supabase
    Object.keys(localStorage)
      .filter(k => k.startsWith('sb-') && k.endsWith('-auth-token'))
      .forEach(k => localStorage.removeItem(k));

    // Explicitly call Supabase signOut to revoke refresh token
    supabase.auth.signOut().catch(() => {});

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
