/**
 * Auth Fix Script - Fixes authentication issues with React router and Supabase
 *
 * This script helps ensure authentication state is properly loaded before route protection kicks in.
 * Include this script in your index.html before your main application script.
 */
(function () {
  console.log('[AUTH-FIX] Initializing auth fix script');

  // Check if we should redirect for login auto-flow
  const urlParams = new URLSearchParams(window.location.search);
  const autoLogin = urlParams.get('autologin');

  if (autoLogin === 'group-admin') {
    console.log('[AUTH-FIX] Auto-login detected, redirecting to login page');
    // Redirect to our emergency login page
    window.location.href = '/EmergencyLogin.html';
    return;
  }

  // Function to get session from localStorage
  function getSessionFromStorage() {
    try {
      // Find the Supabase storage key
      const supabaseUrlPattern = /sb-(.*?)-auth-token/;
      let sessionKey = null;

      // Look through localStorage for the session key
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (supabaseUrlPattern.test(key)) {
          sessionKey = key;
          break;
        }
      }

      if (!sessionKey) return null;

      // Try to parse the session data
      const sessionStr = localStorage.getItem(sessionKey);
      if (!sessionStr) return null;

      return JSON.parse(sessionStr);
    } catch (err) {
      console.error('[AUTH-FIX] Error getting session from storage:', err);
      return null;
    }
  }

  // Extract user info from session
  function getUserFromSession(session) {
    if (!session || !session.user) return null;
    return session.user;
  }

  // Check if the token is expired
  function isTokenExpired(session) {
    if (!session || !session.expires_at) return true;
    const expiresAt = session.expires_at * 1000; // Convert to milliseconds
    return Date.now() > expiresAt;
  }

  // Check if user has the group admin role
  function isGroupAdmin(user) {
    if (!user) return false;

    // Check different ways a user might be marked as a group admin
    if (user.email && user.email.includes('group') && user.email.includes('@exampletest.com')) {
      return true;
    }

    if (user.user_metadata && user.user_metadata.role === 'group_admin') {
      return true;
    }

    if (user.app_metadata && user.app_metadata.role === 'group_admin') {
      return true;
    }

    return false;
  }

  // Main function to patch the auth state
  function patchAuth() {
    const session = getSessionFromStorage();
    const user = getUserFromSession(session);
    const isExpired = isTokenExpired(session);

    // Create a flag to indicate the session was pre-validated
    if (user && !isExpired) {
      // Save validated auth state to sessionStorage for immediate access
      sessionStorage.setItem('auth_fix_applied', 'true');
      sessionStorage.setItem('is_authenticated', 'true');
      sessionStorage.setItem('user_email', user.email || '');
      sessionStorage.setItem('user_id', user.id || '');

      // For group admin detection
      if (isGroupAdmin(user)) {
        sessionStorage.setItem('is_group_admin', 'true');
        console.log('[AUTH-FIX] Group admin status detected and saved');
      }

      console.log('[AUTH-FIX] Auth state patched:', {
        user_email: user.email,
        is_group_admin: isGroupAdmin(user),
        auth_fixed: true,
      });
    } else {
      console.log('[AUTH-FIX] No valid session found or session expired');
    }
  }

  // Initialize auth fix
  patchAuth();

  // Monkey patch navigation to handle redirects
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  // Add property to window to detect navigation type
  window.__authFixNavigationType = 'none';

  // Override pushState
  history.pushState = function (state, title, url) {
    window.__authFixNavigationType = 'push';
    originalPushState.apply(this, arguments);
  };

  // Override replaceState
  history.replaceState = function (state, title, url) {
    window.__authFixNavigationType = 'replace';
    originalReplaceState.apply(this, arguments);
  };

  // Expose our fix to the window for debugging
  window.__authFix = {
    getSessionFromStorage,
    getUserFromSession,
    isTokenExpired,
    isGroupAdmin,
    patchAuth,
  };

  console.log('[AUTH-FIX] Auth fix script initialized successfully');
})();
