import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase, isTestEmail } from '../../lib/supabaseClient';
import { Loader2 } from 'lucide-react';

/**
 * TestUserMiddleware checks if the current user is a test user
 * and handles routing and metadata appropriately to bypass
 * the regular authentication flow issues.
 */
const TestUserMiddleware: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [isTestUser, setIsTestUser] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkTestUser = async () => {
      try {
        console.log('[TestUserMiddleware] Checking for test user...');
        
        // Get current session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('[TestUserMiddleware] Session error:', sessionError);
          setChecking(false);
          return;
        }
        
        if (!sessionData.session) {
          console.log('[TestUserMiddleware] No active session');
          setChecking(false);
          return;
        }
        
        const user = sessionData.session.user;
        const userEmail = user?.email || '';
        
        if (!isTestEmail(userEmail)) {
          console.log('[TestUserMiddleware] Not a test user:', userEmail);
          setChecking(false);
          return;
        }
        
        console.log('[TestUserMiddleware] Test user detected:', userEmail);
        setIsTestUser(true);
        
        // Special handling for testadmin@example.com
        if (userEmail === 'testadmin@example.com') {
          console.log('[TestUserMiddleware] Master admin user detected');
          
          // Update user metadata
          try {
            await supabase.auth.updateUser({
              data: {
                role: 'admin',
                is_admin: true
              }
            });
            console.log('[TestUserMiddleware] Updated metadata for master admin');
          } catch (metadataError) {
            console.error('[TestUserMiddleware] Error updating metadata:', metadataError);
          }
          
          // If not already on master-admin page, redirect
          if (location.pathname !== '/master-admin') {
            console.log('[TestUserMiddleware] Redirecting master admin to /master-admin');
            navigate('/master-admin', { replace: true });
          }
        }
        // Handle group admin test users
        else if (userEmail.includes('group') && userEmail.includes('@exampletest.com')) {
          console.log('[TestUserMiddleware] Group admin user detected');
          
          // Update user metadata
          try {
            await supabase.auth.updateUser({
              data: {
                role: 'dealer_group_admin',
                is_group_admin: true
              }
            });
            console.log('[TestUserMiddleware] Updated metadata for group admin');
            
            // Set session storage flag as fallback
            sessionStorage.setItem('is_group_admin', 'true');
          } catch (metadataError) {
            console.error('[TestUserMiddleware] Error updating metadata:', metadataError);
          }
          
          // If not already on group-admin page, redirect
          if (location.pathname !== '/group-admin') {
            console.log('[TestUserMiddleware] Redirecting group admin to /group-admin');
            navigate('/group-admin', { replace: true });
          }
        }
        // Handle other test users based on email pattern
        else if (userEmail.includes('admin') && userEmail.includes('@exampletest.com')) {
          console.log('[TestUserMiddleware] Dealership admin user detected');
          
          // Update user metadata
          try {
            await supabase.auth.updateUser({
              data: {
                role: 'dealership_admin',
                dealership_id: 1
              }
            });
            console.log('[TestUserMiddleware] Updated metadata for dealership admin');
          } catch (metadataError) {
            console.error('[TestUserMiddleware] Error updating metadata:', metadataError);
          }
          
          // If not already on admin dashboard, redirect
          if (location.pathname !== '/dashboard/admin') {
            console.log('[TestUserMiddleware] Redirecting dealership admin to /dashboard/admin');
            navigate('/dashboard/admin', { replace: true });
          }
        }
        
        setChecking(false);
      } catch (error) {
        console.error('[TestUserMiddleware] Unexpected error:', error);
        setChecking(false);
      }
    };
    
    checkTestUser();
  }, [location.pathname, navigate]);
  
  // If still checking and it's a test user that needs special handling, show loading
  if (checking && isTestUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">Configuring test user access...</p>
        </div>
      </div>
    );
  }
  
  // Otherwise render children
  return <>{children}</>;
};

export default TestUserMiddleware; 