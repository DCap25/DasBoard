import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('[AuthCallback] Processing auth callback');
        
        // Get the hash parameters from URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        // Also check search params for error
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (error) {
          console.error('[AuthCallback] Error in callback:', error, errorDescription);
          setStatus('error');
          setMessage(`Authentication failed: ${errorDescription || error}`);
          
          // Redirect to auth page with error message after 3 seconds
          setTimeout(() => {
            navigate('/auth?error=' + encodeURIComponent(errorDescription || error));
          }, 3000);
          return;
        }

        if (type === 'signup' || type === 'email_change' || type === 'invite') {
          console.log('[AuthCallback] Processing email verification');
          
          // Let Supabase handle the session automatically
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('[AuthCallback] Session error:', sessionError);
            setStatus('error');
            setMessage('Failed to verify email. Please try again.');
            
            setTimeout(() => {
              navigate('/auth?error=' + encodeURIComponent('Email verification failed'));
            }, 3000);
            return;
          }

          if (session?.user) {
            console.log('[AuthCallback] Email verified successfully:', session.user.email);
            setStatus('success');
            setMessage('Email verified successfully! Redirecting to dashboard...');
            
            // Wait a moment then redirect to dashboard
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
          } else {
            console.log('[AuthCallback] No session found, redirecting to login');
            setStatus('success');
            setMessage('Email verified! Please sign in to continue.');
            
            setTimeout(() => {
              navigate('/auth?message=' + encodeURIComponent('Email verified successfully. Please sign in.'));
            }, 2000);
          }
        } else if (type === 'recovery') {
          console.log('[AuthCallback] Processing password recovery');
          setStatus('success');
          setMessage('Password recovery verified! Redirecting...');
          
          setTimeout(() => {
            navigate('/auth/reset-password');
          }, 2000);
        } else {
          console.log('[AuthCallback] Unknown callback type, redirecting to auth');
          setStatus('success');
          setMessage('Verification complete! Redirecting...');
          
          setTimeout(() => {
            navigate('/auth');
          }, 2000);
        }

      } catch (error) {
        console.error('[AuthCallback] Unexpected error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred during verification.');
        
        setTimeout(() => {
          navigate('/auth?error=' + encodeURIComponent('Verification failed'));
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Verifying Email</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Verification Successful</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => navigate('/auth')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Return to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}